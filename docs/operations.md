# Operación y DevOps

## Despliegue
| Entorno | Instrucciones |
|---------|---------------|
| Local   | `docker compose -f infra/docker-compose.yml up` |
| Staging | Construir imagen Docker y desplegar en el orquestador (ECS/K8s) con variables `SERVICE_NAME`, `DD_ENV=staging`, endpoints OTLP |
| Prod    | Igual que staging pero con recursos gestionados (DB, cola, gateway real) y `DD_ENV=prod` |

## Runbooks
| Incidente | Pasos |
|-----------|-------|
| Idempotency hit inesperado | Revisar store de idempotencia; purgar clave si es necesario |
| Eventos acumulados en bus | Verificar worker activo; reiniciar proceso o escalar instancias |
| Latencia elevada del gateway | Redirigir tráfico a otro gateway mediante `originPolicy`; escalar reintentos |

## SLO/SLAs y Métricas
| Métrica | Objetivo | Descripción |
|----------|----------|----------------|
| Latencia API p95 | <200ms | Tiempo desde solicitud hasta respuesta |
| Éxito autorización | >99% | Pagos con estado `authorized` |
| Tiempo procesar evento | <1s p95 | De `PaymentRequested` a `PaymentAuthorized` |
| Errores worker | 0 | Excepciones no controladas |

Monitoriza con OpenTelemetry enviando a Datadog/Prometheus. Configura alertas cuando una métrica supere su umbral.
