import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { setCredentials } from '../features/auth/authSlice.js';

export default function Register() {
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
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError('Password must contain at least 1 uppercase letter.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(form.password)) {
      setError('Password must contain at least 1 special character.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { user, accessToken } = await authApi.register(form);
      dispatch(setCredentials({ user, accessToken }));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. That email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <div className="eyebrow">Join the gallery</div>
        <h2 style={{ marginBottom: 28 }}>Create your account</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" autoComplete="name"
              value={form.name} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email"
              value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password"
              value={form.password} onChange={onChange} required />
            <span className="muted" style={{ fontSize: '0.78rem' }}>
              At least 8 characters, 1 uppercase letter, 1 special character.
            </span>
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
              value={form.confirmPassword} onChange={onChange} required />
          </div>
          <button className="btn btn--block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 20, fontSize: '0.9rem' }}>
          Already a member? <Link to="/login" style={{ color: 'var(--navy)' }}>Sign in</Link>
        </p>
      </div>
    </section>
  );
}
