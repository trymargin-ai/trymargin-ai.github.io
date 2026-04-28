# Auto-Failover & High Availability

## Cascading Multi-Provider Failover with Mid-Stream Recovery

Margin AI ensures your AI workloads achieve **99.999% effective uptime** regardless of any single provider's reliability. When OpenAI, Anthropic, Google, or Groq experiences an outage, rate limit, or latency degradation, Margin AI automatically cascades the request to the next best provider — mid-stream, with zero client-side awareness.

---

## The Problem

LLM providers are not as reliable as traditional cloud infrastructure:

| Provider Event | Frequency | Impact |
| :--- | :--- | :--- |
| **Rate Limiting (429)** | Daily for high-volume users | Requests blocked for 60s+ |
| **Service Degradation** | Weekly | 2-5x latency increase |
| **Regional Outage** | Monthly | Complete unavailability for 15-60 min |
| **API Changes / Breakage** | Quarterly | Silent failures or schema mismatches |

For production AI applications, a single provider dependency is an unacceptable risk. Mission-critical agent workflows, customer-facing copilots, and real-time voice applications cannot tolerate 60-second retry loops.

---

## How It Works

### Provider Health Scoring

Every configured provider maintains a real-time health score based on:

- **Latency Percentiles:** p50, p95, p99 response times over a rolling 5-minute window.
- **Error Rate:** Percentage of 4xx/5xx responses over the last 100 requests.
- **Rate Limit Proximity:** Distance from known rate limit ceilings.
- **Last Success:** Time since the last successful response.

```
Provider Health Scores (real-time):
  OpenAI GPT-4o:           ████████░░  82/100
  Anthropic Claude 3.5:    ██████████  98/100
  Groq Llama-3.1-8b:       █████████░  94/100
  Google Gemini 1.5 Pro:   ██████░░░░  65/100  ← degraded latency
```

### Cascade Strategy

When a request fails, the engine cascades through providers in health-score order:

```
1. Primary Provider (selected by routing engine)
   └─ HTTP 429 (rate limited)
      └─ 2. Next healthiest provider (same model class)
         └─ HTTP 200 ✓ Response delivered to client
```

### Mid-Stream Recovery

For **streaming requests** (SSE), Margin AI performs failover **within the active stream**:

1. Client initiates a streaming request to GPT-4o.
2. After 3 seconds, OpenAI returns a 500.
3. Margin AI **within the same SSE connection** reroutes to Claude 3.5 Sonnet.
4. The client receives the response seamlessly — no reconnection, no retry, no error.

The client's SSE connection is never broken. The failover is invisible.

---

## Failover Policies

### Retry Configuration

```bash
# .env
FAILOVER_ENABLED=true                    # Master toggle
FAILOVER_MAX_RETRIES=3                   # Max cascade attempts
FAILOVER_TIMEOUT_MS=10000                # Per-provider timeout
FAILOVER_BACKOFF_BASE_MS=100             # Exponential backoff base
FAILOVER_BACKOFF_MAX_MS=2000             # Max backoff delay
FAILOVER_JITTER=true                     # Add random jitter to prevent thundering herd
```

### Provider Priority Override

Force specific failover chains for compliance or cost reasons:

```bash
# .env
FAILOVER_CHAIN=openai,anthropic,groq,gemini    # Explicit cascade order
FAILOVER_EXCLUDE_PROVIDERS=                     # Providers to never fail over to
```

---

## Failover Analytics

Every failover event is tracked with full context:

```json
{
  "failover": {
    "triggered": true,
    "primary_provider": "openai",
    "primary_error": "429 Too Many Requests",
    "failover_provider": "anthropic",
    "failover_model": "claude-3.5-sonnet-20240620",
    "failover_latency_ms": 4.2,
    "total_cascade_attempts": 1,
    "client_impact": "none",
    "stream_preserved": true
  }
}
```

---

## Supported Providers

| Provider | Models | Health Monitoring | Mid-Stream Failover |
| :--- | :--- | :---: | :---: |
| **OpenAI** | GPT-4o, GPT-4o-mini, GPT-3.5-turbo, o1, o3 | ✅ | ✅ |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku | ✅ | ✅ |
| **Google** | Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 | ✅ | ✅ |
| **Groq** | Llama 3.1 8B, Llama 3.3 70B, Mixtral 8x7B | ✅ | ✅ |
| **Azure OpenAI** | All Azure-hosted OpenAI models | ✅ | ✅ |
| **Custom / Self-Hosted** | Any OpenAI-compatible endpoint | ✅ | ✅ |

---

## Uptime Guarantee

With 3+ providers configured, Margin AI achieves **99.999% effective uptime** (less than 5 minutes of downtime per year) — even when individual providers experience extended outages.

| Configuration | Effective Uptime |
| :--- | :--- |
| 1 Provider | ~99.9% (provider-dependent) |
| 2 Providers | ~99.99% |
| 3+ Providers | **~99.999%** |

---

## Related

- [Intelligent Routing →](https://trymargin-ai.github.io/inference-gateway/intelligent-routing)
- [System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)
- [Performance Benchmarks →](https://trymargin-ai.github.io/inference-gateway/benchmarks)
