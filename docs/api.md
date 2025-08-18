# API y Contratos

## Endpoints REST (OpenAPI 3.1)
El archivo [openapi.yaml](../openapi.yaml) describe el contrato completo. Resumen:

| Método | Path              | Descripción               |
|---------|-------------------|-----------------------------|
| POST    | `/payments`        | Crear pago (sync/async)     |
| GET     | `/payments/{id}`   | Consultar estado de pago    |
| POST    | `/refunds`         | Crear reembolso             |
| POST    | `/webhooks/gateway`| Webhooks del gateway        |

### Ejemplo: crear pago
```http
POST /payments?mode=sync
Content-Type: application/json
Idempotency-Key: inv-1

{
  "originId": "originA",
  "idempotencyKey": "inv-1",
  "amount": 1299,
  "currency": "USD",
  "orderId": "ord-1",
  "capture": false,
  "token": {"type":"network","token":"tok_x"}
}
```
Respuesta `201 Created`:
```json
{
  "paymentId": "pay_123",
  "status": "authorized",
  "amount": 1299,
  "currency": "USD"
}
```

## Eventos (CloudEvents 1.0)
La plataforma publica y consume eventos usando [CloudEvents](https://cloudevents.io/).

| Tipo de evento       | Origen                  | Descripción                     |
|----------------------|-------------------------|----------------------------------|
| `PaymentRequested`   | API                     | Solicitud de autorización       |
| `PaymentAuthorized`  | Worker                  | Autorización exitosa            |
| `PaymentFailed`      | Worker                  | Autorización fallida            |
| `RefundRequested`    | API                     | Solicitud de reembolso            |
| `RefundCompleted`    | *(futuro)*              | Reembolso procesado               |

### Ejemplo `PaymentRequested`
```json
{
  "specversion": "1.0",
  "id": "evt-123",
  "type": "PaymentRequested",
  "source": "payment-engine-lite/api",
  "time": "2024-01-01T12:00:00Z",
  "data": {
    "paymentId": "pay_123",
    "originId": "originA",
    "idempotencyKey": "inv-1",
    "request": {"amount":1299,"currency":"USD"}
  }
}
```
