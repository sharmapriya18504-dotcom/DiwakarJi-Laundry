/* ============================================================
   DIWAKAR JI LAUNDRY — ADMIN DASHBOARD JAVASCRIPT
   Authentication, Bookings Management, Services & Settings
   ============================================================ */

(function () {
  'use strict';

  const API_BASE = window.location.origin;
  let authToken = localStorage.getItem('diwakar_admin_token') || '';
  let allBookings = [];
  let allServices = [];

  // DOM Elements
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');
  const displayAdminName = document.getElementById('display-admin-name');
  const togglePwdBtn = document.getElementById('toggle-pwd-btn');
  const pwdInput = document.getElementById('admin-password');
  const pwdEyeIcon = document.getElementById('pwd-eye-icon');

  // Toast Helper
  function showToast(msg, duration) {
    const toast = document.getElementById('admin-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration || 3500);
  }

  // Auth Fetch Helper (includes cookies and Bearer token)
  async function authFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    options.credentials = 'include';

    const res = await fetch(url, options);
    if (res.status === 401) {
      // Session expired or unauthorized
      handleLogoutUI();
      throw new Error('Unauthorized');
    }
    return res;
  }

  /* ============================================================
     1. AUTHENTICATION & LOGIN
     ============================================================ */
  async function checkAuth() {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/auth-check`);
      if (res.ok) {
        const data = await res.json();
        showDashboardUI(data.username || 'admin');
        return;
      }
    } catch (e) {
      // not logged in
    }
    handleLogoutUI();
  }

  function showDashboardUI(username) {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    if (displayAdminName) displayAdminName.textContent = username;
    loadDashboardStats();
    loadBookings();
    loadServices();
    loadSettings();
  }

  function handleLogoutUI() {
    localStorage.removeItem('diwakar_admin_token');
    authToken = '';
    dashboardContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      loginError.style.display = 'none';

      const username = document.getElementById('admin-username').value.trim();
      const password = pwdInput.value;
      const btn = document.getElementById('login-btn');
      btn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          authToken = data.token;
          localStorage.setItem('diwakar_admin_token', authToken);
          showDashboardUI(data.username);
          showToast('✓ Welcome back, ' + data.username + '!');
        } else {
          loginError.textContent = data.error || 'Invalid credentials. Please try again.';
          loginError.style.display = 'block';
        }
      } catch (err) {
        loginError.textContent = 'Server connection error. Make sure the server is running.';
        loginError.style.display = 'block';
      } finally {
        btn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      try {
        await fetch(`${API_BASE}/api/admin/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {}
      handleLogoutUI();
      showToast('Logged out successfully.');
    });
  }

  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener('click', function () {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      pwdEyeIcon.className = isPwd ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
  }

  /* ============================================================
     2. NAVIGATION TABS
     ============================================================ */
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const targetId = this.dataset.tab;
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');

      // Auto-refresh data on tab click
      if (targetId === 'tab-overview') loadDashboardStats();
      if (targetId === 'tab-bookings') loadBookings();
      if (targetId === 'tab-services') loadServices();
      if (targetId === 'tab-settings') loadSettings();
    });
  });

  /* ============================================================
     3. OVERVIEW & STATS
     ============================================================ */
  async function loadDashboardStats() {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/dashboard-stats`);
      if (!res.ok) return;
      const stats = await res.json();

      document.getElementById('kpi-total').textContent = stats.total || 0;
      document.getElementById('kpi-pending').textContent = stats.pending || 0;
      document.getElementById('kpi-today').textContent = stats.today || 0;
      document.getElementById('kpi-completed').textContent = stats.completed || 0;
      document.getElementById('kpi-services').textContent = stats.services || 6;

      const badge = document.getElementById('tab-badge-pending');
      if (badge) badge.textContent = stats.pending || 0;
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
  }

  function renderRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings-list');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
      container.innerHTML = '<div class="empty-state text-muted py-3">No bookings yet. New customer bookings will appear here.</div>';
      return;
    }

    const recent = bookings.slice(0, 5);
    let html = '<div class="recent-table-wrap"><table class="bookings-table"><thead><tr><th>Ref</th><th>Customer</th><th>Service</th><th>Pickup</th><th>Status</th></tr></thead><tbody>';

    recent.forEach(b => {
      html += `
        <tr>
          <td><span class="ref-pill">${b.reference}</span></td>
          <td><strong>${escapeHtml(b.customer_name)}</strong><br/><small class="text-muted">${b.mobile}</small></td>
          <td>${escapeHtml(b.service_name)}</td>
          <td>${escapeHtml(b.pickup_date)} • ${escapeHtml(b.pickup_time)}</td>
          <td><span class="badge-status ${b.status}">${formatStatus(b.status)}</span></td>
        </tr>
      `;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  /* ============================================================
     4. BOOKINGS MANAGER
     ============================================================ */
  const searchInput = document.getElementById('booking-search');
  const statusFilter = document.getElementById('filter-status');
  const dateFilter = document.getElementById('filter-date');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const refreshBookingsBtn = document.getElementById('refresh-bookings-btn');
  const bookingsTbody = document.getElementById('bookings-tbody');

  async function loadBookings() {
    try {
      const status = statusFilter ? statusFilter.value : 'all';
      const search = searchInput ? searchInput.value.trim() : '';
      const dateVal = dateFilter ? dateFilter.value : '';

      let url = `${API_BASE}/api/admin/bookings?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}&date=${encodeURIComponent(dateVal)}`;
      const res = await authFetch(url);
      if (!res.ok) return;
      const data = await res.json();
      allBookings = data.bookings || [];

      renderBookingsTable(allBookings);
      renderRecentBookings(allBookings);
    } catch (err) {
      if (bookingsTbody) {
        bookingsTbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error loading bookings. Please refresh.</td></tr>`;
      }
    }
  }

  function renderBookingsTable(bookings) {
    if (!bookingsTbody) return;

    if (!bookings || bookings.length === 0) {
      bookingsTbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-6 text-muted">
            <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
            No bookings found matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    bookings.forEach(b => {
      const cleanPhone = b.mobile.replace(/\D/g, '');
      const waDirectUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${b.customer_name}, this is Diwakar Ji Laundry regarding your booking ${b.reference}.`)}`;

      rowsHtml += `
        <tr id="booking-row-${b.id}">
          <td>
            <span class="ref-pill">${b.reference}</span>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 3px;">${b.created_at || ''}</div>
          </td>
          <td>
            <div class="cust-name">${escapeHtml(b.customer_name)}</div>
            <div class="cust-phone">${escapeHtml(b.mobile)}</div>
          </td>
          <td>
            <div style="font-size: 0.85rem; max-width: 200px;">${escapeHtml(b.address)}</div>
            <span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">📍 ${escapeHtml(b.area)}</span>
          </td>
          <td>
            <div style="font-weight: 700; color: #1e293b;">${escapeHtml(b.service_name)}</div>
            <div style="font-size: 0.78rem; color: #64748b;">${escapeHtml(b.quantity)}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: #0c1424;">${escapeHtml(b.pickup_date)}</div>
            <div style="font-size: 0.78rem; color: #475569;">⏰ ${escapeHtml(b.pickup_time)}</div>
          </td>
          <td>
            <div style="font-weight: 800; color: #b45309;">${escapeHtml(b.estimated_amount || '—')}</div>
          </td>
          <td>
            <select class="status-select-inline" onchange="window.updateBookingStatus(${b.id}, this.value)">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="in_progress" ${b.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <div style="margin-top: 4px;">
              <span class="badge-status ${b.status}">${formatStatus(b.status)}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a href="${waDirectUrl}" target="_blank" class="btn-wa-direct" title="Chat with customer on WhatsApp">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <a href="tel:+91${cleanPhone}" class="btn-wa-direct" style="background: #2878F0;" title="Call customer">
                <i class="fa-solid fa-phone" style="font-size: 13px;"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    });

    bookingsTbody.innerHTML = rowsHtml;
  }

  // Global handler for status update
  window.updateBookingStatus = async function (bookingId, newStatus) {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`✓ Booking status updated to "${formatStatus(newStatus)}"`);
        loadDashboardStats();
        // Update badge in table row
        const row = document.getElementById(`booking-row-${bookingId}`);
        if (row) {
          const badge = row.querySelector('.badge-status');
          if (badge) {
            badge.className = `badge-status ${newStatus}`;
            badge.textContent = formatStatus(newStatus);
          }
        }
      } else {
        showToast('Failed to update status.');
      }
    } catch (e) {
      showToast('Error updating status.');
    }
  };

  if (searchInput) searchInput.addEventListener('input', debounce(loadBookings, 300));
  if (statusFilter) statusFilter.addEventListener('change', loadBookings);
  if (dateFilter) dateFilter.addEventListener('change', loadBookings);
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (dateFilter) dateFilter.value = '';
      loadBookings();
    });
  }
  if (refreshBookingsBtn) refreshBookingsBtn.addEventListener('click', loadBookings);

  /* ============================================================
     5. SERVICES & PRICING
     ============================================================ */
  const servicesGrid = document.getElementById('admin-services-grid');
  const serviceModal = document.getElementById('service-modal');
  const serviceModalClose = document.getElementById('service-modal-close');
  const serviceModalCancel = document.getElementById('service-modal-cancel');
  const serviceForm = document.getElementById('service-form');
  const btnAddService = document.getElementById('btn-add-service');

  async function loadServices() {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/services`);
      if (!res.ok) return;
      const data = await res.json();
      allServices = data.services || [];
      renderServicesGrid(allServices);
    } catch (e) {
      console.warn('Failed to load services:', e);
    }
  }

  function renderServicesGrid(services) {
    if (!servicesGrid) return;
    if (!services || services.length === 0) {
      servicesGrid.innerHTML = '<div class="empty-state">No services configured.</div>';
      return;
    }

    let html = '';
    services.forEach(s => {
      const isInactive = !s.is_active;
      html += `
        <div class="admin-service-card ${isInactive ? 'inactive' : ''}" id="service-card-${s.id}">
          <div class="admin-service-header">
            <div>
              <span class="service-card-title">${escapeHtml(s.name)}</span>
              ${s.is_popular ? '<span class="admin-badge-diwali" style="margin-left: 6px;">Popular</span>' : ''}
            </div>
            <span class="badge-status ${s.is_active ? 'completed' : 'cancelled'}">
              ${s.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div class="service-price-tag">
            ₹${s.price}<small>${s.unit}</small>
          </div>
          <p class="service-card-desc">${escapeHtml(s.description || 'No description.')}</p>
          <div class="service-card-footer">
            <span style="font-size: 0.78rem; color: #64748b;">Order: #${s.display_order || 0}</span>
            <button type="button" class="btn-edit-service" onclick="window.openEditServiceModal(${s.id})">
              <i class="fa-solid fa-pen-to-square"></i> Edit Price
            </button>
          </div>
        </div>
      `;
    });
    servicesGrid.innerHTML = html;
  }

  window.openEditServiceModal = function (serviceId) {
    const s = allServices.find(item => item.id === serviceId);
    if (!s) return;

    document.getElementById('service-modal-title').textContent = 'Edit Service & Pricing';
    document.getElementById('edit-service-id').value = s.id;
    document.getElementById('service-modal-name').value = s.name;
    document.getElementById('service-modal-price').value = s.price;
    document.getElementById('service-modal-unit').value = s.unit || '/kg';
    document.getElementById('service-modal-desc').value = s.description || '';
    document.getElementById('service-modal-popular').checked = Boolean(s.is_popular);
    document.getElementById('service-modal-active').checked = Boolean(s.is_active);

    serviceModal.style.display = 'flex';
  };

  if (btnAddService) {
    btnAddService.addEventListener('click', function () {
      document.getElementById('service-modal-title').textContent = 'Add New Laundry Service';
      document.getElementById('edit-service-id').value = '';
      serviceForm.reset();
      document.getElementById('service-modal-active').checked = true;
      serviceModal.style.display = 'flex';
    });
  }

  function closeServiceModal() {
    if (serviceModal) serviceModal.style.display = 'none';
  }

  if (serviceModalClose) serviceModalClose.addEventListener('click', closeServiceModal);
  if (serviceModalCancel) serviceModalCancel.addEventListener('click', closeServiceModal);

  if (serviceForm) {
    serviceForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const id = document.getElementById('edit-service-id').value;
      const payload = {
        name: document.getElementById('service-modal-name').value.trim(),
        price: parseFloat(document.getElementById('service-modal-price').value),
        unit: document.getElementById('service-modal-unit').value,
        description: document.getElementById('service-modal-desc').value.trim(),
        is_popular: document.getElementById('service-modal-popular').checked ? 1 : 0,
        is_active: document.getElementById('service-modal-active').checked ? 1 : 0
      };

      const url = id ? `${API_BASE}/api/admin/services/${id}` : `${API_BASE}/api/admin/services`;
      const method = id ? 'PUT' : 'POST';

      try {
        const res = await authFetch(url, {
          method: method,
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          closeServiceModal();
          showToast(`✓ Service "${payload.name}" updated successfully!`);
          loadServices();
          loadDashboardStats();
        } else {
          const err = await res.json();
          showToast(err.error || 'Failed to save service.');
        }
      } catch (err) {
        showToast('Error saving service.');
      }
    });
  }

  /* ============================================================
     6. DIWALI & SITE SETTINGS
     ============================================================ */
  const settingsForm = document.getElementById('settings-form');

  async function loadSettings() {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/settings`);
      if (!res.ok) return;
      const data = await res.json();
      const s = data.settings || {};

      document.getElementById('setting-diwali-decorations').checked = (s.diwali_decorations_enabled === 'true' || s.diwali_decorations_enabled === true);
      document.getElementById('setting-banner-enabled').checked = (s.festive_banner_enabled === 'true' || s.festive_banner_enabled === true);
      document.getElementById('setting-banner-text').value = s.festive_banner_text || '';
      document.getElementById('setting-whatsapp-num').value = s.whatsapp_number || '917860462268';
      document.getElementById('setting-phone').value = s.contact_phone || '+91 7860462268';
      document.getElementById('setting-owner-name').value = s.owner_name || 'Diwakar Ji';
      document.getElementById('setting-hours').value = s.opening_hours || '7:00 AM – 8:00 PM (All 7 Days)';
      document.getElementById('setting-hero-headline').value = s.hero_headline || '';
      document.getElementById('setting-hero-subtitle').value = s.hero_subtitle || '';
      document.getElementById('setting-service-areas').value = s.service_areas || '';
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const payload = {
        diwali_decorations_enabled: document.getElementById('setting-diwali-decorations').checked ? 'true' : 'false',
        festive_banner_enabled: document.getElementById('setting-banner-enabled').checked ? 'true' : 'false',
        festive_banner_text: document.getElementById('setting-banner-text').value.trim(),
        whatsapp_number: document.getElementById('setting-whatsapp-num').value.trim(),
        contact_phone: document.getElementById('setting-phone').value.trim(),
        owner_name: document.getElementById('setting-owner-name').value.trim(),
        opening_hours: document.getElementById('setting-hours').value.trim(),
        hero_headline: document.getElementById('setting-hero-headline').value.trim(),
        hero_subtitle: document.getElementById('setting-hero-subtitle').value.trim(),
        service_areas: document.getElementById('setting-service-areas').value.trim()
      };

      try {
        const res = await authFetch(`${API_BASE}/api/admin/settings`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('✓ Diwali & Website settings updated successfully!');
        } else {
          showToast('Failed to save settings.');
        }
      } catch (err) {
        showToast('Error saving settings.');
      }
    });
  }

  /* ============================================================
     7. SECURITY & CHANGE PASSWORD
     ============================================================ */
  const changePwdForm = document.getElementById('change-pwd-form');
  if (changePwdForm) {
    changePwdForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const curr = document.getElementById('curr-password').value;
      const newP = document.getElementById('new-password').value;
      const conf = document.getElementById('confirm-password').value;

      if (newP !== conf) {
        showToast('New passwords do not match.');
        return;
      }

      try {
        const res = await authFetch(`${API_BASE}/api/admin/change-password`, {
          method: 'POST',
          body: JSON.stringify({ current_password: curr, new_password: newP })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✓ Password updated successfully!');
          changePwdForm.reset();
        } else {
          showToast(data.error || 'Failed to update password.');
        }
      } catch (err) {
        showToast('Error changing password.');
      }
    });
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function formatStatus(status) {
    const map = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return map[status] || status;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize
  checkAuth();

})();
