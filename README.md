# Web Asincrona

Sistema Asíncrono de Pedidos de Comida Rápida — **React + Vite**.

Aplicación SPA que consume múltiples APIs remotas (FakeStoreAPI + DummyJSON) usando
**`async/await`** de forma estricta, sin recargas de página y con manejo de errores
en cada operación asíncrona.

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Módulos](#módulos)
- [APIs consumidas](#apis-consumidas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Documentación de funciones async](#documentación-de-funciones-async)
- [Usuarios de prueba](#usuarios-de-prueba)

## Requisitos

- Node.js 18+
- npm 9+

## Instalación

```bash
cd web-asincrona
npm install
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

La app se abrirá en <http://localhost:3000>.

### Producción

```bash
npm run build      # genera /dist
npm run preview    # sirve el build en http://localhost:3000
```

## Módulos

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | **Splash Screen** | Pantalla de bienvenida fija de 2 s + spinner + recuperación de errores con botón "Reintentar". |
| 2 | **Catálogo** | Tarjetas de producto con imagen, nombre, precio, categoría, rating y stock. Buscador por texto, filtro por categoría y ordenamiento (precio asc/desc · nombre A-Z/Z-A). |
| 3 | **Carrito** | Agregar / eliminar / modificar cantidad / vaciar. Cálculo en tiempo real de Subtotal, IVA (16 %), Descuento (10 % si subtotal > $100) y Total. |
| 4 | **Login** | Búsqueda asíncrona de usuario en `dummyjson.com/users`. Persistencia de sesión en `localStorage`. |
| 5 | **Checkout** | Flujo secuencial de 6 pasos con `async/await`: validar conexión → validar inventario → calcular total → enviar pedido (POST) → guardar local → mostrar ticket. |

## APIs consumidas

| Recurso | Endpoint |
|---------|----------|
| Productos | <https://fakestoreapi.com/products> |
| Usuarios | <https://dummyjson.com/users> |
| Carritos | <https://dummyjson.com/carts> |

## Estructura del proyecto

```
web-asincrona/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx                  # Entry point React
    ├── App.jsx                   # Router de vistas (fase splash/error/app)
    ├── context/
    │   └── AppContext.jsx        # Estado global + inicializarApp + iniciarSesion
    ├── services/
    │   └── api.js                # TODAS las funciones async de red
    ├── components/
    │   ├── SplashScreen.jsx      # Módulo 1 (UI)
    │   ├── PantallaError.jsx     # Módulo 1 (UI de error)
    │   ├── Navbar.jsx            # Navegación SPA
    │   ├── Catalogo.jsx          # Módulo 2 (filtros con useMemo)
    │   ├── ProductCard.jsx       # Módulo 2 (tarjeta de producto)
    │   ├── Carrito.jsx           # Módulo 3 (gestión local + cálculos)
    │   ├── Login.jsx             # Módulo 4 (handleSubmit async)
    │   └── Checkout.jsx          # Módulo 5 (finalizarCompra, 6 pasos)
    └── styles/
        └── App.css               # Estilos globales
```

## Documentación de funciones async

La documentación completa de cada función asíncrona (código, propósito,
manejo de errores y justificación de `async/await`) está en:

**[`DOCUMENTACION_ASYNC.md`](../download/DOCUMENTACION_ASYNC.md)**

## Usuarios de prueba (Login)

Estos usernames existen en `dummyjson.com/users`:

- `emilys`
- `michaelw`
- `catchick`
- `hbingley1`
- ` ggunderson`

Puedes ver la lista completa en <https://dummyjson.com/users>.

---

**Stack:** React 18 · Vite 5 · CSS plano · Context API · async/await
