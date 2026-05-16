// scripts.js

const PRODUCT_DETAILS = {
  '#watch1-modal': { price: 2499, category: 'mens', type: 'analog', dial: 'stainless steel', strap: 'leather' },
  '#watch2-modal': { price: 1795, category: 'mens', type: 'analog', dial: 'black', strap: 'leather' },
  '#watch3-modal': { price: 2195, category: 'mens', type: 'analog', dial: 'blue grey', strap: 'stainless steel' },
  '#watch4-modal': { price: 3299, category: 'mens', type: 'analog', dial: 'black', strap: 'stainless steel' },
  '#watch5-modal': { price: 1499, category: 'mens', type: 'fashion', dial: 'creative', strap: 'synthetic' },
  '#watch6-modal': { price: 8995, category: 'mens', type: 'smartwatch', dial: 'black', strap: 'leather' },
  '#watch7-modal': { price: 2799, category: 'mens', type: 'analog', dial: 'decorative', strap: 'stainless steel' },
  '#watch8-modal': { price: 1299, category: 'smartwatch', type: 'smartwatch', dial: 'digital', strap: 'silicone' },
  '#watch9-modal': { price: 1999, category: 'smartwatch', type: 'smartwatch', dial: 'digital', strap: 'silicone' },
  '#watch10-modal': { price: 1199, category: 'mens', type: 'analog', dial: 'slim', strap: 'leather' },
  '#watch11-modal': { price: 1999, category: 'smartwatch', type: 'smartwatch', dial: 'digital', strap: 'stainless steel' },
  '#watch12-modal': { price: 1299, category: 'womens', type: 'analog', dial: 'rose gold', strap: 'stainless steel' },
  '#watch13-modal': { price: 3195, category: 'womens', type: 'analog', dial: 'lilac', strap: 'stainless steel' },
  '#watch14-modal': { price: 3699, category: 'womens', type: 'analog', dial: 'rose gold', strap: 'metal' },
  '#watch15-modal': { price: 1695, category: 'womens', type: 'analog', dial: 'pink', strap: 'metal' },
};

function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function getPriceRange(value) {
  if (!value) {
    return null;
  }

  const [min, max] = value.split('-').map(Number);
  return { min, max };
}

function createProductRecord(card) {
  const modalTarget = card.querySelector('.modal-btn')?.getAttribute('data-modal-target') || '';
  const details = PRODUCT_DETAILS[modalTarget] || {};
  const title = card.querySelector('h3')?.textContent || '';
  const description = card.querySelector('p')?.textContent || '';
  const section = card.closest('#womens-watches') ? 'womens' : 'mens';
  const category = details.category || section;
  const searchable = [
    title,
    description,
    category,
    details.type,
    details.dial,
    details.strap,
    details.price
  ].join(' ').toLowerCase();

  return {
    card,
    title,
    description,
    brand: normalize(title),
    category,
    price: details.price || 0,
    type: details.type || 'analog',
    dial: details.dial || '',
    strap: details.strap || '',
    searchable,
  };
}

function addProductMeta(product) {
  if (!product.price || product.card.querySelector('.watch-meta')) {
    return;
  }

  const meta = document.createElement('dl');
  meta.className = 'watch-meta';
  meta.innerHTML = `
    <div><dt>Price</dt><dd>${formatPrice(product.price)}</dd></div>
    <div><dt>Type</dt><dd>${product.type}</dd></div>
    <div><dt>Strap</dt><dd>${product.strap}</dd></div>
  `;

  const button = product.card.querySelector('.modal-btn');
  product.card.insertBefore(meta, button);
}

function populateSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value.replace(/\b\w/g, (letter) => letter.toUpperCase());
    select.appendChild(option);
  });
}

function initProductDiscovery() {
  const products = Array.from(document.querySelectorAll('.watch')).map(createProductRecord);
  const controls = {
    search: document.querySelector('#watchSearch'),
    category: document.querySelector('#categoryFilter'),
    brand: document.querySelector('#brandFilter'),
    price: document.querySelector('#priceFilter'),
    strap: document.querySelector('#strapFilter'),
    clear: document.querySelector('#clearFilters'),
    resultCount: document.querySelector('#resultCount'),
    activeFilters: document.querySelector('#activeFilters'),
  };

  if (!controls.search || products.length === 0) {
    return;
  }

  products.forEach(addProductMeta);
  populateSelect(controls.brand, [...new Set(products.map((product) => product.brand))].sort());
  populateSelect(controls.strap, [...new Set(products.map((product) => product.strap).filter(Boolean))].sort());

  const applyFilters = () => {
    const query = normalize(controls.search.value);
    const queryTerms = query.split(/\s+/).filter(Boolean);
    const category = controls.category.value;
    const brand = controls.brand.value;
    const priceRange = getPriceRange(controls.price.value);
    const strap = controls.strap.value;
    const active = [];
    let visibleCount = 0;

    if (query) active.push(`Search: "${query}"`);
    if (category) active.push(`Category: ${category}`);
    if (brand) active.push(`Brand: ${brand}`);
    if (controls.price.value) active.push(`Price: ${controls.price.options[controls.price.selectedIndex].textContent}`);
    if (strap) active.push(`Strap: ${strap}`);

    products.forEach((product) => {
      const matchesQuery = queryTerms.length === 0 ||
        queryTerms.every((term) => product.searchable.includes(term));
      const matchesCategory = !category || product.category === category;
      const matchesBrand = !brand || product.brand === brand;
      const matchesPrice = !priceRange || (product.price >= priceRange.min && product.price <= priceRange.max);
      const matchesStrap = !strap || product.strap === strap;
      const isVisible = matchesQuery && matchesCategory && matchesBrand && matchesPrice && matchesStrap;

      product.card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    document.querySelectorAll('.watches').forEach((section) => {
      const visibleCards = section.querySelectorAll('.watch:not([hidden])').length;
      section.classList.toggle('is-empty', visibleCards === 0);
    });

    controls.resultCount.textContent = visibleCount === products.length
      ? `Showing all ${products.length} watches`
      : `Showing ${visibleCount} of ${products.length} watches`;
    controls.activeFilters.textContent = active.join(' | ');
  };

  [controls.search, controls.category, controls.brand, controls.price, controls.strap].forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  controls.clear.addEventListener('click', () => {
    controls.search.value = '';
    controls.category.value = '';
    controls.brand.value = '';
    controls.price.value = '';
    controls.strap.value = '';
    applyFilters();
    controls.search.focus();
  });

  applyFilters();
}

document.addEventListener('DOMContentLoaded', function() {
  const modalBtns = document.querySelectorAll('.modal-btn');
  const modals = document.querySelectorAll('.modal');

  modalBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const modalTarget = this.getAttribute('data-modal-target');
      const modal = document.querySelector(modalTarget);
      modal.style.display = 'block';

      const closeBtn = modal.querySelector('.close-btn');
      closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
      });

      window.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('nav ul');

  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('show');
  });
});

document.addEventListener('DOMContentLoaded', initProductDiscovery);
