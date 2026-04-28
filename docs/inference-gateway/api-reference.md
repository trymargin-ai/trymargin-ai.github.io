# API Reference

## Complete REST API Documentation

Margin AI implements the **OpenAI REST API standard exactly**. Any library, SDK, or agent framework that speaks OpenAI can connect to Margin AI by changing the base URL. No custom SDK required.

---

## Base URL

```
http://localhost:8000/v1
```

For production deployments behind a reverse proxy or load balancer, replace with your internal endpoint.

---

## Authentication

All requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-margin-ai-key>
```

API keys are configured in the `.env` file. Multi-tenant deployments can configure per-key rate limits, model access controls, and cache isolation.

---

## Endpoints

### 1. Chat Completions

`POST /v1/chat/completions`

The primary gateway endpoint. Supports all OpenAI-compatible request parameters with Margin AI's six-layer optimization pipeline applied transparently.

#### Request

```json
{
  "model": "auto",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of France?"}
  ],
  "temperature": 0.7,
  "stream": false,
  "max_tokens": 1000
}
```

#### Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `model` | string | ✅ | Model name or `"auto"` for intelligent routing |
| `messages` | array | ✅ | Array of message objects (role/content) |
| `temperature` | float | ❌ | Sampling temperature (0-2). Default: 1.0 |
| `stream` | boolean | ❌ | Enable SSE streaming. Default: false |
| `max_tokens` | integer | ❌ | Maximum tokens in the response |
| `top_p` | float | ❌ | Nucleus sampling parameter |
| `frequency_penalty` | float | ❌ | Frequency penalty (-2.0 to 2.0) |
| `presence_penalty` | float | ❌ | Presence penalty (-2.0 to 2.0) |

#### Model Selection

| Value | Behavior |
| :--- | :--- |
| `"auto"` | Margin AI's routing engine selects the optimal model based on prompt complexity |
| `"gpt-4o"` | Force route to GPT-4o (skips intelligent routing) |
| `"llama-3.1-8b-instant"` | Force route to Groq Llama 3.1 8B |
| `"gemini-1.5-flash"` | Force route to Google Gemini 1.5 Flash |
| Any OpenAI-compatible model name | Route to the specified model via the appropriate provider |

#### Response

```json
{
  "id": "chatcmpl-margin-a1b2c3",
  "object": "chat.completion",
  "created": 1714003200,
  "model": "llama-3.1-8b-instant",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 24,
    "completion_tokens": 8,
    "total_tokens": 32
  },
  "margin_ai_optimized": true,
  "strategy": "efficiency_optimized",
  "estimated_cost": 0.0000016,
  "optimization": {
    "cache_hit": false,
    "tokens_compressed": 12,
    "tokens_deduplicated": 0,
    "pii_entities_redacted": 0,
    "routing_strategy": "heuristic_lean"
  }
}
```

#### Streaming Response

When `stream: true`, the response is delivered as Server-Sent Events (SSE):

```
data: {"id":"chatcmpl-margin-a1b2c3","object":"chat.completion.chunk","created":1714003200,"model":"llama-3.1-8b-instant","choices":[{"index":0,"delta":{"role":"assistant","content":"The"},"finish_reason":null}]}

data: {"id":"chatcmpl-margin-a1b2c3","object":"chat.completion.chunk","created":1714003200,"model":"llama-3.1-8b-instant","choices":[{"index":0,"delta":{"content":" capital"},"finish_reason":null}]}

data: [DONE]
```

Margin AI captures full token counts and cost analytics **even during streaming** — unlike competitors that lose visibility when SSE is enabled.

---

### 2. Analytics & Live Metrics

`GET /api/stats`

Returns real-time ROI and savings metrics for the CFO Dashboard.

#### Response

```json
{
  "direct": {
    "queries": 15420,
    "tokens": 4021000,
    "cost": 64.21
  },
  "margin": {
    "queries": 15420,
    "tokens": 4021000,
    "cost": 12.84,
    "saved": 51.37,
    "savings_percent": 80.0,
    "cache_hits": 4120,
    "cache_hit_rate": 26.7,
    "pii_redactions": 342,
    "routing_downgrades": 8940,
    "compression_savings_tokens": 1205000
  }
}
```

---

### 3. Health Check

`GET /health`

Returns gateway health status for load balancer integration.

```json
{
  "status": "healthy",
  "uptime_seconds": 86400,
  "providers": {
    "openai": {"status": "healthy", "latency_p50_ms": 320},
    "anthropic": {"status": "healthy", "latency_p50_ms": 280},
    "groq": {"status": "healthy", "latency_p50_ms": 45},
    "gemini": {"status": "degraded", "latency_p50_ms": 1200}
  },
  "cache": {
    "redis": "connected",
    "faiss_vectors": 8421
  }
}
```

---

## Error Responses

### Common Error Codes

| Code | Error | Description |
| :--- | :--- | :--- |
| `400` | `invalid_request` | Malformed payload or missing required fields |
| `401` | `authentication_error` | Invalid or missing API key |
| `429` | `rate_limit_exceeded` | Per-key rate limit exceeded |
| `500` | `internal_error` | Gateway processing error |
| `502` | `provider_error` | All providers failed (after failover cascade) |
| `503` | `service_unavailable` | Gateway is starting up or shutting down |

### Error Response Format

```json
{
  "error": {
    "message": "All configured providers returned errors after 3 failover attempts.",
    "type": "provider_error",
    "code": 502,
    "details": {
      "attempts": [
        {"provider": "openai", "error": "429 Too Many Requests"},
        {"provider": "anthropic", "error": "500 Internal Server Error"},
        {"provider": "groq", "error": "503 Service Unavailable"}
      ]
    }
  }
}
```

---

## Rate Limits

Default rate limits (configurable per API key):

| Tier | Requests/min | Tokens/min |
| :--- | :---: | :---: |
| **Free** | 60 | 100,000 |
| **Pro** | 600 | 1,000,000 |
| **Enterprise** | Unlimited | Unlimited |

---

## SDK Compatibility

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key="your_margin_ai_key",
    base_url="http://localhost:8000/v1"
)

response = client.chat.completions.create(
    model="auto",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    api_key="margin-ai-key",
    base_url="http://localhost:8000/v1",
    model="auto"
)
```

### JavaScript / TypeScript

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: 'your_margin_ai_key',
    baseURL: 'http://localhost:8000/v1'
});

const response = await client.chat.completions.create({
    model: 'auto',
    messages: [{ role: 'user', content: 'Hello!' }]
});
```

### cURL

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer margin-ai-key" \
  -d '{
    "model": "auto",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## Related Documentation

- [System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)
- [Performance Benchmarks →](https://trymargin-ai.github.io/inference-gateway/benchmarks)
- [Competitive Comparison →](https://trymargin-ai.github.io/inference-gateway/comparisons)
