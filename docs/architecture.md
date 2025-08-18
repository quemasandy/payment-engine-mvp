# Arquitectura

## Modelo C4

### Contexto
```mermaid
C4Context
    title Payment Engine Lite - Contexto
    Person(merchant, "Merchant", "Sistema que inicia pagos")
    System(paymentEngine, "Payment Engine Lite", "Motor de pagos")
    System_Ext(gateway, "Gateway", "Procesa tarjetas")
    Rel(merchant, paymentEngine, "HTTP/JSON")
    Rel(paymentEngine, gateway, "Autorización de pagos")
```

### Contenedores
```mermaid
C4Container
    title Payment Engine Lite - Contenedores
    Person(merchant, "Merchant")
    System_Boundary(pe, "Payment Engine Lite") {
        Container(api, "API", "Node.js", "Endpoints REST")
        Container(workers, "Workers", "Node.js", "Procesa eventos")
        ContainerDb(store, "Config/Outbox Store", "In-memory")
        ContainerQueue(bus, "Message Bus", "In-memory Pub/Sub")
    }
    System_Ext(gateway, "Gateway")
    Rel(merchant, api, "POST/GET")
    Rel(api, bus, "publish PaymentRequested")
    Rel(workers, bus, "consume")
    Rel(workers, gateway, "authorize")
    Rel(workers, store, "persist payments")
    Rel(api, store, "idempotency/config")
```

### Componentes (API)
```mermaid
C4Component
    title API - Componentes
    Container(api, "API")
    Component(ctrl, "Controladores HTTP")
    Component(idem, "Middleware Idempotencia")
    Component(domain, "Validaciones Dominio")
    Rel(ctrl, idem, "verifica claves")
    Rel(ctrl, domain, "valida payloads")
    Rel(ctrl, "MessageBus", "publica eventos")
```

### Código
```mermaid
graph TD
    A[apps/api/src/app.ts] --> B[packages/lib/idempotency]
    A --> C[packages/adapters/messagebus/inMemory]
    A --> D[packages/domain]
```

## Decisiones Arquitectónicas Clave (ADR)
1. **Node.js + TypeScript** por productividad y ecosistema.
2. **Hexagonal (Ports & Adapters)** para aislar el dominio.
3. **CloudEvents 1.0** como contrato de eventos asíncronos.
4. **OpenTelemetry** para trazas y métricas portables.
5. **Adapters en memoria** en el MVP; reemplazables por servicios gestionados.
