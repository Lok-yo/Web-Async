import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CheckCircleIcon, WarningIcon, RocketIcon } from './Icons'
import {
  validarConexionInternet,
  validarInventario,
  calcularTotalFinal,
  enviarPedido,
  guardarCompraLocal
} from '../services/api'

/**
 * Checkout (Módulo 5)
 * - Flujo secuencial e interdependiente con async/await:
 *   1) Validar conexión
 *   2) Validar inventario
 *   3) Calcular total
 *   4) Enviar pedido (POST)
 *   5) Guardar compra (localStorage)
 *   6) Mostrar ticket
 */
export default function Checkout() {
  const {
    carrito,
    productos,
    usuario,
    resumenCarrito,
    vaciarCarrito,
    setVista
  } = useApp()

  const [paso, setPaso]         = useState(0) // 0 = sin empezar, 7 = ticket
  const [procesando, setProcesando] = useState(false)
  const [error, setError]       = useState('')
  const [ticket, setTicket]     = useState(null)

  const pasos = [
    'Validar conexión a internet',
    'Validar inventario disponible',
    'Calcular total final',
    'Enviar pedido al servidor',
    'Guardar compra localmente',
    'Mostrar ticket de confirmación'
  ]

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
      const pedidoServidor = await enviarPedido(
        carrito,
        totales.total,
        usuario?.id ?? 1
      )

      // -------- Paso 5: Guardar compra localmente --------
      setPaso(5)
      await guardarCompraLocal({
        pedidoId: pedidoServidor?.id ?? Date.now(),
        usuario,
        items: carrito,
        totales,
        fecha: new Date().toISOString()
      })

      // -------- Paso 6: Mostrar ticket --------
      setPaso(6)
      setTicket({
        pedidoId: pedidoServidor?.id ?? Date.now(),
        usuario,
        items: carrito,
        totales,
        fecha: new Date().toLocaleString('es-MX')
      })

      // Vaciamos el carrito porque la compra ya se procesó
      vaciarCarrito()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcesando(false)
    }
  }

  // ---------- Pantalla de ticket final ----------
  if (ticket) {
    return (
      <section className="checkout">
        <div className="ticket">
          <h2><CheckCircleIcon /> ¡Compra realizada con éxito!</h2>
          <p className="muted">Pedido #{ticket.pedidoId}</p>
          <p className="muted">{ticket.fecha}</p>

          <h3>Resumen del pedido</h3>
          <ul className="ticket-items">
            {ticket.items.map((item) => (
              <li key={item.id}>
                <span>{item.cantidad} × {item.nombre}</span>
                <span>${(item.precio * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="ticket-totales">
            <div className="resumen-linea">
              <span>Subtotal</span>
              <span>${ticket.totales.subtotal.toFixed(2)}</span>
            </div>
            <div className="resumen-linea">
              <span>IVA (16%)</span>
              <span>${ticket.totales.iva.toFixed(2)}</span>
            </div>
            <div className="resumen-linea">
              <span>Descuento</span>
              <span>− ${ticket.totales.descuento.toFixed(2)}</span>
            </div>
            <div className="resumen-linea resumen-total">
              <span>Total pagado</span>
              <span>${ticket.totales.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn btn-primario btn-grande"
            onClick={() => {
              setTicket(null)
              setPaso(0)
              setVista('catalogo')
            }}
          >
            ← Volver al catálogo
          </button>
        </div>
      </section>
    )
  }

  // ---------- Pantalla de checkout ----------
  return (
    <section className="checkout">
      <h2><CheckCircleIcon /> Checkout</h2>

      {carrito.length === 0 ? (
        <div className="empty-state">
          <p>No hay productos para procesar.</p>
          <button className="btn btn-primario" onClick={() => setVista('catalogo')}>
            ← Ir al catálogo
          </button>
        </div>
      ) : (
        <>
          <div className="checkout-info">
            <p><strong>Usuario:</strong> {usuario?.firstName} {usuario?.lastName} (@{usuario?.username})</p>
            <p><strong>Productos:</strong> {carrito.length} ítem(s)</p>
            <p><strong>Total estimado:</strong> ${resumenCarrito.total.toFixed(2)}</p>
          </div>

          {/* Lista de pasos */}
          <ol className="pasos-lista">
            {pasos.map((label, i) => {
              const n = i + 1
              let clase = 'paso'
              if (paso > n) clase += ' paso-hecho'
              else if (paso === n) clase += ' paso-activo'
              return (
                <li key={n} className={clase}>
                  <span className="paso-numero">
                    {paso > n ? '✓' : n}
                  </span>
                  <span className="paso-label">{label}</span>
                  {paso === n && procesando && (
                    <span className="paso-spinner" />
                  )}
                </li>
              )
            })}
          </ol>

          {error && (
            <div className="error-mensaje error-bloque">
              <WarningIcon /> {error}
            </div>
          )}

          <button
            className="btn btn-primario btn-grande"
            onClick={finalizarCompra}
            disabled={procesando}
          >
            {procesando ? 'Procesando…' : <><RocketIcon /> Finalizar Compra</>}
          </button>
        </>
      )}
    </section>
  )
}
