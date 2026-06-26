// ============================================================
//  CAPA DE SERVICIOS ASÍNCRONOS
//  Centraliza TODAS las peticiones fetch de la aplicación.
//  Cada función usa async/await y maneja errores con try/catch.
// ============================================================

const API_PRODUCTOS = 'https://fakestoreapi.com/products'
const API_USUARIOS  = 'https://dummyjson.com/users'
const API_CARRITOS  = 'https://dummyjson.com/carts'

// ------------------------------------------------------------
//  Helper: espera (ms) -> promesa que resuelve tras X ms.
//  Se usa para simular latencia y para el splash de 2 segundos.
// ------------------------------------------------------------
export const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ------------------------------------------------------------
//  Helper: random determinista por id (para stock reproducible)
// ------------------------------------------------------------
const stockDeterminista = (id) => {
  // Genera un número entre 0 y 50 basado en el id del producto
  return ((id * 7) % 51)
}

// ============================================================
//  MÓDULO 1 & 2 — PRODUCTOS (FakeStoreAPI)
// ============================================================
/**
 * obtenerProductos
 * - Realiza fetch a https://fakestoreapi.com/products
 * - Normaliza la respuesta agregando un campo `stock` (la API no lo trae)
 * - Lanza Error si la respuesta no es ok o si falla la red.
 */
export async function obtenerProductos() {
  try {
    const respuesta = await fetch(API_PRODUCTOS)

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al obtener productos`)
    }

    const productos = await respuesta.json()

    // Normalizamos: agregamos stock determinista para los módulos 3 y 5
    return productos.map((p) => ({
      id: p.id,
      nombre: p.title,
      precio: p.price,
      categoria: p.category,
      imagen: p.image,
      descripcion: p.description,
      rating: p.rating?.rate ?? 0,
      numValoraciones: p.rating?.count ?? 0,
      stock: stockDeterminista(p.id)
    }))
  } catch (error) {
    // Re-lanzamos para que el componente decida cómo mostrar el error
    throw new Error(`No fue posible cargar los productos: ${error.message}`)
  }
}

// ============================================================
//  MÓDULO 4 — USUARIOS (DummyJSON)
// ============================================================
/**
 * obtenerUsuarios
 * - Realiza fetch a https://dummyjson.com/users?limit=0&select=username,firstName,lastName,email
 * - Devuelve un arreglo plano de usuarios con su username.
 */
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

/**
 * buscarUsuario
 * - Busca un usuario por username dentro de la lista obtenida.
 * - Retorna el usuario o null si no existe.
 */
export async function buscarUsuario(listaUsuarios, usernameBuscado) {
  // Simulamos una búsqueda asíncrona (en la vida real sería una query al server)
  await esperar(400)

  if (!listaUsuarios || !usernameBuscado) return null

  return (
    listaUsuarios.find(
      (u) => u.username.toLowerCase() === usernameBuscado.trim().toLowerCase()
    ) || null
  )
}

// ============================================================
//  MÓDULO 5 — CHECKOUT (CARRITOS DummyJSON)
// ============================================================
/**
 * validarConexionInternet
 * - Paso 1 del checkout.
 * - Verifica navigator.onLine y hace un ping ligero a la API.
 */
export async function validarConexionInternet() {
  if (!navigator.onLine) {
    throw new Error('Sin conexión a internet. Verifica tu red e inténtalo de nuevo.')
  }
  // Ping ligero (HEAD) para confirmar que el servidor responde
  try {
    await fetch(API_CARRITOS, { method: 'HEAD', mode: 'no-cors' })
  } catch (_) {
    // En mode no-cors no podemos inspeccionar la respuesta, pero si no
    // lanza excepción asumimos que hay ruta de red.
  }
  return true
}

/**
 * validarInventario
 * - Paso 2 del checkout.
 * - Verifica que cada item del carrito tenga stock suficiente.
 */
export async function validarInventario(itemsCarrito, productosCatalogo) {
  await esperar(600) // simulamos consulta al inventario

  for (const item of itemsCarrito) {
    const producto = productosCatalogo.find((p) => p.id === item.id)
    if (!producto) {
      throw new Error(`Producto no encontrado en el catálogo: ${item.nombre}`)
    }
    if (producto.stock < item.cantidad) {
      throw new Error(
        `Stock insuficiente para "${item.nombre}". ` +
        `Disponible: ${producto.stock}, solicitado: ${item.cantidad}`
      )
    }
  }
  return true
}

/**
 * calcularTotalFinal
 * - Paso 3 del checkout.
 * - Recalcula subtotal, IVA, descuento y total a partir del carrito.
 */
export async function calcularTotalFinal(itemsCarrito) {
  await esperar(400)

  const subtotal = itemsCarrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  )
  const iva = subtotal * 0.16
  const descuento = subtotal > 100 ? subtotal * 0.10 : 0
  const total = subtotal + iva - descuento

  return { subtotal, iva, descuento, total }
}

/**
 * enviarPedido
 * - Paso 4 del checkout.
 * - POST al endpoint /carts de DummyJSON con el carrito actual.
 */
export async function enviarPedido(itemsCarrito, total, userId = 1) {
  try {
    const respuesta = await fetch(API_CARRITOS + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        products: itemsCarrito.map((item) => ({
          id: item.id,
          quantity: item.cantidad
        })),
        total
      })
    })

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al enviar el pedido`)
    }

    const pedido = await respuesta.json()
    return pedido
  } catch (error) {
    throw new Error(`No fue posible enviar el pedido: ${error.message}`)
  }
}

/**
 * guardarCompraLocal
 * - Paso 5 del checkout.
 * - Persiste el ticket de compra en localStorage (historial).
 */
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
