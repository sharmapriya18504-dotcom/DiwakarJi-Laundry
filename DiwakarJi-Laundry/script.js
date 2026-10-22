/* ============================================================
   DIWAKAR JI LAUNDRY — JavaScript
   Diwali Theme & Full-Stack Booking Platform
   Features: 
     - Dynamic Config & Active Services Loading
     - Live Price Estimation
     - Rigorous Form Validation & Duplicate Prevention
     - Database Persistence & Preserved Owner WhatsApp Notification
     - Booking Review & Confirmation Modal
     - Fallback / Copy / Direct Call Actions
     - Mobile Navigation, Scroll Reveal, FAQ Accordion
   ============================================================ */

(function () {
  'use strict';

  // Config & State
  const API_BASE = window.location.origin;
  let activeServices = [
    { service_id: 'wash_fold', name: 'Wash & Fold', price: 40, unit: '/kg' },
    { service_id: 'wash_iron', name: 'Wash & Iron', price: 60, unit: '/kg' },
    { service_id: 'dry_cleaning', name: 'Dry Cleaning', price: 120, unit: '/piece' },
    { service_id: 'steam_iron', name: 'Steam Ironing', price: 30, unit: '/piece' },
    { service_id: 'blankets', name: 'Blankets & Bedsheets', price: 80, unit: '/piece' },
    { service_id: 'express', name: 'Express Laundry', price: 70, unit: '/kg' }
  ];
  let currentSettings = {
    whatsapp_number: '917860462268',
    contact_phone: '+91 7860462268',
    owner_name: 'Diwakar Ji',
    festive_banner_enabled: 'true',
    festive_banner_text: '🪔 Shubh Diwali Offer: 15% OFF on Blankets & Dry Cleaning! Free Pickup & Delivery across Kanpur.',
    diwali_decorations_enabled: 'true'
  };
  let activeOffer = null;
  let themeSettings = {
    active_theme: 'diwali',
    theme_mode: 'manual',
    fireworks_enabled: true
  };
  let lastBookingData = null;

  /* ---- FIREWORKS CANVAS ANIMATION ---- */
  let fireworksAnimId = null;
  let fireworksPaused = false;

  function initFireworksCanvas(enabled) {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;

    if (fireworksAnimId) {
      cancelAnimationFrame(fireworksAnimId);
      fireworksAnimId = null;
    }

    if (!enabled) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    let height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    const isMobile = width < 768;
    const maxParticles = isMobile ? 35 : 70;

    const particles = [];
    const colorPalette = ['#FFD700', '#FFB703', '#FB8500', '#FF9E00', '#E63946', '#FFF3B0'];

    function Particle(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.8;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.035;
      this.friction = 0.982;
      this.alpha = 1;
      this.decay = Math.random() * 0.012 + 0.01;
      this.size = Math.random() * 2 + 1.2;
    }

    Particle.prototype.update = function () {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    };

    Particle.prototype.draw = function (c) {
      c.save();
      c.globalAlpha = Math.max(0, this.alpha);
      c.fillStyle = this.color;
      c.shadowBlur = 6;
      c.shadowColor = this.color;
      c.beginPath();
      c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      c.fill();
      c.restore();
    };

    function createBurst(x, y) {
      const count = isMobile ? 18 : 34;
      const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      for (let i = 0; i < count; i++) {
        if (particles.length > maxParticles) particles.shift();
        const color = Math.random() > 0.3 ? baseColor : colorPalette[Math.floor(Math.random() * colorPalette.length)];
        particles.push(new Particle(x, y, color));
      }
    }

    let lastBurstTime = Date.now();
    let nextBurstDelay = 1200;

    function loop() {
      if (fireworksPaused) return;
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastBurstTime > nextBurstDelay) {
        const bx = width * 0.15 + Math.random() * (width * 0.7);
        const by = height * 0.12 + Math.random() * (height * 0.45);
        createBurst(bx, by);
        lastBurstTime = now;
        nextBurstDelay = 1600 + Math.random() * 1600;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      fireworksAnimId = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        fireworksPaused = true;
        if (fireworksAnimId) cancelAnimationFrame(fireworksAnimId);
      } else {
        fireworksPaused = false;
        lastBurstTime = Date.now();
        fireworksAnimId = requestAnimationFrame(loop);
      }
    });

    createBurst(width * 0.35, height * 0.25);
    fireworksAnimId = requestAnimationFrame(loop);
  }

  /* ---- 1. TOAST HELPER ---- */
  function showToast(msg, duration) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, duration || 3500);
  }

  /* ---- 2. HEADER SCROLL EFFECT ---- */
  const header = document.getElementById('header');
  let lastScroll = 0;

  function onScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- 3. MOBILE HAMBURGER MENU ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
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
  }

  /* ---- 4. SCROLL REVEAL (Intersection Observer) ---- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- 5. FAQ ACCORDION ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      faqItems.forEach(function (other) {
        if (other !== item) {
          const otherBtn = other.querySelector('.faq-question');
          const otherAns = other.querySelector('.faq-answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.classList.remove('open');
        }
      });

      btn.setAttribute('aria-expanded', !isOpen);
      answer.classList.toggle('open', !isOpen);
    });
  });

  /* ---- 6. DATE RESTRICTION (today to 30 days) ---- */
  const dateInput = document.getElementById('pickup-date');
  if (dateInput) {
    const today = new Date();
    const maxDay = new Date();
    maxDay.setDate(today.getDate() + 30);

    function formatDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + dd;
    }

    dateInput.min = formatDate(today);
    dateInput.max = formatDate(maxDay);
    if (!dateInput.value) {
      dateInput.value = formatDate(today);
    }
  }

  /* ---- 7. LOAD DYNAMIC PUBLIC CONFIG & SERVICES ---- */
  async function loadPublicConfig() {
    try {
      const res = await fetch(`${API_BASE}/api/public/config`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.active_offer) {
        activeOffer = data.active_offer;
      }
      if (data.theme_settings) {
        themeSettings = data.theme_settings;
      }

      if (data.settings) {
        currentSettings = Object.assign(currentSettings, data.settings);
        applySettingsToDOM(currentSettings);
      }

      if (Array.isArray(data.services) && data.services.length > 0) {
        activeServices = data.services;
        updateServicesInDOM(activeServices);
      }
    } catch (err) {
      console.warn('Backend API currently using default offline config:', err);
      // Still apply defaults to DOM
      applySettingsToDOM(currentSettings);
    }
  }

  function applySettingsToDOM(settings) {
    // Dynamic Multi-Theme Engine
    const activeTheme = settings.active_theme || 'diwali';
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-theme', activeTheme);

    // Festive Banner
    const banner = document.getElementById('festive-banner');
    const bannerText = document.getElementById('festive-banner-text');
    if (banner) {
      if (settings.festive_banner_enabled === 'true' || settings.festive_banner_enabled === true) {
        banner.style.display = 'block';
        document.body.classList.add('has-festive-banner');
        if (bannerText && settings.festive_banner_text) {
          bannerText.innerHTML = settings.festive_banner_text;
        }
      } else {
        banner.style.display = 'none';
        document.body.classList.remove('has-festive-banner');
      }
    }

    // Diwali Decorations & Traditional Clay Diya
    const fairyLights = document.getElementById('fairy-lights');
    const festiveBadge = document.getElementById('festive-hero-badge');
    const traditionalDiya = document.getElementById('traditional-diya-hero');
    const rangoliMandala = document.querySelector('.hero-rangoli-mandala');
    const waCompanion = document.querySelector('.whatsapp-diya-companion');
    const isDecorEnabled = settings.diwali_decorations_enabled === 'true' || settings.diwali_decorations_enabled === true;

    const showDiwali = (activeTheme === 'diwali') && isDecorEnabled;

    if (fairyLights) fairyLights.style.display = showDiwali ? 'flex' : 'none';
    if (festiveBadge) festiveBadge.style.display = showDiwali ? 'inline-flex' : 'none';
    if (traditionalDiya) traditionalDiya.style.display = showDiwali ? 'inline-flex' : 'none';
    if (rangoliMandala) rangoliMandala.style.display = showDiwali ? 'block' : 'none';
    if (waCompanion) waCompanion.style.display = showDiwali ? 'flex' : 'none';

    // Hero Text
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroTitle && settings.hero_headline) {
      heroTitle.innerHTML = settings.hero_headline;
    }
    if (heroSubtitle && settings.hero_subtitle) {
      heroSubtitle.innerHTML = settings.hero_subtitle;
    }

    // Contact details & WhatsApp Links
    const waPhone = settings.whatsapp_number || '917860462268';
    const waFloat = document.getElementById('whatsapp-float');
    if (waFloat) waFloat.href = `https://wa.me/${waPhone}`;
  }

  // Banner close button handler
  const bannerCloseBtn = document.getElementById('festive-banner-close');
  if (bannerCloseBtn) {
    bannerCloseBtn.addEventListener('click', function () {
      const banner = document.getElementById('festive-banner');
      if (banner) {
        banner.style.display = 'none';
        document.body.classList.remove('has-festive-banner');
      }
    });
  }

  function updateServicesInDOM(services) {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
      const currentVal = serviceSelect.value;
      serviceSelect.innerHTML = '<option value="">Select Service</option>';
      services.forEach(function (s) {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = `${s.name} (from ₹${s.price}${s.unit})`;
        serviceSelect.appendChild(opt);
      });
      if (currentVal) serviceSelect.value = currentVal;
    }
  }

  /* ---- 8. LIVE PRICE ESTIMATION ---- */
  const serviceEl = document.getElementById('service');
  const quantityEl = document.getElementById('quantity');
  const estimateBox = document.getElementById('live-price-estimate');
  const estimateTag = document.getElementById('estimate-service-tag');
  const estimateAmount = document.getElementById('estimate-amount-text');
  const estimateNote = document.getElementById('estimate-note-text');

  function calculatePriceEstimate(serviceName, qtyStr) {
    if (!serviceName) return null;
    const svc = activeServices.find(s => s.name.toLowerCase() === serviceName.toLowerCase())
      || activeServices.find(s => serviceName.toLowerCase().includes(s.name.toLowerCase()));

    if (!svc) return null;

    const price = svc.price;
    const unit = svc.unit;

    if (!qtyStr || qtyStr.includes('Not sure')) {
      return {
        amount: `Starting from ₹${price}${unit}`,
        note: `Rate is ₹${price}${unit}. Final weight & amount will be confirmed at doorstep pickup.`
      };
    }

    let multiplier = 1;
    const q = qtyStr.toLowerCase();
    if (q.includes('1–3') || q.includes('1-3')) multiplier = 2;
    else if (q.includes('4–6') || q.includes('4-6')) multiplier = 5;
    else if (q.includes('7–10') || q.includes('7-10')) multiplier = 8;
    else if (q.includes('10+')) multiplier = 12;

    const est = Math.round(price * multiplier);
    return {
      amount: `~₹${est}`,
      note: `Estimated for ${qtyStr} @ ₹${price}${unit}. Final amount confirmed upon weighing at pickup. No advance needed.`
    };
  }

  function updateLivePrice() {
    if (!estimateBox) return;
    const sVal = serviceEl ? serviceEl.value : '';
    const qVal = quantityEl ? quantityEl.value : '';

    if (!sVal) {
      estimateBox.style.display = 'none';
      return;
    }

    const est = calculatePriceEstimate(sVal, qVal);
    if (!est) {
      estimateBox.style.display = 'none';
      return;
    }

    estimateBox.style.display = 'block';
    if (estimateTag) estimateTag.textContent = sVal;
    if (estimateAmount) estimateAmount.textContent = est.amount;
    if (estimateNote) estimateNote.textContent = est.note;
  }

  if (serviceEl) serviceEl.addEventListener('change', updateLivePrice);
  if (quantityEl) quantityEl.addEventListener('change', updateLivePrice);

  /* ---- 9. FORM VALIDATION & MODAL BOOKING WORKFLOW ---- */
  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');

  const fields = [
    {
      id: 'full-name',
      groupId: 'group-name',
      validate: function (v) { return v.trim().length >= 2; }
    },
    {
      id: 'mobile',
      groupId: 'group-mobile',
      validate: function (v) { return /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, '')); }
    },
    {
      id: 'address',
      groupId: 'group-address',
      validate: function (v) { return v.trim().length >= 5; }
    },
    {
      id: 'area',
      groupId: 'group-area',
      validate: function (v) { return v.trim().length >= 2; }
    },
    {
      id: 'service',
      groupId: 'group-service',
      validate: function (v) { return v !== ''; }
    },
    {
      id: 'quantity',
      groupId: 'group-quantity',
      validate: function (v) { return v !== ''; }
    },
    {
      id: 'pickup-date',
      groupId: 'group-date',
      validate: function (v) { return v !== ''; }
    },
    {
      id: 'pickup-time',
      groupId: 'group-time',
      validate: function (v) { return v !== ''; }
    }
  ];

  fields.forEach(function (f) {
    const el = document.getElementById(f.id);
    if (!el) return;
    el.addEventListener('blur', function () { validateField(f); });
    el.addEventListener('input', function () {
      const grp = document.getElementById(f.groupId);
      if (grp && grp.classList.contains('error')) {
        validateField(f);
      }
    });
  });

  function validateField(f) {
    const el = document.getElementById(f.id);
    const group = document.getElementById(f.groupId);
    if (!el || !group) return true;
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

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    } catch (e) {
      return dateStr;
    }
  }

  // Exact WhatsApp owner message generator
  function buildWhatsAppMessage(data, ref, estPrice) {
    const line = '\n';
    const owner = currentSettings.owner_name || 'Diwakar Ji';
    var msg = '';
    msg += '🧺 *New Laundry Booking — ' + owner + '*' + line + line;
    msg += 'Hello ' + owner + ',' + line + line;
    msg += 'I would like to book a laundry pickup.' + line + line;
    msg += '━━━━━━━━━━━━━━━━━━' + line;
    if (ref) {
      msg += '🔖 *Booking Ref:* ' + ref + line;
    }
    msg += '👤 *Name:* ' + data.name + line;
    msg += '📱 *Mobile:* ' + data.mobile + line;
    msg += '🏠 *Address:* ' + data.address + line;
    msg += '📍 *Area / PIN Code:* ' + data.area + line;
    msg += '👕 *Service:* ' + data.service + line;
    msg += '⚖️ *Estimated Quantity:* ' + data.quantity + line;
    if (estPrice) {
      msg += '💰 *Estimated Price:* ' + estPrice + line;
    }
    msg += '📅 *Pickup Date:* ' + data.formattedDate + line;
    msg += '⏰ *Preferred Time:* ' + data.time + line;
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

  /* ---- 10. BOOKING MODAL ACTIONS ---- */
  const bookingModal = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalOpenWaBtn = document.getElementById('modal-open-wa-btn');
  const modalCopyBtn = document.getElementById('modal-copy-btn');
  const modalCallBtn = document.getElementById('modal-call-btn');
  const modalRetryBtn = document.getElementById('modal-retry-btn');

  function openBookingModal(bookingData) {
    lastBookingData = bookingData;
    document.getElementById('modal-booking-ref').textContent = bookingData.reference;
    document.getElementById('modal-cust-name').textContent = bookingData.name;
    document.getElementById('modal-cust-mobile').textContent = bookingData.mobile;
    document.getElementById('modal-cust-service').textContent = bookingData.service;
    document.getElementById('modal-cust-quantity').textContent = bookingData.quantity;
    document.getElementById('modal-cust-schedule').textContent = `${bookingData.formattedDate} • ${bookingData.time}`;
    document.getElementById('modal-cust-estimate').textContent = bookingData.estimatedPrice || 'Confirmed at pickup';
    document.getElementById('modal-cust-address').textContent = `${bookingData.address}, ${bookingData.area}`;

    const instrEl = document.getElementById('modal-cust-instructions');
    if (instrEl) instrEl.textContent = bookingData.instructions || '—';

    // Set call button
    if (modalCallBtn) {
      modalCallBtn.href = `tel:${bookingData.ownerPhone || currentSettings.contact_phone || '+917860462268'}`;
    }

    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookingModal);

  // Close on backdrop click
  if (bookingModal) {
    bookingModal.addEventListener('click', function (e) {
      if (e.target === bookingModal) closeBookingModal();
    });
  }

  // Open WhatsApp action
  if (modalOpenWaBtn) {
    modalOpenWaBtn.addEventListener('click', function () {
      if (lastBookingData && lastBookingData.whatsappUrl) {
        window.open(lastBookingData.whatsappUrl, '_blank');
        showToast('✓ WhatsApp opened. Please tap Send in WhatsApp!');

        // Notify backend that notification was opened
        if (lastBookingData.reference) {
          fetch(`${API_BASE}/api/bookings/${lastBookingData.reference}/notification`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'opened' })
          }).catch(() => { });
        }
      }
    });
  }

  // Copy booking text action
  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', function () {
      if (lastBookingData && lastBookingData.whatsappMessage) {
        navigator.clipboard.writeText(lastBookingData.whatsappMessage).then(function () {
          showToast('✓ Booking details copied to clipboard!');
        }).catch(function () {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = lastBookingData.whatsappMessage;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('✓ Booking details copied to clipboard!');
        });
      }
    });
  }

  /* ---- 11. FORM SUBMIT HANDLER ---- */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!validateAll()) {
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = firstError.querySelector('input, textarea, select');
        if (input) input.focus();
      }
      return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'Saving Booking…';

    const rawMobile = document.getElementById('mobile').value.trim();
    const cleanMobile = rawMobile.replace(/\D/g, '').replace(/^91/, '');
    const rawDate = document.getElementById('pickup-date').value;
    const formattedDate = formatDateDisplay(rawDate);

    const formData = {
      name: document.getElementById('full-name').value.trim(),
      mobile: cleanMobile,
      address: document.getElementById('address').value.trim(),
      area: document.getElementById('area').value.trim(),
      service: document.getElementById('service').value,
      quantity: document.getElementById('quantity').value,
      date: rawDate,
      formattedDate: formattedDate,
      time: document.getElementById('pickup-time').value,
      instructions: document.getElementById('instructions').value.trim()
    };

    let estPrice = '';
    const estObj = calculatePriceEstimate(formData.service, formData.quantity);
    if (estObj) estPrice = estObj.amount;

    let bookingResult = null;

    try {
      // 1. Save booking in backend database
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        bookingResult = {
          reference: json.booking.reference,
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          area: formData.area,
          service: formData.service,
          quantity: formData.quantity,
          formattedDate: formattedDate,
          time: formData.time,
          instructions: formData.instructions,
          estimatedPrice: json.booking.estimated_amount || estPrice,
          whatsappUrl: json.whatsappUrl,
          whatsappMessage: json.whatsappMessage,
          ownerPhone: json.ownerPhone
        };
      } else {
        throw new Error(json.errors ? json.errors.join(', ') : 'Database save failed');
      }
    } catch (err) {
      console.warn('Backend unavailable, using client-side fallback booking flow:', err);
      // Safe client-side fallback: NEVER lose the booking or the owner notification!
      const clientRef = 'DWK-' + Math.floor(Date.now() / 1000).toString(16).toUpperCase().slice(-6);
      const ownerPhone = currentSettings.whatsapp_number || '917860462268';
      const fallbackMsg = buildWhatsAppMessage(formData, clientRef, estPrice);
      const fallbackUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(fallbackMsg)}`;

      bookingResult = {
        reference: clientRef,
        name: formData.name,
        mobile: formData.mobile,
        address: formData.address,
        area: formData.area,
        service: formData.service,
        quantity: formData.quantity,
        formattedDate: formattedDate,
        time: formData.time,
        instructions: formData.instructions,
        estimatedPrice: estPrice,
        whatsappUrl: fallbackUrl,
        whatsappMessage: fallbackMsg,
        ownerPhone: ownerPhone
      };
    }

    // Reset button state
    submitBtn.disabled = false;
    submitText.textContent = 'Submit & Continue to WhatsApp';

    // Show Confirmation Modal
    openBookingModal(bookingResult);

    // Automatically trigger WhatsApp in new tab (preserves existing workflow!)
    try {
      window.open(bookingResult.whatsappUrl, '_blank');
    } catch (popErr) {
      console.warn('Pop-up prevented automatic WhatsApp open; user can click modal button.', popErr);
    }
  });

  /* ---- 12. SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 70;
        const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });

  /* ---- 13. STAT COUNTERS ---- */
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

  const statNums = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent;
          const num = parseInt(text.replace(/\D/g, ''));
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

  /* ---- 14. DUAL THEME SWITCHER (NORMAL DAILY & SPECIAL DIWALI) ---- */
  /* ---- 10. THEME SWITCHER & REVIEW CAROUSEL (SCREENSHOT REDESIGN) ---- */
  const themeSelector = document.getElementById('theme-selector');
  const heroBadge = document.getElementById('hero-badge');
  const heroShowcaseImg = document.getElementById('hero-showcase-img');
  const diwaliSeal = document.getElementById('diwali-seal');
  const marigoldGarland = document.getElementById('marigold-garland');
  const centerFestiveCard = document.getElementById('center-festive-card');

  function applyTheme(themeName) {
    const isDiwali = themeName === 'diwali';
    document.documentElement.setAttribute('data-theme', isDiwali ? 'diwali' : 'classic');
    localStorage.setItem('diwakar_theme', themeName);

    if (themeSelector) {
      themeSelector.value = isDiwali ? 'diwali' : 'classic';
    }

    if (heroBadge) {
      heroBadge.innerHTML = isDiwali
        ? `<span>🪔 ${activeOffer?.badge_text || 'Happy Diwali'} 🪔</span>`
        : '<span>🧺 Premium Laundry Care</span>';
      heroBadge.className = isDiwali ? 'hero-festive-badge' : 'hero-normal-badge';
    }

    if (heroShowcaseImg) {
      heroShowcaseImg.src = isDiwali ? 'diwali_hero_stack.jpg' : 'hero_laundry.png';
    }

    if (diwaliSeal) {
      diwaliSeal.style.display = isDiwali ? 'flex' : 'none';
      if (isDiwali && activeOffer) {
        const sealTitle = diwaliSeal.querySelector('.seal-title');
        const sealSub = diwaliSeal.querySelector('.seal-subtitle');
        if (sealTitle) sealTitle.textContent = activeOffer.title || '✦ Diwali Special ✦';
        if (sealSub) sealSub.textContent = activeOffer.discount_value ? `${activeOffer.discount_value}% OFF` : (activeOffer.subtitle || 'Freshness for a brighter tomorrow');
      }
    }

    if (marigoldGarland) {
      marigoldGarland.style.display = isDiwali ? 'flex' : 'none';
    }

    // Toggle Fireworks Canvas
    const allowSparks = isDiwali && (themeSettings ? themeSettings.fireworks_enabled : true);
    initFireworksCanvas(allowSparks);

    if (centerFestiveCard) {
      if (isDiwali) {
        centerFestiveCard.className = 'diwali-promo-card-screenshot';
        centerFestiveCard.innerHTML = `
          <div class="promo-lantern-ornament left" aria-hidden="true">🪔</div>
          <div class="promo-lantern-ornament right" aria-hidden="true">🪔</div>
          <span class="diwali-promo-tag">${activeOffer?.badge_text || 'This Diwali'}</span>
          <h3 class="diwali-promo-headline">${activeOffer?.title || 'Keep Your Clothes Fresh and Your Moments Bright'}</h3>
          <p class="diwali-promo-desc">${activeOffer?.description || activeOffer?.subtitle || 'Special festive offers on selected services. Book now and enjoy the festive care!'}</p>
          ${activeOffer?.discount_code ? `
            <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(245,196,83,0.15); border:1px dashed #F6C64A; padding:6px 14px; border-radius:50px; margin:10px auto; color:#F6C64A; font-weight:700; font-size:0.82rem;">
              <span>🏷️ Code: <strong>${activeOffer.discount_code}</strong></span>
              <span style="background:#F6C64A; color:#1a0d2e; padding:2px 8px; border-radius:12px; font-size:0.72rem;">${activeOffer.discount_value}% OFF</span>
            </div>
          ` : ''}
          <div class="diwali-promo-diya-glow">
            <svg class="diya-glow-svg" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="38" stroke="#F6C64A" stroke-width="1" stroke-dasharray="3 3"/>
              <circle cx="50" cy="50" r="28" stroke="#F6C64A" stroke-width="0.8"/>
              <path d="M20 48 C22 60 36 65 50 65 C64 65 78 60 80 48 C80 42 70 38 50 38 C30 38 20 42 20 48 Z" fill="#9a3412" stroke="#F6C64A" stroke-width="1"/>
              <ellipse cx="50" cy="42" rx="30" ry="7" fill="#d97706" stroke="#F6C64A" stroke-width="0.8"/>
              <g class="diya-flame-animation">
                <path d="M50 14 C43 26 42 33 50 38 C58 33 57 26 50 14 Z" fill="#ea580c"/>
                <path d="M50 18 C45 28 44 32 50 36 C56 32 55 28 50 18 Z" fill="#fbbf24"/>
                <path d="M50 22 C48 30 47 32 50 34 C53 32 52 30 50 22 Z" fill="#ffffff"/>
              </g>
            </svg>
          </div>
        `;
      } else {
        centerFestiveCard.className = 'diwali-promo-card-screenshot';
        centerFestiveCard.style.background = 'linear-gradient(135deg, #061a33 0%, #0b3b70 100%)';
        centerFestiveCard.innerHTML = `
          <span class="diwali-promo-tag" style="color:#f6c64a; font-style:normal; font-weight:700;">Our Promise</span>
          <h3 class="diwali-promo-headline">Fabric-Safe, Hygienic &amp; On-Time Delivery</h3>
          <p class="diwali-promo-desc">Every order is washed individually in fresh softened water with eco-friendly sanitizing detergents.</p>
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:16px; font-size:0.85rem; color:#e2e8f0; text-align:left;">
            <div><i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> 100% Separate Individual Wash</div>
            <div><i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> Zero Color Bleed Guarantee</div>
            <div><i class="fa-solid fa-circle-check" style="color:#22c55e;"></i> Digital Doorstep Weighing</div>
          </div>
        `;
      }
    }
  }

  // Load saved theme (default to diwali matching user screenshot request)
  const savedTheme = localStorage.getItem('diwakar_theme') || 'diwali';
  applyTheme(savedTheme);

  if (themeSelector) {
    themeSelector.addEventListener('change', function (e) {
      applyTheme(e.target.value);
      showToast(e.target.value === 'diwali' ? '🪔 Shubh Diwali Theme Activated!' : '☀️ Normal Daily Theme Activated!');
    });
  }

  /* ---- 11. REVIEWS CAROUSEL ---- */
  const reviewsData = [
    {
      text: '"Excellent service! My clothes came back fresh, clean and perfectly folded. On-time delivery and very professional team."',
      author: '— Pooja Sharma'
    },
    {
      text: '"Best dry cleaning service in Kanpur! My heavy festive sherwani and blankets were cleaned with extraordinary care."',
      author: '— Rohit Verma'
    },
    {
      text: '"Prompt doorstep pickup and delivery near IIT Kanpur. Very reasonable prices and great hygienic packaging."',
      author: '— Dr. Amit Tiwari'
    }
  ];

  let currentReviewIdx = 0;
  const quoteEl = document.getElementById('active-review-quote');
  const authorEl = document.getElementById('active-review-author');
  const dots = document.querySelectorAll('.carousel-dot');

  function updateReview(idx) {
    currentReviewIdx = (idx + reviewsData.length) % reviewsData.length;
    if (quoteEl) quoteEl.textContent = reviewsData[currentReviewIdx].text;
    if (authorEl) authorEl.textContent = reviewsData[currentReviewIdx].author;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentReviewIdx);
    });
  }

  const prevReviewBtn = document.getElementById('prev-review-btn');
  const nextReviewBtn = document.getElementById('next-review-btn');
  if (prevReviewBtn) prevReviewBtn.addEventListener('click', () => updateReview(currentReviewIdx - 1));
  if (nextReviewBtn) nextReviewBtn.addEventListener('click', () => updateReview(currentReviewIdx + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => updateReview(i)));

  /* ---- 12. LIVE PRICE ESTIMATE ON SERVICE CHANGE ---- */
  const serviceSelect = document.getElementById('service');
  const estimateDisplay = document.getElementById('estimate-amount-text');

  const priceMap = {
    'Wash & Fold': '~₹160',
    'Wash & Iron': '~₹240',
    'Dry Cleaning': '~₹480',
    'Steam Ironing': '~₹120',
    'Bedding & Home Linen': '~₹320',
    'Express Laundry': '~₹280'
  };

  if (serviceSelect && estimateDisplay) {
    serviceSelect.addEventListener('change', function () {
      const selected = serviceSelect.value;
      estimateDisplay.textContent = priceMap[selected] || '~₹240';
    });
  }

  /* ---- INIT ---- */
  loadPublicConfig();
  console.log('%c Diwakar Ji Laundry 🧺 ', 'background:#0c1424;color:#f5c453;font-size:16px;font-weight:bold;border-radius:4px;padding:4px 10px;');
  console.log('%c Atelier Frontend Active • WhatsApp: +91 7860462268 ', 'color:#25D366;font-weight:bold;');

})();

