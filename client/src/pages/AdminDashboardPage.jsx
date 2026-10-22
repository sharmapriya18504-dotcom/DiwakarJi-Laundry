import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchDashboardStats,
  fetchAdminBookings,
  updateBookingStatus,
  fetchAdminServices,
  updateAdminService,
  fetchAdminSettings,
  updateAdminSettings,
  changeAdminPassword
} from '../services/api';

export default function AdminDashboardPage() {
  const { admin, isAuthenticated, checking, logout } = useAuth();
  const { refreshConfig } = useConfig();
  const { switchTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ total_bookings: 0, pending_bookings: 0, confirmed_bookings: 0, completed_bookings: 0, today_pickups: 0 });
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters for bookings
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, checking, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, svRes, stRes] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminBookings({ status: statusFilter, search: searchFilter, date: dateFilter }),
        fetchAdminServices(),
        fetchAdminSettings()
      ]);

      if (sRes.stats) setStats(sRes.stats);
      if (bRes.bookings) setBookings(bRes.bookings);
      if (svRes.services) setServices(svRes.services);
      if (stRes.settings) setSettings(stRes.settings);
    } catch (e) {
      console.warn('Dashboard data fetch note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus, 'Status updated via admin dashboard');
      showToast(`Booking status updated to ${newStatus}`);
      loadData();
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  const handleServicePriceChange = async (svc, newPrice) => {
    try {
      await updateAdminService(svc.id, {
        name: svc.name,
        description: svc.description,
        price: parseFloat(newPrice),
        unit: svc.unit,
        is_active: svc.is_active,
        display_order: svc.display_order
      });
      showToast(`Updated price for ${svc.name}`);
      loadData();
      refreshConfig();
    } catch (e) {
      alert(e.message || 'Failed to update service');
    }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      await updateAdminSettings({ active_theme: newTheme });
      setSettings(prev => ({ ...prev, active_theme: newTheme }));
      switchTheme(newTheme);
      refreshConfig();
      showToast(`Active website theme changed to ${newTheme.toUpperCase()}`);
    } catch (e) {
      alert(e.message || 'Failed to update theme');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings);
      showToast('Website settings saved to database successfully');
      refreshConfig();
    } catch (e) {
      alert(e.message || 'Failed to save settings');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully changed!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setPasswordMsg({ type: 'error', text: e.message || 'Failed to update password.' });
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0c1424', color: '#fff' }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Top Bar */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <span style={{ fontSize: '24px' }}>🪔</span>
          <div>
            <h3>Diwakar Ji Laundry</h3>
            <span>Admin Management Portal</span>
          </div>
        </div>

        <div className="admin-header-actions">
          <Link to="/" target="_blank" className="btn-view-site">
            <i className="fa-solid fa-arrow-up-right-from-square"></i> Live Website
          </Link>
          <div className="admin-profile-badge">
            <i className="fa-solid fa-user-shield"></i>
            <span>{admin?.username || 'admin'}</span>
          </div>
          <button type="button" className="btn-admin-logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="admin-body-container">
        {/* Navigation Tabs */}
        <nav className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fa-solid fa-chart-pie"></i> Overview
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fa-solid fa-calendar-check"></i> Bookings Manager
            {stats.pending_bookings > 0 && (
              <span className="badge-tab-count">{stats.pending_bookings}</span>
            )}
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <i className="fa-solid fa-tags"></i> Services &amp; Pricing
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fa-solid fa-palette"></i> Website &amp; Themes
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fa-solid fa-shield-halved"></i> Security
          </button>
        </nav>

        {/* Content Area */}
        <main className="admin-content-area">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-tab-pane">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon blue"><i className="fa-solid fa-receipt"></i></div>
                  <div className="kpi-details">
                    <span className="kpi-label">Total Bookings</span>
                    <strong className="kpi-val">{stats.total_bookings}</strong>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon orange"><i className="fa-solid fa-clock-rotate-left"></i></div>
                  <div className="kpi-details">
                    <span className="kpi-label">Pending / New</span>
                    <strong className="kpi-val">{stats.pending_bookings}</strong>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon green"><i className="fa-solid fa-circle-check"></i></div>
                  <div className="kpi-details">
                    <span className="kpi-label">Confirmed</span>
                    <strong className="kpi-val">{stats.confirmed_bookings}</strong>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon purple"><i className="fa-solid fa-truck-ramp-box"></i></div>
                  <div className="kpi-details">
                    <span className="kpi-label">Completed</span>
                    <strong className="kpi-val">{stats.completed_bookings}</strong>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon gold"><i className="fa-solid fa-calendar-day"></i></div>
                  <div className="kpi-details">
                    <span className="kpi-label">Today's Pickups</span>
                    <strong className="kpi-val">{stats.today_pickups}</strong>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Recent Customer Bookings</h4>
                  <button type="button" className="btn-sm-refresh" onClick={loadData}>
                    <i className="fa-solid fa-rotate-right"></i> Refresh
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ref Code</th>
                        <th>Customer</th>
                        <th>Mobile</th>
                        <th>Service</th>
                        <th>Pickup Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 8).map(b => (
                        <tr key={b.id || b.booking_ref}>
                          <td><strong>{b.booking_ref}</strong></td>
                          <td>{b.customer_name}</td>
                          <td>{b.mobile_number}</td>
                          <td>{b.service_name}</td>
                          <td>{b.pickup_date}</td>
                          <td>{b.pickup_time}</td>
                          <td>
                            <span className={`status-pill ${b.status}`}>{b.status}</span>
                          </td>
                          <td>
                            <a
                              href={`https://wa.me/91${b.mobile_number.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-icon wa"
                              title="Chat with Customer on WhatsApp"
                            >
                              <i className="fa-brands fa-whatsapp"></i>
                            </a>
                            <a
                              href={`tel:${b.mobile_number}`}
                              className="btn-action-icon phone"
                              title="Call Customer"
                            >
                              <i className="fa-solid fa-phone"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No bookings recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS MANAGER */}
          {activeTab === 'bookings' && (
            <div className="admin-tab-pane">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>All Customer Bookings ({bookings.length})</h4>
                  <div className="admin-filters-bar">
                    <form onSubmit={handleSearchSubmit} className="search-form-inline">
                      <input
                        type="text"
                        placeholder="Search ref, customer, phone..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                      />
                      <button type="submit"><i className="fa-solid fa-magnifying-glass"></i></button>
                    </form>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      title="Filter by Pickup Date"
                    />
                    {dateFilter && (
                      <button type="button" onClick={() => setDateFilter('')} className="btn-clear-date">
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Customer Details</th>
                        <th>Service &amp; Qty</th>
                        <th>Address &amp; Area</th>
                        <th>Schedule</th>
                        <th>Estimate</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id || b.booking_ref}>
                          <td>
                            <strong>{b.booking_ref}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {new Date(b.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td>
                            <strong>{b.customer_name}</strong>
                            <div style={{ fontSize: '0.8rem' }}>{b.mobile_number}</div>
                          </td>
                          <td>
                            <strong>{b.service_name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.quantity}</div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '180px', fontSize: '0.82rem' }}>{b.pickup_address}</div>
                            <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>{b.area}</span>
                          </td>
                          <td>
                            <div>{b.pickup_date}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.pickup_time}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#b45309' }}>{b.estimated_price || '—'}</strong>
                          </td>
                          <td>
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className={`status-select ${b.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <a
                              href={`https://wa.me/91${b.mobile_number.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action-icon wa"
                              title="Chat on WhatsApp"
                            >
                              <i className="fa-brands fa-whatsapp"></i>
                            </a>
                            <a
                              href={`tel:${b.mobile_number}`}
                              className="btn-action-icon phone"
                              title="Direct Phone Call"
                            >
                              <i className="fa-solid fa-phone"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                            No matching bookings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div className="admin-tab-pane">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Manage Services &amp; Starting Rates</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Changes immediately reflect on the public website and live price estimator.
                  </p>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Service Name</th>
                        <th>Description</th>
                        <th>Base Rate (₹)</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(svc => (
                        <tr key={svc.id}>
                          <td><strong>{svc.name}</strong></td>
                          <td style={{ maxWidth: '280px', fontSize: '0.8rem' }}>{svc.description}</td>
                          <td>
                            <input
                              type="number"
                              defaultValue={svc.price}
                              id={`price-input-${svc.id}`}
                              style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                          </td>
                          <td>{svc.unit}</td>
                          <td>
                            <span className="status-pill confirmed">Active</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-sm-save"
                              onClick={() => {
                                const input = document.getElementById(`price-input-${svc.id}`);
                                if (input) handleServicePriceChange(svc, input.value);
                              }}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBSITE & THEMES */}
          {activeTab === 'settings' && (
            <div className="admin-tab-pane">
              {/* Dynamic Theme Cards */}
              <div className="admin-card" style={{ marginBottom: '24px' }}>
                <div className="admin-card-header">
                  <h4>Dynamic Theme Engine</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Select which visual theme all public visitors see by default.
                  </p>
                </div>

                <div className="theme-selection-grid">
                  <div
                    className={`theme-card-option ${settings.active_theme === 'diwali' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('diwali')}
                  >
                    <div className="theme-card-preview diwali-preview">
                      <span>🪔</span>
                    </div>
                    <strong>Shubh Diwali Theme</strong>
                    <p>Royal Purple, Night Sky, Mitti Ka Diya, Rangoli &amp; Gold Sparkles</p>
                  </div>

                  <div
                    className={`theme-card-option ${settings.active_theme === 'classic' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('classic')}
                  >
                    <div className="theme-card-preview classic-preview">
                      <span>🌊</span>
                    </div>
                    <strong>Classic Ocean (Everyday)</strong>
                    <p>Clean Ivory, Professional Navy #10243A &amp; Royal Azure</p>
                  </div>

                  <div
                    className={`theme-card-option ${settings.active_theme === 'royal_gold' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('royal_gold')}
                  >
                    <div className="theme-card-preview gold-preview">
                      <span>👑</span>
                    </div>
                    <strong>Royal Gold Theme</strong>
                    <p>Deep Onyx Black &amp; Imperial Champagne Gold</p>
                  </div>

                  <div
                    className={`theme-card-option ${settings.active_theme === 'fresh_mint' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('fresh_mint')}
                  >
                    <div className="theme-card-preview mint-preview">
                      <span>🍃</span>
                    </div>
                    <strong>Fresh Mint Theme</strong>
                    <p>Eco-Friendly Botanical Greens &amp; Clean Emerald</p>
                  </div>
                </div>
              </div>

              {/* Website Content Form */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Website Content &amp; Contact Details</h4>
                </div>
                <form onSubmit={handleSaveSettings}>
                  <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        value={settings.business_name || ''}
                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Name</label>
                      <input
                        type="text"
                        value={settings.owner_name || ''}
                        onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                    <div className="form-group">
                      <label>Owner WhatsApp Number (for order notifications)</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Display Phone Number</label>
                      <input
                        type="text"
                        value={settings.contact_phone || ''}
                        onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Festive Announcement Banner Text</label>
                    <textarea
                      rows={2}
                      value={settings.festive_banner_text || ''}
                      onChange={(e) => setSettings({ ...settings, festive_banner_text: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>Kanpur Service Areas</label>
                    <input
                      type="text"
                      value={settings.service_areas || ''}
                      onChange={(e) => setSettings({ ...settings, service_areas: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-save"></i> Save Content to Database
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="admin-tab-pane">
              <div className="admin-card" style={{ maxWidth: '480px' }}>
                <div className="admin-card-header">
                  <h4>Change Admin Password</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Stored with secure bcrypt hashing in the database.
                  </p>
                </div>

                {passwordMsg.text && (
                  <div className={`login-alert-${passwordMsg.type}`} style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', background: passwordMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: passwordMsg.type === 'success' ? '#15803d' : '#b91c1c' }}>
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>New Password (min 8 characters)</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      minLength={8}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-key"></i> Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Admin Toast */}
      {toast && (
        <div className="toast-msg show" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
