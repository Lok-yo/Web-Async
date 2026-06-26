import { useApp } from './context/AppContext'
import SplashScreen from './components/SplashScreen'
import PantallaError from './components/PantallaError'
import Navbar from './components/Navbar'
import Catalogo from './components/Catalogo'
import Carrito from './components/Carrito'
import Login from './components/Login'
import Checkout from './components/Checkout'

export default function App() {
  const { fase, vista } = useApp()

  // ---------- MÓDULO 1: Splash / Error ----------
  if (fase === 'splash') return <SplashScreen />
  if (fase === 'error')  return <PantallaError />

  // ---------- MÓDULOS 2–5: Aplicación principal ----------
  return (
    <div className="app">
      <Navbar />

      <main className="container">
        {vista === 'catalogo' && <Catalogo />}
        {vista === 'carrito'  && <Carrito />}
        {vista === 'login'    && <Login />}
        {vista === 'checkout' && <Checkout />}
      </main>

      <footer className="footer">
        <p>Web Asincrona — Sistema Asíncrono de Pedidos · React + Vite</p>
      </footer>
    </div>
  )
}
