# 📚 Documentación de Funciones Asíncronas — Web Asincrona

> Sistema Asíncrono de Pedidos de Comida Rápida
> Stack: **React + Vite** · Asincronía con **async/await**
> APIs: `fakestoreapi.com/products` · `dummyjson.com/users` · `dummyjson.com/carts`

---

## 🗂️ Índice

1. [Capa de servicios (`src/services/api.js`)](#1-capa-de-servicios-srcservicesapijs)
2. [Contexto global (`src/context/AppContext.jsx`)](#2-contexto-global-srccontextappcontextjsx)
3. [Módulo 1 — Splash Screen y Carga](#módulo-1--splash-screen-y-carga)
4. [Módulo 2 — Catálogo de Productos](#módulo-2--catálogo-de-productos)
5. [Módulo 3 — Carrito de Compras](#módulo-3--carrito-de-compras)
6. [Módulo 4 — Login (Autenticación)](#módulo-4--login-autenticación)
7. [Módulo 5 — Checkout (Procesamiento de Pago)](#módulo-5--checkout-procesamiento-de-pago)
8. [Flujo completo del checkout](#flujo-completo-del-checkout)

---

## 1. Capa de servicios (`src/services/api.js`)

Este archivo centraliza **todas** las peticiones asíncronas de la aplicación.
Cada función usa `async/await` y propagación de errores con `try/catch`.

### `esperar(ms)` — Helper de utilidad

```js
export const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
```

| Aspecto | Descripción |
|---|---|
| **Tipo** | Función asíncrona (devuelve una `Promise`) |
| **Propósito** | Pausar la ejecución durante `ms` milisegundos. |
| **Uso** | Splash de 2 segundos, simulación de latencia en login, validación de inventario, etc. |
| **Por qué async/await** | Permite escribir `await esperar(2000)` de forma secuencial sin anidar `setTimeout`. |

---

### `obtenerProductos()` — Módulo 1 & 2

```js
export async function obtenerProductos() {
  try {
    const respuesta = await fetch(API_PRODUCTOS)
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al obtener productos`)
    }
    const productos = await respuesta.json()
    return productos.map((p) => ({ ...campos normalizados... }))
  } catch (error) {
    throw new Error(`No fue posible cargar los productos: ${error.message}`)
  }
}
```

| Aspecto | Descripción |
|---|---|
| **Endpoint** | `GET https://fakestoreapi.com/products` |
| **Retorna** | Arreglo de productos normalizados con `stock` sintético (la API no lo provee). |
| **Manejo de errores** | `try/catch` que envuelve todo. Si el `fetch` falla o `respuesta.ok` es `false`, lanza un `Error` con mensaje claro. |
| **Por qué async/await** | `await fetch(...)` espera la respuesta de red; `await respuesta.json()` espera el parsing del body. Sin `await` se obtendría una `Promise` pendiente. |

---

### `obtenerUsuarios()` — Módulo 4

```js
export async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(
      `${API_USUARIOS}?limit=0&select=username,firstName,lastName,email`
    )
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al obtener usuarios`)
    }
    const data = await respuesta.json()
    return data.users // DummyJSON devuelve { users: [...] }
  } catch (error) {
    throw new Error(`No fue posible cargar los usuarios: ${error.message}`)
  }
}
```

| Aspecto | Descripción |
|---|---|
| **Endpoint** | `GET https://dummyjson.com/users?limit=0&select=...` |
| **Retorna** | Arreglo de objetos `{ username, firstName, lastName, email }`. |
| **Manejo de errores** | Igual que `obtenerProductos`: envoltorio `try/catch` y validación de `respuesta.ok`. |
| **Nota** | Se carga **al inicio** (en paralelo con productos) para que el login sea instantáneo. |

---

### `buscarUsuario(listaUsuarios, usernameBuscado)` — Módulo 4

```js
export async function buscarUsuario(listaUsuarios, usernameBuscado) {
  await esperar(400) // simulamos latencia
  if (!listaUsuarios || !usernameBuscado) return null
  return (
    listaUsuarios.find(
      (u) => u.username.toLowerCase() === usernameBuscado.trim().toLowerCase()
    ) || null
  )
}
```

