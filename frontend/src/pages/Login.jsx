import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function Login() {
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
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to sign in. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="eyebrow">Welcome back</div>
        <h2 style={{ marginBottom: 28 }}>Sign in to Aurelis</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password"
              value={form.password} onChange={onChange} required />
          </div>
          <button className="btn btn--block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 20, fontSize: '0.9rem' }}>
          New to Aurelis? <Link to="/register" style={{ color: 'var(--navy)' }}>Create an account</Link>
        </p>
        <p className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
          Demo: demo@artmind.test / Demo1234
        </p>
      </div>
    </section>
  );
}
