# Margin AI Inference Gateway

## Enterprise-Grade LLM Inference Optimization Engine

The Inference Gateway is Margin AI's flagship module — a battle-tested, six-layer optimization pipeline that intercepts every LLM API call, eliminates waste at the token level, enforces data loss prevention, and routes intelligently across 100+ providers. All with a single line of code.

---

## Why Margin AI?

### The Challenge

Organizations scaling AI workloads face an impossible trilemma:

1. **Inference Cost Explosion:** Multi-step agents, RAG pipelines, and agentic loops generate massive token volumes. 80% of these calls are trivial background tasks (JSON formatting, date parsing, entity extraction) being routed to premium models at 100x the necessary cost.

2. **Data Privacy Liability:** Customer PII — emails, credit card numbers, social security numbers — is embedded in prompts and conversation histories. Every outbound API call to OpenAI, Anthropic, or Google risks regulatory exposure under HIPAA, SOC2, GDPR, and CCPA.

3. **Operational Blindness:** Engineering teams have no real-time visibility into token-level spend, model utilization, or cache efficiency. Finance teams receive a single monthly invoice with no attribution.

### The Solution

Margin AI solves all three simultaneously through a **six-layer inference optimization pipeline** operating entirely within your VPC:

- **Wire-Level Prompt Compression** — Proprietary payload optimization that reduces input tokens by 30-60% without altering semantic content.
- **Stateful Context Deduplication** — Hash-based detection and intelligent collapse of repeated system prompts and conversation context across agentic loops.
- **Token Budget Enforcement** — Configurable input token ceilings with intelligent truncation strategies that preserve critical context.
- **Sub-Millisecond Semantic Caching** — FAISS-powered vector similarity search with ID-mapped Redis response store. Exact and fuzzy cache hits at <1ms latency.
- **Hybrid Intelligent Routing** — Two-layer classification engine (heuristic fast-path + sentence-transformer embeddings) that routes each request to the most cost-effective model capable of handling it.
- **Automated PII Redaction** — Two-pass Data Loss Prevention pipeline combining regex pattern matching with Microsoft Presidio's contextual NLP engine.

---

## Key Capabilities

### ⚡ Prompt Compression Engine

Automatically optimizes outbound payloads at the wire level, stripping redundant structural tokens and reformatting data representations to achieve **30-60% input token reduction** on every API call. Your application continues to send standard JSON — Margin AI compresses at the LLM boundary transparently.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/prompt-compression)

### 🔁 Context Deduplication Engine

Agentic workflows and multi-turn applications resend identical system prompts and conversation history on every iteration. Margin AI's deduplication engine hashes each message block, detects repetition across requests, and intelligently collapses redundant context — reducing input tokens by an additional **20-40%** on agentic workloads.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/context-deduplication)

### 🧠 Semantic Cache (FAISS)

Enterprise-grade semantic caching powered by a **FAISS IndexIDMap** vector index with sentence-transformer embeddings (`all-MiniLM-L6-v2`). When a semantically similar query is detected, the cached response is served directly from a Redis-backed store in **sub-millisecond latency** — zero tokens consumed, zero provider cost.

Data integrity is guaranteed through ID-mapped synchronization between the FAISS index and the Redis response store, eliminating cache desync risk under concurrent writes.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/semantic-cache)

### 🎯 Intelligent Routing Engine

A hybrid two-layer routing classifier that evaluates every request's complexity before selecting the optimal model:

- **Layer 1 (Fast Path):** Heuristic scoring based on keyword analysis, prompt length, structural cues (code blocks, JSON), and question complexity. Resolves obvious cases in **<1ms**.
- **Layer 2 (Smart Path):** For ambiguous prompts, a sentence-transformer embedding model classifies the request against pre-computed exemplar sets for complex vs. trivial workloads using cosine similarity scoring.

Result: Trivial tasks route to $0.05/M-token models. Complex reasoning routes to GPT-4o or Claude. You only pay for the intelligence you actually need.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/intelligent-routing)

### 🛡️ PII Redaction Engine (DLP)

Two-pass Data Loss Prevention pipeline that operates on the full conversation history before any payload exits your VPC:

- **Pass 1 (Fast Regex):** High-speed pattern matching for credit cards, SSNs, emails, phone numbers, IP addresses, and custom entity types. Covers ~80% of PII in **<1ms**.
- **Pass 2 (Presidio NLP):** Microsoft Presidio's contextual NLP engine for deep entity recognition — understands that "Order #555-1234" is NOT a phone number.
- **Prompt Injection Detection:** Multi-layer defense against adversarial prompts including Unicode homoglyph normalization and Base64 payload decoding.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/pii-redaction)

### 🔄 Auto-Failover & High Availability

If OpenAI returns a `429`, Anthropic experiences latency degradation, or any provider throws an error, Margin AI automatically cascades the request to the next best provider **mid-stream** — preserving the SSE connection to your client.

