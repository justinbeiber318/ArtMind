import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/endpoints.js';
import { setCredentials } from '../features/auth/authSlice.js';

const LOGIN_ART_IMAGE =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF1EG1-fXP4Vebr3XaLI6y3JdqWILbyhibq-h5ZejSh05z0-d9MGOh3KQ&s=10';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user, accessToken } = await authApi.login(form);
      dispatch(setCredentials({ user, accessToken }));
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || t('auth_login_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-shell">
        <div className="auth-panel">
          <div className="eyebrow">Welcome back</div>
          <h1>{t('auth_login_title')}</h1>
          <p className="muted auth-panel__intro">
            {t('auth_login_intro')}
          </p>

          {error && <div className="form-error auth-panel__error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">{t('email')}</label>
              <input id="email" name="email" type="email" autoComplete="email"
                value={form.email} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="password">{t('password')}</label>
              <input id="password" name="password" type="password" autoComplete="current-password"
                value={form.password} onChange={onChange} required />
            </div>
            <button className="btn btn--block" disabled={submitting}>
              {submitting ? t('signing_in') : t('sign_in')}
            </button>
          </form>

          <p className="muted auth-panel__note">
            {t('new_to_aurelis')} <Link to="/register">{t('create_account')}</Link>
          </p>
        </div>

        <aside className="auth-art" aria-label="Aurelis gallery preview">
          <div className="auth-art__frame">
            <img className="auth-art__image" src={LOGIN_ART_IMAGE} alt="Abstract gallery artwork" />
          </div>
          <div className="auth-art__caption">
            <span>{t('auth_login_art_label')}</span>
            <strong>{t('auth_login_art_caption')}</strong>
          </div>
          <div className="auth-art__meta">
            <span>{t('ai_search')}</span>
            <span>{t('virtual_gallery')}</span>
            <span>{t('private_favorites')}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
