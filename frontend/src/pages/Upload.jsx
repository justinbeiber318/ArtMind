import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paintingApi, categoryApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const MAX_BYTES = 8 * 1024 * 1024;

export default function Upload() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [form, setForm] = useState({
    title: '', artistName: '', description: '',
    categoryId: '', styleId: '', medium: '', surface: '', year: '',
  });
  const [error, setError] = useState('');

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['styles'], queryFn: categoryApi.styles });
  const mine = useQuery({ queryKey: ['paintings', 'mine'], queryFn: paintingApi.mine });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pickFile = (f) => {
    if (!f) return;
    if (f.size > MAX_BYTES) { setError('Image is too large (max 8 MB).'); return; }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const upload = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('image', file);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      return paintingApi.upload(fd);
    },
    onSuccess: (painting) => {
      qc.invalidateQueries({ queryKey: ['paintings', 'mine'] });
      qc.invalidateQueries({ queryKey: ['gallery'] });
      navigate(`/paintings/${painting.slug}`);
    },
    onError: (err) => setError(err?.response?.data?.message || 'Upload failed. Please try again.'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError('Please choose an image to upload.'); return; }
    if (!form.title || !form.artistName || !form.description || !form.categoryId) {
      setError('Title, artist, description and category are required.');
      return;
    }
    upload.mutate();
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Contribute</div>
          <h1>Upload your artwork</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
            Add a work to the Aurelis collection. We&apos;ll extract its color palette automatically
            and send it to the admin team for review before it appears in the public gallery.
          </p>
        </div>
      </div>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
            style={{
              border: '1.5px dashed var(--border)', background: 'var(--light-gray)',
              padding: preview ? 0 : '64px 24px', textAlign: 'center', cursor: 'pointer',
              minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {preview ? (
              <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 520, objectFit: 'contain' }} />
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>Drop an image here</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>or click to browse &middot; JPEG, PNG, WebP &middot; up to 8&nbsp;MB</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
            onChange={(e) => pickFile(e.target.files?.[0])} />
        </div>

        <div>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" value={form.title} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="artistName">Artist *</label>
              <input id="artistName" name="artistName" value={form.artistName} onChange={onChange}
                placeholder="Your name or the artist's name" required />
            </div>
            <div className="field">
              <label htmlFor="description">Description *</label>
              <textarea id="description" name="description" rows={4} value={form.description} onChange={onChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field">
                <label htmlFor="categoryId">Category *</label>
                <select id="categoryId" name="categoryId" value={form.categoryId} onChange={onChange} required>
                  <option value="">Select...</option>
                  {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="styleId">Style</label>
                <select id="styleId" name="styleId" value={form.styleId} onChange={onChange}>
                  <option value="">Select...</option>
                  {(styles.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="medium">Medium</label>
                <input id="medium" name="medium" value={form.medium} onChange={onChange} placeholder="Oil, acrylic..." />
              </div>
              <div className="field">
                <label htmlFor="surface">Surface</label>
                <input id="surface" name="surface" value={form.surface} onChange={onChange} placeholder="Canvas, paper..." />
              </div>
              <div className="field">
                <label htmlFor="year">Year</label>
                <input id="year" name="year" type="number" value={form.year} onChange={onChange} placeholder="2024" />
              </div>
            </div>

            <button className="btn btn--block" disabled={upload.isPending}>
              {upload.isPending ? 'Uploading...' : 'Submit for admin review'}
            </button>
          </form>
        </div>
      </section>

      {(mine.data || []).length > 0 && (
        <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
          <div className="container">
            <div className="eyebrow">Your uploads</div>
            <h2 style={{ marginBottom: 28 }}>Works you&apos;ve added</h2>
            <div className="grid grid--cards">
              {mine.data.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