| Aspecto | Descripción |
|---|---|
| **Propósito** | Buscar un `username` dentro de la lista de usuarios descargada. |
| **Por qué async** | Aunque la búsqueda sea local, se envuelve en `async` para: (a) simular latencia realista con `await esperar(400)`, (b) poder ser `await`-ada desde el componente sin importar si en el futuro cambia a una petición `fetch` real. |
| **Retorna** | El objeto usuario o `null`. |

---

### `validarConexionInternet()` — Módulo 5, paso 1

```js
export async function validarConexionInternet() {
  if (!navigator.onLine) {
    throw new Error('Sin conexión a internet. Verifica tu red e inténtalo de nuevo.')
  }
  try {
    await fetch(API_CARRITOS, { method: 'HEAD', mode: 'no-cors' })
  } catch (_) { /* no-op */ }
  return true
}
```

| Aspecto | Descripción |
|---|---|
| **Propósito** | Confirmar que hay red antes de iniciar el flujo de pago. |
| **Validaciones** | 1) `navigator.onLine` (estado del navegador). 2) Ping `HEAD` al endpoint de carritos. |
| **Por qué async/await** | El `fetch` de ping es asíncrono; con `await` esperamos su resolución antes de continuar al paso 2. |

---

### `validarInventario(itemsCarrito, productosCatalogo)` — Módulo 5, paso 2

```js
export async function validarInventario(itemsCarrito, productosCatalogo) {
  await esperar(600) // simulamos consulta al inventario
  for (const item of itemsCarrito) {
    const producto = productosCatalogo.find((p) => p.id === item.id)
    if (!producto) {
      throw new Error(`Producto no encontrado en el catálogo: ${item.nombre}`)
    }
    if (producto.stock < item.cantidad) {
      throw new Error(`Stock insuficiente para "${item.nombre}". Disponible: ${producto.stock}, solicitado: ${item.cantidad}`)
    }
  }
  return true
}
```

| Aspecto | Descripción |
|---|---|
| **Propósito** | Verificar que cada item del carrito tenga stock suficiente. |
| **Por qué async** | `await esperar(600)` simula una consulta real al servidor de inventario. En producción sería un `await fetch(...)`. |
| **Errores lanzados** | Producto no encontrado o stock insuficiente. |

---

### `calcularTotalFinal(itemsCarrito)` — Módulo 5, paso 3

```js
export async function calcularTotalFinal(itemsCarrito) {
  await esperar(400)
  const subtotal = itemsCarrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const iva      = subtotal * 0.16
  const descuento = subtotal > 100 ? subtotal * 0.10 : 0
  const total    = subtotal + iva - descuento
  return { subtotal, iva, descuento, total }
}
```

| Aspecto | Descripción |
|---|---|
| **Propósito** | Recalcular precios en el servidor (verificación final) antes de enviar el pedido. |
| **Lógica de descuento** | 10 % si el subtotal supera $100. |
| **Retorna** | Objeto `{ subtotal, iva, descuento, total }`. |

---

### `enviarPedido(itemsCarrito, total, userId)` — Módulo 5, paso 4

```js
export async function enviarPedido(itemsCarrito, total, userId = 1) {
  try {
    const respuesta = await fetch(API_CARRITOS + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        products: itemsCarrito.map((item) => ({ id: item.id, quantity: item.cantidad })),
        total
      })
    })
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al enviar el pedido`)
    }
    return await respuesta.json()
  } catch (error) {
    throw new Error(`No fue posible enviar el pedido: ${error.message}`)
  }
}
```

| Aspecto | Descripción |
|---|---|
| **Endpoint** | `POST https://dummyjson.com/carts/add` |
| **Body** | JSON con `userId`, `products[]` (id + quantity) y `total`. |
| **Retorna** | El objeto creado por DummyJSON (incluye `id` del pedido). |
| **Manejo de errores** | `try/catch` completo con verificación de `respuesta.ok`. |

---

### `guardarCompraLocal(ticket)` — Módulo 5, paso 5

