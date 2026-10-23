import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchDashboardStats,
  fetchAdminBookings,
  updateBookingStatus,
  updateBookingDetails,
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  fetchAdminSettings,
  updateAdminSettings,
  publishSiteConfig,
  changeAdminPassword,
  fetchAdminOffers,
  createAdminOffer,
  updateAdminOffer,
  updateAdminOfferStatus,
  duplicateAdminCampaign,
  deleteAdminOffer,
  fetchAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminSections,
  updateAdminSection,
  fetchAdminTheme,
  updateAdminTheme,
  fetchAdminMedia,
  addAdminMedia,
  deleteAdminMedia,
  fetchAdminAuditLogs
} from '../services/api';

export default function AdminDashboardPage() {
  const { admin, isAuthenticated, checking, logout } = useAuth();
  const { refreshConfig } = useConfig();
  const { switchTheme } = useTheme();
  const navigate = useNavigate();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data States
  const [stats, setStats] = useState({ total_bookings: 0, pending_bookings: 0, confirmed_bookings: 0, completed_bookings: 0, today_pickups: 0 });
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({});
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [sections, setSections] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [themeConfig, setThemeConfig] = useState({
    active_theme: 'diwali',
    configured_theme: 'diwali',
    theme_mode: 'manual',
    campaign_start: '2026-10-01T00:00:00',
    campaign_end: '2026-11-15T23:59:59',
    fireworks_enabled: false
  });

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Filters for bookings
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('');
  const [statusReason, setStatusReason] = useState('');

  // Theme Live Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewThemeMode, setPreviewThemeMode] = useState('diwali');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Service form state
  const [serviceForm, setServiceForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 50,
    unit: 'kg',
    min_order: 1,
    turnaround: '24-48 hrs',
    image_url: '/assets/laundry/wash-fold.webp',
    is_active: true,
    display_order: 1
  });

  // Media form state
  const [mediaForm, setMediaForm] = useState({
    file_name: '',
    file_path: '/assets/laundry/',
    file_type: 'image/webp',
    file_size_kb: 120,
    alt_text: 'Commercial Laundry Photography',
    category: 'service'
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 299,
    max_discount_amount: 150,
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    is_active: true
  });

  // Offer form state
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
    fireworks_enabled: false,
    is_active: true
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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
      const [sRes, bRes, svRes, stRes, ofRes, thRes, cpRes, mdRes, secRes, logRes] = await Promise.all([
        fetchDashboardStats().catch(() => ({ stats: null })),
        fetchAdminBookings({ status: statusFilter, search: searchFilter, date: dateFilter }).catch(() => ({ bookings: [] })),
        fetchAdminServices().catch(() => ({ services: [] })),
        fetchAdminSettings().catch(() => ({ settings: {} })),
        fetchAdminOffers().catch(() => ({ offers: [] })),
        fetchAdminTheme().catch(() => null),
        fetchAdminCoupons().catch(() => ({ coupons: [] })),
        fetchAdminMedia().catch(() => ({ media: [] })),
        fetchAdminSections().catch(() => ({ sections: [] })),
        fetchAdminAuditLogs().catch(() => ({ logs: [] }))
      ]);

      if (sRes.stats) setStats(sRes.stats);
      if (bRes.bookings) setBookings(bRes.bookings);
      if (svRes.services) setServices(svRes.services);
      if (stRes.settings) setSettings(stRes.settings);
      if (ofRes.offers) setOffers(ofRes.offers);
      if (thRes) setThemeConfig(thRes);
      if (cpRes.coupons) setCoupons(cpRes.coupons);
      if (mdRes.media) setMediaAssets(mdRes.media);
      if (secRes.sections) setSections(secRes.sections);
      if (logRes.logs) setAuditLogs(logRes.logs);
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

  // Derived Customers Aggregation
  const customersList = useMemo(() => {
    const map = new Map();
    bookings.forEach(b => {
      const phone = b.mobile_number || 'N/A';
      if (!map.has(phone)) {
        map.set(phone, {
          name: b.customer_name || 'Customer',
          mobile: phone,
          area: b.area || 'Kanpur',
          bookingCount: 0,
          totalSpent: 0,
          lastBookingDate: b.pickup_date || b.created_at || 'Recent'
        });
      }
      const entry = map.get(phone);
      entry.bookingCount += 1;
      entry.totalSpent += Number(b.estimated_price || b.final_price || 150);
      if (b.pickup_date) entry.lastBookingDate = b.pickup_date;
    });
    return Array.from(map.values());
  }, [bookings]);

  // Booking handlers
  const handleOpenStatusModal = (booking) => {
    setSelectedBookingForStatus(booking);
    setNewStatusValue(booking.booking_status || 'pending');
    setStatusReason('');
    setShowStatusModal(true);
  };

  const handleSaveStatusModal = async (e) => {
    e.preventDefault();
    if (!selectedBookingForStatus) return;
    try {
      await updateBookingStatus(selectedBookingForStatus.id, newStatusValue, statusReason || 'Status update via admin');
      showToast(`Order status updated to: ${newStatusValue}`);
      setShowStatusModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus, 'Quick update via admin overview');
      showToast(`Booking marked as ${newStatus}`);
      loadData();
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  };

  // Service Handlers
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await createAdminService(serviceForm);
      showToast(`Service "${serviceForm.name}" created successfully`);
      setShowServiceModal(false);
      setServiceForm({
        name: '',
        slug: '',
        description: '',
        price: 50,
        unit: 'kg',
        min_order: 1,
        turnaround: '24-48 hrs',
        image_url: '/assets/laundry/wash-fold.webp',
        is_active: true,
        display_order: services.length + 1
      });
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to create service');
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
      showToast(`Updated price for ${svc.name} to ₹${newPrice}`);
      loadData();
      refreshConfig();
    } catch (e) {
      alert(e.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      await deleteAdminService(id);
      showToast(`Service deleted`);
      loadData();
      refreshConfig();
    } catch (e) {
      alert(e.message || 'Failed to delete service');
    }
  };

  // Offer / Campaign Handlers
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
      fireworks_enabled: false,
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
      fireworks_enabled: false,
      is_active: offer.is_active === 1 || offer.is_active === true
    });
    setShowOfferModal(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (editingOfferId) {
        await updateAdminOffer(editingOfferId, offerForm);
        showToast('Campaign offer updated in database');
      } else {
        await createAdminOffer(offerForm);
        showToast('New campaign offer saved');
      }
      setShowOfferModal(false);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to save offer');
    }
  };

  const handleDuplicateOffer = async (id) => {
    try {
      await duplicateAdminCampaign(id);
      showToast('Campaign offer duplicated as draft');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to duplicate campaign');
    }
  };

  const handleToggleOfferStatus = async (offer) => {
    try {
      const nextActive = !(offer.is_active === 1 || offer.is_active === true);
      await updateAdminOfferStatus(offer.id, nextActive);
      showToast(`Campaign ${nextActive ? 'activated' : 'deactivated'}`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to update offer status');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this campaign offer?')) return;
    try {
      await deleteAdminOffer(id);
      showToast('Campaign offer deleted');
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  // Coupons
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await createAdminCoupon(couponForm);
      showToast(`Coupon code "${couponForm.code}" created`);
      setShowCouponModal(false);
      setCouponForm({
        code: '',
        discount_type: 'percentage',
        discount_value: 15,
        min_order_amount: 299,
        max_discount_amount: 150,
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        is_active: true
      });
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteAdminCoupon(id);
      showToast(`Coupon deleted`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  // Media Asset Handlers
  const handleCreateMediaAsset = async (e) => {
    e.preventDefault();
    try {
      await addAdminMedia(mediaForm);
      showToast(`Media asset "${mediaForm.file_name}" registered`);
      setShowMediaModal(false);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to add media asset');
    }
  };

  const handleDeleteMediaAsset = async (id, name) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;
    try {
      await deleteAdminMedia(id);
      showToast(`Media asset removed`);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete media asset');
    }
  };

  // Theme & Appearance
  const handleSaveThemeSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await updateAdminTheme({
        active_theme: themeConfig.active_theme,
        theme_mode: themeConfig.theme_mode,
        campaign_start: themeConfig.campaign_start,
        campaign_end: themeConfig.campaign_end,
        fireworks_enabled: Boolean(themeConfig.fireworks_enabled)
      });
      switchTheme(themeConfig.active_theme);
      showToast(`Theme updated to ${themeConfig.active_theme === 'diwali' ? 'Diwali Edition' : 'Standard Dark Mode'}`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to save theme settings');
    }
  };

  const handleQuickThemeSwitch = async (newTheme, enableFireworks = null) => {
    try {
      const isDiwali = newTheme === 'diwali';
      const fwEnabled = enableFireworks !== null ? enableFireworks : (isDiwali ? true : false);
      const updated = {
        active_theme: newTheme,
        theme_mode: 'manual',
        campaign_start: themeConfig.campaign_start,
        campaign_end: themeConfig.campaign_end,
        fireworks_enabled: fwEnabled
      };
      await updateAdminTheme(updated);
      setThemeConfig(prev => ({ ...prev, active_theme: newTheme, fireworks_enabled: fwEnabled }));
      switchTheme(newTheme);
      showToast(`Live Theme updated to ${isDiwali ? 'Diwali Festival Edition' : 'Standard Dark Mode'}!`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to update theme');
    }
  };

  const handleToggleFireworks = async () => {
    try {
      const nextFw = !themeConfig.fireworks_enabled;
      await updateAdminTheme({
        active_theme: themeConfig.active_theme,
        theme_mode: themeConfig.theme_mode,
        campaign_start: themeConfig.campaign_start,
        campaign_end: themeConfig.campaign_end,
        fireworks_enabled: nextFw
      });
      setThemeConfig(prev => ({ ...prev, fireworks_enabled: nextFw }));
      showToast(`Background Crackers ${nextFw ? 'Activated' : 'Disabled'}`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to toggle crackers');
    }
  };

  // Settings & CMS
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings);
      showToast('Settings saved to database');
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handlePublishAllConfig = async () => {
    try {
      await updateAdminTheme({
        active_theme: themeConfig.active_theme,
        theme_mode: themeConfig.theme_mode,
        campaign_start: themeConfig.campaign_start,
        campaign_end: themeConfig.campaign_end,
        fireworks_enabled: Boolean(themeConfig.fireworks_enabled)
      });
      await publishSiteConfig();
      switchTheme(themeConfig.active_theme);
      showToast('Live website configuration & theme published successfully!');
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to publish site config');
    }
  };

  // Section Toggle
  const handleToggleSection = async (sec) => {
    try {
      const nextVisible = !sec.is_visible;
      await updateAdminSection(sec.section_key, { is_visible: nextVisible });
      showToast(`Section "${sec.title || sec.section_key}" ${nextVisible ? 'enabled' : 'hidden'}`);
      loadData();
      refreshConfig();
    } catch (err) {
      alert(err.message || 'Failed to update section visibility');
    }
  };

  // Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New password and Confirm Password do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'danger', text: 'New password must be at least 8 characters long.' });
      return;
    }

    try {
      await changeAdminPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password successfully updated! Please keep your new password safe.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Admin password updated successfully');
    } catch (err) {
      setPasswordMsg({ type: 'danger', text: err.message || 'Failed to update password' });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const activeOfferObj = offers.find(o => o.status === 'active' || o.is_active === 1 || o.is_active === true);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Banner */}
      {toast && (
        <div className="admin-toast-banner">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* TOP EXECUTIVE BAR */}
      <header className="admin-topbar">
        <div className="container" style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="admin-brand-logo-badge" aria-hidden="true" style={{ width: '38px', height: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="38" height="38">
                <circle cx="22" cy="22" r="21" fill="#0A2547" stroke="#F6C64A" strokeWidth="1.2" />
                <path d="M22 11 C22 11 22 9 23.8 8 C25.5 7 27 8.5 27 10.2 C27 11.5 25.8 12.5 24.5 12.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="22" y1="11" x2="22" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 17 C17 19 12 23 10 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <path d="M22 17 C27 19 32 23 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                <path d="M10 27 Q22 30.5 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <h1 className="admin-brand-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>Diwakar Ji Laundry</h1>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>
                Administration Console &bull; {themeConfig.active_theme === 'diwali' ? 'Diwali Theme Active' : 'Standard Theme Active'}
              </span>
            </div>
          </div>

          <div className="admin-topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="topbar-btn"
              onClick={() => {
                setPreviewThemeMode(themeConfig.active_theme);
                setShowPreviewModal(true);
              }}
              title="Preview active theme in browser frame"
            >
              <i className="fa-solid fa-eye" style={{ color: '#38bdf8' }}></i>
              <span>Live Theme Preview</span>
            </button>

            <button
              type="button"
              className="topbar-btn topbar-btn-publish"
              onClick={handlePublishAllConfig}
              title="Publish all configuration to live website"
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Publish Changes</span>
            </button>

            <Link to="/" target="_blank" className="topbar-btn" title="Open live customer website in new tab">
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: '#94a3b8' }}></i>
              <span>Live Website</span>
            </Link>

            <div className="admin-user-pill">
              <i className="fa-solid fa-user-shield" style={{ color: '#f59e0b' }}></i>
              <span>{admin?.username || 'admin'}</span>
            </div>

            <button type="button" className="topbar-btn logout" onClick={logout} title="Sign out of administration console">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* CENTERED NAVIGATION PILL BAR */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div className="container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '12px 24px', overflowX: 'auto' }}>
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'overview' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'overview' ? '#eff6ff' : 'transparent', color: activeTab === 'overview' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa-solid fa-chart-pie"></i>
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'bookings' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'bookings' ? '#eff6ff' : 'transparent', color: activeTab === 'bookings' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="fa-solid fa-calendar-check"></i>
              <span>Bookings</span>
              {stats.pending_bookings > 0 && (
                <span className="tab-badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '50px' }}>{stats.pending_bookings}</span>
              )}
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'customers' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'customers' ? '#eff6ff' : 'transparent', color: activeTab === 'customers' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('customers')}
            >
              <i className="fa-solid fa-users"></i>
              <span>Customers</span>
              <span className="tab-badge" style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '50px' }}>{customersList.length}</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'services' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'services' ? '#eff6ff' : 'transparent', color: activeTab === 'services' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('services')}
            >
              <i className="fa-solid fa-shirt"></i>
              <span>Services &amp; Pricing</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'campaigns' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'campaigns' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'campaigns' ? '#eff6ff' : 'transparent', color: activeTab === 'campaigns' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('campaigns')}
            >
              <i className="fa-solid fa-gift"></i>
              <span>Campaigns &amp; Offers</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'themes' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'themes' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'themes' ? '#eff6ff' : 'transparent', color: activeTab === 'themes' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('themes')}
            >
              <i className="fa-solid fa-palette"></i>
              <span>Appearance &amp; Themes</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'business' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'business' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'business' ? '#eff6ff' : 'transparent', color: activeTab === 'business' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('business')}
            >
              <i className="fa-solid fa-gear"></i>
              <span>Business Settings</span>
            </button>

            <button
              type="button"
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              style={{ padding: '9px 18px', borderRadius: '8px', border: activeTab === 'security' ? '1px solid #2563eb' : '1px solid transparent', background: activeTab === 'security' ? '#eff6ff' : 'transparent', color: activeTab === 'security' ? '#2563eb' : '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setActiveTab('security')}
            >
              <i className="fa-solid fa-shield-halved"></i>
              <span>Security</span>
            </button>
          </nav>
        </div>
      </div>

      {/* CENTERED CONTENT CONTAINER */}
      <main className="container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '28px 24px 60px', width: '100%', flex: 1 }}>
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
                  <span className="kpi-label">Pending Orders</span>
                  <strong className="kpi-val">{stats.pending_bookings}</strong>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green"><i className="fa-solid fa-circle-check"></i></div>
                <div className="kpi-details">
                  <span className="kpi-label">Confirmed Orders</span>
                  <strong className="kpi-val">{stats.confirmed_bookings}</strong>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><i className="fa-solid fa-truck-ramp-box"></i></div>
                <div className="kpi-details">
                  <span className="kpi-label">Completed Orders</span>
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
              <div className="kpi-card" style={{ minWidth: 0, overflow: 'hidden' }}>
                <div className="kpi-icon" style={{ background: '#fef3c7', color: '#b45309', flexShrink: 0 }}>
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <div className="kpi-details" style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                  <span className="kpi-label">Active Promotion</span>
                  <strong className="kpi-val promo-text" title={activeOfferObj ? activeOfferObj.title : 'None Active'}>
                    {activeOfferObj ? activeOfferObj.title : 'None Active'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Recent Bookings Quick Table */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h4>Recent Customer Bookings</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Latest customer laundry pickups submitted from website.</p>
                </div>
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
                      <th>Pickup Slot</th>
                      <th>Est. Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.id || b.booking_ref}>
                        <td><strong>{b.booking_ref}</strong></td>
                        <td>{b.customer_name}</td>
                        <td>
                          <a href={`tel:${b.mobile_number}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {b.mobile_number}
                          </a>
                        </td>
                        <td>{b.service_name}</td>
                        <td>{b.pickup_date} ({b.pickup_time})</td>
                        <td><strong>₹{b.estimated_price || 150}</strong></td>
                        <td>
                          <span className={`status-pill ${b.booking_status}`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns-row">
                            <button
                              type="button"
                              className="btn-action confirm"
                              title="Update tracking status"
                              onClick={() => handleOpenStatusModal(b)}
                            >
                              <i className="fa-solid fa-sliders"></i>
                            </button>
                            {b.booking_status === 'pending' && (
                              <button
                                type="button"
                                className="btn-action confirm"
                                title="Confirm booking"
                                onClick={() => handleQuickStatusChange(b.id, 'confirmed')}
                              >
                                <i className="fa-solid fa-check"></i>
                              </button>
                            )}
                            {b.booking_status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn-action complete"
                                title="Mark completed"
                                onClick={() => handleQuickStatusChange(b.id, 'completed')}
                              >
                                <i className="fa-solid fa-box"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                          No customer bookings recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h4>All Customer Bookings ({bookings.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Manage customer orders across the 9-stage tracking workflow.
                  </p>
                </div>
                <div className="filters-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search ref, name, phone..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="input-search"
                  />

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
                      <th>Contact</th>
                      <th>Pickup Slot &amp; Address</th>
                      <th>Service / Qty</th>
                      <th>Est. Total</th>
                      <th>Current Stage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id || b.booking_ref}>
                        <td>
                          <strong>{b.booking_ref}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(b.booking_ref, 'Order Ref')}
                            style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', marginLeft: '4px' }}
                            title="Copy Reference"
                          >
                            <i className="fa-regular fa-copy"></i>
                          </button>
                        </td>
                        <td>
                          <strong>{b.customer_name}</strong>
                          {b.discount_code && (
                            <span style={{ display: 'block', fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>
                              {b.discount_code} (-₹{b.discount_amount || 0})
                            </span>
                          )}
                        </td>
                        <td>
                          <a href={`tel:${b.mobile_number}`} style={{ color: '#2563eb', textDecoration: 'none', display: 'block' }}>
                            {b.mobile_number}
                          </a>
                          <a
                            href={`https://wa.me/91${b.mobile_number}?text=Hello%20${encodeURIComponent(b.customer_name)},%20regarding%20your%20Diwakar%20Ji%20Laundry%20order%20${b.booking_ref}:`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#16a34a', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="fa-brands fa-whatsapp"></i> WhatsApp
                          </a>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>{b.pickup_date} &bull; {b.pickup_time}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '200px' }}>
                            {b.pickup_address}, {b.area}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{b.service_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.quantity || 1} units</div>
                        </td>
                        <td>
                          <strong>₹{b.estimated_price || 150}</strong>
                        </td>
                        <td>
                          <span className={`status-pill ${b.booking_status}`}>
                            {b.booking_status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action confirm"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.78rem' }}
                            onClick={() => handleOpenStatusModal(b)}
                          >
                            <i className="fa-solid fa-sliders"></i> Stage
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

        {/* TAB 3: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h4>Kanpur Customer Directory ({customersList.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Aggregated customer records, contact info, total orders, and lifetime laundry spend.
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>Primary Area</th>
                      <th>Total Orders</th>
                      <th>Estimated Spend</th>
                      <th>Last Order Date</th>
                      <th>Customer Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersList.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.name}</strong></td>
                        <td>
                          <a href={`tel:${c.mobile}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                            {c.mobile}
                          </a>
                        </td>
                        <td>
                          <span className="customer-stat-pill">{c.area}</span>
                        </td>
                        <td>
                          <span className="customer-stat-pill">{c.bookingCount} orders</span>
                        </td>
                        <td><strong>₹{c.totalSpent}</strong></td>
                        <td>{c.lastBookingDate}</td>
                        <td>
                          <a
                            href={`https://wa.me/91${c.mobile ? c.mobile.replace(/\D/g, '').slice(-10) : ''}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Diwakar%20Ji%20Laundry!`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp-chat"
                            title={`Chat with ${c.name} on WhatsApp`}
                          >
                            <i className="fa-brands fa-whatsapp"></i>
                            <span>WhatsApp Chat</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                    {customersList.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No customer records accumulated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES & PRICING MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h4>Services &amp; Pricing Catalog</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Live pricing management: update rates, units (per-kg or per-piece), minimum order thresholds, and turnaround time. Changes take effect on the website immediately.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={() => setShowServiceModal(true)}
                >
                  <i className="fa-solid fa-plus"></i> Add New Service
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Description</th>
                      <th>Rate (₹)</th>
                      <th>Unit</th>
                      <th>Min Order</th>
                      <th>Turnaround</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map(svc => (
                      <tr key={svc.id}>
                        <td><strong>{svc.name}</strong></td>
                        <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: '#64748b' }}>{svc.description}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>₹</span>
                            <input
                              type="number"
                              defaultValue={svc.price}
                              id={`price-input-${svc.id}`}
                              style={{ width: '85px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}
                            />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>per {svc.unit}</span>
                        </td>
                        <td>{svc.min_order || '1'} {svc.unit}</td>
                        <td>{svc.turnaround || '24 hrs'}</td>
                        <td>
                          <span className="status-pill confirmed">Active</span>
                        </td>
                        <td>
                          <div className="action-btns-row">
                            <button
                              type="button"
                              className="btn-sm-save"
                              onClick={() => {
                                const input = document.getElementById(`price-input-${svc.id}`);
                                if (input) handleServicePriceChange(svc, input.value);
                              }}
                              title="Save new rate"
                            >
                              <i className="fa-solid fa-check"></i> Save
                            </button>
                            <button
                              type="button"
                              className="btn-action cancel"
                              onClick={() => handleDeleteService(svc.id, svc.name)}
                              title="Delete Service"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delivery Policy & Free Pickup Threshold Card */}
              <div style={{ marginTop: '24px', padding: '18px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <i className="fa-solid fa-truck-fast"></i>
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>Doorstep Delivery Policy</h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Orders above <strong>₹299</strong> qualify for <strong>100% FREE Doorstep Pickup &amp; Return</strong> across all Kanpur sectors. Standard ₹40 delivery fee applies for smaller orders.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: '50px', background: '#10b981', color: '#ffffff' }}>
                    Active Policy
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WEBSITE CONTENT CMS */}
        {activeTab === 'cms' && (
          <div className="admin-tab-pane">
            <div className="admin-card" style={{ marginBottom: '24px' }}>
              <div className="admin-card-header">
                <h4>Homepage Hero Content</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Edit the main hero banner headline, taglines, button labels, and hero photo without editing code.
                </p>
              </div>
              <form onSubmit={handleSaveSettings}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Main Headline</label>
                  <input
                    type="text"
                    value={settings.hero_headline || 'Spotless Garments, Delivered to Your Doorstep'}
                    onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={settings.hero_subtitle || 'Kanpur’s trusted professional laundry & dry cleaning service with express doorstep pickup.'}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  />
                </div>
                <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Primary CTA Button Text</label>
                    <input
                      type="text"
                      value={settings.hero_cta_text || 'Schedule Free Pickup'}
                      onChange={(e) => setSettings({ ...settings, hero_cta_text: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hero Image Asset Path</label>
                    <input
                      type="text"
                      value={settings.hero_image_url || '/assets/laundry/hero-laundry.webp'}
                      onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-save"></i> Save Hero Content
                </button>
              </form>
            </div>

            {/* Section Visibility Controls */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h4>Homepage Section Toggles</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Control which sections are publicly rendered on the frontend.
                </p>
              </div>
              <div>
                {sections.map(sec => (
                  <div key={sec.section_key} className="cms-section-card">
                    <div className="cms-section-info">
                      <h4>{sec.title || sec.section_key}</h4>
                      <p>{sec.subtitle || `Key: ${sec.section_key}`}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        className={`btn-action ${sec.is_visible ? 'complete' : 'cancel'}`}
                        style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => handleToggleSection(sec)}
                      >
                        {sec.is_visible ? 'Visible on Site' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: IMAGE LIBRARY */}
        {activeTab === 'media' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h4>Commercial Photography Media Library ({mediaAssets.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    All high-resolution commercial photography assets generated and deployed for Diwakar Ji Laundry.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={() => setShowMediaModal(true)}
                >
                  <i className="fa-solid fa-plus"></i> Register Asset
                </button>
              </div>

              <div className="media-grid">
                {mediaAssets.map(asset => (
                  <div key={asset.id} className="media-asset-card">
                    <div className="media-asset-thumb">
                      <img src={asset.file_path} alt={asset.alt_text} />
                      <span className="media-asset-badge">{asset.category || 'Asset'}</span>
                    </div>
                    <div className="media-asset-details">
                      <div className="media-asset-name">{asset.file_name}</div>
                      <div className="media-asset-meta">
                        <span>{asset.file_size_kb || 120} KB</span>
                        <span>{asset.file_type || 'image/webp'}</span>
                      </div>
                      <div className="media-asset-url">{asset.file_path}</div>
                      <div className="media-asset-actions">
                        <button
                          type="button"
                          className="btn-sm-filter"
                          style={{ flex: 1, fontSize: '0.75rem' }}
                          onClick={() => copyToClipboard(asset.file_path, asset.file_name)}
                        >
                          <i className="fa-regular fa-copy"></i> Copy Path
                        </button>
                        <button
                          type="button"
                          className="btn-action cancel"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => handleDeleteMediaAsset(asset.id, asset.file_name)}
                          title="Remove asset"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: APPEARANCE & THEMES (NO DIYAS!) */}
        {activeTab === 'themes' && (
          <div className="admin-tab-pane">
            <div className="admin-card" style={{ marginBottom: '24px' }}>
              <div className="admin-card-header">
                <div>
                  <h4>Theme Engine &amp; Appearance Control</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Select between the Standard Ocean Blue Theme and the Diwali Festival Edition.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveThemeSettings}>
                <div className="theme-selection-grid" style={{ marginBottom: '24px' }}>
                  <div
                    className={`theme-card-option ${themeConfig.active_theme === 'diwali' ? 'active' : ''}`}
                    onClick={() => setThemeConfig({ ...themeConfig, active_theme: 'diwali' })}
                  >
                    <div className="theme-card-preview diwali-preview">
                      <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '24px', color: '#f5c453' }}></i>
                    </div>
                    <strong>Diwali Festival Edition</strong>
                    <p>Deep Navy #0c1424, Royal Festive Gold #d4a34b, Warm Ambient Lighting &amp; Marigolds</p>
                    <span className="badge-pill" style={{ background: '#f5c453', color: '#170d2b', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 800, marginTop: '6px', display: 'inline-block' }}>
                      Festive Campaign Active
                    </span>
                  </div>

                  <div
                    className={`theme-card-option ${themeConfig.active_theme === 'classic' ? 'active' : ''}`}
                    onClick={() => setThemeConfig({ ...themeConfig, active_theme: 'classic' })}
                  >
                    <div className="theme-card-preview classic-preview">
                      <i className="fa-solid fa-water" style={{ fontSize: '24px', color: '#2878F0' }}></i>
                    </div>
                    <strong>Standard Ocean Blue Edition</strong>
                    <p>Professional Atelier Navy #10243A, Sky Blue #2878F0, Crisp Cleanliness</p>
                    <span className="badge-pill" style={{ background: '#e2e8f0', color: '#334155', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '50px', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                      Default Everyday Theme
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
                      Manual Control (Keep selected theme until changed)
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="theme_mode"
                        value="scheduled"
                        checked={themeConfig.theme_mode === 'scheduled'}
                        onChange={() => setThemeConfig({ ...themeConfig, theme_mode: 'scheduled' })}
                      />
                      Auto-Scheduled (Switch automatically between dates)
                    </label>
                  </div>

                  {themeConfig.theme_mode === 'scheduled' && (
                    <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label>Campaign Start Date &amp; Time (Asia/Kolkata)</label>
                        <input
                          type="datetime-local"
                          value={themeConfig.campaign_start ? themeConfig.campaign_start.slice(0, 16) : ''}
                          onChange={(e) => setThemeConfig({ ...themeConfig, campaign_start: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Campaign End Date &amp; Time (Asia/Kolkata)</label>
                        <input
                          type="datetime-local"
                          value={themeConfig.campaign_end ? themeConfig.campaign_end.slice(0, 16) : ''}
                          onChange={(e) => setThemeConfig({ ...themeConfig, campaign_end: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Crackers & Visual Atmosphere Toggle */}
                <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(themeConfig.fireworks_enabled)}
                      onChange={(e) => setThemeConfig({ ...themeConfig, fireworks_enabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>🎆 Enable Background Fireworks / Crackers (Sparks burst in background when Diwali theme is active)</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-save"></i> Save Theme Settings
                  </button>
                  <button
                    type="button"
                    className="topbar-btn outline"
                    style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                    onClick={() => {
                      setPreviewThemeMode(themeConfig.active_theme);
                      setShowPreviewModal(true);
                    }}
                  >
                    <i className="fa-solid fa-eye"></i> Live Theme Preview
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 9: CAMPAIGNS & OFFERS */}
        {activeTab === 'campaigns' && (
          <div className="admin-tab-pane">
            <div className="admin-card" style={{ marginBottom: '24px' }}>
              <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h4>Diwali Campaigns &amp; Promotional Offers ({offers.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Create and schedule festive laundry campaigns with server-side validated discounts.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={handleOpenCreateOffer}
                >
                  <i className="fa-solid fa-plus"></i> Create New Campaign
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Campaign Title</th>
                      <th>Tagline</th>
                      <th>Discount Value</th>
                      <th>Coupon Code</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.title}</strong></td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.subtitle}</td>
                        <td>
                          <strong>
                            {o.discount_type === 'percentage' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                          </strong>
                        </td>
                        <td>
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem' }}>
                            {o.discount_code || 'AUTOFESTIVE'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{o.end_date ? o.end_date.slice(0, 10) : 'Ongoing'}</td>
                        <td>
                          <span className={`status-pill ${o.is_active ? 'confirmed' : 'cancelled'}`}>
                            {o.is_active ? 'Active' : 'Draft / Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns-row">
                            <button
                              type="button"
                              className="btn-action confirm"
                              onClick={() => handleOpenEditOffer(o)}
                              title="Edit Offer"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              type="button"
                              className="btn-action"
                              style={{ background: '#3b82f6', color: '#fff' }}
                              onClick={() => handleDuplicateOffer(o.id)}
                              title="Duplicate Campaign"
                            >
                              <i className="fa-solid fa-clone"></i>
                            </button>
                            <button
                              type="button"
                              className={`btn-action ${o.is_active ? 'cancel' : 'complete'}`}
                              onClick={() => handleToggleOfferStatus(o)}
                              title={o.is_active ? 'Deactivate' : 'Publish'}
                            >
                              <i className={`fa-solid ${o.is_active ? 'fa-pause' : 'fa-play'}`}></i>
                            </button>
                            <button
                              type="button"
                              className="btn-action cancel"
                              onClick={() => handleDeleteOffer(o.id)}
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Server-Side Coupons Manager */}
            <div className="admin-card">
              <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
                <div>
                  <h4>Coupon Codes &amp; Vouchers ({coupons.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Server-validated checkout coupon codes (e.g. SHUBHDIWALI, DIWALI20, FLAT50).
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  onClick={() => setShowCouponModal(true)}
                >
                  <i className="fa-solid fa-plus"></i> Add Coupon
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Type &amp; Value</th>
                      <th>Min. Order</th>
                      <th>Max. Discount</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(cp => (
                      <tr key={cp.id}>
                        <td><strong>{cp.code}</strong></td>
                        <td>{cp.discount_type === 'percentage' ? `${cp.discount_value}%` : `₹${cp.discount_value}`}</td>
                        <td>₹{cp.min_order_amount || 0}</td>
                        <td>₹{cp.max_discount_amount || 'No cap'}</td>
                        <td>{cp.valid_until ? cp.valid_until.slice(0, 10) : 'Never'}</td>
                        <td>
                          <span className="status-pill confirmed">Valid</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action cancel"
                            onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                          No coupon codes registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SEO SETTINGS */}
        {activeTab === 'seo' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header">
                <h4>Search Engine Optimization &amp; Social Metadata</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Configure page title, meta description, canonical URL, and Open Graph social sharing tags.
                </p>
              </div>
              <form onSubmit={handleSaveSettings}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={settings.meta_title || 'Diwakar Ji Laundry & Dry Cleaning | Best in Kanpur'}
                    onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Meta Description</label>
                  <textarea
                    rows={3}
                    value={settings.meta_description || 'Kanpur’s #1 trusted doorstep laundry and dry cleaning service. Wash & Fold, Wash & Iron, Suit dry cleaning with fast 24-48h delivery across Kidwai Nagar, Swaroop Nagar & IIT Kanpur.'}
                    onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                  />
                </div>
                <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Canonical Site URL</label>
                    <input
                      type="text"
                      value={settings.canonical_url || 'https://diwakar-ji.netlify.app/'}
                      onChange={(e) => setSettings({ ...settings, canonical_url: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Open Graph Social Image</label>
                    <input
                      type="text"
                      value={settings.og_image || '/assets/laundry/hero-laundry.webp'}
                      onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-save"></i> Save SEO Metadata
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 11: BUSINESS SETTINGS */}
        {activeTab === 'business' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header">
                <h4>Kanpur Business &amp; Contact Settings</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Verified business credentials, WhatsApp notification number, Kidwai Nagar address, and operating hours.
                </p>
              </div>
              <form onSubmit={handleSaveSettings}>
                <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      value={settings.business_name || 'Diwakar Ji Laundry'}
                      onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input
                      type="text"
                      value={settings.owner_name || 'Diwakar Sharma'}
                      onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label>Verified Owner WhatsApp Number (for Order Dispatches)</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number || '7860462268'}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Helpline Phone</label>
                    <input
                      type="text"
                      value={settings.contact_phone || '+91 7860462268'}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Store &amp; Workshop Address (Kanpur)</label>
                  <input
                    type="text"
                    value={settings.address || 'Shop No. 4, Kidwai Nagar Main Market & Kalyanpur IIT Area, Kanpur, UP 208011'}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Serviceable Kanpur Neighborhoods</label>
                  <input
                    type="text"
                    value={settings.service_areas || 'Kidwai Nagar, Kalyanpur, IIT Kanpur, Kakadeo, Swaroop Nagar, Civil Lines, Barra, Govind Nagar, Shyam Nagar'}
                    onChange={(e) => setSettings({ ...settings, service_areas: e.target.value })}
                  />
                </div>

                <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Store Operating Hours</label>
                    <input
                      type="text"
                      value={settings.operating_hours || 'Mon - Sun: 8:00 AM - 9:00 PM'}
                      onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      value={settings.email || 'diwakarjilaundry@gmail.com'}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <i className="fa-solid fa-save"></i> Save Business Settings
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 12: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="admin-tab-pane">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h4>Security Audit History &amp; Event Logs ({auditLogs.length})</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Chronological ledger tracking administrative status changes, price updates, themes, and publication events.
                  </p>
                </div>
                <button type="button" className="btn-sm-refresh" onClick={loadData}>
                  <i className="fa-solid fa-rotate-right"></i> Refresh Logs
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp (IST)</th>
                      <th>Admin User</th>
                      <th>Action Type</th>
                      <th>Target Resource</th>
                      <th>Details / Audit Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr key={log.id || i}>
                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                        </td>
                        <td><strong>{log.admin_username || log.actor || 'admin'}</strong></td>
                        <td>
                          <span className={`audit-log-badge ${log.action_type || 'update'}`}>
                            {log.action_type || 'UPDATE'}
                          </span>
                        </td>
                        <td><code>{log.target_resource || 'System'}</code></td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || 'System event recorded')}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>
                          No audit log events recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADMIN SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="admin-tab-pane">
            <div style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Account Security Overview Card */}
              <div className="admin-card" style={{ padding: '20px 24px', margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Admin Security &amp; Access</h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Logged in as <strong>{admin?.username || 'admin'}</strong> &bull; Secured with Bcrypt 10-round hash encryption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Update Form Card */}
              <div className="admin-card" style={{ margin: 0 }}>
                <div className="admin-card-header">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Update Admin Password</h4>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                      Change your console password. Minimum 8 characters required.
                    </p>
                  </div>
                </div>

                {passwordMsg.text && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      marginBottom: '18px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: passwordMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: passwordMsg.type === 'success' ? '#15803d' : '#b91c1c',
                      border: passwordMsg.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca'
                    }}
                  >
                    <i className={passwordMsg.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}></i>
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current administration password"
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      New Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      minLength={8}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password to confirm"
                      minLength={8}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    <i className="fa-solid fa-key"></i>
                    <span>Update Password</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: 9-STAGE ORDER TRACKING STATUS UPDATER */}
      {showStatusModal && selectedBookingForStatus && (
        <div className="preview-modal-overlay">
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                Order #{selectedBookingForStatus.booking_ref}
              </h3>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveStatusModal}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Update Tracking State (9 Stages)</label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="pending">Booking Received (pending)</option>
                  <option value="confirmed">Booking Confirmed</option>
                  <option value="pickup_scheduled">Pickup Scheduled</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="processing">Processing</option>
                  <option value="quality_check">Quality Check</option>
                  <option value="ready_for_delivery">Ready for Delivery</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="completed">Delivered (completed)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Audit Reason / Status Note</label>
                <input
                  type="text"
                  placeholder="e.g. Items weighed at facility (4.2 kg)"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="topbar-btn outline"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Tracking State
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVE THEME PREVIEW (NO DIYAS!) */}
      {showPreviewModal && (
        <div className="preview-modal-overlay">
          <div className="preview-modal-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {previewThemeMode === 'diwali' ? 'Festive Gold Edition Preview' : 'Standard Ocean Blue Preview'}
              </span>
              <div className="preview-device-toggle">
                <button
                  type="button"
                  className={`preview-device-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <i className="fa-solid fa-desktop"></i> Desktop
                </button>
                <button
                  type="button"
                  className={`preview-device-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <i className="fa-solid fa-mobile-screen"></i> Mobile
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="topbar-btn outline"
                onClick={() => setPreviewThemeMode(previewThemeMode === 'diwali' ? 'classic' : 'diwali')}
              >
                Switch to {previewThemeMode === 'diwali' ? 'Ocean Blue' : 'Festive Gold'}
              </button>
              <button
                type="button"
                className="topbar-btn logout"
                onClick={() => setShowPreviewModal(false)}
              >
                Close Preview
              </button>
            </div>
          </div>

          <div className={`preview-viewport-frame ${previewDevice}`}>
            <div className="preview-scroll-container">
              <iframe
                src={`/?theme_preview=${previewThemeMode}`}
                title="Live Theme Preview"
                style={{ width: '100%', height: '100%', minHeight: '600px', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT OFFER */}
      {showOfferModal && (
        <div className="preview-modal-overlay">
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingOfferId ? 'Edit Campaign Offer' : 'Create New Campaign Offer'}
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
                    placeholder="e.g. Festive Special"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Badge Text</label>
                  <input
                    type="text"
                    value={offerForm.badge_text}
                    onChange={(e) => setOfferForm({ ...offerForm, badge_text: e.target.value })}
                    placeholder="e.g. Special Offer"
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
                  placeholder="Celebrate with fresh, clean clothes..."
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
                    value={offerForm.discount_value}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Discount / Coupon Code</label>
                  <input
                    type="text"
                    value={offerForm.discount_code}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DIWALI20"
                  />
                </div>
                <div className="form-group">
                  <label>Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={offerForm.min_amount}
                    onChange={(e) => setOfferForm({ ...offerForm, min_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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

              <div className="form-group-checkbox" style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={offerForm.is_active}
                    onChange={(e) => setOfferForm({ ...offerForm, is_active: e.target.checked })}
                  />
                  <span>Publish Offer Immediately</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="topbar-btn outline"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => setShowOfferModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOfferId ? 'Update Campaign' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {showServiceModal && (
        <div className="preview-modal-overlay">
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Add New Laundry Service</h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateService}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Curtain Steam Cleaning"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                  >
                    <option value="kg">per kg</option>
                    <option value="piece">per piece</option>
                    <option value="pair">per pair</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Service Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description of cleaning method..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label>Image Asset URL</label>
                <input
                  type="text"
                  value={serviceForm.image_url}
                  onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="topbar-btn outline"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => setShowServiceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEDIA ASSET */}
      {showMediaModal && (
        <div className="preview-modal-overlay">
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Register Media Asset</h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateMediaAsset}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Asset Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Garment Dry Clean"
                  value={mediaForm.file_name}
                  onChange={(e) => setMediaForm({ ...mediaForm, file_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>File Path *</label>
                <input
                  type="text"
                  placeholder="/assets/laundry/custom-asset.webp"
                  value={mediaForm.file_path}
                  onChange={(e) => setMediaForm({ ...mediaForm, file_path: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Alt Text</label>
                <input
                  type="text"
                  placeholder="Descriptive image text"
                  value={mediaForm.alt_text}
                  onChange={(e) => setMediaForm({ ...mediaForm, alt_text: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="topbar-btn outline"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => setShowMediaModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COUPON */}
      {showCouponModal && (
        <div className="preview-modal-overlay">
          <div className="modal-window" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Add Server Coupon Code</h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. DIWALI20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="form-row two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div className="form-group">
                  <label>Min Order (₹)</label>
                  <input
                    type="number"
                    value={couponForm.min_order_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.max_discount_amount}
                    onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="topbar-btn outline"
                  style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
                  onClick={() => setShowCouponModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
