# PII Redaction Engine (DLP)

## Enterprise-Grade Data Loss Prevention for LLM Payloads

The PII Redaction Engine is Margin AI's compliance backbone. It ensures that no personally identifiable information — credit card numbers, social security numbers, email addresses, phone numbers, or custom entity types — ever reaches an external LLM provider.

Every outbound payload passes through a **two-pass pipeline** combining high-speed regex pattern matching with Microsoft Presidio's contextual NLP engine. All processing occurs entirely within your VPC.

---

## The Problem

LLM-powered applications routinely process customer data:

- **Customer Support Agents:** "My credit card 4111-1111-1111-1111 was charged incorrectly"
- **Sales Copilots:** "Contact john.doe@company.com about the renewal"
- **Healthcare Assistants:** "Patient SSN 123-45-6789 needs a refill on..."
- **Financial Advisors:** "Transfer $50K to account 9876543210"

Every one of these prompts, sent to OpenAI or Anthropic, represents a potential HIPAA, SOC2, GDPR, or CCPA violation. A single audit finding can cost millions in fines and destroy customer trust.

---

## How It Works

### Pass 1: High-Speed Regex Engine (&lt;1ms)

Compiled regex patterns detect high-confidence PII entities in sub-millisecond time:

| Entity Type | Pattern | Example | Replacement |
| :--- | :--- | :--- | :--- |
| **Credit Card** | Luhn-validated 13-19 digit sequences | 4111-1111-1111-1111 | `[CREDIT_CARD]` |
| **SSN** | XXX-XX-XXXX format | 123-45-6789 | `[SSN]` |
| **Email** | RFC 5322 compliant patterns | john@example.com | `[EMAIL]` |
| **Phone** | International + domestic formats | +1-555-123-4567 | `[PHONE]` |
| **IP Address** | IPv4 and IPv6 | 192.168.1.1 | `[IP_ADDRESS]` |
| **Custom** | User-defined patterns | MRN-12345678 | `[CUSTOM_ENTITY]` |

**Coverage:** ~80% of PII entities in production workloads.
**Latency:** &lt;1ms for payloads up to 50KB.

### Pass 2: Presidio NLP Deep Scan (3-8ms)

For entities that regex cannot reliably detect (names, addresses, contextual entities), the engine invokes Microsoft Presidio's SpaCy-backed Named Entity Recognition:

- **Contextual Understanding:** Knows that "Order #555-1234" is an order number, NOT a phone number.
- **Name Detection:** Identifies personal names in natural language without false positives on company names.
- **Address Detection:** Recognizes full street addresses, including international formats.
- **Medical Record Numbers:** Detects MRN patterns in healthcare contexts.
- **Confidence Scoring:** Each detection includes a confidence score for audit trail purposes.

### Prompt Injection Shield

Beyond PII, the engine includes multi-layer defense against adversarial prompt manipulation:

**Layer 1: Unicode Homoglyph Normalization**
Attackers replace ASCII characters with visually identical Unicode characters (e.g., Cyrillic 'а' instead of Latin 'a') to bypass filters. The engine normalizes all homoglyphs before scanning.

**Layer 2: Base64 Decoding**
Attackers encode malicious instructions ("ignore previous instructions") in Base64 to hide them from text-based filters. The engine identifies Base64 chunks, decodes them, and scans the decoded content.

**Layer 3: Pattern Matching**
Known injection signatures ("ignore previous instructions", "you are now", "system prompt override") are detected with fuzzy matching to catch variations.

---

## Redaction Transparency

Every redaction event is logged with full context for audit compliance:

```json
{
  "redaction": {
    "entities_detected": 3,
    "entities_redacted": 3,
    "details": [
      {
        "type": "CREDIT_CARD",
        "pass": "regex",
        "position": {"start": 45, "end": 64},
        "confidence": 0.99,
        "replacement": "[CREDIT_CARD]"
      },
      {
        "type": "EMAIL",
        "pass": "regex",
        "position": {"start": 102, "end": 124},
        "confidence": 0.95,
        "replacement": "[EMAIL]"
      },
      {
        "type": "PERSON_NAME",
        "pass": "presidio",
        "position": {"start": 12, "end": 22},
        "confidence": 0.87,
        "replacement": "[PERSON]"
      }
    ]
  }
}
```

---

## Compliance Posture

| Standard | How Margin AI Addresses It |
| :--- | :--- |
| **SOC2 Type II** | PII never leaves VPC. Audit logs for every redaction event. |
| **HIPAA** | PHI (Protected Health Information) redacted before external API calls. |
| **GDPR** | Personal data is not transmitted to third-party processors. |
| **CCPA** | Consumer personal information is protected at the gateway level. |
| **PCI DSS** | Credit card numbers are Luhn-validated and redacted with zero false negatives. |

---

## Custom Entity Configuration

Define custom PII patterns for your domain:

```python
# backend/core/security.py — add domain-specific patterns
CUSTOM_REDACTION_PATTERNS = {
    r'\b[A-Z]{2}\d{6}\b': '[EMPLOYEE_ID]',        # Internal employee IDs
    r'\bMRN-\d{8}\b': '[MEDICAL_RECORD]',          # Medical record numbers
    r'\bACCT-\d{10}\b': '[ACCOUNT_NUMBER]',        # Financial account numbers
    r'\b\d{3}-\d{2}-\d{4}\b': '[TAX_ID]',          # Tax identification numbers
}
```

---

## Performance

| Metric | Value |
| :--- | :--- |
| **Pass 1 Latency (Regex)** | &lt;1ms |
| **Pass 2 Latency (Presidio)** | 3-8ms |
| **Total DLP Pipeline** | &lt;10ms |
| **False Negative Rate** | &lt;0.1% (credit cards, SSNs) |
| **False Positive Rate** | &lt;2% (names, addresses) |
| **Max Payload Size** | 100KB+ |

---

## Configuration

```bash
# .env
PII_REDACTION_ENABLED=true              # Master toggle
PII_PASS1_ENABLED=true                  # Regex fast path
PII_PASS2_ENABLED=true                  # Presidio NLP deep scan
PII_INJECTION_DETECTION=true            # Prompt injection shield
PII_CONFIDENCE_THRESHOLD=0.7            # Min confidence for Presidio entities
PII_CUSTOM_PATTERNS_FILE=custom.json    # Path to custom pattern definitions
```

---

## Related

- [System Architecture →](https://trymargin-ai.github.io/inference-gateway/architecture)
- [Auto-Failover →](https://trymargin-ai.github.io/inference-gateway/auto-failover)
- [Competitive Comparison →](https://trymargin-ai.github.io/inference-gateway/comparisons)
