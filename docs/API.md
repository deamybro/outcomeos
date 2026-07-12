# API

`GET /api/health` returns operational mode. `POST /api/okx/a2mcp/outcome-contract` accepts `{task, taskType, requiredFeatures}`. `POST /api/okx/a2mcp/proof-check` accepts `{contract,targetType,target}`. Errors contain `code`, actionable `message`, `action`, and `requestId`. Default public rate target: 60 requests/minute per deployment policy.

```bash
curl -X POST "$BASE/api/okx/a2mcp/outcome-contract" -H "content-type: application/json" -d '{"task":"Review my public landing page","taskType":"website","requiredFeatures":["documentation"]}'
```
