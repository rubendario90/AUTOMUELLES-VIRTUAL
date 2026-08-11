# AUTOMUELLES-VIRTUAL

Frontend Expo/React Native para AUTOMUELLES.

## Ejecución

```bash
npm install
npm run start
```

## Módulo Bodega Jefe (Gestión de pedidos)

Se integró un subsitio de **Bodega Jefe** en `app/(tabs)/bodega-jefe` con flujo principal de pedidos:

- Listado de pedidos
- Creación de pedido
- Detalle/edición de pedido
- Cambio de estado de pedido

Rutas principales:

- `/(tabs)/bodega-jefe`
- `/(tabs)/bodega-jefe/nuevo`
- `/(tabs)/bodega-jefe/[pedidoId]`

### Configuración de entorno

Variables usadas por el módulo:

- `EXPO_PUBLIC_API_URL` (base del backend)
- `EXPO_PUBLIC_PEDIDOS_API_PREFIX` (default: `/api/pedidos`)
- `EXPO_PUBLIC_ROLE` (default: `BODEGA_JEFE`; acceso permitido: `BODEGA_JEFE`, `ADMIN`)

### Endpoints esperados

El módulo consume estos endpoints REST:

- `GET {API_URL}{PEDIDOS_API_PREFIX}`
- `POST {API_URL}{PEDIDOS_API_PREFIX}`
- `GET {API_URL}{PEDIDOS_API_PREFIX}/:id`
- `PUT {API_URL}{PEDIDOS_API_PREFIX}/:id`
- `PATCH {API_URL}{PEDIDOS_API_PREFIX}/:id/estado`
