import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/endpoints.js';
import { setCredentials } from '../features/auth/authSlice.js';

const REGISTER_ART_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoZQGYC_0abqBO0BksQIvkBFheG_wB6rHbDsl3bNXGL_YTAALhGYvx1Uk&s=10';

export default function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError(t('password_min_error'));
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError(t('password_uppercase_error'));
      return;
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError(t('password_special_error'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t('password_match_error'));
      return;
    }
    setSubmitting(true);
    try {
      const { user, accessToken } = await authApi.register(form);
      dispatch(setCredentials({ user, accessToken }));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || t('auth_register_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-shell auth-shell--register">
        <aside className="auth-art auth-art--register" aria-label="Aurelis membership preview">
          <div className="auth-art__frame">
            <img className="auth-art__image" src={REGISTER_ART_IMAGE} alt="Museum wall with framed artwork" />
          </div>
          <div className="auth-art__caption">
            <span>{t('auth_register_art_label')}</span>
            <strong>{t('auth_register_art_caption')}</strong>
          </div>
          <div className="auth-art__meta">
            <span>{t('save_works')}</span>
            <span>{t('upload_art')}</span>
            <span>{t('recognition')}</span>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="eyebrow">{t('join_gallery')}</div>
          <h1>{t('auth_register_title')}</h1>
          <p className="muted auth-panel__intro">
            {t('auth_register_intro')}
          </p>

          {error && <div className="form-error auth-panel__error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">{t('full_name')}</label>
              <input id="name" name="name" type="text" autoComplete="name"
                value={form.name} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="email">{t('email')}</label>
              <input id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">{t('password')}</label>
              <input id="password" name="password" type="password" autoComplete="new-password"
                value={form.password} onChange={onChange} required />
              <span className="auth-panel__hint">
                {t('password_hint')}
              </span>
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">{t('confirm_password')}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
                value={form.confirmPassword} onChange={onChange} required />
            </div>
            <button className="btn btn--block" disabled={submitting}>
              {submitting ? t('creating_account') : t('create_account')}
            </button>
          </form>

          <p className="muted auth-panel__note">
            {t('already_member')} <Link to="/login">{t('sign_in')}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
