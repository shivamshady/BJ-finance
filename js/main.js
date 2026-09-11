/* =========================================================
   BJ FINANCES — main.js
   Navigation, Mobile Menu, Scroll FX, FAQ, Animations
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR SCROLL ──────────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── 2. MOBILE MENU ────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav || e.target.tagName === 'A') {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // ── 3. MOBILE SUB-MENU TOGGLE ─────────────────────────────
  document.querySelectorAll('.mobile-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const sub = toggle.nextElementSibling;
      if (sub) {
        const isOpen = sub.style.display === 'block';
        sub.style.display = isOpen ? 'none' : 'block';
        toggle.querySelector('.toggle-arrow') &&
          (toggle.querySelector('.toggle-arrow').textContent = isOpen ? '▾' : '▴');
      }
    });
  });

  // ── 4. FAQ ACCORDION ──────────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ── 5. SCROLL ANIMATIONS ─────────────────────────────────
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card, .why-card, .step, .job-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  // ── 6. ACTIVE NAV LINK ───────────────────────────────────
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.style.color = 'var(--navy)';
      a.style.fontWeight = '800';
    }
  });

  // ── 7. SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── 8. COUNTER ANIMATION (stat bar) ──────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  function animateCounter(el) {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const decimal = el.dataset.decimal || 0;
    const duration = 1600;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = (target * ease).toFixed(decimal);
      el.textContent = prefix + val + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ── 9. FLOATING FAB VISIBILITY ───────────────────────────
  const floatingActions = document.querySelector('.floating-actions');
  if (floatingActions) {
    window.addEventListener('scroll', () => {
      floatingActions.style.opacity = window.scrollY > 200 ? '1' : '0';
      floatingActions.style.pointerEvents = window.scrollY > 200 ? 'all' : 'none';
    }, { passive: true });
  }

});