```js
export async function guardarCompraLocal(ticket) {
  await esperar(400)
  return new Promise((resolve, reject) => {
    try {
      const historial = JSON.parse(localStorage.getItem('historial_compras') || '[]')
      historial.push({ ...ticket, guardadoEn: new Date().toISOString() })
      localStorage.setItem('historial_compras', JSON.stringify(historial))
      resolve(historial)
    } catch (error) {
      reject(new Error(`No fue posible guardar la compra localmente: ${error.message}`))
    }
  })
}
```

| Aspecto | Descripción |
|---|---|
| **Propósito** | Persistir el ticket de compra en `localStorage` (historial). |
| **Por qué async** | Se envuelve en `Promise` para mantener la firma `async` consistente con el resto del flujo y permitir que en el futuro se reemplace por una llamada a backend sin cambiar los `await` del componente. |
| **Errores** | Si `localStorage` no está disponible o falla la serialización, se rechaza la promesa. |

---

## 2. Contexto global (`src/context/AppContext.jsx`)

### `inicializarApp()` — Arranque de la SPA

```js
const inicializarApp = useCallback(async () => {
  setCargando(true)
  setErrorCarga(null)
  setFase('splash')
  try {
    // 1) Splash fijo de 2 segundos
    await esperar(2000)
    // 2) Carga paralela de productos y usuarios
    const [productosData, usuariosData] = await Promise.all([
      obtenerProductos(),
      obtenerUsuarios()
    ])
    setProductos(productosData)
    setUsuarios(usuariosData)
    setFase('app')
  } catch (error) {
    setErrorCarga(error.message)
    setFase('error')
  } finally {
    setCargando(false)
  }
}, [])
```

| Aspecto | Descripción |
|---|---|
| **Cuándo se ejecuta** | Al montar la app, mediante `useEffect(() => inicializarApp(), [inicializarApp])`. |
| **Paso 1 — Splash** | `await esperar(2000)` garantiza el splash fijo de 2 segundos. |
| **Paso 2 — Carga paralela** | `Promise.all([obtenerProductos(), obtenerUsuarios()])` dispara ambas peticiones **al mismo tiempo** y espera a que ambas terminen. Esto es más rápido que ejecutarlas secuencialmente. |
| **Manejo de errores** | Si cualquiera de las dos peticiones falla, salta al `catch` y cambia `fase` a `'error'` (pantalla de reintentar). |
| **finally** | Siempre apaga `cargando`, sin importar si hubo éxito o error. |

### `iniciarSesion(username)` — Delegación al servicio

```js
const iniciarSesion = useCallback(async (username) => {
  const usuarioEncontrado = await buscarUsuario(usuarios, username)
  if (usuarioEncontrado) {
    setUsuario(usuarioEncontrado)
    return { ok: true, usuario: usuarioEncontrado }
  }
  return { ok: false, mensaje: 'Usuario no encontrado' }
}, [usuarios])
```

| Aspecto | Descripción |
|---|---|
| **Por qué async** | `buscarUsuario` es async (simula latencia). Hay que esperarla antes de decidir si el login fue exitoso. |
| **Efecto** | Si el usuario existe, se guarda en el estado y se persiste en `localStorage` (mediante un `useEffect`). |

---

## Módulo 1 — Splash Screen y Carga

### Componente `SplashScreen.jsx`

**No contiene funciones async propias**; consume el estado `cargando` del contexto.
La lógica asíncrona del módulo 1 vive en `inicializarApp()` (ver arriba).

| Elemento | Implementación |
|---|---|
| Splash fijo de 2 segundos | `await esperar(2000)` dentro de `inicializarApp` |
| Spinner de carga | Renderizado condicional según `cargando === true` |
| Manejo de errores | Si `obtenerProductos()` o `obtenerUsuarios()` lanzan, `fase = 'error'` y se muestra `PantallaError.jsx` |
| Reintentar | Botón que vuelve a llamar `inicializarApp()` |

### Componente `PantallaError.jsx`

