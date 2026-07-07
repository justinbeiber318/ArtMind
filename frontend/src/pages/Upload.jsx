import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock3, ImagePlus, ShieldCheck, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { paintingApi, categoryApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Upload() {
  const { t } = useTranslation();
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
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError(t('upload_file_type_error'));
      return;
    }
    if (f.size > MAX_BYTES) { setError(t('upload_file_size_error')); return; }
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
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
    onError: (err) => setError(err?.message || t('upload_failed')),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!file) { setError(t('upload_choose_image_error')); return; }
    if (!form.title || !form.artistName || !form.description || !form.categoryId) {
      setError(t('upload_required_error'));
      return;
    }
    upload.mutate();
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">{t('contribute')}</div>
          <h1>{t('upload_title')}</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
            {t('upload_intro')}
          </p>
        </div>
      </div>

      <section className="section container upload-layout">
        <div className="upload-left">
          <div className="upload-steps">
            <div><ImagePlus size={18} /><span>{t('select_image')}</span></div>
            <div><ShieldCheck size={18} /><span>{t('admin_review')}</span></div>
            <div><CheckCircle2 size={18} /><span>{t('publish')}</span></div>
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
                <img src={preview} alt={t('preview')} />
                <button
                  type="button"
                  className="upload-clear"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  aria-label={t('remove_selected_image')}
                  title={t('remove_image')}
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>{t('drop_image_here')}</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>{t('click_to_browse')}</p>
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
                <strong>{t('upload_waiting_approval', { title: submitted.title })}</strong>
                <span>{t('upload_saved_review')}</span>
              </div>
            </div>
          )}
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="title">{t('title')} *</label>
              <input id="title" name="title" value={form.title} onChange={onChange} required />
            </div>
            <div className="field">
              <label htmlFor="artistName">{t('artist')} *</label>
              <input id="artistName" name="artistName" value={form.artistName} onChange={onChange}
                placeholder={t('artist_placeholder')} required />
            </div>
            <div className="field">
              <label htmlFor="description">{t('description')} *</label>
              <textarea id="description" name="description" rows={4} value={form.description} onChange={onChange} required />
            </div>

            <div className="upload-form-grid">
              <div className="field">
                <label htmlFor="categoryId">{t('category')} *</label>
                <select id="categoryId" name="categoryId" value={form.categoryId} onChange={onChange} required>
                  <option value="">{t('select_option')}</option>
                  {(categories.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="styleId">{t('style')}</label>
                <select id="styleId" name="styleId" value={form.styleId} onChange={onChange}>
                  <option value="">{t('select_option')}</option>
                  {(styles.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="medium">{t('medium')}</label>
                <input id="medium" name="medium" value={form.medium} onChange={onChange} placeholder={t('medium_placeholder')} />
              </div>
              <div className="field">
                <label htmlFor="surface">{t('surface')}</label>
                <input id="surface" name="surface" value={form.surface} onChange={onChange} placeholder={t('surface_placeholder')} />
              </div>
              <div className="field">
                <label htmlFor="year">{t('year')}</label>
                <input id="year" name="year" type="number" value={form.year} onChange={onChange} placeholder="2024" />
              </div>
            </div>

            <button className="btn btn--block" disabled={upload.isPending}>
              {upload.isPending ? t('uploading') : t('submit_for_review')}
            </button>
          </form>
        </div>
      </section>

      {(mine.data || []).length > 0 && (
        <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
          <div className="container">
            <div className="eyebrow">{t('your_uploads')}</div>
            <h2 style={{ marginBottom: 28 }}>{t('works_you_added')}</h2>
            <div className="upload-status-list">
              {mine.data.map((p) => (
                <div key={p.id} className="upload-status-row">
                  <img src={p.thumbnailUrl || p.imageUrl} alt="" />
                  <div>
                    <strong>{p.title}</strong>
                    <span>{p.featured ? t('approved_visible') : t('pending_admin_review')}</span>
                  </div>
                  <em className={p.featured ? 'is-approved' : ''}>{p.featured ? t('approved') : t('pending')}</em>
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
