# Performance Benchmarks

## Production-Grade Latency, Throughput, and Cost Metrics

Margin AI is engineered for sub-millisecond overhead on production workloads. Every optimization layer is benchmarked independently and as part of the full six-layer pipeline. All benchmarks were conducted on production-representative hardware.

---

## Test Environment

| Parameter | Value |
| :--- | :--- |
| **Hardware** | AWS c5.2xlarge (8 vCPU, 16GB RAM) |
| **OS** | Ubuntu 22.04 LTS |
| **Python** | 3.11.6 |
| **Gateway** | Margin AI v1.0 (Docker) |
| **Redis** | 7.2 (Alpine) |
| **FAISS Index Size** | 10,000 vectors |
| **Concurrency** | uvicorn, 4 workers |
| **Load Generator** | Locust (500 concurrent users) |

---

## End-to-End Pipeline Latency

Total overhead added by Margin AI's six-layer pipeline **before** the request reaches the LLM provider:

| Scenario | p50 | p95 | p99 |
| :--- | :---: | :---: | :---: |
| **Cache Hit (Exact)** | 0.3ms | 0.5ms | 0.8ms |
| **Cache Hit (Semantic)** | 0.8ms | 1.2ms | 1.8ms |
| **Cache Miss (Full Pipeline)** | 1.2ms | 2.1ms | 2.8ms |
| **Cache Miss + Presidio DLP** | 4.5ms | 7.2ms | 9.8ms |

**Verdict:** For the vast majority of requests (without PII), Margin AI adds less than **2ms** of overhead. Even with full Presidio NLP scanning, overhead stays under **10ms** — negligible compared to typical LLM response times (200-2000ms).

---

## Per-Layer Latency Breakdown

| Layer | p50 Latency | p99 Latency | Notes |
| :--- | :---: | :---: | :--- |
| **Authentication & Rate Limiting** | 0.05ms | 0.1ms | In-memory key lookup |
| **PII Redaction (Regex Pass)** | 0.3ms | 0.8ms | Compiled patterns |
| **PII Redaction (Presidio NLP)** | 3.5ms | 8.0ms | SpaCy NER, lazy-loaded |
| **Prompt Compression** | 0.2ms | 0.5ms | Structural analysis |
| **Context Deduplication** | 0.1ms | 0.3ms | SHA-256 hash comparison |
| **Token Budget Check** | 0.05ms | 0.1ms | tiktoken count |
| **Semantic Cache Lookup** | 0.3ms | 1.2ms | FAISS search + Redis |
| **Routing Classification (Heuristic)** | 0.1ms | 0.3ms | Keyword scoring |
| **Routing Classification (Embedding)** | 4.8ms | 6.5ms | Sentence-transformer |
| **Provider Dispatch** | 0.05ms | 0.1ms | Async HTTP |

---

## Token Savings Benchmarks

Measured across a representative workload of 10,000 production requests:

### By Optimization Layer

| Layer | Avg. Token Savings | Max Savings |
| :--- | :---: | :---: |
| **Prompt Compression** | 38% input tokens | 62% |
| **Context Deduplication** | 28% input tokens | 44% |
| **Semantic Cache Hits** | 100% (zero cost) | 100% |
| **Intelligent Routing** | 65% cost reduction | 100x |

### By Workload Type

| Workload | Combined Savings | Primary Optimization |
| :--- | :---: | :--- |
| **Agentic Loops (25+ calls/session)** | 72% | Deduplication + Routing |
| **RAG Pipelines** | 58% | Compression + Caching |
| **Customer Support Chat** | 81% | Caching + Routing |
| **Voice AI (10K calls/day)** | 67% | Caching + Compression |
| **Code Generation** | 45% | Routing + Compression |

---

## Throughput Benchmarks

### Single Instance

| Metric | Value |
| :--- | :--- |
| **Max Concurrent Streams** | 5,000+ |
| **Requests/Second (Cache Hit)** | 12,000 rps |
| **Requests/Second (Cache Miss)** | 3,200 rps |
| **Requests/Second (Full Pipeline)** | 2,800 rps |

### Horizontal Scaling

| Instances | Aggregate rps (Cache Miss) |
| :---: | :---: |
| 1 | 2,800 |
| 3 | 8,200 |
| 5 | 13,500 |
| 10 | 26,000 |

Linear scaling is achieved because the gateway core is **stateless** — Redis handles all shared state.

---

## FAISS Index Performance

| Index Size | Search Latency (p50) | Search Latency (p99) | Memory |
| :---: | :---: | :---: | :---: |
| 1,000 vectors | 0.1ms | 0.3ms | 15MB |
| 10,000 vectors | 0.3ms | 0.8ms | 150MB |
| 100,000 vectors | 0.8ms | 2.1ms | 1.5GB |
| 1,000,000 vectors | 2.5ms | 5.2ms | 15GB |

FAISS IndexFlatIP provides exact nearest-neighbor search. For deployments exceeding 100K vectors, consider IVF-based indexes for sub-linear search time.

---

## Cost Savings Projection

For a team making 100,000 LLM API calls per month:

| Scenario | Monthly Cost (Direct) | Monthly Cost (Margin AI) | Savings |
| :--- | :---: | :---: | :---: |
| **All GPT-4o** | $1,250 | $250 | **$1,000/mo (80%)** |
| **Mixed Models** | $620 | $186 | **$434/mo (70%)** |
| **High Cache Hit Rate** | $1,250 | $125 | **$1,125/mo (90%)** |
| **Agentic Workload** | $3,400 | $680 | **$2,720/mo (80%)** |

---

## Methodology

All benchmarks follow these principles:

- **Reproducible:** Test scripts are included in the repository (`tests/benchmark_load.py`).
- **Production-Representative:** Request payloads are sampled from real-world agentic workloads.
- **Isolated:** Each layer is benchmarked independently to prevent cross-layer interference.
- **Warm:** All benchmarks are conducted after a 60-second warmup period to ensure model loading and JIT compilation are complete.

---

## Related

- [System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)
- [Competitive Comparison →](https://trymargin-ai.github.io/inference-gateway/comparisons)
- [API Reference →](https://trymargin-ai.github.io/inference-gateway/api-reference)
