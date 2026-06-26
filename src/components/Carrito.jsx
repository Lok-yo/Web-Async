import { useApp } from '../context/AppContext'
import { CartIcon, TrashIcon, CheckCircleIcon, KeyIcon } from './Icons'

/**
 * Carrito (Módulo 3)
 * - Gestión local de productos seleccionados.
 * - Acciones: agregar, eliminar, modificar cantidad, vaciar.
 * - Cálculos en tiempo real: Subtotal, IVA (16%), Descuento, Total.
 */
export default function Carrito() {
  const {
    carrito,
    eliminarDelCarrito,
    modificarCantidad,
    vaciarCarrito,
    resumenCarrito,
    usuario,
    setVista
  } = useApp()

  if (carrito.length === 0) {
    return (
      <section className="carrito">
        <h2><CartIcon /> Carrito de Compras</h2>
        <div className="empty-state">
          <p>Tu carrito está vacío.</p>
          <button className="btn btn-primario" onClick={() => setVista('catalogo')}>
            ← Volver al catálogo
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="carrito">
      <h2><CartIcon /> Carrito de Compras</h2>

      <div className="carrito-layout">
        {/* ---------------- Lista de items ---------------- */}
        <div className="carrito-items">
          <div className="carrito-toolbar">
            <button className="btn btn-peligro" onClick={vaciarCarrito}>
              <TrashIcon /> Vaciar carrito
            </button>
          </div>

          {carrito.map((item) => (
            <div className="carrito-item" key={item.id}>
              <img src={item.imagen} alt={item.nombre} />

              <div className="carrito-item-info">
                <h4>{item.nombre}</h4>
                <p className="carrito-item-precio">${item.precio.toFixed(2)} c/u</p>
              </div>

              <div className="carrito-item-cantidad">
                <button
                  className="btn btn-mini"
                  onClick={() => modificarCantidad(item.id, item.cantidad - 1)}
                >
                  −
                </button>
                <span>{item.cantidad}</span>
                <button
                  className="btn btn-mini"
                  onClick={() => modificarCantidad(item.id, item.cantidad + 1)}
                >
                  +
                </button>
              </div>

              <div className="carrito-item-subtotal">
                ${(item.precio * item.cantidad).toFixed(2)}
              </div>

              <button
                className="btn btn-peligro btn-mini"
                onClick={() => eliminarDelCarrito(item.id)}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ---------------- Resumen ---------------- */}
        <aside className="carrito-resumen">
          <h3>Resumen</h3>

          <div className="resumen-linea">
            <span>Subtotal</span>
            <span>${resumenCarrito.subtotal.toFixed(2)}</span>
          </div>
          <div className="resumen-linea">
            <span>IVA (16%)</span>
            <span>${resumenCarrito.iva.toFixed(2)}</span>
          </div>
          <div className="resumen-linea resumen-descuento">
            <span>Descuento (10% si &gt; $100)</span>
            <span>− ${resumenCarrito.descuento.toFixed(2)}</span>
          </div>
          <div className="resumen-linea resumen-total">
            <span>Total</span>
            <span>${resumenCarrito.total.toFixed(2)}</span>
          </div>

          {usuario ? (
            <button
              className="btn btn-primario btn-grande"
              onClick={() => setVista('checkout')}
            >
              <CheckCircleIcon /> Finalizar Compra
            </button>
          ) : (
            <button
              className="btn btn-primario btn-grande"
              onClick={() => setVista('login')}
            >
              <KeyIcon /> Inicia sesión para comprar
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}
