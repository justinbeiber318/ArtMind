import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, userApi } from '../api/endpoints.js';
import { selectUser, setCredentials } from '../features/auth/authSlice.js';

const emptyPassword = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Profile() {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const cachedUser = useSelector(selectUser);
  const accessToken = useSelector((s) => s.auth.accessToken);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: userApi.me });
  const categories = useQuery({ queryKey: ['profile-categories'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['profile-styles'], queryFn: categoryApi.styles });
  const profile = me || cachedUser || {};

  const preferenceKey = useMemo(() => `aurelis_preferences_${profile.id || 'guest'}`, [profile.id]);
  const [form, setForm] = useState({ name: '', email: '', avatarUrl: '', bio: '' });
  const [password, setPassword] = useState(emptyPassword);
  const [preferences, setPreferences] = useState({ categories: [], styles: [] });
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: profile.name || '',
      email: profile.email || '',
      avatarUrl: profile.avatarUrl || '',
      bio: profile.bio || '',
    });
  }, [profile.name, profile.email, profile.avatarUrl, profile.bio]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(preferenceKey));
      if (saved) setPreferences({ categories: saved.categories || [], styles: saved.styles || [] });
    } catch {
      setPreferences({ categories: [], styles: [] });
    }
  }, [preferenceKey]);

  const flash = (message) => {
    setNote(message);
    setError('');
    setTimeout(() => setNote(''), 2600);
  };

  const updateProfile = useMutation({
    mutationFn: () => userApi.update({
      name: form.name,
      avatarUrl: form.avatarUrl || undefined,
      bio: form.bio || undefined,
    }),
    onSuccess: (updated) => {
      dispatch(setCredentials({ user: updated, accessToken }));
      qc.invalidateQueries({ queryKey: ['me'] });
      flash('Profile updated.');
    },
    onError: (err) => setError(err.message || 'Could not update profile.'),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return userApi.uploadAvatar(formData);
    },
    onSuccess: (updated) => {
      dispatch(setCredentials({ user: updated, accessToken }));
      qc.invalidateQueries({ queryKey: ['me'] });
      flash('Avatar uploaded.');
    },
    onError: (err) => setError(err.message || 'Could not upload avatar.'),
  });

  const changePassword = useMutation({
    mutationFn: () => userApi.changePassword({
      currentPassword: password.currentPassword,
      newPassword: password.newPassword,
    }),
    onSuccess: () => {
      setPassword(emptyPassword);
      flash('Password changed.');
    },
    onError: (err) => setError(err.message || 'Could not change password.'),
  });

  const savePreferences = () => {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    flash('Preferences saved.');
  };

  const avatarInitial = (profile.name || profile.email || '?').charAt(0).toUpperCase();

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Account</div>
          <h1>User Profile</h1>
        </div>
      </div>

      <section className="section container profile-layout">
        <aside className="profile-summary">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="" className="profile-avatar" />
          ) : (
            <div className="profile-avatar profile-avatar--initial">{avatarInitial}</div>
          )}
          <h2>{profile.name}</h2>
          <p className="muted">{profile.email}</p>
          {profile.role === 'ADMIN' && <span className="tag">Administrator</span>}
        </aside>

        <div className="profile-stack">
          {(note || error) && (
            <div className={error ? 'profile-alert profile-alert--error' : 'profile-alert'}>
              {error || note}
            </div>
          )}

          <ProfileCard title="Edit Profile">
            <form className="profile-form" onSubmit={(e) => { e.preventDefault(); updateProfile.mutate(); }}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" value={form.email} disabled />
              </div>
              <div className="field profile-form__wide">
                <label htmlFor="avatarFile">Upload avatar</label>
                <input
                  id="avatarFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar.mutate(file);
                  }}
                />
              </div>
              <div className="field profile-form__wide">
                <label htmlFor="avatarUrl">Avatar URL</label>
                <input id="avatarUrl" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
                {uploadAvatar.isPending && <p className="muted profile-help">Uploading avatar...</p>}
              </div>
              <div className="field profile-form__wide">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
              </div>
              <button className="btn" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </ProfileCard>

          <ProfileCard title="Change Password">
            <form className="profile-form" onSubmit={(e) => {
              e.preventDefault();
              if (password.newPassword !== password.confirmPassword) {
                setError('New password and confirmation do not match.');
                return;
              }
              changePassword.mutate();
            }}>
              <div className="field">
                <label htmlFor="currentPassword">Current password</label>
                <input id="currentPassword" type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input id="newPassword" type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required minLength={8} />
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} required minLength={8} />
              </div>
              <button className="btn btn--ghost" disabled={changePassword.isPending}>
                {changePassword.isPending ? 'Updating...' : 'Change password'}
              </button>
            </form>
          </ProfileCard>

          <ProfileCard title="Manage Preferences">
            <PreferenceGroup
              title="Favorite Categories"
              items={categories.data || []}
              selected={preferences.categories}
              onToggle={(id) => togglePreference('categories', id, preferences, setPreferences)}
            />
            <PreferenceGroup
              title="Favorite Styles"
              items={styles.data || []}
              selected={preferences.styles}
              onToggle={(id) => togglePreference('styles', id, preferences, setPreferences)}
            />
            <button className="btn" onClick={savePreferences}>Save preferences</button>
          </ProfileCard>
        </div>
      </section>
    </>
  );
}

function ProfileCard({ title, children }) {
  return (
    <section className="profile-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function PreferenceGroup({ title, items, selected, onToggle }) {
  return (
    <div className="profile-preferences">
      <h3>{title}</h3>
      <div className="profile-chips">
        {items.map((item) => (
          <label key={item.id} className={`profile-chip ${selected.includes(item.id) ? 'is-selected' : ''}`}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function togglePreference(key, id, preferences, setPreferences) {
  const current = preferences[key];
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setPreferences({ ...preferences, [key]: next });
}
