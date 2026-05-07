/**
 * PROEXT - Main JavaScript
 * Scroll reveals, sticky header, smooth scroll, animations
 */

document.addEventListener('DOMContentLoaded', function() {
  // ==========================================
  // STICKY HEADER
  // ==========================================
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // ==========================================
  // MOBILE MENU TOGGLE
  // ==========================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');

      // Animate hamburger
      const spans = menuToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // ==========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerHeight = header ? header.offsetHeight : 80;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ==========================================
  // SCROLL REVEAL ANIMATIONS (Continuous)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  // Dynamic scroll animations - triggers every time elements enter/leave viewport
  const handleScrollAnimation = () => {
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.85;

    revealElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      
      // Calculate how close the element is to the center of the viewport
      const centerOffset = elementTop - (windowHeight / 2) + (rect.height / 2);
      const distanceFromCenter = Math.abs(centerOffset);
      
      // Scale and opacity based on position relative to viewport center
      if (elementTop < triggerPoint && elementBottom > 0) {
        // Element is entering viewport - calculate intensity based on position
        const intensity = 1 - (distanceFromCenter / (windowHeight / 2));
        const clampedIntensity = Math.max(0, Math.min(1, intensity));
        
        // Apply continuous animation based on scroll position
        element.style.opacity = clampedIntensity;
        element.style.transform = `translateY(${40 * (1 - clampedIntensity)}px)`;
        element.classList.add('active');
      } else if (elementBottom <= 0 || elementTop >= windowHeight) {
        // Element has left viewport - reduce opacity for smoother exit
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px)';
      }
    });
  };

  // Initial check
  handleScrollAnimation();

  // Throttled scroll handler for better performance
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollAnimation();
        ticking = false;
      });
      ticking = true;
    }
  });

  // ==========================================
  // PARALLAX EFFECT FOR HERO
  // ==========================================
  const heroSection = document.querySelector('.hero');
  const heroBg = document.querySelector('.hero-bg');

  if (heroSection && heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < heroSection.offsetHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    });
  }

  // ==========================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // ==========================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .product-card, .testimonial-card').forEach(el => {
    observer.observe(el);
  });

  // ==========================================
  // ACTIVE NAV LINK ON SCROLL
  // ==========================================
  const sections = document.querySelectorAll('section[id]');

  const highlightNavOnScroll = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNavOnScroll);

  // ==========================================
  // PRODUCT CARDS HOVER EFFECT
  // ==========================================
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // ==========================================
  // TESTIMONIALS AUTO-FADE (Optional)
  // ==========================================
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  if (testimonialCards.length > 0) {
    let currentTestimonial = 0;

    const nextTestimonial = () => {
      testimonialCards[currentTestimonial].style.opacity = '0.5';
      currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
      testimonialCards[currentTestimonial].style.opacity = '1';
    };

    setInterval(nextTestimonial, 5000);
  }

  console.log('✅ ProExt - Main scripts loaded');
});