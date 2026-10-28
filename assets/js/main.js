/**
 * VOLTARIS CORE APPLICATION CONTROLLER (main.js)
 * Global navigation, custom cursor glow,
 * scroll reveals, animated number counters, tabs, accordions, and form validation.
 */

import { initTilt } from './tilt.js';
import { renderHomeMiniChart, renderStudioChart } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCursorGlow();
  initScrollReveals();
  initCounters();
  initAccordions();
  initTabs();
  initTilt();
  initDemoScheduler();
  initContactForm();
  initStudioCharts();
  initScrollUp();
});

/**
 * 1. THEME INITIALIZATION (Locked to Circuit-Noir Dark)
 */
function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.removeItem('voltaris_theme');
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * 2. NAVIGATION (STRICT: 4 LINKS ONLY)
 */
function initNavigation() {
  const nav = document.querySelector('.voltaris-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Active page indicator
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile Drawer Toggle
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/**
 * 4. CUSTOM CURSOR GLOW (Desktop Mouse Follower)
 */
function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let posX = mouseX;
  let posY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  function renderCursor() {
    posX += (mouseX - posX) * 0.12;
    posY += (mouseY - posY) * 0.12;
    glow.style.transform = `translate(${posX - 190}px, ${posY - 190}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);
}

/**
 * 5. SCROLL REVEAL OBSERVER
 */
function initScrollReveals() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));
}

/**
 * 6. ANIMATED NUMBER COUNTERS
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(c => observer.observe(c));

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const isDecimal = el.getAttribute('data-counter').includes('.');
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;

      el.textContent = `${prefix}${isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString()}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }
}

/**
 * 7. ACCORDIONS (FAQ & Glossary)
 */
function initAccordions() {
  const accordions = document.querySelectorAll('.accordion-item');
  accordions.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      // Close sibling items in the same container
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.accordion-item').forEach(sib => sib.classList.remove('active'));
      }
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * 8. CATEGORY EXPLORER TABS (index.html)
 */
function initTabs() {
  const tabBtns = document.querySelectorAll('.cat-tab-btn');
  const panes = document.querySelectorAll('.category-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      panes.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-category-pane') === cat);
      });
    });
  });

  // Render home mini chart if canvas present
  if (document.getElementById('homeMiniChart')) {
    renderHomeMiniChart('homeMiniChart');
  }
}

/**
 * 9. INTERACTIVE CHART STUDIO (insights.html)
 */
function initStudioCharts() {
  const studioCanvas = document.getElementById('studioChartCanvas');
  if (!studioCanvas) return;

  let activeType = 'sales';
  let activeCat = 'All';
  let activeRange = '30d';
  let activeChart = renderStudioChart('studioChartCanvas', activeType, activeCat, activeRange);

  // Chart type switcher buttons
  const typeBtns = document.querySelectorAll('.chart-type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.getAttribute('data-chart-type');
      if (activeChart) activeChart.destroy();
      activeChart = renderStudioChart('studioChartCanvas', activeType, activeCat, activeRange);
    });
  });

  // Date range filters
  const rangeBtns = document.querySelectorAll('.date-range-btn');
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRange = btn.getAttribute('data-range');
      if (activeChart) activeChart.destroy();
      activeChart = renderStudioChart('studioChartCanvas', activeType, activeCat, activeRange);
    });
  });

  // Category filter dropdown
  const catSelect = document.getElementById('studioCategoryFilter');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      activeCat = e.target.value;
      if (activeChart) activeChart.destroy();
      activeChart = renderStudioChart('studioChartCanvas', activeType, activeCat, activeRange);
    });
  }

  // Articles live search filter in insights.html
  const blogSearch = document.getElementById('blogSearchInput');
  if (blogSearch) {
    blogSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const articles = document.querySelectorAll('.blog-article-card');
      articles.forEach(art => {
        const title = art.querySelector('h3').textContent.toLowerCase();
        const snippet = art.querySelector('p').textContent.toLowerCase();
        art.style.display = (title.includes(q) || snippet.includes(q)) ? 'flex' : 'none';
      });
    });
  }
}

/**
 * 10. INTERACTIVE DEMO SCHEDULER (contact.html)
 */
function initDemoScheduler() {
  const dateChips = document.querySelectorAll('.sched-date-chip');
  const timeChips = document.querySelectorAll('.sched-time-chip');
  const bookBtn = document.getElementById('confirmBookingBtn');
  const modal = document.getElementById('bookingConfirmModal');
  const closeBtn = document.getElementById('closeBookingModal');

  let selectedDate = 'Tomorrow';
  let selectedTime = '10:00 AM UTC';

  dateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dateChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedDate = chip.getAttribute('data-date');
    });
  });

  timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      timeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedTime = chip.getAttribute('data-time');
    });
  });

  if (bookBtn && modal) {
    bookBtn.addEventListener('click', () => {
      const summaryEl = document.getElementById('bookingModalSummary');
      if (summaryEl) {
        summaryEl.textContent = `Demo scheduled for ${selectedDate} at ${selectedTime}. A calendar invitation has been prepared for your device engineering team.`;
      }
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
}

/**
 * 11. CONTACT FORM REAL CLIENT-SIDE VALIDATION
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasErrors = false;

    // Name validation
    const nameInput = document.getElementById('contactName');
    const nameGroup = nameInput.closest('.form-group');
    if (!nameInput.value.trim()) {
      nameGroup.classList.add('has-error');
      hasErrors = true;
    } else {
      nameGroup.classList.remove('has-error');
    }

    // Email validation
    const emailInput = document.getElementById('contactEmail');
    const emailGroup = emailInput.closest('.form-group');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailGroup.classList.add('has-error');
      hasErrors = true;
    } else {
      emailGroup.classList.remove('has-error');
    }

    // Message validation
    const msgInput = document.getElementById('contactMessage');
    const msgGroup = msgInput.closest('.form-group');
    if (msgInput.value.trim().length < 10) {
      msgGroup.classList.add('has-error');
      hasErrors = true;
    } else {
      msgGroup.classList.remove('has-error');
    }

    if (!hasErrors) {
      const successBox = document.getElementById('contactSuccessAlert');
      if (successBox) {
        successBox.style.display = 'block';
        form.reset();
        setTimeout(() => { successBox.style.display = 'none'; }, 6000);
      }
    }
  });
}

/**
 * 13. SCROLL UP (BACK TO TOP) CONTROLLER
 */
function initScrollUp() {
  let scrollBtn = document.getElementById('scrollUpBtn');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollUpBtn';
    scrollBtn.className = 'scroll-up-btn';
    scrollBtn.type = 'button';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(scrollBtn);
  }

  const toggleVisibility = () => {
    if (window.scrollY > 280) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
