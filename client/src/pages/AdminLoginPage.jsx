import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid work email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-wrapper">
      {/* Top Right Language Switcher Pill matching Screenshot 1 */}
      <div className="employee-top-lang">
        <button
          type="button"
          className="employee-lang-btn"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          title="Switch Language / भाषा बदलें"
        >
          <i className="fa-solid fa-globe"></i>
          <span>{lang === 'en' ? 'EN ▾' : 'HI ▾'}</span>
        </button>
      </div>

      <div className="employee-login-container">
        {/* Brand Logo & Header matching Screenshot 1 */}
        <div className="employee-brand-header">
          <div className="employee-logo-badge">
            <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="46" height="46">
              <circle cx="22" cy="22" r="21" fill="#0A2547" stroke="#F6C64A" strokeWidth="1.2" />
              <path d="M22 11 C22 11 22 9 23.8 8 C25.5 7 27 8.5 27 10.2 C27 11.5 25.8 12.5 24.5 12.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <line x1="22" y1="11" x2="22" y2="17" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 17 C17 19 12 23 10 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M22 17 C27 19 32 23 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              <path d="M10 27 Q22 30.5 34 27" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <h1 className="employee-login-title">{t('adminLoginTitle')}</h1>
          <p className="employee-login-subtitle">{t('adminLoginSub')}</p>
        </div>

        {/* Frosted Glassmorphism Portal Card matching Screenshot 1 */}
        <div className="employee-login-card">
          <div className="employee-portal-badge-row">
            <div className="employee-shield-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="employee-badge-text">
              <strong>{t('adminPortalBadge')}</strong>
              <span>{t('staffAccessOnly')}</span>
            </div>
          </div>

          {error && (
            <div className="employee-alert-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="employee-login-form">
            <div className="employee-form-group">
              <label htmlFor="employee-email">{t('workEmail')}</label>
              <input
                type="text"
                id="employee-email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin / sandeep@diwakarji.com"
                required
                autoComplete="username"
              />
            </div>

            <div className="employee-form-group">
              <label htmlFor="employee-password">{t('password')}</label>
              <div className="employee-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="employee-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="employee-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="employee-btn-signin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                t('adminSignIn')
              )}
            </button>
          </form>

          <div className="employee-card-footer">
            <p className="employee-footer-note">{t('accountsCreatedByAdmin')}</p>
            <Link to="/" className="employee-back-link">
              {t('backToWebsite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
