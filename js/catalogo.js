/**
 * PROEXT - Catálogo JavaScript
 * Filtros por tipo de producto y precio
 */

document.addEventListener('DOMContentLoaded', async function() {
  // ==========================================
  // DATOS DE PRODUCTOS (Simulados + API)
  // ==========================================
  
  // Fetch products from API
  let productos = [];
  try {
    const res = await fetch('/api/products');
    const apiProducts = await res.json();
    productos = apiProducts.map(p => {
      const priceNum = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
      return {
        id: p.id,
        nombre: p.title,
        categoria: p.category || 'otro',
        precio: priceNum,
        precioDisplay: priceNum > 0 ? priceNum.toLocaleString('es-ES') + ' €' : 'Contactar',
        imagen: p.image,
        descripcion: p.description,
        tag: p.tag || '',
        url: '/producto?id=' + p.id
      };
    });
  } catch (e) { 
    console.log('No products from API'); 
    productos = [];
  }

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  const grid = document.getElementById('catalog-grid');
  const countSpan = document.getElementById('catalog-count');
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

  // ==========================================
  // FUNCIÓN PARA RENDERIZAR PRODUCTOS
  // ==========================================
  function renderProductos(productosFiltrados) {
    if (!grid) return;

    grid.innerHTML = '';

    if (productosFiltrados.length === 0) {
      grid.innerHTML = `
        <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
          <h3 style="color: var(--verde-bosque); margin-bottom: 1rem;">No se encontraron productos</h3>
          <p style="color: var(--texto-secundario);">Intenta con otros filtros</p>
        </div>
      `;
      if (countSpan) countSpan.textContent = '0 productos';
      return;
    }

    if (countSpan) countSpan.textContent = `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`;

    productosFiltrados.forEach(producto => {
      const productUrl = producto.url || '/contacto';
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.cursor = 'pointer';
      card.onclick = () => window.location.href = productUrl;
      card.innerHTML = `
        <div class="product-image">
          <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
          ${producto.tag ? `<span class="product-tag">${producto.tag}</span>` : ''}
        </div>
        <div class="product-body">
          <h3 class="product-title">${producto.nombre}</h3>
          <p class="product-description">${producto.descripcion}</p>
          <div class="product-footer">
            <a href="${productUrl}" class="btn btn-primary" style="width: 100%;">Ver más</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Add animation
    grid.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // ==========================================
  // FUNCIÓN PARA APLICAR FILTROS
  // ==========================================
  function aplicarFiltros() {
    // Obtener categorías seleccionadas
    const categoriasSeleccionadas = Array.from(filterCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // Filtrar productos
    const productosFiltrados = productos.filter(producto => {
      const cumpleCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(producto.categoria);
      return cumpleCategoria;
    });

    // Renderizar
    renderProductos(productosFiltrados);
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  // Filtros de categoría
  if (filterCheckboxes) {
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', aplicarFiltros);
    });
  }

  // ==========================================
  // INICIALIZAR
  // ==========================================
  renderProductos(productos);

  console.log('✅ ProExt - Catálogo scripts loaded');
});