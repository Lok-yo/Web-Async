import { useApp } from '../context/AppContext'

/**
 * SplashScreen (Módulo 1)
 * - Se muestra durante 2 segundos mientras se cargan los datos.
 * - El temporizador de 2s se gestiona en AppContext.inicializarApp().
 */
export default function SplashScreen() {
  const { cargando } = useApp()

  return (
    <div className="splash">
      <div className="splash-contenido">
        <div className="splash-logo">🍔 Web Asincrona</div>
        <h1>Sistema de Pedidos de Comida Rápida</h1>

        <div className="splash-spinner" aria-label="Cargando"></div>

        <p className="splash-estado">
          {cargando ? 'Cargando catálogo y usuarios…' : 'Listo…'}
        </p>

        <p className="splash-hint">
          Conectando con FakeStoreAPI y DummyJSON mediante async/await
        </p>
      </div>
    </div>
  )
}
