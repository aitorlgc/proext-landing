/* PROEXT — Catálogo
 * Carga productos desde /api/products, filtros con chips, render con cards editorial.
 */
(async function () {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count');
  const chips = document.querySelectorAll('.filter-chip');
  if (!grid) return;

  const CATEGORY_LABELS = {
    pergola: 'Pérgolas',
    pergolas: 'Pérgolas',
    bioclimatic: 'Bioclimáticas',
    bioclimatica: 'Bioclimáticas',
    'pergolas-bioclimaticas': 'Pérgolas Bioclimáticas',
    'pergola-bioclimatica': 'Pérgola Bioclimática',
    'pergola-madera': 'Pérgola de Madera',
    'pergola-motorizada': 'Pérgola Motorizada',
    toldo: 'Toldos',
    toldos: 'Toldos',
    'toldo-retractil': 'Toldo Retráctil',
    'toldo-vertical': 'Toldo Vertical',
    'cortina-enrollable': 'Cortina Enrollable',
    ventana: 'Ventanas',
    ventanas: 'Ventanas',
    'ventana-panoramica': 'Ventana Panorámica',
    'ventana-corredera': 'Ventana Corredera',
    'ventana-batiente': 'Ventana Batiente',
    cerramiento: 'Cerramientos',
    cerramientos: 'Cerramientos',
    'cerramiento-terraza': 'Cerramiento de Terraza',
    'cerramiento-zenital': 'Cerramiento Zenital',
  };

  function normalizeCat(cat) {
    const c = (cat || '').toLowerCase().trim();
    if (c.includes('bioclimat')) return 'bioclimatic';
    if (c.includes('pergol')) return 'pergola';
    if (c.includes('toldo') || c.includes('cortina')) return 'toldo';
    if (c.includes('ventana')) return 'ventana';
    if (c.includes('cerramiento')) return 'cerramiento';
    return c;
  }

  let products = [];
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    products = data.map((p, idx) => {
      const rawCat = (p.category || 'otro').toLowerCase();
      const filterCat = normalizeCat(rawCat);
      return {
        id: p.id,
        title: p.title,
        category: rawCat,
        filterCat,
        categoryLabel: CATEGORY_LABELS[rawCat] || CATEGORY_LABELS[filterCat] || 'Producto',
        image: p.image,
        desc: p.description || '',
        tag: p.tag || '',
        price: p.price && p.price !== 'Consultar' ? p.price : null,
        url: '/producto?id=' + p.id,
        n: (idx + 1).toString().padStart(2, '0'),
      };
    });
  } catch (e) {
    console.warn('No products from API');
  }

  function updateCount(n) {
    if (!countEl) return;
    countEl.textContent = `Mostrando ${n.toString().padStart(2, '0')} ${n === 1 ? 'obra' : 'obras'}`;
  }

  function render(items) {
    grid.innerHTML = '';
    if (!items.length) {
      grid.innerHTML = '<div class="catalog-empty"><h3>Sin resultados</h3><p>No hay productos que coincidan con los filtros seleccionados.</p></div>';
      updateCount(0);
      return;
    }
    updateCount(items.length);
    items.forEach((p, i) => {
      const card = document.createElement('a');
      card.className = 'product-card reveal-up';
      card.style.setProperty('--i', (i % 6).toString());
      card.href = p.url;
      card.innerHTML = `
        <span class="product-card__num">→ ${p.n}</span>
        ${p.tag ? `<span class="product-card__tag">${p.tag}</span>` : ''}
        <div class="product-card__media">
          <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop'">
          <div class="product-card__mask">
            <span class="eyebrow" style="color:var(--verde-hoja)">${p.categoryLabel}</span>
            <h3>${p.title}</h3>
            <span class="product-card__mask-cta">Descubrir</span>
          </div>
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${p.categoryLabel}</span>
          <h3 class="product-card__title">${p.title}</h3>
          <p class="product-card__desc">${(p.desc || '').slice(0, 110)}${(p.desc || '').length > 110 ? '…' : ''}</p>
          <div class="product-card__foot">
            <span class="product-card__price">${p.price || 'Consultar'}</span>
            <span class="btn btn--inline">Ver →</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    // Trigger reveal for newly added cards
    requestAnimationFrame(() => grid.querySelectorAll('.reveal-up').forEach((el) => el.classList.add('is-in')));
  }

  function applyFilters() {
    const active = document.querySelector('.filter-chip.is-active');
    const cat = active ? active.dataset.cat : 'all';
    const filtered = (!cat || cat === 'all') ? products : products.filter((p) => p.filterCat === cat);
    render(filtered);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilters();
    });
  });

  render(products);
})();
