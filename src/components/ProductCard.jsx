/**
 * ProductCard (Módulo 2)
 * - Tarjeta individual de producto.
 * - Muestra: imagen, nombre, precio, categoría, rating y stock.
 * - Botón "Agregar" dispara onAgregar.
 */
export default function ProductCard({ producto, onAgregar }) {
  const {
    nombre,
    precio,
    categoria,
    imagen,
    rating,
    stock
  } = producto

  const sinStock = stock <= 0

  return (
    <article className="product-card">
      <div className="product-imagen">
        <img src={imagen} alt={nombre} loading="lazy" />
      </div>

      <div className="product-info">
        <span className="product-categoria">{categoria}</span>
        <h3 className="product-nombre" title={nombre}>{nombre}</h3>

        <div className="product-rating">
          <span>⭐ {rating.toFixed(1)}</span>
          <span className={sinStock ? 'stock-agotado' : 'stock-ok'}>
            {sinStock ? 'Agotado' : `Stock: ${stock}`}
          </span>
        </div>

        <div className="product-footer">
          <span className="product-precio">${precio.toFixed(2)}</span>
          <button
            className="btn btn-primario"
            onClick={onAgregar}
            disabled={sinStock}
          >
            {sinStock ? 'Sin stock' : '🛒 Agregar'}
          </button>
        </div>
      </div>
    </article>
  )
}
