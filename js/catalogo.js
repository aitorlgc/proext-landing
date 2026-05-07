/**
 * PROEXT - Catálogo JavaScript
 * Filtros por tipo de producto y precio
 */

document.addEventListener('DOMContentLoaded', function() {
  // ==========================================
  // DATOS DE PRODUCTOS (Simulados)
  // ==========================================
  const productos = [
    {
      id: 1,
      nombre: 'Toldo Retráctil Premium',
      categoria: 'toldos',
      precio: 850,
      imagen: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      descripcion: 'Sistema de toldo retráctil con motor silent y tejido resistente UV.',
      tag: 'Más vendido',
      url: '/toldo-retractil'
    },
    {
      id: 2,
      nombre: 'Pérgola Bioclimática de Aluminum',
      categoria: 'pergolas',
      precio: 3200,
      imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
      descripcion: 'Estructura de aluminio con lamas orientables y sensor de viento.',
      tag: 'Premium',
      url: '/pergola-bioclimatica'
    },
    {
      id: 3,
      nombre: 'Ventana Panorámica Sin Marco',
      categoria: 'ventanas',
      precio: 1200,
      imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop',
      descripcion: 'Vidrio de alta eficiencia térmica con apertura oscilobatiente.',
      tag: 'Nuevo',
      url: '/ventana-panoramica'
    },
    {
      id: 4,
      nombre: 'Cerramiento de Terraza Cristal',
      categoria: 'cerramientos',
      precio: 2100,
      imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
      descripcion: 'Sistema corredero de cristal sin perfiles para terasa.',
      tag: 'Popular',
      url: '/cerramiento-terraza'
    },
    {
      id: 5,
      nombre: 'Toldo Vertical Screen',
      categoria: 'toldos',
      precio: 680,
      imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
      descripcion: 'Protección vertical con tela screen transparente.',
      tag: ''
    },
    {
      id: 6,
      nombre: 'Pérgola de Madera con Techo',
      categoria: 'pergolas',
      precio: 1800,
      imagen: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=400&fit=crop',
      descripción: 'Estructura de madera tratada con tejado de lamas.',
      tag: ''
    },
    {
      id: 7,
      nombre: 'Ventana Corredera de Aluminum',
      categoria: 'ventanas',
      precio: 950,
      imagen: 'https://images.unsplash.com/photo-1600573472591-ee6981cf35ca?w=600&h=400&fit=crop',
      descripcion: 'Sistema corredero de dos hojas con rotura de puente térmico.',
      tag: 'Oferta'
    },
    {
      id: 8,
      nombre: 'Cortina Técnica Enrollable',
      categoria: 'cerramientos',
      precio: 350,
      imagen: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=400&fit=crop',
      descripcion: 'Sistema de enrollado con motor y control remoto.',
      tag: ''
    },
    {
      id: 9,
      nombre: 'Toldo de Punto Recto',
      categoria: 'toldos',
      precio: 720,
      imagen: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=600&h=400&fit=crop',
      descripcion: 'Diseño clásico con varillas y tejido de calidad.',
      tag: ''
    },
    {
      id: 10,
      nombre: 'Pérgola Bioclimática Motorizada',
      categoria: 'pergolas',
      precio: 2800,
      imagen: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600&h=400&fit=crop',
      descripcion: 'Lamas motorizadas con control remoto y APP móvil.',
      tag: 'Top'
    },
    {
      id: 11,
      nombre: 'Ventana Batiente de PVC',
      categoria: 'ventanas',
      precio: 650,
      imagen: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600&h=400&fit=crop',
      descripcion: 'Aislamiento térmico excepcional con apertura hacia inside.',
      tag: ''
    },
    {
      id: 12,
      nombre: 'Cerramiento Zenital',
      categoria: 'cerramientos',
      precio: 2500,
      imagen: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&h=400&fit=crop',
      descripcion: 'Techo de cristal corredero para cubiertas.',
      tag: 'Premium'
    }
  ];

  // ==========================================
  // ELEMENTOS DEL DOM
  // ==========================================
  const grid = document.getElementById('catalog-grid');
  const countSpan = document.getElementById('catalog-count');
  const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
  const minPriceInput = document.getElementById('price-min');
  const maxPriceInput = document.getElementById('price-max');
  const applyPriceBtn = document.getElementById('apply-price');

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
            <span class="product-price">${producto.precio.toLocaleString('es-ES')} €</span>
            <a href="${productUrl}" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.875rem;">Ver más</a>
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

    // Obtener rango de precios
    const minPrice = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;

    // Filtrar productos
    const productosFiltrados = productos.filter(producto => {
      const cumpleCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(producto.categoria);
      const cumplePrecio = producto.precio >= minPrice && producto.precio <= maxPrice;
      return cumpleCategoria && cumplePrecio;
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

  // Filtros de precio
  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', aplicarFiltros);
  }

  // Enter en inputs de precio
  if (minPriceInput) {
    minPriceInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') aplicarFiltros();
    });
  }
  if (maxPriceInput) {
    maxPriceInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') aplicarFiltros();
    });
  }

  // ==========================================
  // INICIALIZAR
  // ==========================================
  renderProductos(productos);

  console.log('✅ ProExt - Catálogo scripts loaded');
});