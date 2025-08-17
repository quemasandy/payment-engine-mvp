# Payment Engine Lite (MVP, funcional, multi-cloud)

**Stack:** Node.js + TypeScript (funcional), OpenTelemetry → Datadog, CloudEvents 1.0, Ports/Adapters.

## Quickstart (local)
```bash
docker compose -f infra/docker-compose.yml up
# API en :3000
curl -s -XPOST 'http://localhost:3000/payments?mode=sync' \
  -H 'Content-Type: application/json' -H 'Idempotency-Key: inv-1' \
  -d '{"originId":"originA","idempotencyKey":"inv-1","amount":1299,"currency":"USD","orderId":"ord-1","capture":false,"token":{"type":"network","token":"tok_x"}}' | jq
```

## Tests
```bash
npm i
npm test
```

Repo estructura:
- `apps/api` HTTP
- `apps/workers` consumidores de eventos
- `packages/*` domain, ports, adapters, gateways, lib, tests
- `infra/docker-compose.yml` Datadog Agent opcional
- `openapi.yaml`

Notas:
- Idempotencia por Idempotency-Key (header/body)
- Token-only (PCI MVP)
- Gateways intercambiables vía OriginPolicy
- Reemplaza adapters in-memory por reales para producción
