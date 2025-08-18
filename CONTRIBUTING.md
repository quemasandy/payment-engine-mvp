# Guía de Contribución

## Extender la arquitectura
- Implementa nuevos *adapters* respetando los puertos definidos en `packages/ports`.
- Nuevos *gateways* deben implementar `GatewayPort` y declararse en `originPolicy`.
- Para agregar eventos, utiliza CloudEvents 1.0 y publica a través del *message bus*.

## Convenciones de código
- Lenguaje: TypeScript estricto.
- Estilo: ESLint + Prettier (ejecuta `npm run lint`).
- Testing: Jest (`npm test`).
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (ej. `feat: add new gateway`).

## Flujo de cambios
1. Crea un *fork* y una rama descriptiva.
2. Asegúrate de que `npm test` y `npm run lint` pasen.
3. Abre un Pull Request con descripción clara del cambio y referencias a issues.
4. Espera revisión de un mantenedor antes de *merge*.
