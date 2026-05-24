/* PROEXT — Animations module
 * IntersectionObserver reveals, parallax, marquee, scroll progress.
 * Honors prefers-reduced-motion.
 */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveals() {
    if (prefersReduced) {
      document.querySelectorAll('.reveal-mask, .reveal-up, .reveal-fade').forEach((el) => el.classList.add('is-in'));
      return;
    }
    const targets = document.querySelectorAll('.reveal-mask, .reveal-up, .reveal-fade');
    if (!targets.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );
    targets.forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', (i % 6).toString());
      obs.observe(el);
    });
  }

  function initHeroReveal() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (prefersReduced) {
      hero.classList.add('is-ready');
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-ready')));
  }

  function initParallax() {
    if (prefersReduced) return;
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        els.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax || '0.15');
          const rect = el.getBoundingClientRect();
          const inView = rect.bottom > 0 && rect.top < window.innerHeight;
          if (inView) el.style.transform = `translate3d(0, ${(y - el.offsetTop) * speed}px, 0)`;
        });
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMarqueeClone() {
    document.querySelectorAll('.marquee__track').forEach((track) => {
      if (track.dataset.cloned) return;
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.parentNode.appendChild(clone);
      clone.classList.add('marquee__track');
      // Wrap original and clone in a parent? Already child of .marquee
      track.dataset.cloned = '1';
    });
  }

  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initSplitTitle() {
    const titles = document.querySelectorAll('.hero__title');
    titles.forEach((t) => {
      const lines = t.querySelectorAll('.line');
      lines.forEach((line, i) => {
        const span = line.querySelector('span');
        if (span) span.style.setProperty('--i', i.toString());
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSplitTitle();
    initHeroReveal();
    initReveals();
    initParallax();
    initMarqueeClone();
    initScrollProgress();
  });
})();
