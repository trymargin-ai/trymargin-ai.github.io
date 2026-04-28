# Semantic Cache

## Sub-Millisecond FAISS-Powered Response Caching

The Semantic Cache is Margin AI's most aggressive cost optimization layer. It intercepts incoming requests, identifies queries that have been answered before — either exactly or semantically — and serves the cached response in **sub-millisecond latency**. Zero tokens consumed. Zero provider cost. Zero latency penalty.

Built on Facebook's FAISS (Facebook AI Similarity Search) with enterprise-grade data integrity guarantees.

---

## Architecture

The cache operates on two tiers, combining exact matching for speed with semantic matching for coverage:

### Tier 1: Exact Match (Redis)

Every incoming prompt is normalized (lowercased, whitespace-stripped) and hashed using SHA-256. The hash serves as a key in the Redis response store.

- **Lookup Time:** O(1) — typically <0.1ms.
- **Hit Condition:** Identical prompt text after normalization.
- **Storage:** Full serialized response object with TTL.

### Tier 2: Semantic Match (FAISS)

When Tier 1 misses, the prompt is encoded into a **384-dimensional embedding vector** using the `all-MiniLM-L6-v2` sentence-transformer model. The vector is compared against all indexed embeddings using FAISS IndexIDMap.

- **Lookup Time:** <1ms for indexes up to 100K vectors.
- **Hit Condition:** Cosine similarity exceeds configurable threshold (default: 0.92).
- **Index Type:** FAISS IndexIDMap wrapping IndexFlatIP (inner product, equivalent to cosine similarity on L2-normalized vectors).

### Data Integrity Guarantee

Unlike basic caching implementations that store vectors and responses independently (risking desync under concurrent writes), Margin AI uses FAISS **IndexIDMap** to maintain a 1:1 mapping between vector IDs and response hashes.

- Every vector insertion is paired with a unique integer ID derived from the prompt hash.
- Lookups return the vector ID, which maps directly to the Redis response key.
- Thread-safe RLock ensures no corruption during concurrent writes.
- **Result:** Zero desync risk. Zero stale responses. Guaranteed data integrity.

---

## Performance

| Metric | Value |
| :--- | :--- |
| **Exact Cache Hit Latency** | <0.1ms |
| **Semantic Cache Hit Latency** | <1ms |
| **Embedding Generation** | ~5ms (per prompt) |
| **Index Capacity** | 100K+ vectors per instance |
| **Memory Footprint** | ~150MB per 100K vectors |
| **Token Savings per Cache Hit** | 100% (zero provider cost) |

---

## Cache Hit Analytics

Every cache interaction is tracked and reported to the CFO Dashboard:

```json
{
  "cache": {
    "hit": true,
    "tier": "semantic",
    "similarity_score": 0.967,
    "tokens_saved": 1247,
    "cost_saved": 0.0187,
    "original_prompt_hash": "a3f8c1...",
    "matched_prompt_hash": "b7d2e4..."
  }
}
```

---

## Multi-Tenant Isolation

Cache entries are scoped by API key. Tenant A's cached responses are never served to Tenant B, even if the prompts are semantically identical. This ensures:

- **Data Isolation:** No cross-tenant data leakage.
- **Model Consistency:** Different tenants may use different routing configurations, producing different responses for similar prompts.
- **Compliance:** Per-tenant cache TTL and eviction policies.

---

## Configuration

```bash
# .env
CACHE_ENABLED=true                      # Master toggle
CACHE_SIMILARITY_THRESHOLD=0.92         # Min cosine similarity for semantic hit
CACHE_TTL=3600                          # Default TTL in seconds
CACHE_MAX_VECTORS=100000                # Max FAISS index size
REDIS_URL=redis://localhost:6379/0      # Redis connection string
```

---

## Fallback Strategy

If Redis is unavailable, the cache transparently degrades to an **in-memory LRU cache** with bounded capacity (default: 1,000 entries). This ensures:

- Gateway never fails due to cache infrastructure issues.
- OOM protection via bounded capacity.
- Automatic recovery when Redis reconnects.

---

## Related

- [Context Deduplication →](https://trymargin-ai.github.io/inference-gateway/context-deduplication)
- [Intelligent Routing →](https://trymargin-ai.github.io/inference-gateway/intelligent-routing)
- [Performance Benchmarks →](https://trymargin-ai.github.io/inference-gateway/benchmarks)
