# Margin AI

## The Enterprise LLM Inference Control Plane

Optimize every token. Protect every payload. Control every dollar.

Margin AI is the industry's first **full-stack inference optimization layer** — a hardened, production-grade control plane that intercepts, compresses, caches, routes, and secures every LLM API call across 100+ providers with a single line of code.

---

## What is Margin AI?

Margin AI is a transparent, drop-in gateway designed to solve the inference cost crisis facing every organization running LLM workloads at scale.

While generic API gateways offer basic request forwarding and rate limiting, Margin AI deploys a **six-layer optimization pipeline** — operating entirely within your VPC — that reduces total inference spend by up to 80% while enforcing SOC2/HIPAA-grade data loss prevention on every outbound payload.

Margin AI is not a wrapper. It is infrastructure.

---

## Why Engineering Teams Choose Margin AI

### 💰 Cost Mastery

We don't just route requests — we **eliminate waste at every layer**. Prompt compression strips redundant tokens before they hit the wire. Context deduplication collapses repetitive agentic loops. Semantic caching serves repeated queries at zero cost. Intelligent routing ensures you never pay GPT-4o prices for a task that a $0.05/M-token model can handle. The result: up to 80% reduction in total inference spend, verified in real-time on the CFO Dashboard.

### 🛡️ Provable Privacy

Don't take our word for it — inspect the logs. Every outbound payload passes through a **two-pass PII redaction pipeline** combining high-speed regex pattern matching with Microsoft Presidio's contextual NLP engine. SSNs, credit cards, emails, and custom entity types are redacted **before** the payload ever leaves your VPC. Zero data leakage. Zero trust required.

### ⚖️ Compliance-First

Built from the ground up for regulated industries. Margin AI's Data Loss Prevention engine, combined with full VPC-local deployment, means your organization achieves SOC2, HIPAA, and GDPR compliance posture out of the box — without routing sensitive data through third-party SaaS platforms.

### 🚀 Developer Speed

Change one line of code. That's it. Margin AI implements the OpenAI API standard exactly — any SDK, framework, or agent that speaks OpenAI can connect to Margin AI in under 10 seconds. No new SDK. No refactoring. No migration. Your entire AI stack is hardened instantly.

---

## Available Modules

### ⚡ Inference Gateway

Our flagship module — a battle-tested, six-layer LLM inference optimization engine for agentic workflows, RAG pipelines, voice AI, and any workload making LLM API calls at scale.

- **Prompt Compression** — 30-60% input token reduction via wire-level payload optimization.
- **Context Deduplication** — Intelligent collapse of repetitive system prompts and conversation history.
- **Semantic Caching** — Sub-millisecond FAISS vector search with Redis-backed response store.
- **Intelligent Routing** — Hybrid heuristic + embedding-based complexity classification.
- **PII Redaction** — Two-pass DLP with regex fast-path and Presidio NLP deep scan.
- **Auto-Failover** — Cascading multi-provider failover with mid-stream recovery.

[Explore Inference Gateway →](https://trymargin-ai.github.io/inference-gateway)

---

## Quick Exploration

### 🚀 Get Running in 3 Minutes

Deploy the full control plane and real-time CFO Dashboard inside your VPC with Docker:

```bash
# 1. Clone
git clone https://github.com/ramprag/margin_ai.git && cd margin_ai

# 2. Configure provider keys
cp .env.example .env   # Add your OpenAI, Groq, Gemini, Anthropic keys

# 3. Launch
docker-compose up --build -d

# 4. Open the CFO Dashboard
open http://localhost:8000
```

Once running, point any AI SDK to `http://localhost:8000/v1` — your infrastructure is hardened.

[Try it now](https://trymargin-ai.github.io/inference-gateway#quick-start) 

### 🏗️ System Architecture

Deep dive into the six-layer optimization pipeline, FAISS vector engine, hybrid routing classifier, and the Presidio NLP integration.

[View Architecture](https://trymargin-ai.github.io/inference-gateway/architecture)

---

## Open Source & Enterprise Ready

Margin AI is **Open Core**. The full inference gateway and all six optimization layers are available under the MIT License.

- **No Vendor Lock-in:** Deploy on-prem, in your private cloud, or air-gapped. Your data never leaves your infrastructure.
- **No Per-Seat Cost:** Scale to thousands of concurrent streams on your own hardware.
- **Modern Stack:** Python (FastAPI, FAISS, Presidio, Sentence-Transformers), Redis, and a fully OpenAI-compatible REST API.

Built for the future of AI infrastructure. Open for everyone.

[GitHub Repository](https://github.com/ramprag/margin_ai) · [Inference Gateway Overview](https://trymargin-ai.github.io/inference-gateway) · [Report Issues](https://github.com/ramprag/margin_ai/issues)
