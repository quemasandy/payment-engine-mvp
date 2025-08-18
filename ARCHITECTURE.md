# Documento de Arquitectura de Solución

## 1. Propósito y Alcance
Este documento describe la arquitectura del proyecto **Payment Engine Lite**. Se cubren la visión general del sistema y el detalle por componente. Se documentan las decisiones arquitectónicas, los patrones utilizados y la forma en que el diseño soporta un despliegue multi-cloud.

## 2. Visión General
Payment Engine Lite es un motor de pagos minimalista construido en Node.js y TypeScript. Expone una API HTTP para crear pagos y reembolsos, procesa eventos de manera asíncrona y está instrumentado con OpenTelemetry. El proyecto sigue una aproximación funcional con separación estricta entre dominio y periferia.

### 2.1 Multi-cloud
El sistema es *multi-cloud* porque se apoya en estándares y abstracciones que permiten desplegarlo en distintos proveedores:
- **Ports & Adapters** aíslan el dominio de la infraestructura. Los adaptadores en memoria del MVP pueden reemplazarse por implementaciones específicas de AWS, GCP o Azure (por ejemplo, DynamoDB, Pub/Sub, SQS, etc.).
- **CloudEvents 1.0** define un formato de eventos agnóstico al proveedor, facilitando la interoperabilidad entre buses de mensajes.
- **OpenTelemetry** ofrece observabilidad portable que puede exportarse a múltiples backends (Datadog, Prometheus, etc.).
- La **contenedorización** descrita en `infra/docker-compose.yml` permite ejecutar los servicios en cualquier orquestador compatible (Kubernetes, ECS, GKE, etc.).

## 3. Patrones de Diseño
- **Arquitectura Hexagonal (Ports & Adapters):** el dominio se declara en `packages/domain`, los puertos en `packages/ports` y las implementaciones en `packages/adapters` y `packages/gateways`.
- **Event-driven & Outbox:** la API publica eventos `CloudEvent` en un *message bus* y los workers los consumen. La cola *outbox* asegura la entrega confiable.
- **Idempotencia:** el middleware `idempotencyMiddleware` evita la duplicación de operaciones en la API.
- **Strategy/Router:** `originRouter` elige el gateway de pago según la política del origen.
- **Retry y Response shaping:** perfiles de reintentos y ajuste de respuestas configurables por origen.

## 4. Decisiones Arquitectónicas
1. **Node.js + TypeScript** por su ecosistema y soporte para programación funcional.
2. **Separación API/Workers** para diferenciar tráfico síncrono y procesamiento asíncrono.
3. **Modelado de dominio con Zod** para validación y tipado.
4. **Uso de CloudEvents** para estandarizar eventos entre servicios.
5. **Instrumentación con OpenTelemetry** para telemetría consistente entre entornos.
6. **Adapters en memoria** en el MVP para simplicidad; se prevé reemplazarlos por servicios gestionados en producción.
7. **Idempotency-Key** como requisito en operaciones críticas para soportar reintentos seguros.

## 5. Componentes
### 5.1 API (`apps/api`)
Servicio Express que expone endpoints `/payments` y `/refunds`. Valida peticiones con esquemas de dominio, aplica idempotencia y publica eventos cuando el modo es asíncrono.

### 5.2 Workers (`apps/workers`)
Procesos suscritos a eventos de pagos. Autorizan pagos vía `gateway` y publican eventos de resultado (`PaymentAuthorized`, `PaymentFailed`).

### 5.3 Dominio (`packages/domain`)
Contiene los modelos y validaciones con Zod: pagos, reembolsos, políticas de origen, perfiles de reintentos y eventos.

### 5.4 Puertos (`packages/ports`)
Interfaces para almacenamiento de configuración, buses de mensajes, gateways de pago, métricas, logs, etc. Definen los contratos que deben cumplir los adaptadores.

### 5.5 Adaptadores (`packages/adapters`)
Implementaciones en memoria de los puertos: `configStore` y `messageBus`. Sirven para desarrollo local y pruebas.

### 5.6 Gateways (`packages/gateways`)
Integraciones con procesadores de pago. El MVP incluye `MockGateway`; otros gateways pueden añadirse implementando `GatewayPort`.

### 5.7 Librerías (`packages/lib`)
Utilidades compartidas: middleware de idempotencia, enrutamiento a gateways, arranque de OpenTelemetry y modelado de respuestas por origen.

### 5.8 Infraestructura (`infra`)
`docker-compose.yml` define contenedores para la API, los workers y un agente de Datadog. Esta configuración puede mapearse fácilmente a cualquier entorno cloud.

## 6. Consideraciones de Seguridad
- El token de pago se redacted en logs y respuestas.
- El diseño permite integrar almacenes de secretos y gestores de claves en adaptadores futuros.

## 7. Próximos Pasos
- Implementar adaptadores reales para servicios gestionados (por ejemplo, SQS, Pub/Sub, DynamoDB).
- Añadir persistencia y colas durables para ambientes de producción.
- Incorporar diagramas C4 o UML para visualizar la arquitectura.

