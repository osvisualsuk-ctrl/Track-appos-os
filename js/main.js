/* ===========================
   INHANCE MEDIA — main.js
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveLink();
  initHero();
  initScrollFades();
  initCounters();

  if (document.querySelector('.portfolio-grid'))  initPortfolio();
  if (document.querySelector('#contact-form'))    initContactForm();
  if (document.querySelector('.faq-list'))        initFAQ();

  initSmoothScroll();
});

/* ──────────────────────────────
   NAVIGATION
────────────────────────────── */
function initNav() {
  const nav       = document.getElementById('nav');
  const burger    = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav');

  // Scroll shadow
  const handleScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (!burger || !mobileNav) return;

  // Toggle
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = burger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeMenu();
  });

  function closeMenu() {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function setActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ──────────────────────────────
   HERO KEN-BURNS EFFECT
────────────────────────────── */
function initHero() {
  const bg = document.querySelector('.hero__bg');
  if (bg) setTimeout(() => bg.classList.add('loaded'), 80);

  const scrollBtn = document.querySelector('.hero__scroll');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const target = document.querySelector('.stats-bar, main section');
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* ──────────────────────────────
   INTERSECTION OBSERVER FADES
────────────────────────────── */
function initScrollFades() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

/* ──────────────────────────────
   ANIMATED COUNTERS
────────────────────────────── */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        runCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => obs.observe(el));
}

function runCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const duration = 1600;
  const start    = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(tick);
}

/* ──────────────────────────────
   PORTFOLIO FILTER + LIGHTBOX
────────────────────────────── */
function initPortfolio() {
  // ─ Filter ─
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.p-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      items.forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;
        item.style.opacity    = show ? '1' : '0';
        item.style.transform  = show ? '' : 'scale(0.93)';
        item.style.pointerEvents = show ? '' : 'none';
        // hide after fade
        if (!show) {
          setTimeout(() => { if (item.style.opacity === '0') item.style.display = 'none'; }, 320);
        } else {
          item.style.display = '';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = ''; }, 20);
        }
      });
    });
  });

  // ─ Lightbox ─
  const lb       = document.getElementById('lightbox');
  if (!lb) return;
  const lbImg    = lb.querySelector('.lb-img');
  const lbClose  = lb.querySelector('.lb-close');
  const lbPrev   = lb.querySelector('.lb-prev');
  const lbNext   = lb.querySelector('.lb-next');
  const lbCap    = lb.querySelector('.lb-caption');
  let current    = 0;
  let activeImgs = [];

  function getVisible() {
    return Array.from(document.querySelectorAll('.p-item'))
      .filter(i => i.style.display !== 'none')
      .map(i => ({ src: i.querySelector('img').src, caption: i.dataset.caption || '' }));
  }

  function openLb(idx) {
    activeImgs = getVisible();
    current    = Math.max(0, Math.min(idx, activeImgs.length - 1));
    showImg();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function showImg() {
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = activeImgs[current].src;
      if (lbCap) lbCap.textContent = activeImgs[current].caption;
      lbImg.style.opacity = '1';
    }, 200);
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function nav(dir) {
    current = (current + dir + activeImgs.length) % activeImgs.length;
    showImg();
  }

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      const visibleSrcs = getVisible().map(v => v.src);
      const src = item.querySelector('img').src;
      const idx = visibleSrcs.indexOf(src);
      openLb(idx >= 0 ? idx : 0);
    });
  });

  lbClose?.addEventListener('click', closeLb);
  lbPrev?.addEventListener('click', () => nav(-1));
  lbNext?.addEventListener('click', () => nav(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLb();
    if (e.key === 'ArrowLeft')   nav(-1);
    if (e.key === 'ArrowRight')  nav(1);
  });
}

/* ──────────────────────────────
   FAQ ACCORDION
────────────────────────────── */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const open   = btn.classList.toggle('open');
      answer.classList.toggle('open', open);
      // close siblings
      btn.closest('.faq-list').querySelectorAll('.faq-q').forEach(other => {
        if (other !== btn) {
          other.classList.remove('open');
          other.nextElementSibling.classList.remove('open');
        }
      });
    });
  });
}

/* ──────────────────────────────
   CONTACT FORM VALIDATION
────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.querySelector('.form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    // reset
    form.querySelectorAll('.field-err').forEach(el => el.classList.remove('show'));
    form.querySelectorAll('.err').forEach(el => el.classList.remove('err'));

    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const service = form.querySelector('#service');
    const message = form.querySelector('#message');

    if (!name?.value.trim()) {
      flag(name, 'Please enter your name'); valid = false;
    }
    if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      flag(email, 'Please enter a valid email'); valid = false;
    }
    if (!service?.value) {
      flag(service, 'Please select a service'); valid = false;
    }
    if (!message?.value.trim() || message.value.trim().length < 15) {
      flag(message, 'Please give us a little more detail (15+ chars)'); valid = false;
    }

    if (!valid) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      success?.classList.add('show');
    }, 1000);
  });
}

function flag(field, msg) {
  if (!field) return;
  field.classList.add('err');
  const errEl = field.closest('.fg')?.querySelector('.field-err');
  if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
}

/* ──────────────────────────────
   SMOOTH SCROLL (anchor links)
────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
