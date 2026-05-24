/* PROEXT — Components module
 * Header auto-hide, mobile menu, accordion, whatsapp visibility, cookie banner.
 */
(function () {
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        header.classList.toggle('is-scrolled', y > 8);
        if (Math.abs(delta) > 6) {
          if (delta > 0 && y > 120) header.classList.add('is-hidden');
          else header.classList.remove('is-hidden');
        }
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;
    const closeBtn = menu.querySelector('.menu-toggle');
    const links = menu.querySelectorAll('.mobile-menu__link');
    links.forEach((l, i) => l.style.setProperty('--i', i.toString()));

    const open = () => {
      menu.classList.add('is-open');
      toggle.classList.add('is-open');
      if (closeBtn) closeBtn.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      if (closeBtn) closeBtn.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      menu.classList.contains('is-open') ? close() : open();
    });
    if (closeBtn && closeBtn !== toggle) closeBtn.addEventListener('click', close);
    links.forEach((l) => l.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function initAccordion() {
    document.querySelectorAll('.accordion').forEach((acc) => {
      acc.querySelectorAll('.accordion__item').forEach((item) => {
        const btn = item.querySelector('.accordion__btn');
        const content = item.querySelector('.accordion__content');
        if (!btn || !content) return;
        btn.addEventListener('click', () => {
          const open = item.classList.toggle('is-open');
          if (open) {
            content.style.maxHeight = content.scrollHeight + 'px';
          } else {
            content.style.maxHeight = '0';
          }
        });
      });
    });
  }

  function initWhatsapp() {
    const fab = document.querySelector('.whatsapp-float');
    if (!fab) return;
    const onScroll = () => fab.classList.toggle('is-visible', window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const accept = document.getElementById('btn-aceptar');
    const decline = document.getElementById('btn-rechazar');
    if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => banner.classList.add('is-open'), 800);
    }
    if (accept) accept.addEventListener('click', () => { localStorage.setItem('cookiesAccepted', 'true'); banner.classList.remove('is-open'); });
    if (decline) decline.addEventListener('click', () => { localStorage.setItem('cookiesAccepted', 'false'); banner.classList.remove('is-open'); });
  }

  function initActiveNav() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav__link, .mobile-menu__link').forEach((l) => {
      const href = (l.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href === path) l.classList.add('is-active');
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initAccordion();
    initWhatsapp();
    initCookieBanner();
    initActiveNav();
    initSmoothAnchors();
  });
})();