Pantalla de recuperación. Su único handler es `onClick={() => inicializarApp()}` — dispara de nuevo el flujo asíncrono completo.

---

## Módulo 2 — Catálogo de Productos

### Componente `Catalogo.jsx`

**No usa async directamente** porque los productos ya están cargados en el contexto.
Sin embargo, todos sus filtros son **en tiempo real** mediante `useMemo`:

```js
const productosVisibles = useMemo(() => {
  let resultado = [...productos]
  if (busqueda.trim()) { /* filtro por texto */ }
  if (categoria !== 'todas') { /* filtro por categoría */ }
  switch (orden) {
    case 'precio-asc':  resultado.sort((a,b) => a.precio - b.precio); break
    case 'precio-desc': resultado.sort((a,b) => b.precio - a.precio); break
    case 'nombre-az':   resultado.sort((a,b) => a.nombre.localeCompare(b.nombre)); break
    case 'nombre-za':   resultado.sort((a,b) => b.nombre.localeCompare(a.nombre)); break
  }
  return resultado
}, [productos, busqueda, categoria, orden])
```

| Filtro | Estado | Tipo |
|---|---|---|
| Buscador por nombre | `busqueda` | texto en tiempo real |
| Filtro por categoría | `categoria` | `<select>` |
| Ordenamiento | `orden` | `<select>` con 4 opciones + default |

### `ProductCard.jsx`

Componente de presentación. Tampoco contiene funciones async; recibe el producto por props y dispara `onAgregar` (que en `Catalogo` ejecuta `agregarAlCarrito(producto)`).

---

## Módulo 3 — Carrito de Compras

### Componente `Carrito.jsx`

**Sin funciones async**: el carrito es 100 % local (estado React + `localStorage`).

| Acción | Handler del contexto | Efecto |
|---|---|---|
| Agregar producto | `agregarAlCarrito(producto)` | Si ya existe, suma 1; si no, lo añade con cantidad 1 |
| Eliminar producto | `eliminarDelCarrito(id)` | Filtra el item por id |
| Modificar cantidad | `modificarCantidad(id, nuevaCantidad)` | Si nuevaCantidad < 1 se ignora |
| Vaciar carrito | `vaciarCarrito()` | `setCarrito([])` |

### Cálculos automáticos (`resumenCarrito`)

Se recalculan en cada render del contexto gracias a una derivación directa del estado `carrito`:

```js
const resumenCarrito = (() => {
  const subtotal   = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const iva        = subtotal * 0.16
  const descuento  = subtotal > 100 ? subtotal * 0.10 : 0
  const total      = subtotal + iva - descuento
  const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)
  return { subtotal, iva, descuento, total, cantidadTotal }
})()
```

| Campo | Fórmula |
|---|---|
| Subtotal | Σ (precio × cantidad) |
| IVA | Subtotal × 0.16 |
| Descuento | Subtotal × 0.10 **si** Subtotal > $100, si no 0 |
| Total | Subtotal + IVA − Descuento |

---

## Módulo 4 — Login (Autenticación)

### Componente `Login.jsx` → `handleSubmit(e)`

```js
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setCargando(true)
  try {
    const resultado = await iniciarSesion(username)
    if (resultado.ok) {
      setVista('carrito') // avanzar al siguiente paso
    } else {
      setError(resultado.mensaje) // "Usuario no encontrado"
    }
  } catch (err) {
    setError(`Error inesperado: ${err.message}`)
  } finally {
    setCargando(false)
  }
}
```

| Aspecto | Descripción |
|---|---|
| **Por qué async** | `iniciarSesion` es async porque delega en `buscarUsuario` (que simula latencia con `esperar(400)`). |
| **Flujo exitoso** | Si `resultado.ok === true`, se navega al carrito. |
| **Flujo fallido** | Si el usuario no existe, se muestra "⚠️ Usuario no encontrado" sin romper la app. |
| **Persistencia** | El `useEffect` del contexto guarda automáticamente el usuario en `localStorage`. |

---

## Módulo 5 — Checkout (Procesamiento de Pago)

### Componente `Checkout.jsx` → `finalizarCompra()`

