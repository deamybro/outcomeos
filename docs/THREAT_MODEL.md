# Threat model

| Threat | Boundary and mitigation |
|---|---|
| SSRF / DNS rebinding | HTTP(S) only, no credentials, private/loopback/link-local IP rejection, DNS validation, timeouts and response caps. Redirect destinations require further hardening; see limitations. |
| Malicious repositories | GitHub API static reads only; no clone or command execution in web requests. Controlled workflow is opt-in. |
| Prompt injection | Audited content is untrusted data and cannot modify verifier policy. AI output is strict-schema advisory data. |
| Stored XSS | React output encoding, CSP, structured JSON, no raw HTML rendering. |
| Broken access control | Owner RLS and server-verified admin policy; service role is never browser-exposed. |
| Receipt leakage | Public sharing must run recursive redaction and expose only a selected public slug. |
| Abuse / leakage | Body limits at the platform edge, rate-limit policy, redacted logs, no auth headers/cookies/secrets. |
| Evidence tampering | Canonical JSON SHA-256 is recalculated on access. Hashing is not blockchain anchoring. |
| False positives | Objective/advisory labels, evidence, confidence and limitations are retained. |
