import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import ProductCard from './ProductCard'

/**
 * Catalogo (Módulo 2)
 * - Renderiza todos los productos en tarjetas.
 * - Buscador por texto, filtro por categoría y ordenamiento (precio/nombre).
 * - Todos los filtros son en tiempo real (useMemo).
 */
export default function Catalogo() {
  const { productos, agregarAlCarrito } = useApp()

  const [busqueda, setBusqueda]   = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [orden, setOrden]         = useState('default')

  // Lista única de categorías para el filtro
  const categorias = useMemo(() => {
    const set = new Set(productos.map((p) => p.categoria))
    return ['todas', ...Array.from(set).sort()]
  }, [productos])

  // Aplica filtros + orden en tiempo real
  const productosVisibles = useMemo(() => {
    let resultado = [...productos]

    // 1) Filtro por texto
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter((p) =>
        p.nombre.toLowerCase().includes(q)
      )
    }

    // 2) Filtro por categoría
    if (categoria !== 'todas') {
      resultado = resultado.filter((p) => p.categoria === categoria)
    }

    // 3) Ordenamiento
    switch (orden) {
      case 'precio-asc':
        resultado.sort((a, b) => a.precio - b.precio)
        break
      case 'precio-desc':
        resultado.sort((a, b) => b.precio - a.precio)
        break
      case 'nombre-az':
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case 'nombre-za':
        resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))
        break
      default:
        break
    }

    return resultado
  }, [productos, busqueda, categoria, orden])

  return (
    <section className="catalogo">
      <div className="catalogo-header">
        <h2>📦 Catálogo de Productos</h2>
        <p>{productosVisibles.length} producto(s) encontrados</p>
      </div>

      {/* ---------------- Barra de herramientas ---------------- */}
      <div className="catalogo-tools">
        <input
          type="text"
          className="input-busqueda"
          placeholder="🔎 Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className="select-filtro"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c === 'todas' ? 'Todas las categorías' : c}
            </option>
          ))}
        </select>

        <select
          className="select-filtro"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="default">Sin ordenar</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="nombre-az">Nombre: A → Z</option>
          <option value="nombre-za">Nombre: Z → A</option>
        </select>
      </div>

      {/* ---------------- Grid de productos ---------------- */}
      {productosVisibles.length === 0 ? (
        <p className="empty-state">No se encontraron productos con esos filtros.</p>
      ) : (
        <div className="grid-productos">
          {productosVisibles.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={() => agregarAlCarrito(producto)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
