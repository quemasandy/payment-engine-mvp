# Payment Engine Lite

Motor de pagos minimalista escrito en Node.js y TypeScript. Permite autorizar, capturar y reembolsar pagos usando una arquitectura asincrónica basada en eventos CloudEvents 1.0. Diseñado para fintechs y comercios que necesitan un prototipo funcional en semanas.

## ¿Qué problema resuelve?
- Unifica la integración con múltiples *gateways*.
- Gestiona idempotencia y reintentos de forma automática.
- Provee telemetría portable con OpenTelemetry.

## Público objetivo
Equipos de ingeniería que requieren un *payment engine* ligero para pruebas, POCs o despliegues multi-cloud.

## Instalación y ejecución (menos de 5 pasos)
1. Instala Docker y Docker Compose.
2. Clona el repositorio y entra al directorio:
   ```bash
   git clone https://github.com/example/payment-engine-mvp.git
   cd payment-engine-mvp
   ```
3. Levanta el stack local (API + workers + observabilidad):
   ```bash
   docker compose -f infra/docker-compose.yml up
   ```
4. Crea un pago de prueba:
   ```bash
   curl -s -XPOST 'http://localhost:3000/payments?mode=sync' \
     -H 'Content-Type: application/json' -H 'Idempotency-Key: inv-1' \
     -d '{"originId":"originA","idempotencyKey":"inv-1","amount":1299,"currency":"USD","orderId":"ord-1","capture":false,"token":{"type":"network","token":"tok_x"}}' | jq
   ```

## Uso rápido
- `POST /payments` crea un pago.
- `GET /payments/{id}` consulta el estado.
- `POST /refunds` inicia un reembolso.
Consulta [docs/api.md](docs/api.md) para el detalle completo.

## Documentación
- [Arquitectura](docs/architecture.md)
- [API y contratos](docs/api.md)
- [Flujos de negocio](docs/business-flows.md)
- [Operación y DevOps](docs/operations.md)
- [Guía de contribución](CONTRIBUTING.md)

## Tests
```bash
npm install
npm test
```
