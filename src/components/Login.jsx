import { useState } from 'react'
import { useApp } from '../context/AppContext'

/**
 * Login (Módulo 4)
 * - Control de acceso simulado contra https://dummyjson.com/users.
 * - El usuario escribe su username.
 * - Se busca asíncronamente en la lista de usuarios (iniciarSesion).
 * - Si existe, se guarda la sesión; si no, se muestra error.
 */
export default function Login() {
  const { iniciarSesion, setVista, usuario } = useApp()

  const [username, setUsername] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const resultado = await iniciarSesion(username)
      if (resultado.ok) {
        setVista('carrito') // avanzar al siguiente paso
      } else {
        setError(resultado.mensaje)
      }
    } catch (err) {
      setError(`Error inesperado: ${err.message}`)
    } finally {
      setCargando(false)
    }
  }

  if (usuario) {
    return (
      <section className="login">
        <h2>🔑 Sesión iniciada</h2>
        <p>Bienvenido, <strong>{usuario.firstName} {usuario.lastName}</strong></p>
        <p className="muted">Usuario: @{usuario.username}</p>
        <button className="btn btn-primario" onClick={() => setVista('carrito')}>
          → Ir al carrito
        </button>
      </section>
    )
  }

  return (
    <section className="login">
      <h2>🔑 Iniciar Sesión</h2>
      <p className="muted">
        Buscaremos tu usuario en <code>dummyjson.com/users</code>.
        <br />Prueba con: <code>emilys</code>, <code>michaelw</code>, <code>catchick</code>…
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-busqueda"
          placeholder="Username (ej. emilys)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={cargando}
          autoFocus
        />

        <button
          type="submit"
          className="btn btn-primario btn-grande"
          disabled={cargando || !username.trim()}
        >
          {cargando ? 'Validando…' : 'Entrar'}
        </button>
      </form>

      {error && <p className="error-mensaje">⚠️ {error}</p>}
    </section>
  )
}
