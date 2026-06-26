import { useApp } from '../context/AppContext'

/**
 * PantallaError (Módulo 1 — Manejo de errores)
 * - Se muestra si la carga inicial falla.
 * - Botón "Reintentar" dispara inicializarApp() nuevamente.
 */
export default function PantallaError() {
  const { errorCarga, inicializarApp } = useApp()

  return (
    <div className="splash splash-error">
      <div className="splash-contenido">
        <div className="error-icono">⚠️</div>
        <h1>No pudimos cargar el sistema</h1>
        <p className="error-detalle">{errorCarga}</p>
        <button className="btn btn-primario" onClick={() => inicializarApp()}>
          🔄 Reintentar
        </button>
      </div>
    </div>
  )
}
