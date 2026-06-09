import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/endpoints.js';
import { selectUser, setCredentials } from '../features/auth/authSlice.js';

export default function Profile() {
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const cachedUser = useSelector(selectUser);
  const accessToken = useSelector((s) => s.auth.accessToken);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: userApi.me });
  const [name, setName] = useState(cachedUser?.name || '');
  const [note, setNote] = useState('');

  useEffect(() => { if (me?.name) setName(me.name); }, [me?.name]);

  const update = useMutation({
    mutationFn: () => userApi.update({ name }),
    onSuccess: (updated) => {
      dispatch(setCredentials({ user: updated, accessToken }));
      qc.invalidateQueries({ queryKey: ['me'] });
      setNote('Profile updated.');
      setTimeout(() => setNote(''), 2500);
    },
  });

  const profile = me || cachedUser || {};

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Account</div>
          <h1>Profile</h1>
        </div>
      </div>

      <section className="section container" style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'var(--navy)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>
            {(profile.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{profile.name}</div>
            <div className="muted" style={{ fontSize: '0.9rem' }}>{profile.email}</div>
            {profile.role === 'ADMIN' && <span className="tag" style={{ marginTop: 6 }}>Administrator</span>}
          </div>
        </div>

        {note && <div style={{ color: 'var(--navy)', marginBottom: 14, fontSize: '0.9rem' }}>{note}</div>}

        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }}>
          <div className="field">
            <label htmlFor="name">Display name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" value={profile.email || ''} disabled />
          </div>
          <button className="btn" disabled={update.isPending || name === profile.name}>
            {update.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>
    </>
  );
}
