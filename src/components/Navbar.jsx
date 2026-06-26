import { useApp } from '../context/AppContext'

/**
 * Navbar
 * - Navegación principal de la SPA.
 * - Muestra la cantidad de items en el carrito y el usuario logueado.
 */
export default function Navbar() {
  const {
    vista,
    setVista,
    resumenCarrito,
    usuario,
    cerrarSesion
  } = useApp()

  const navItem = (id, label) => (
    <button
      className={`nav-item ${vista === id ? 'activo' : ''}`}
      onClick={() => setVista(id)}
    >
      {label}
    </button>
  )

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => setVista('catalogo')}>
        🍔 Web Asincrona
      </div>

      <nav className="navbar-nav">
        {navItem('catalogo', '📦 Catálogo')}
        {navItem('carrito', `🛒 Carrito (${resumenCarrito.cantidadTotal})`)}
        {usuario
          ? navItem('checkout', '✅ Checkout')
          : navItem('login', '🔑 Login')}
      </nav>

      <div className="navbar-user">
        {usuario ? (
          <>
            <span className="user-name">
              👤 {usuario.firstName} {usuario.lastName}
            </span>
            <button className="btn btn-mini" onClick={cerrarSesion}>
              Salir
            </button>
          </>
        ) : (
          <span className="user-name">Invitado</span>
        )}
      </div>
    </header>
  )
}
