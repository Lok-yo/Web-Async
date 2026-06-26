import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  obtenerProductos,
  obtenerUsuarios,
  buscarUsuario,
  esperar
} from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ---------- ESTADO GLOBAL ----------
  const [fase, setFase] = useState('splash') // splash | error | app
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)

  const [productos, setProductos] = useState([])
  const [usuarios, setUsuarios] = useState([])

  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito_web_asincrona')
      return guardado ? JSON.parse(guardado) : []
    } catch {
      return []
    }
  })

  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('sesion_web_asincrona')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  const [vista, setVista] = useState('catalogo') // catalogo | carrito | login | checkout

  // ---------- PERSISTENCIA ----------
  useEffect(() => {
    localStorage.setItem('carrito_web_asincrona', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('sesion_web_asincrona', JSON.stringify(usuario))
    } else {
      localStorage.removeItem('sesion_web_asincrona')
    }
  }, [usuario])

  // ---------- INICIALIZACIÓN ASÍNCRONA ----------
  /**
   * inicializarApp
   * - Se ejecuta al montar la app.
   * - Muestra splash 2s + carga productos y usuarios en paralelo.
   * - Si falla, cambia fase a 'error'.
   */
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

  useEffect(() => {
    inicializarApp()
  }, [inicializarApp])

  // ---------- ACCIONES DEL CARRITO ----------
  const agregarAlCarrito = useCallback((producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id)
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1
        }
      ]
    })
  }, [])

  const eliminarDelCarrito = useCallback((id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const modificarCantidad = useCallback((id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    )
  }, [])

  const vaciarCarrito = useCallback(() => {
    setCarrito([])
  }, [])

  // ---------- CÁLCULOS DEL CARRITO ----------
  const resumenCarrito = (() => {
    const subtotal = carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    )
    const iva = subtotal * 0.16
    const descuento = subtotal > 100 ? subtotal * 0.10 : 0
    const total = subtotal + iva - descuento
    const cantidadTotal = carrito.reduce((acc, i) => acc + i.cantidad, 0)
    return { subtotal, iva, descuento, total, cantidadTotal }
  })()

  // ---------- SESIÓN ----------
  const iniciarSesion = useCallback(
    async (username) => {
      const usuarioEncontrado = await buscarUsuario(usuarios, username)
      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado)
        return { ok: true, usuario: usuarioEncontrado }
      }
      return { ok: false, mensaje: 'Usuario no encontrado' }
    },
    [usuarios]
  )

  const cerrarSesion = useCallback(() => {
    setUsuario(null)
    setVista('catalogo')
  }, [])

  const value = {
    // estado global
    fase,
    cargando,
    errorCarga,
    productos,
    usuarios,
    carrito,
    usuario,
    vista,
    resumenCarrito,
    // acciones
    setVista,
    inicializarApp,
    agregarAlCarrito,
    eliminarDelCarrito,
    modificarCantidad,
    vaciarCarrito,
    iniciarSesion,
    cerrarSesion
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