Provider health is monitored continuously. Failover decisions are made in <5ms with zero client-side awareness.

**Result:** 99.999% effective uptime across your AI workloads, regardless of any single provider's reliability.

[Learn more →](https://trymargin-ai.github.io/inference-gateway/auto-failover)

### 📊 Real-Time CFO Analytics Dashboard

Stop guessing where your AI budget is going. The built-in analytics dashboard tracks:

- **Avoided Spend** — Dollar-and-cent savings from caching, routing, and compression.
- **Token Utilization** — Input vs. output token breakdown by model and provider.
- **Cache Hit Rates** — Real-time semantic cache performance metrics.
- **Model Distribution** — Which models are handling what percentage of your traffic.
- **Streaming Analytics** — Full visibility even when `stream=true`, unlike competitors that lose tracking during SSE streams.

### 🔐 Token Budget Guard

Configurable per-key and per-request input token ceilings. When a prompt exceeds the budget, Margin AI applies intelligent truncation — preserving the system prompt and most recent conversation turns while trimming older context. Prevents runaway costs from accidentally oversized prompts.

---

## Competitive Advantages

| Feature | Margin AI | LiteLLM | Cloudflare AI Gateway | Portkey | Helicone |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Prompt Compression** | ✅ Automatic | ❌ None | ❌ None | ❌ None | ❌ None |
| **Context Deduplication** | ✅ Built-in | ❌ None | ❌ None | ❌ None | ❌ None |
| **Semantic Caching** | ✅ FAISS + Redis | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic | ❌ None |
| **Intelligent Routing** | ✅ Hybrid ML | ⚠️ Rules-only | ❌ None | ⚠️ Rules-only | ❌ None |
| **PII Redaction** | ✅ Regex + Presidio | ❌ Enterprise-only | ❌ None | ❌ None | ❌ None |
| **Prompt Injection Detection** | ✅ Multi-layer | ❌ None | ❌ None | ❌ None | ❌ None |
| **Auto-Failover** | ✅ Mid-stream | ✅ Basic | ⚠️ Manual | ✅ Basic | ❌ None |
| **Streaming Analytics** | ✅ Full SSE tracking | ⚠️ Partial | ❌ Lost during stream | ⚠️ Partial | ✅ Yes |
| **Deployment** | VPC / On-Prem | VPC / Cloud | Hosted (external) | Hosted (external) | Hosted (external) |
| **Added Latency** | **<2ms** | <5ms | ~50ms | ~30ms | ~20ms |
| **Pricing** | **Free / OSS** | Free / Enterprise | Usage-based | Usage-based | Usage-based |

[Full comparison →](https://trymargin-ai.github.io/inference-gateway/comparisons)

---

## Use Cases

### Agentic Workflows

Multi-step autonomous agents (research bots, coding assistants, workflow automation) generate hundreds of LLM calls per session. Margin AI's compression, deduplication, and routing layers eliminate 60-80% of wasted tokens on background loops while ensuring complex reasoning tasks still reach premium models.

### RAG Pipelines

Retrieval-Augmented Generation systems embed large context windows with retrieved documents. Margin AI compresses these payloads, caches repeated retrieval patterns, and routes synthesis tasks to the optimal model — cutting RAG inference costs by up to 70%.

### Voice AI & Real-Time Applications

High-volume voice platforms processing 10,000+ calls/day benefit from semantic caching (identical customer queries) and prompt compression, while auto-failover ensures zero downtime during provider outages.

### Enterprise Customer Support

Customer support copilots handling repetitive queries achieve near-100% cache hit rates on common questions, while PII redaction ensures customer data never reaches external LLM providers.

---

## Quick Start

### Integration in 10 Seconds

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_margin_ai_key",
    base_url="http://localhost:8000/v1"  # ← Point to Margin AI
)

# Your app now has compression, caching, routing, and PII redaction
response = client.chat.completions.create(
    model="auto",  # Margin AI selects the optimal model
    messages=[{"role": "user", "content": "What is the capital of France?"}]
)
```

---

## Architecture Overview

Deep dive into the six-layer pipeline, FAISS vector engine, hybrid routing classifier, and Presidio NLP integration.

[System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)

## API Reference

Complete REST API documentation with request/response examples, error codes, and SDK guides.

[API Reference →](https://trymargin-ai.github.io/inference-gateway/api-reference)

## Getting Started

Deploy the full control plane in your VPC in under 3 minutes.

```bash
git clone https://github.com/ramprag/margin_ai.git && cd margin_ai
cp .env.example .env   # Configure your provider keys
docker-compose up --build -d
# Open http://localhost:8000 for the CFO Dashboard
```

---

## License

Margin AI is released under the **MIT License**. The full inference gateway, all six optimization layers, and the CFO Dashboard are included in the open-source distribution.

Enterprise features (SSO, audit logging, managed cloud deployment, SLA guarantees) are available under a commercial license. [Contact sales](mailto:sales@margin-ai.dev) for details.
