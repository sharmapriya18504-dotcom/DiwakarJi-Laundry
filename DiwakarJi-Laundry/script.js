/* ============================================================
   DIWAKAR JI LAUNDRY — JavaScript
   Features: Scroll reveal, Header scroll, Mobile nav,
             FAQ accordion, Form validation, WhatsApp redirect,
             Date restriction, Smooth UX
   ============================================================ */

(function () {
  'use strict';

  /* ---- 1. HEADER SCROLL EFFECT ---- */
  const header = document.getElementById('header');
  let lastScroll = 0;

  function onScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 2. MOBILE HAMBURGER MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close nav when clicking a link
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close nav on outside click
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- 3. SCROLL REVEAL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Stagger children if multiple in grid
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- 4. FAQ ACCORDION ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').classList.remove('open');
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
    });
  });

  /* ---- 5. DATE RESTRICTION (min = today, max = 30 days) ---- */
  const dateInput = document.getElementById('pickup-date');
  if (dateInput) {
    const today  = new Date();
    const maxDay = new Date();
    maxDay.setDate(today.getDate() + 30);

    function formatDate(d) {
      const y  = d.getFullYear();
      const m  = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + dd;
    }

    dateInput.min = formatDate(today);
    dateInput.max = formatDate(maxDay);
  }

  /* ---- 6. FORM VALIDATION & WHATSAPP REDIRECT ---- */
  const form       = document.getElementById('booking-form');
  const submitBtn  = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');

  // Field configs
  const fields = [
    {
      id:      'full-name',
      groupId: 'group-name',
      errorId: 'error-name',
      validate: function (v) { return v.trim().length >= 2; }
    },
    {
      id:      'mobile',
      groupId: 'group-mobile',
      errorId: 'error-mobile',
      validate: function (v) { return /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, '')); }
    },
    {
      id:      'address',
      groupId: 'group-address',
      errorId: 'error-address',
      validate: function (v) { return v.trim().length >= 8; }
    },
    {
      id:      'area',
      groupId: 'group-area',
      errorId: 'error-area',
      validate: function (v) { return v.trim().length >= 3; }
    },
    {
      id:      'service',
      groupId: 'group-service',
      errorId: 'error-service',
      validate: function (v) { return v !== ''; }
    },
    {
      id:      'quantity',
      groupId: 'group-quantity',
      errorId: 'error-quantity',
      validate: function (v) { return v !== ''; }
    },
    {
      id:      'pickup-date',
      groupId: 'group-date',
      errorId: 'error-date',
      validate: function (v) { return v !== ''; }
    },
    {
      id:      'pickup-time',
      groupId: 'group-time',
      errorId: 'error-time',
      validate: function (v) { return v !== ''; }
    }
  ];

  // Real-time validation on blur
  fields.forEach(function (f) {
    const el = document.getElementById(f.id);
    if (!el) return;
    el.addEventListener('blur', function () { validateField(f); });
    el.addEventListener('input', function () {
      if (document.getElementById(f.groupId).classList.contains('error')) {
        validateField(f);
      }
    });
  });

  function validateField(f) {
    const el      = document.getElementById(f.id);
    const group   = document.getElementById(f.groupId);
    const isValid = f.validate(el.value);
    group.classList.toggle('error', !isValid);
    return isValid;
  }

  function validateAll() {
    let allValid = true;
    fields.forEach(function (f) {
      if (!validateField(f)) allValid = false;
    });
    return allValid;
  }

  // Format date for WhatsApp message
  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  // Build WhatsApp message
  function buildWhatsAppMessage(data) {
    const line = '\n';
    var msg = '';
    msg += '🧺 *New Laundry Booking — Diwakar Ji*' + line + line;
    msg += 'Hello Diwakar Ji,' + line + line;
    msg += 'I would like to book a laundry pickup.' + line + line;
    msg += '━━━━━━━━━━━━━━━━━━' + line;
    msg += '👤 *Name:* '              + data.name         + line;
    msg += '📱 *Mobile:* '            + data.mobile       + line;
    msg += '🏠 *Address:* '           + data.address      + line;
    msg += '📍 *Area / PIN Code:* '   + data.area         + line;
    msg += '👕 *Service:* '           + data.service      + line;
    msg += '⚖️ *Estimated Quantity:* ' + data.quantity    + line;
    msg += '📅 *Pickup Date:* '       + data.date         + line;
    msg += '⏰ *Preferred Time:* '    + data.time         + line;
    if (data.instructions && data.instructions.trim()) {
      msg += '📝 *Special Instructions:* ' + data.instructions.trim() + line;
    } else {
      msg += '📝 *Special Instructions:* —' + line;
    }
    msg += '━━━━━━━━━━━━━━━━━━' + line + line;
    msg += 'Please confirm availability and the final price.' + line + line;
    msg += 'Thank you! 🙏';
    return msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateAll()) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.querySelector('input, textarea, select').focus();
      }
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Opening WhatsApp…';

    // Gather values
    const data = {
      name:         document.getElementById('full-name').value.trim(),
      mobile:       document.getElementById('mobile').value.trim(),
      address:      document.getElementById('address').value.trim(),
      area:         document.getElementById('area').value.trim(),
      service:      document.getElementById('service').value,
      quantity:     document.getElementById('quantity').value,
      date:         formatDateDisplay(document.getElementById('pickup-date').value),
      time:         document.getElementById('pickup-time').value,
      instructions: document.getElementById('instructions').value
    };

    const message = buildWhatsAppMessage(data);
    const encoded = encodeURIComponent(message);
    const waURL   = 'https://wa.me/917860462268?text=' + encoded;

    // Short delay for UX feedback, then open WhatsApp
    setTimeout(function () {
      window.open(waURL, '_blank');

      // Show success state
      submitText.textContent = '✓ WhatsApp Opened! Check your app.';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

      // Reset after 5 seconds
      setTimeout(function () {
        submitBtn.disabled = false;
        submitText.textContent = 'Submit & Continue to WhatsApp';
        submitBtn.style.background = '';
      }, 5000);
    }, 600);
  });

  /* ---- 7. SMOOTH SCROLL for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerH = header.offsetHeight;
        const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });

  /* ---- 8. STAGGERED CARD ANIMATIONS ---- */
  // Add slight delay for grid cards
  function staggerCards(selector, delay) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.style.transitionDelay = (i * delay) + 'ms';
    });
  }
  staggerCards('.service-card', 80);
  staggerCards('.price-card', 60);
  staggerCards('.review-card', 80);
  staggerCards('.step-card', 100);

  /* ---- 9. ACTIVE NAV LINK on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });
    navLinkEls.forEach(function (link) {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--blue)' : '';
      link.style.background = href === current ? 'var(--sky)' : '';
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ---- 10. HERO IMAGE PARALLAX (desktop only) ---- */
  const heroImgWrap = document.querySelector('.hero-image-wrap');
  if (heroImgWrap && window.innerWidth > 768) {
    window.addEventListener('scroll', function () {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImgWrap.style.transform = 'translateY(' + scrolled * 0.08 + 'px)';
      }
    }, { passive: true });
  }

  /* ---- 11. COUNTER ANIMATION for stats ---- */
  function animateCounter(el, target, duration) {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(function () {
      start += step;
      if (start >= target) {
        el.textContent = el.dataset.suffix
          ? target + el.dataset.suffix
          : target + (el.dataset.plus ? '+' : '');
        clearInterval(interval);
      } else {
        el.textContent = Math.floor(start) + (el.dataset.plus ? '+' : '');
      }
    }, 16);
  }

  // Observe stat numbers
  const statNums = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el   = entry.target;
          const text = el.textContent;
          const num  = parseInt(text.replace(/\D/g, ''));
          if (!isNaN(num) && num > 0 && !el.dataset.animated) {
            el.dataset.animated = 'true';
            el.dataset.plus = text.includes('+') ? 'true' : '';
            animateCounter(el, num, 1500);
          }
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { statObserver.observe(el); });
  }

  /* ---- INIT ---- */
  console.log('%c Diwakar Ji Laundry 🧺 ', 'background:#2878F0;color:white;font-size:16px;font-weight:bold;border-radius:4px;padding:4px 10px;');
  console.log('%c Website ready. WhatsApp: +91 7860462268 ', 'color:#25D366;font-weight:bold;');

})();
