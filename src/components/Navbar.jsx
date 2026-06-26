import { useApp } from '../context/AppContext'
import { BurgerIcon, BoxIcon, CartIcon, CheckCircleIcon, KeyIcon, UserIcon } from './Icons'

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
        <BurgerIcon /> Web Asincrona
      </div>

      <nav className="navbar-nav">
        {navItem('catalogo', <><BoxIcon /> Catálogo</>)}
        {navItem('carrito', <><CartIcon /> Carrito ({resumenCarrito.cantidadTotal})</>)}
        {usuario
          ? navItem('checkout', <><CheckCircleIcon /> Checkout</>)
          : navItem('login', <><KeyIcon /> Login</>)}
      </nav>

      <div className="navbar-user">
        {usuario ? (
          <>
            <span className="user-name">
              <UserIcon /> {usuario.firstName} {usuario.lastName}
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