Esta es la función central del módulo 5. Ejecuta los **6 pasos secuencialmente** con `await`:

```js
const finalizarCompra = async () => {
  setProcesando(true)
  setError('')
  setTicket(null)
  try {
    // -------- Paso 1: Validar conexión --------
    setPaso(1)
    await validarConexionInternet()

    // -------- Paso 2: Validar inventario --------
    setPaso(2)
    await validarInventario(carrito, productos)

    // -------- Paso 3: Calcular total final --------
    setPaso(3)
    const totales = await calcularTotalFinal(carrito)

    // -------- Paso 4: Enviar pedido (POST) --------
    setPaso(4)
    const pedidoServidor = await enviarPedido(carrito, totales.total, usuario?.id ?? 1)

    // -------- Paso 5: Guardar compra localmente --------
    setPaso(5)
    await guardarCompraLocal({ pedidoId: pedidoServidor?.id ?? Date.now(), usuario, items: carrito, totales, fecha: new Date().toISOString() })

    // -------- Paso 6: Mostrar ticket --------
    setPaso(6)
    setTicket({ ... })
    vaciarCarrito()
  } catch (err) {
    setError(err.message)
  } finally {
    setProcesando(false)
  }
}
```

### ¿Por qué el flujo es "secuencial e interdependiente"?

| Paso | Depende de | Falla si… |
|---|---|---|
| 1. Validar conexión | — | No hay internet |
| 2. Validar inventario | Paso 1 (si no hay red no se puede validar) | Stock insuficiente |
| 3. Calcular total | Paso 2 (necesitamos el carrito validado) | Carrito vacío o corrupto |
| 4. Enviar pedido | Pasos 1–3 (sin conexión, inventario ni total no se puede enviar) | Error HTTP en el POST |
| 5. Guardar compra | Paso 4 (necesitamos el `id` del pedido) | `localStorage` inaccesible |
| 6. Mostrar ticket | Paso 5 (necesitamos confirmar la persistencia) | — |

Si **cualquier paso** lanza un error, el `catch` captura el mensaje, lo muestra al usuario y **detiene el flujo** — los pasos siguientes no se ejecutan. El estado `paso` queda congelado en el paso que falló, dando feedback visual al usuario.

---

## Flujo completo del checkout

```
[Finalizar Compra]  ← finalizarCompra() — async
       │
       ▼
1. await validarConexionInternet()
       │   ✓ navigator.onLine + ping HEAD a /carts
       │   ✗ throw → catch → "Sin conexión a internet"
       ▼
2. await validarInventario(carrito, productos)
       │   ✓ cada item tiene stock suficiente
       │   ✗ throw → catch → "Stock insuficiente para X"
       ▼
3. await calcularTotalFinal(carrito)
       │   → { subtotal, iva, descuento, total }
       ▼
4. await enviarPedido(carrito, total, userId)
       │   POST https://dummyjson.com/carts/add
       │   → { id, products, total, ... }
       │   ✗ throw → catch → "No fue posible enviar el pedido"
       ▼
5. await guardarCompraLocal({ pedidoId, usuario, items, totales })
       │   → localStorage.setItem('historial_compras', ...)
       ▼
6. setTicket(...) + vaciarCarrito()
       │   → se renderiza la pantalla de confirmación
       ▼
[Ticket final]
```

---

## 📌 Reglas de async/await aplicadas

1. **Toda función que use `await` está marcada como `async`.**
2. **Toda función `async` devuelve una `Promise`** (aunque sea implícita).
3. **Todo `await` va dentro de un bloque `try/catch`** para evitar `UnhandledPromiseRejection`.
4. **Los errores se re-lanzan con mensajes claros** para que el componente los muestre al usuario.
5. **`Promise.all` para peticiones paralelas** (`obtenerProductos()` + `obtenerUsuarios()`) — reduce el tiempo total de carga.
6. **`await` secuencial cuando hay dependencia** (los 6 pasos del checkout son interdependientes).

---

## 📁 Estructura del proyecto

```
web-asincrona/
├── index.html
├── package.json
├── vite.config.js
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
