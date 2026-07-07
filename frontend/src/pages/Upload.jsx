import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock3, ImagePlus, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { paintingApi, categoryApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Upload() {
  const qc = useQueryClient();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({
    title: '', artistName: '', description: '',
    categoryId: '', styleId: '', medium: '', surface: '', year: '',
  });
  const [error, setError] = useState('');

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['styles'], queryFn: categoryApi.styles });
  const mine = useQuery({ queryKey: ['paintings', 'mine'], queryFn: paintingApi.mine });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pickFile = (f) => {
    if (!f) return;
<<<<<<< HEAD
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Unsupported file. Please use JPG, JPEG, PNG or WEBP.');
      return;
    }
    if (f.size > MAX_BYTES) { setError('Image is too large (max 5 MB).'); return; }
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
=======
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (f.size > MAX_BYTES) { setError('Image is too large (max 8 MB).'); return; }
>>>>>>> 561a62b9d81ee3d723357fedb9ff4b465d876d4c
    setError('');
    setFile(f);
    setSubmitted(null);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
  };

  const resetForm = () => {
    clearFile();
    setForm({
      title: '', artistName: '', description: '',
      categoryId: '', styleId: '', medium: '', surface: '', year: '',
    });
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
      setSubmitted(painting);
      resetForm();
    },
    onError: (err) => setError(err?.message || 'Upload failed. Please try again.'),
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
            Add a work to the Aurelis collection. Your image is saved to the database immediately,
            then held for admin review before it appears in the public gallery.
          </p>
        </div>
      </div>

      <section className="section container upload-layout">
        <div className="upload-left">
          <div className="upload-steps">
            <div><ImagePlus size={18} /><span>Select image</span></div>
            <div><ShieldCheck size={18} /><span>Admin review</span></div>
            <div><CheckCircle2 size={18} /><span>Publish</span></div>
          </div>
          <div
            className={`upload-dropzone ${preview ? 'has-preview' : ''} ${isDragging ? 'is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" />
                <button
                  type="button"
                  className="upload-clear"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  aria-label="Remove selected image"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
<<<<<<< HEAD
              <div>
                <p style={{ fontWeight: 500 }}>Drop an image here</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>or click to browse &middot; JPEG, PNG, WebP &middot; up to 5&nbsp;MB</p>
=======
              <div className="upload-dropzone__empty">
                <UploadCloud size={38} />
                <p>Drop an image here</p>
                <span>or click to browse · JPEG, PNG, WebP · up to 8 MB</span>
>>>>>>> 561a62b9d81ee3d723357fedb9ff4b465d876d4c
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
            onChange={(e) => pickFile(e.target.files?.[0])} />
          {file && (
            <div className="upload-file-meta">
              <strong>{file.name}</strong>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          )}
        </div>

        <div className="upload-panel">
          {submitted && (
            <div className="upload-success">
              <Clock3 size={20} />
              <div>
                <strong>{submitted.title} is waiting for admin approval.</strong>
                <span>It is saved in the database and will appear publicly after review.</span>
              </div>
            </div>
          )}
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

            <div className="upload-form-grid">
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
            <div className="upload-status-list">
              {mine.data.map((p) => (
                <div key={p.id} className="upload-status-row">
                  <img src={p.thumbnailUrl || p.imageUrl} alt="" />
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.featured ? 'Approved and visible in gallery' : 'Pending admin review'}</span>
                  </div>
                  <em className={p.featured ? 'is-approved' : ''}>{p.featured ? 'Approved' : 'Pending'}</em>
                </div>
              ))}
            </div>
            <div className="grid grid--cards">
              {mine.data.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
