/* PROEXT — Catálogo
 * Carga productos desde /api/products, filtros con chips, render con cards editorial.
 */
document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('catalog-grid');
  const countEl = document.getElementById('catalog-count');
  const chips = document.querySelectorAll('.filter-chip');
  if (!grid) return;

  const CATEGORY_LABELS = {
    pergola: 'Pérgolas',
    pergolas: 'Pérgolas',
    bioclimatic: 'Bioclimáticas',
    bioclimatica: 'Bioclimáticas',
    toldo: 'Toldos',
    toldos: 'Toldos',
    ventana: 'Ventanas',
    ventanas: 'Ventanas',
    cerramiento: 'Cerramientos',
    cerramientos: 'Cerramientos',
  };

  let products = [];
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    products = data.map((p, idx) => ({
      id: p.id,
      title: p.title,
      category: (p.category || 'otro').toLowerCase(),
      categoryLabel: CATEGORY_LABELS[(p.category || 'otro').toLowerCase()] || 'Producto',
      image: p.image,
      desc: p.description || '',
      tag: p.tag || '',
      price: p.price && p.price !== 'Consultar' ? p.price : null,
      url: '/producto?id=' + p.id,
      n: (idx + 1).toString().padStart(2, '0'),
    }));
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

  function getActiveCategories() {
    return Array.from(chips)
      .filter((c) => c.classList.contains('is-active') && c.dataset.cat !== 'all')
      .map((c) => c.dataset.cat);
  }

  function applyFilters() {
    const active = getActiveCategories();
    const filtered = active.length === 0 ? products : products.filter((p) => active.includes(p.category));
    render(filtered);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.dataset.cat === 'all') {
        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
      } else {
        const all = document.querySelector('.filter-chip[data-cat="all"]');
        if (all) all.classList.remove('is-active');
        chip.classList.toggle('is-active');
        const anyActive = Array.from(chips).some((c) => c.dataset.cat !== 'all' && c.classList.contains('is-active'));
        if (!anyActive && all) all.classList.add('is-active');
      }
      applyFilters();
    });
  });

  render(products);
});
