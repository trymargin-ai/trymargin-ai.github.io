# Context Deduplication Engine

## Intelligent Collapse of Repetitive LLM Context

The Context Deduplication Engine targets the single largest source of token waste in modern AI applications: **repeated context in agentic loops**. Multi-step agents, chain-of-thought workflows, and multi-turn conversations resend the same system prompts and conversation history on every iteration — burning tokens on content the model has already processed.

Margin AI detects this repetition at the gateway level and collapses it, reducing input tokens by **20-40%** on agentic workloads.

---

## The Problem

Consider a typical LangChain agent loop that makes 25 LLM calls to complete a task:

| Call # | System Prompt | History | New Content | Total Tokens |
| :---: | :---: | :---: | :---: | :---: |
| 1 | 800 tokens | 0 | 200 | 1,000 |
| 5 | 800 tokens | 1,600 | 200 | 2,600 |
| 10 | 800 tokens | 4,000 | 200 | 5,000 |
| 25 | 800 tokens | 12,000 | 200 | 13,000 |

The system prompt (800 tokens) is sent **identically** on every single call — that's 20,000 wasted tokens across 25 calls. The conversation history grows linearly, but earlier turns are rarely referenced by the model.

**Without deduplication:** ~125,000 total input tokens.
**With deduplication:** ~72,000 total input tokens. **42% reduction.**

---

## How It Works

### Stage 1: Message Fingerprinting

Every message in the `messages[]` array is hashed using SHA-256. The engine maintains a per-session fingerprint registry that tracks which message blocks have been seen before.

```
Request #1: [SYS_abc123, USR_def456]              → All new, send as-is
Request #2: [SYS_abc123, USR_def456, ASST_ghi789] → SYS_abc123 seen, compress
Request #3: [SYS_abc123, USR_def456, ASST_ghi789, USR_jkl012] → 3 of 4 seen
```

### Stage 2: Repetition Classification

Each detected duplicate is classified:

| Pattern | Action |
| :--- | :--- |
| **Identical System Prompt** | Replaced with a compressed reference token. The model receives a condensed version on subsequent calls. |
| **Repeated Conversation Turns** | Older turns beyond a configurable window are summarized into a single context block. |
| **Duplicate Tool Definitions** | Tool schemas that appear identically across calls are sent once and referenced thereafter. |
| **Identical Retrieval Context** | RAG-injected documents that repeat across calls are deduplicated. |

### Stage 3: Context Reconstruction

The engine ensures the model always receives a **semantically complete** prompt. Deduplicated content is replaced with condensed versions — never omitted entirely. The model's ability to reason is fully preserved.

---

## Deduplication Strategies

### Strategy 1: Session-Aware Compression

For multi-turn conversations with the same user, the engine tracks conversation state across requests. Messages that have already been processed are references rather than retransmitted in full.

### Strategy 2: Cross-Request Pattern Detection

For agentic workloads where many parallel requests share the same system prompt (e.g., a coding agent spawning 10 sub-tasks), the engine detects the common prompt pattern and compresses it across all concurrent requests.

### Strategy 3: Temporal Windowing

Conversation history beyond a configurable window (default: last 8 turns) is compressed into a summary block. This prevents the linear token growth that plagues long-running agent sessions.

---

## Performance

| Metric | Value |
| :--- | :--- |
| **Token Reduction (Agentic)** | 20-40% |
| **Token Reduction (Multi-Turn Chat)** | 10-25% |
| **Token Reduction (RAG Pipelines)** | 15-30% |
| **Processing Latency** | <0.3ms |
| **Memory Overhead** | <2MB per active session |

---

## Configuration

```bash
# .env
DEDUP_ENABLED=true                    # Master toggle
DEDUP_HISTORY_WINDOW=8                # Number of recent turns to preserve in full
DEDUP_SYSTEM_PROMPT_COMPRESS=true     # Compress repeated system prompts
DEDUP_TOOL_SCHEMA_COMPRESS=true       # Compress repeated tool definitions
DEDUP_SESSION_TTL=3600                # Session fingerprint TTL (seconds)
```

---

## Integration

The deduplication engine operates entirely within the Margin AI pipeline. No client-side changes are required. Your agent framework sends the full `messages[]` array as usual — Margin AI handles the optimization transparently.

The CFO Dashboard reports deduplication savings per-request:

```json
{
  "deduplication": {
    "original_tokens": 8450,
    "deduplicated_tokens": 5120,
    "tokens_saved": 3330,
    "savings_percent": 39.4,
    "patterns_detected": ["system_prompt", "tool_schema", "history_turns"]
  }
}
```

---

## Related

- [Prompt Compression Engine →](https://trymargin-ai.github.io/inference-gateway/prompt-compression)
- [Semantic Cache →](https://trymargin-ai.github.io/inference-gateway/semantic-cache)
- [System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)
