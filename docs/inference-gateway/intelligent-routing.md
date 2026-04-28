# Intelligent Routing Engine

## Hybrid ML-Powered Model Selection

The Intelligent Routing Engine is the core decision layer of Margin AI. For every LLM request that passes through the gateway, the engine evaluates the prompt's complexity and selects the **most cost-effective model capable of handling it** — automatically, in real-time, with no developer intervention.

Trivial tasks route to $0.05/M-token models. Complex reasoning routes to GPT-4o or Claude 3.5 Sonnet. You only pay for the intelligence you actually need.

---

## The Problem

Most AI applications hardcode a single model for all requests:

```python
# The expensive default — every request goes to GPT-4o
response = client.chat.completions.create(model="gpt-4o", ...)
```

But in a typical agentic workflow:

| Task Type | % of Calls | Actual Complexity | Optimal Model | Cost Difference |
| :--- | :---: | :---: | :--- | :---: |
| JSON formatting | 30% | Trivial | llama-3.1-8b-instant | **100x cheaper** |
| Entity extraction | 25% | Trivial | gemini-1.5-flash | **67x cheaper** |
| Date parsing | 15% | Trivial | llama-3.1-8b-instant | **100x cheaper** |
| Code generation | 15% | Complex | gpt-4o | Correct model |
| Deep reasoning | 10% | Complex | claude-3.5-sonnet | Correct model |
| Ambiguous | 5% | Unknown | Needs classification | — |

**Result:** 70% of your API calls are overpaying by 67-100x.

---

## How It Works

### Layer 1: Heuristic Fast Path (<1ms)

A high-speed scoring engine that resolves obvious cases without any ML overhead:

**Complexity Signals (Positive Score):**
- Keywords: `analyze`, `debug`, `refactor`, `optimize`, `architecture`, `prove`, `theorem`
- Structural cues: Code blocks (` ``` `), JSON objects (`{}`), mathematical notation
- Length: Prompts exceeding 150 words

**Simplicity Signals (Negative Score):**
- Keywords: `hello`, `hi`, `format this`, `convert to`, `what time`, `translate`
- Short questions: Under 8 words with a question mark
- Pattern matches: Greetings, simple lookups, unit conversions

**Decision Thresholds:**
- Score ≥ 6 → **Route to strong model immediately** (skip Layer 2)
- Score ≤ -1 → **Route to lean model immediately** (skip Layer 2)
- Score 0-5 → **Ambiguous** — proceed to Layer 2

### Layer 2: Embedding Classifier (5ms)

For ambiguous prompts, the engine deploys a sentence-transformer model to classify the request against pre-computed exemplar embeddings:

1. The prompt is encoded into a 384-dimensional vector using `all-MiniLM-L6-v2`.
2. Cosine similarity is computed against two exemplar sets:
   - **Complex Exemplars:** "Design a distributed system...", "Audit this smart contract...", "Debug this race condition..."
   - **Trivial Exemplars:** "Hi there", "Format this JSON", "What is the capital of France?"
3. The prompt is classified based on which exemplar set has higher average similarity.

**Accuracy:** 95%+ on production workloads, validated against a labeled benchmark dataset.

### Failsafe: Graceful Degradation

If the embedding model is unavailable (e.g., during cold start), the engine falls back to heuristic-only classification with adjusted thresholds. Service continuity is never compromised.

---

## Dynamic Model Selection

The routing engine automatically selects models based on available provider keys:

| Provider Available | Lean Model | Strong Model |
| :--- | :--- | :--- |
| OpenAI | gpt-3.5-turbo | gpt-4o |
| Groq | llama-3.1-8b-instant | llama-3.3-70b-versatile |
| Google | gemini-1.5-flash | gemini-1.5-pro |
| Anthropic | claude-3-haiku | claude-3.5-sonnet |

Multiple providers can be configured simultaneously, enabling cross-provider routing and failover.

---

## Token Budget Guard

Before routing, the engine enforces a configurable **max input token ceiling**:

1. Input tokens are counted using OpenAI's `tiktoken` (`cl100k_base` encoding).
2. If the payload exceeds the budget, intelligent truncation is applied:
   - System prompt is **always preserved**.
   - Most recent N conversation turns are preserved.
   - Older turns are compressed or removed.
3. Truncation events are logged to the CFO Dashboard for visibility.

```bash
# .env
TOKEN_BUDGET_MAX_INPUT=8192              # Max input tokens per request
TOKEN_BUDGET_PRESERVE_TURNS=4            # Recent turns to always keep
TOKEN_BUDGET_STRATEGY=truncate_oldest    # truncate_oldest | summarize | reject
```

---

## Routing Analytics

Every routing decision is logged with full transparency:

```json
{
  "routing": {
    "selected_model": "llama-3.1-8b-instant",
    "strategy": "efficiency_optimized",
    "heuristic_score": -3,
    "classifier_used": false,
    "estimated_cost_savings": 0.0042,
    "would_have_cost": 0.0045,
    "actual_cost": 0.0003
  }
}
```

---

## Custom Routing Rules

Extend the routing engine with domain-specific keywords and exemplars:

```python
# Add custom high-complexity keywords for your domain
routing_engine.complexity_keywords["high"].extend([
    "differential diagnosis",
    "regulatory filing",
    "actuarial analysis"
])

# Add custom exemplars for your specific workload patterns
routing_engine.complex_exemplars.extend([
    "Perform a differential diagnosis for these symptoms...",
    "Draft the SEC 10-K filing section for revenue recognition..."
])
```

---

## Performance

| Metric | Value |
| :--- | :--- |
| **Layer 1 Classification Latency** | <1ms |
| **Layer 2 Classification Latency** | ~5ms |
| **Classification Accuracy** | 95%+ |
| **Typical Cost Reduction (Routing Only)** | 40-60% |
| **False Positive Rate** | <3% (caught by auto-failover) |

---

## Related

- [Auto-Failover →](https://trymargin-ai.github.io/inference-gateway/auto-failover)
- [Semantic Cache →](https://trymargin-ai.github.io/inference-gateway/semantic-cache)
- [Performance Benchmarks →](https://trymargin-ai.github.io/inference-gateway/benchmarks)
