/**
 * NexaFlow — script.js
 * Interactive Navigation + Landing Page Logic
 */

'use strict';

/* ═══════════════════════════════════════════════════
   1. NAVBAR — scroll colour change + progress bar
   ═══════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const progress   = document.getElementById('navProgress');
  const links      = document.querySelectorAll('.nav-link[data-section]');
  const sections   = [];

  // Map each link → its target section
  links.forEach(link => {
    const id = link.getAttribute('data-section');
    const el = document.getElementById(id);
    if (el) sections.push({ link, el });
  });

  function onScroll() {
    const scrollY   = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Toggle "scrolled" class — triggers colour/backdrop change
    navbar.classList.toggle('scrolled', scrollY > 20);

    // Reading progress bar
    const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progress.style.width = pct + '%';

    // Active link highlighting
    let currentSection = null;
    sections.forEach(({ el }) => {
      if (scrollY >= el.offsetTop - 120) currentSection = el.id;
    });

    sections.forEach(({ link }) => {
      link.classList.toggle(
        'active',
        link.getAttribute('data-section') === currentSection
      );
    });

    // Back-to-top button
    const btn = document.getElementById('backTop');
    btn.classList.toggle('show', scrollY > 400);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ═══════════════════════════════════════════════════
   2. HAMBURGER MENU (mobile)
   ═══════════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const overlay   = document.getElementById('mobileOverlay');

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  // Close menu on nav link click (mobile)
  document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on resize ≥ 900
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) toggleMenu(false);
  });
})();

/* ═══════════════════════════════════════════════════
   3. SMOOTH SCROLL for anchor links
   ═══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════
   4. SCROLL REVEAL (Intersection Observer)
   ═══════════════════════════════════════════════════ */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), +delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  items.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════════════
   5. ANIMATED COUNTERS
   ═══════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  let started = false;

  function startCount() {
    if (started) return;
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;
    const rect = statsSection.getBoundingClientRect();
    if (rect.top > window.innerHeight) return;
    started = true;

    counters.forEach(counter => {
      const target = +counter.dataset.target;
      const duration = 1600;
      const step = 16;
      const increment = target / (duration / step);
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.round(current);
      }, step);
    });
  }

  window.addEventListener('scroll', startCount, { passive: true });
  setTimeout(startCount, 800);
})();

/* ═══════════════════════════════════════════════════
   6. HERO CANVAS — particle field
   ═══════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles;
  const COLORS = ['#6c63ff', '#f72585', '#00f5d4', '#ffd60a'];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }

  function init() {
    const count = Math.min(Math.floor((W * H) / 10000), 80);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${(1 - dist / 140) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();

  window.addEventListener('resize', resize, { passive: true });

  // Mouse repel effect
  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    particles.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * 0.8;
        p.vy += (dy / dist) * force * 0.8;
        // Damping
        p.vx *= 0.9;
        p.vy *= 0.9;
      }
    });
  });
})();

/* ═══════════════════════════════════════════════════
   7. WORK — portfolio filter
   ═══════════════════════════════════════════════════ */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.work-card[data-category]');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.transition = 'opacity .4s ease, transform .4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════
   8. CONTACT FORM — validation + submit
   ═══════════════════════════════════════════════════ */
(function initForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;

  const fnameInput = form.querySelector('#fname');
  const lnameInput = form.querySelector('#lname');
  const emailInput = form.querySelector('#email');
  const msgInput   = form.querySelector('#message');
  const btnText    = document.getElementById('btnText');
  const success    = document.getElementById('formSuccess');

  function setError(inputEl, errId, msg) {
    document.getElementById(errId).textContent = msg;
    inputEl.classList.toggle('error', !!msg);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validate() {
    let valid = true;

    if (!fnameInput.value.trim()) {
      setError(fnameInput, 'fnameErr', 'First name is required.'); valid = false;
    } else setError(fnameInput, 'fnameErr', '');

    if (!lnameInput.value.trim()) {
      setError(lnameInput, 'lnameErr', 'Last name is required.'); valid = false;
    } else setError(lnameInput, 'lnameErr', '');

    if (!emailInput.value.trim()) {
      setError(emailInput, 'emailErr', 'Email is required.'); valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, 'emailErr', 'Please enter a valid email.'); valid = false;
    } else setError(emailInput, 'emailErr', '');

    if (!msgInput.value.trim()) {
      setError(msgInput, 'msgErr', 'Message cannot be empty.'); valid = false;
    } else if (msgInput.value.trim().length < 20) {
      setError(msgInput, 'msgErr', 'Message must be at least 20 characters.'); valid = false;
    } else setError(msgInput, 'msgErr', '');

    return valid;
  }

  // Live validation on blur
  [fnameInput, lnameInput, emailInput, msgInput].forEach(el => {
    el.addEventListener('blur', validate);
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validate();
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate async submit
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      success.classList.add('show');
      form.reset();

      setTimeout(() => success.classList.remove('show'), 6000);
    }, 1400);
  });
})();

/* ═══════════════════════════════════════════════════
  9. BACK TO TOP
   ═══════════════════════════════════════════════════ */
document.getElementById('backTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ═══════════════════════════════════════════════════
  10. HERO TITLE — staggered letter reveal on load
   ═══════════════════════════════════════════════════ */
(function initHeroAnimations() {
  const lines = document.querySelectorAll('.title-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(60px)';
    line.style.transition = `opacity .8s ease ${i * 0.18 + 0.2}s, transform .8s cubic-bezier(.4,0,.2,1) ${i * 0.18 + 0.2}s`;
    requestAnimationFrame(() => {
      setTimeout(() => {
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';
      }, 50);
    });
  });
})();

/* ═══════════════════════════════════════════════════
  11. ACTIVE NAV LINK — colour style on hover
      (CSS handles :hover, JS handles .active state;
       additional micro-colour change via CSS vars
       driven by scroll — already handled in §1)
   ═══════════════════════════════════════════════════ */
// All nav colour/style changes are managed by the
// .navbar.scrolled class (see CSS) + .active class
// toggled by the Intersection / scroll logic above.
// No extra JS needed here — clean separation of concerns.

console.info('%cNexaFlow ✦ Loaded', 'color:#6c63ff;font-size:14px;font-weight:bold;');