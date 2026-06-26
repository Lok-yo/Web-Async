import { useApp } from '../context/AppContext'
import { WarningIcon, RefreshIcon } from './Icons'

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
        <div className="error-icono">
          <WarningIcon />
        </div>
        <h1>No pudimos cargar el sistema</h1>
        <p className="error-detalle">{errorCarga}</p>
        <button className="btn btn-primario" onClick={() => inicializarApp()}>
          <RefreshIcon /> Reintentar
        </button>
      </div>
    </div>
  )
}
