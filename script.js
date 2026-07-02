/* HealthBridge — script.js */

(function () {
  'use strict';

  // ---- Sticky header shadow --------------------------------
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav toggle ----------------------------------
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !header.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // ---- Active nav link on scroll --------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const updateActiveLink = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 80) current = section.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ---- Fade-in on scroll (Intersection Observer) ----------
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ---- Smooth scroll for anchor links ---------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- Contact Form Validation ----------------------------
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    'first-name':  { el: form.querySelector('#first-name'),  errEl: form.querySelector('#first-name-error'),  rule: v => v.trim().length >= 1, msg: 'First name is required.' },
    'last-name':   { el: form.querySelector('#last-name'),   errEl: form.querySelector('#last-name-error'),   rule: v => v.trim().length >= 1, msg: 'Last name is required.' },
    'email':       { el: form.querySelector('#email'),       errEl: form.querySelector('#email-error'),       rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Please enter a valid work email.' },
    'company':     { el: form.querySelector('#company'),     errEl: form.querySelector('#company-error'),     rule: v => v.trim().length >= 1, msg: 'Company name is required.' },
  };

  function validateField(key) {
    const { el, errEl, rule, msg } = fields[key];
    const valid = rule(el.value);
    el.classList.toggle('error', !valid);
    errEl.textContent = valid ? '' : msg;
    el.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  // Live validation on blur
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) validateField(key);
    });
  });

  const submitBtn = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all required fields
    const allValid = Object.keys(fields).map(validateField).every(Boolean);
    if (!allValid) {
      const firstError = Object.values(fields).find(f => f.el.classList.contains('error'));
      if (firstError) firstError.el.focus();
      return;
    }

    // Simulate submission (replace with real endpoint)
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    await simulateSubmit(form);

    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    form.reset();
    Object.values(fields).forEach(({ el, errEl }) => {
      el.classList.remove('error');
      errEl.textContent = '';
    });

    successMsg.removeAttribute('hidden');
    successMsg.focus();

    // Hide success after 8 seconds
    setTimeout(() => successMsg.setAttribute('hidden', ''), 8000);
  });

  function simulateSubmit(formEl) {
    // Collect form data (swap for a real fetch() call)
    const data = Object.fromEntries(new FormData(formEl).entries());
    console.log('Form submitted:', data);
    return new Promise(resolve => setTimeout(resolve, 1200));
  }

  // ---- Counter animation for hero stats -------------------
  const statNumbers = document.querySelectorAll('.hero__stat-number');

  function animateCounter(el) {
    const raw = el.textContent.trim();
    const numMatch = raw.match(/[\d,]+/);
    if (!numMatch) return;
    const target = parseInt(numMatch[0].replace(/,/g, ''), 10);
    if (!target || target > 100000) return; // skip huge or non-numeric

    const prefix = raw.slice(0, raw.indexOf(numMatch[0]));
    const suffix = raw.slice(raw.indexOf(numMatch[0]) + numMatch[0].length);
    const duration = 1400;
    const start = performance.now();

    const tick = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

})();
