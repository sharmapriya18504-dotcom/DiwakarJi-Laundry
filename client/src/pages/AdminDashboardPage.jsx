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
  changeAdminPassword,
  fetchAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  updateAdminOfferStatus,
  deleteAdminOffer,
  fetchAdminTheme,
  updateAdminTheme
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
  const [offers, setOffers] = useState([]);
  const [themeConfig, setThemeConfig] = useState({
    active_theme: 'diwali',
    configured_theme: 'diwali',
    theme_mode: 'manual',
    campaign_start: '2026-10-01T00:00:00',
    campaign_end: '2026-11-15T23:59:59',
    fireworks_enabled: true
  });
  const [loading, setLoading] = useState(true);

  // Filters for bookings
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Offer modal & form state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [offerPreviewData, setOfferPreviewData] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 20,
    promotional_price: '',
    applicable_services: 'all',
    min_amount: 0,
    discount_code: '',
    badge_text: 'Festive Offer',
    start_date: '',
    end_date: '',
    terms: '',
    cta_text: 'Book Pickup',
    fireworks_enabled: true,
    is_active: true
  });

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
      const [sRes, bRes, svRes, stRes, ofRes, thRes] = await Promise.all([
        fetchDashboardStats(),
        fetchAdminBookings({ status: statusFilter, search: searchFilter, date: dateFilter }),
        fetchAdminServices(),
        fetchAdminSettings(),
        fetchAdminOffers(),
        fetchAdminTheme()
      ]);

      if (sRes.stats) setStats(sRes.stats);
      if (bRes.bookings) setBookings(bRes.bookings);
      if (svRes.services) setServices(svRes.services);
      if (stRes.settings) setSettings(stRes.settings);
      if (ofRes.offers) setOffers(ofRes.offers);
      if (thRes) setThemeConfig(thRes);
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

  // --- OFFER HANDLERS ---
  const handleOpenCreateOffer = () => {
    setEditingOfferId(null);
    setOfferForm({
      title: 'Diwali Special',
      subtitle: 'Fresh Clothes for a Brighter Tomorrow',
      description: 'Celebrate Diwali with fresh clothes and special laundry savings.',
      discount_type: 'percentage',
      discount_value: 20,
      promotional_price: '',
      applicable_services: 'all',
      min_amount: 0,
      discount_code: 'DIWALI20',
      badge_text: 'Festive Offer',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      terms: 'Valid on orders placed during the festive season.',
      cta_text: 'Book Pickup',
      fireworks_enabled: true,
      is_active: true
    });
    setShowOfferModal(true);
  };

  const handleOpenEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      description: offer.description || '',
      discount_type: offer.discount_type || 'percentage',
      discount_value: offer.discount_value !== undefined ? offer.discount_value : 15,
      promotional_price: offer.promotional_price || '',
      applicable_services: offer.applicable_services || 'all',
      min_amount: offer.min_amount || 0,
      discount_code: offer.discount_code || '',
      badge_text: offer.badge_text || 'Festive Offer',
      start_date: offer.start_date ? offer.start_date.slice(0, 16) : '',
      end_date: offer.end_date ? offer.end_date.slice(0, 16) : '',
      terms: offer.terms || '',
      cta_text: offer.cta_text || 'Book Pickup',
      fireworks_enabled: offer.fireworks_enabled === 1 || offer.fireworks_enabled === true,
      is_active: offer.is_active === 1 || offer.is_active === true
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (editingOfferId) {
        await updateAdminOffer(editingOfferId, offerForm);
        showToast('Festive offer updated in database');
      } else {
        await createAdminOffer(offerForm);
        showToast('New festive offer published to database');
      }
      setShowOfferModal(false);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to save offer');
    }
  };

  const handleToggleOfferStatus = async (offer) => {
    try {
      const nextActive = !(offer.is_active === 1 || offer.is_active === true);
      await updateAdminOfferStatus(offer.id, nextActive);
      showToast(`Offer ${nextActive ? 'activated' : 'deactivated'}`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to update offer status');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await deleteAdminOffer(id);
      showToast('Offer deleted from database');
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  // --- THEME & CAMPAIGN HANDLERS ---
  const handleSaveThemeSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await updateAdminTheme({
        active_theme: themeConfig.active_theme,
        theme_mode: themeConfig.theme_mode,
        campaign_start: themeConfig.campaign_start,
        campaign_end: themeConfig.campaign_end,
        fireworks_enabled: themeConfig.fireworks_enabled
      });
      if (res && res.theme) {
        setThemeConfig(res.theme);
        switchTheme(res.theme.active_theme);
      }
      showToast('Theme campaign configuration saved to database');
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to update theme settings');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateAdminSettings({
        business_name: settings.business_name,
        owner_name: settings.owner_name,
        whatsapp_number: settings.whatsapp_number,
        contact_phone: settings.contact_phone,
        address: settings.address,
        service_areas: settings.service_areas,
        festive_banner_text: settings.festive_banner_text,
        festive_banner_enabled: settings.festive_banner_enabled
      });
      showToast('Website content saved to database');
      loadData();
      refreshConfig();
    } catch (e) {
      alert(e.message || 'Failed to update settings');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated in database.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setPasswordMsg({ type: 'error', text: e.message || 'Failed to update password' });
    }
  };

  const activeOfferObj = offers.find(o => o.status === 'active');

  return (
    <div className="admin-body">
      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🧺</span>
          <div>
            <h1 className="admin-brand-title">Diwakar Ji Laundry</h1>
            <span className="admin-badge-diwali">
              {themeConfig.active_theme === 'diwali' ? '🪔 Diwali Edition Active' : '🌊 Normal Daily Theme Active'}
            </span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <Link to="/" target="_blank" className="topbar-btn outline">
            <i className="fa-solid fa-external-link"></i>
            <span>View Live Site</span>
          </Link>
          <div className="admin-user-pill">
            <i className="fa-solid fa-shield-halved"></i>
            <span>{admin?.username || 'admin'}</span>
          </div>
          <button type="button" className="topbar-btn logout" onClick={logout}>
            <i className="fa-solid fa-power-off"></i>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container" style={{ padding: '0 24px', maxWidth: '1360px', margin: '0 auto' }}>
        <nav className="admin-tabs-nav" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', margin: '20px 0 28px', flexWrap: 'wrap' }}>
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
            className={`admin-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <i className="fa-solid fa-gift"></i> Offers &amp; Campaigns
            {offers.filter(o => o.status === 'active').length > 0 && (
              <span className="badge-tab-count" style={{ background: '#d97706' }}>
                {offers.filter(o => o.status === 'active').length}
              </span>
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
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                    <i className="fa-solid fa-bullhorn"></i>
                  </div>
                  <div className="kpi-details">
                    <span className="kpi-label">Active Campaign</span>
                    <strong className="kpi-val" style={{ fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                      {activeOfferObj ? activeOfferObj.title : 'None Active'}
                    </strong>
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
                            <span className={`status-pill ${b.booking_status}`}>
                              {b.booking_status}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns-row">
                              {b.booking_status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn-action confirm"
                                  title="Confirm booking"
                                  onClick={() => handleStatusChange(b.id, 'confirmed')}
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              {b.booking_status === 'confirmed' && (
                                <button
                                  type="button"
                                  className="btn-action complete"
                                  title="Mark completed"
                                  onClick={() => handleStatusChange(b.id, 'completed')}
                                >
                                  <i className="fa-solid fa-box"></i>
                                </button>
                              )}
                              {b.booking_status !== 'cancelled' && (
                                <button
                                  type="button"
                                  className="btn-action cancel"
                                  title="Cancel booking"
                                  onClick={() => handleStatusChange(b.id, 'cancelled')}
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                            No booking records found in database.
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
                <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
                  <h4>All Customer Bookings ({bookings.length})</h4>
                  <div className="filters-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Search ref, name, phone..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="input-search"
                      />
                      <button type="submit" className="btn-sm-filter">
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </form>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select-filter"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="date-filter"
                    />

                    <button type="button" className="btn-sm-refresh" onClick={loadData}>
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ref Code</th>
                        <th>Customer</th>
                        <th>Mobile</th>
                        <th>Pickup Details</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id || b.booking_ref}>
                          <td><strong>{b.booking_ref}</strong></td>
                          <td>
                            <strong>{b.customer_name}</strong>
                            {b.discount_code && (
                              <span style={{ display: 'block', fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
                                🏷️ {b.discount_code}
                              </span>
                            )}
                          </td>
                          <td>
                            <a href={`tel:${b.mobile_number}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                              {b.mobile_number}
                            </a>
                          </td>
                          <td>
                            <div>{b.service_name}</div>
                            <small style={{ color: '#64748b' }}>{b.pickup_date} | {b.pickup_time}</small>
                          </td>
                          <td style={{ maxWidth: '220px', fontSize: '0.8rem' }}>
                            {b.pickup_address}
                            {b.special_instructions && (
                              <div style={{ color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                                Note: {b.special_instructions}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`status-pill ${b.booking_status}`}>
                              {b.booking_status}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns-row">
                              {b.booking_status === 'pending' && (
                                <button
                                  type="button"
                                  className="btn-action confirm"
                                  title="Confirm booking"
                                  onClick={() => handleStatusChange(b.id, 'confirmed')}
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              {b.booking_status === 'confirmed' && (
                                <button
                                  type="button"
                                  className="btn-action complete"
                                  title="Mark as completed"
                                  onClick={() => handleStatusChange(b.id, 'completed')}
                                >
                                  <i className="fa-solid fa-box"></i>
                                </button>
                              )}
                              {b.booking_status !== 'cancelled' && (
                                <button
                                  type="button"
                                  className="btn-action cancel"
                                  title="Cancel booking"
                                  onClick={() => handleStatusChange(b.id, 'cancelled')}
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFERS & CAMPAIGNS (CRITICAL REQUIREMENT) */}
          {activeTab === 'offers' && (
            <div className="admin-tab-pane">
              <div className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4>Dynamic Festive Offer &amp; Campaign Manager</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Configure discounts, coupon codes, and dates without touching any frontend code.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleOpenCreateOffer}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fa-solid fa-plus"></i> Create New Offer
                  </button>
                </div>

                <div className="table-responsive" style={{ marginTop: '16px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Offer Title &amp; Badge</th>
                        <th>Discount / Coupon</th>
                        <th>Applicable Services</th>
                        <th>Campaign Dates</th>
                        <th>Status</th>
                        <th>Fireworks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map(offer => (
                        <tr key={offer.id}>
                          <td>
                            <strong>{offer.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{offer.subtitle}</div>
                            {offer.badge_text && (
                              <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700, marginTop: '4px' }}>
                                {offer.badge_text}
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>
                              {offer.discount_type === 'percentage'
                                ? `${offer.discount_value}% OFF`
                                : `₹${offer.discount_value} OFF`}
                            </strong>
                            {offer.discount_code && (
                              <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700 }}>
                                Code: {offer.discount_code}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ textTransform: 'capitalize' }}>{offer.applicable_services || 'all'}</span>
                            {offer.min_amount > 0 && (
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                Min: ₹{offer.min_amount}
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: '0.78rem' }}>
                            <div><strong>Start:</strong> {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : 'Immediate'}</div>
                            <div><strong>End:</strong> {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : 'Indefinite'}</div>
                          </td>
                          <td>
                            <span className={`status-pill ${offer.status === 'active' ? 'confirmed' : offer.status === 'scheduled' ? 'pending' : 'cancelled'}`}>
                              {offer.status?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {offer.fireworks_enabled ? (
                              <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.8rem' }}>
                                🎇 Enabled
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                Off
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="action-btns-row">
                              <button
                                type="button"
                                className={`btn-action ${offer.is_active ? 'cancel' : 'confirm'}`}
                                title={offer.is_active ? 'Deactivate offer' : 'Activate offer'}
                                onClick={() => handleToggleOfferStatus(offer)}
                              >
                                <i className={`fa-solid ${offer.is_active ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                              </button>
                              <button
                                type="button"
                                className="btn-action edit"
                                title="Edit offer"
                                onClick={() => handleOpenEditOffer(offer)}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                type="button"
                                className="btn-action preview"
                                title="Preview offer"
                                onClick={() => setOfferPreviewData(offer)}
                              >
                                <i className="fa-solid fa-eye"></i>
                              </button>
                              <button
                                type="button"
                                className="btn-action cancel"
                                title="Delete offer"
                                onClick={() => handleDeleteOffer(offer.id)}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {offers.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                            No offers created yet. Click "Create New Offer" to set up your Diwali campaign!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div className="admin-tab-pane">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Service Rates &amp; Catalog</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Configure unit prices. Preserves Kanpur laundry service IDs.
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

          {/* TAB 5: WEBSITE & THEMES (CAMPAIGN SCHEDULING + THEMES) */}
          {activeTab === 'settings' && (
            <div className="admin-tab-pane">
              {/* Theme Settings & Campaign Scheduling */}
              <div className="admin-card" style={{ marginBottom: '24px' }}>
                <div className="admin-card-header">
                  <h4>Theme Engine &amp; Campaign Scheduling</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Switch between the Normal Daily Theme and the Special Diwali Theme. Schedule campaign windows to automatically activate Diwali theme.
                  </p>
                </div>

                <form onSubmit={handleSaveThemeSettings}>
                  {/* Theme Selector */}
                  <div className="theme-selection-grid" style={{ marginBottom: '24px' }}>
                    <div
                      className={`theme-card-option ${themeConfig.active_theme === 'diwali' ? 'active' : ''}`}
                      onClick={() => setThemeConfig({ ...themeConfig, active_theme: 'diwali' })}
                    >
                      <div className="theme-card-preview diwali-preview">
                        <span>🪔</span>
                      </div>
                      <strong>Special Diwali Theme</strong>
                      <p>Deep Navy, Royal Maroon, Amber Glow, Marigolds &amp; Gold Sparks</p>
                      <span className="badge-pill" style={{ background: '#f5c453', color: '#170d2b', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 800, marginTop: '6px', display: 'inline-block' }}>
                        Festive Reference
                      </span>
                    </div>

                    <div
                      className={`theme-card-option ${themeConfig.active_theme === 'classic' ? 'active' : ''}`}
                      onClick={() => setThemeConfig({ ...themeConfig, active_theme: 'classic' })}
                    >
                      <div className="theme-card-preview classic-preview">
                        <span>🌊</span>
                      </div>
                      <strong>Normal Daily Theme</strong>
                      <p>Professional Navy #10243A, Clean Ivory &amp; Crisp Minimalist Atelier</p>
                      <span className="badge-pill" style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        Default Outside Diwali
                      </span>
                    </div>
                  </div>

                  {/* Mode & Scheduling Controls */}
                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Campaign Scheduling Rules</h5>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="theme_mode"
                          value="manual"
                          checked={themeConfig.theme_mode === 'manual'}
                          onChange={() => setThemeConfig({ ...themeConfig, theme_mode: 'manual' })}
                        />
                        Manual Override (Always keep selected theme)
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="radio"
                          name="theme_mode"
                          value="scheduled"
                          checked={themeConfig.theme_mode === 'scheduled'}
                          onChange={() => setThemeConfig({ ...themeConfig, theme_mode: 'scheduled' })}
                        />
                        Auto-Scheduled Campaign (Switch automatically by date)
                      </label>
                    </div>

                    {themeConfig.theme_mode === 'scheduled' && (
                      <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label>Campaign Start Date &amp; Time</label>
                          <input
                            type="datetime-local"
                            value={themeConfig.campaign_start ? themeConfig.campaign_start.slice(0, 16) : ''}
                            onChange={(e) => setThemeConfig({ ...themeConfig, campaign_start: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Campaign End Date &amp; Time</label>
                          <input
                            type="datetime-local"
                            value={themeConfig.campaign_end ? themeConfig.campaign_end.slice(0, 16) : ''}
                            onChange={(e) => setThemeConfig({ ...themeConfig, campaign_end: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Fireworks animation toggle */}
                    <div className="form-group-checkbox" style={{ marginTop: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={themeConfig.fireworks_enabled}
                          onChange={(e) => setThemeConfig({ ...themeConfig, fireworks_enabled: e.target.checked })}
                        />
                        <span>✨ Enable Subtle Background Fireworks Sparks in Diwali Theme</span>
                      </label>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '26px', marginTop: '2px' }}>
                        Lightweight canvas animation, zero audio, pauses on tab switch, reduced on mobile.
                      </p>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-save"></i> Save Theme &amp; Campaign Settings
                  </button>
                </form>
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

          {/* TAB 6: SECURITY */}
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

      {/* CREATE / EDIT OFFER MODAL */}
      {showOfferModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingOfferId ? 'Edit Diwali Offer' : 'Create New Diwali Offer'}
              </h3>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveOffer}>
              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Offer Title *</label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="e.g. Diwali Special"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    value={offerForm.badge_text}
                    onChange={(e) => setOfferForm({ ...offerForm, badge_text: e.target.value })}
                    placeholder="e.g. Festive Offer"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Subtitle / Tagline</label>
                <input
                  type="text"
                  value={offerForm.subtitle}
                  onChange={(e) => setOfferForm({ ...offerForm, subtitle: e.target.value })}
                  placeholder="e.g. Fresh Clothes for a Brighter Tomorrow"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Description *</label>
                <textarea
                  rows={2}
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  placeholder="Celebrate Diwali with fresh clothes and special laundry savings."
                  required
                />
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={offerForm.discount_type}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={offerForm.discount_value}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Coupon Code</label>
                  <input
                    type="text"
                    value={offerForm.discount_code}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Booking (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={offerForm.min_amount}
                    onChange={(e) => setOfferForm({ ...offerForm, min_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={offerForm.start_date}
                    onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={offerForm.end_date}
                    onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={offerForm.is_active}
                    onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                  />
                  <span>Offer Active</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={offerForm.fireworks_enabled}
                    onChange={(e) => setOfferForm({ ...offerForm, fireworks_enabled: e.target.checked })}
                  />
                  <span>Enable Background Fireworks Sparks</span>
                </label>
              </div>

              <div className="modal-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setOfferPreviewData(offerForm)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Preview Offer
                </button>
                <button type="submit" className="btn btn-primary">
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFER PREVIEW MODAL */}
      {offerPreviewData && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, padding: '20px' }}>
          <div style={{ background: '#1a0d2e', color: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '32px', border: '2px solid #F6C64A', position: 'relative', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <button
              type="button"
              onClick={() => setOfferPreviewData(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fef08a', fontSize: '26px', cursor: 'pointer' }}
            >
              &times;
            </button>

            <span style={{ background: '#F6C64A', color: '#170d2b', padding: '4px 14px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {offerPreviewData.badge_text || 'Diwali Special'}
            </span>

            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#ffffff', margin: '18px 0 10px', lineHeight: 1.25 }}>
              {offerPreviewData.title}
            </h3>

            <p style={{ color: '#F6C64A', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>
              {offerPreviewData.subtitle}
            </p>

            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 18px' }}>
              {offerPreviewData.description}
            </p>

            {offerPreviewData.discount_code && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(245, 196, 83, 0.2)', border: '1px dashed #F6C64A', padding: '8px 20px', borderRadius: '50px', color: '#F6C64A', fontSize: '0.92rem', fontWeight: 700, margin: '0 auto 18px' }}>
                <span>Use Coupon: <strong>{offerPreviewData.discount_code}</strong></span>
                <span style={{ background: '#F6C64A', color: '#1a0d2e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.76rem' }}>
                  {offerPreviewData.discount_type === 'percentage' ? `${offerPreviewData.discount_value}% OFF` : `₹${offerPreviewData.discount_value} OFF`}
                </span>
              </div>
            )}

            <div style={{ fontSize: '0.76rem', color: '#fef08a', opacity: 0.8, marginBottom: '20px' }}>
              Valid: {offerPreviewData.start_date || 'Immediate'} to {offerPreviewData.end_date || 'Campaign End'}
            </div>

            <button
              type="button"
              onClick={() => setOfferPreviewData(null)}
              style={{ background: '#F6C64A', color: '#1a0d2e', border: 'none', padding: '10px 24px', borderRadius: '50px', fontWeight: 800, cursor: 'pointer' }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Admin Toast */}
      {toast && (
        <div className="admin-toast show">
          {toast}
        </div>
      )}
    </div>
  );
}
