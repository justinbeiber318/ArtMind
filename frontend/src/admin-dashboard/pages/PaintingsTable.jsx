import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock3, Eye, ImageIcon, Pencil, Plus, Trash2, XCircle } from 'lucide-react';

import { artistApi, categoryApi, paintingApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  thumbnailUrl: '',
  artistId: '',
  categoryId: '',
  styleId: '',
  surface: '',
  medium: '',
  featured: true,
};

export default function PaintingsTable() {
  const queryClient = useQueryClient();
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('all');

  const paintings = useQuery({
    queryKey: ['admin', 'paintings', status],
    queryFn: () => paintingApi.adminList({
      limit: 50,
      sort: 'newest',
      ...(status !== 'all' ? { status } : {}),
    }),
  });
  const artists = useQuery({ queryKey: ['admin', 'artists', 'options'], queryFn: () => artistApi.list({ limit: 200 }) });
  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['styles'], queryFn: categoryApi.styles });

  const artistOptions = artists.data?.data || [];
  const categoryOptions = categories.data || [];
  const styleOptions = styles.data || [];

  const savePainting = useMutation({
    mutationFn: (payload) => {
      const body = normalizePainting(payload.form, Boolean(payload.id));
      return payload.id ? paintingApi.update(payload.id, body) : paintingApi.create(body);
    },
    onSuccess: () => {
      closeModal();
      invalidate();
      toast.success('Painting saved');
    },
    onError: (e) => toast.error(e.message || 'Could not save painting'),
  });

  const deletePainting = useMutation({
    mutationFn: id => paintingApi.remove(id),
    onSuccess: () => {
      setErr('');
      invalidate();
      toast.success('Painting deleted successfully');
    },
    onError: e => {
      const msg = e?.response?.data?.message || e.message || 'Could not delete this painting.';
      setErr(msg);
      toast.error(msg);
    },
  });

  const approvePainting = useMutation({
    mutationFn: id => paintingApi.update(id, { featured: true }),
    onSuccess: () => {
      invalidate();
      toast.success('Upload approved and published');
    },
    onError: e => toast.error(e?.response?.data?.message || e.message || 'Could not approve upload'),
  });

  const rows = paintings.data?.data || [];
  const pendingCount = rows.filter(isPendingUpload).length;
  const approvedCount = rows.filter((painting) => painting.featured).length;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'paintings'] });
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
  }

  function openCreate() {
    setForm(emptyForm);
    setModal({ type: 'form', title: 'Add Painting' });
  }

  function openEdit(painting) {
    setForm({
      title: painting.title || '',
      description: painting.description || '',
      imageUrl: painting.imageUrl || '',
      thumbnailUrl: painting.thumbnailUrl || '',
      artistId: String(painting.artistId || ''),
      categoryId: String(painting.categoryId || ''),
      styleId: painting.styleId ? String(painting.styleId) : '',
      surface: painting.surface || '',
      medium: painting.medium || '',
      featured: Boolean(painting.featured),
    });
    setModal({ type: 'form', title: 'Edit Painting', id: painting.id });
  }

  function openView(painting) {
    setModal({ type: 'view', title: painting.title, painting });
  }

  function closeModal() {
    setModal(null);
    setForm(emptyForm);
  }

  function handleDelete(painting) {
    if (window.confirm(`Delete "${painting.title}"? This permanently removes the painting.`)) {
      deletePainting.mutate(painting.id);
    }
  }

  function handleReject(painting) {
    if (window.confirm(`Reject "${painting.title}"? The database record will be removed.`)) {
      deletePainting.mutate(painting.id);
    }
  }

  return (
    <>
      <DataTable
        title="Painting Management"
        subtitle={`${rows.length} paintings · ${pendingCount} pending · ${approvedCount} published`}
        icon={<ImageIcon size={16} />}
        className="admin-paintings-table"
        head={['Image', 'Painting Name', 'Artist', 'Category', 'Style', 'Surface Type', 'Color Medium', 'Status', 'Created Date', 'Actions']}
        loading={paintings.isLoading}
        error={err}
        actions={(
          <div className="admin-review-toolbar">
            <FilterButton active={status === 'all'} onClick={() => setStatus('all')}>All</FilterButton>
            <FilterButton active={status === 'pending'} onClick={() => setStatus('pending')}>Pending</FilterButton>
            <FilterButton active={status === 'approved'} onClick={() => setStatus('approved')}>Published</FilterButton>
            <FilterButton active={status === 'system'} onClick={() => setStatus('system')}>Curated</FilterButton>
            <GlassButton primary icon={<Plus size={16} />} onClick={openCreate}>Add Painting</GlassButton>
          </div>
        )}
        rows={rows.map((painting, i) => (
          <TableRow key={painting.id} i={i}>
            <TableCell><Thumb src={painting.thumbnailUrl || painting.imageUrl} alt={painting.title} /></TableCell>
            <TableCell className="font-medium text-[#f0e6c8]">
              <div className="admin-title-cell">
                <span>{painting.title}</span>
                {painting.uploadedById && <small>User upload</small>}
              </div>
            </TableCell>
            <TableCell>{painting.artist?.name || '-'}</TableCell>
            <TableCell><StatusBadge variant="blue">{painting.category?.name || '-'}</StatusBadge></TableCell>
            <TableCell>{painting.style?.name || '-'}</TableCell>
            <TableCell>{painting.surface || '-'}</TableCell>
            <TableCell>{painting.medium || '-'}</TableCell>
            <TableCell><ReviewStatus painting={painting} /></TableCell>
            <TableCell className="text-xs">{new Date(painting.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <ActionGroup>
                <IconButton title="View" onClick={() => openView(painting)}><Eye size={15} /></IconButton>
                {isPendingUpload(painting) && (
                  <>
                    <IconButton title="Approve upload" onClick={() => approvePainting.mutate(painting.id)}><CheckCircle2 size={15} /></IconButton>
                    <IconButton title="Reject upload" danger onClick={() => handleReject(painting)}><XCircle size={15} /></IconButton>
                  </>
                )}
                <IconButton title="Edit" onClick={() => openEdit(painting)}><Pencil size={15} /></IconButton>
                <IconButton title="Delete" danger onClick={() => handleDelete(painting)}><Trash2 size={15} /></IconButton>
              </ActionGroup>
            </TableCell>
          </TableRow>
        ))}
      />

      {modal?.type === 'form' && (
        <AdminModal title={modal.title} onClose={closeModal}>
          <form className="admin-form-grid" onSubmit={(e) => { e.preventDefault(); savePainting.mutate({ id: modal.id, form }); }}>
            <Field label="Painting Name" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} required />
            <Field label="Thumbnail URL" value={form.thumbnailUrl} onChange={(v) => setForm({ ...form, thumbnailUrl: v })} />
            <Select label="Artist" value={form.artistId} onChange={(v) => setForm({ ...form, artistId: v })} required>
              <option value="">Select artist</option>
              {artistOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Select label="Category" value={form.categoryId} onChange={(v) => setForm({ ...form, categoryId: v })} required>
              <option value="">Select category</option>
              {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Style" value={form.styleId} onChange={(v) => setForm({ ...form, styleId: v })}>
              <option value="">No style</option>
              {styleOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Field label="Surface Type" value={form.surface} onChange={(v) => setForm({ ...form, surface: v })} />
            <Field label="Color Medium" value={form.medium} onChange={(v) => setForm({ ...form, medium: v })} />
            <label className="admin-check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Published</label>
            <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} required />
            <div className="admin-form-actions">
              <GlassButton onClick={closeModal}>Cancel</GlassButton>
              <GlassButton primary type="submit" disabled={savePainting.isPending}>{savePainting.isPending ? 'Saving...' : 'Save Painting'}</GlassButton>
            </div>
          </form>
        </AdminModal>
      )}

      {modal?.type === 'view' && (
        <AdminModal title="Painting Details" onClose={closeModal}>
          <DetailGrid
            image={modal.painting.imageUrl}
            rows={[
              ['Name', modal.painting.title],
              ['Artist', modal.painting.artist?.name],
              ['Category', modal.painting.category?.name],
              ['Style', modal.painting.style?.name || '-'],
              ['Surface Type', modal.painting.surface || '-'],
              ['Color Medium', modal.painting.medium || '-'],
              ['Source', modal.painting.uploadedById ? 'User upload' : 'Curated collection'],
              ['Status', getReviewLabel(modal.painting)],
              ['Created Date', new Date(modal.painting.createdAt).toLocaleString()],
              ['Description', modal.painting.description],
            ]}
          />
        </AdminModal>
      )}
    </>
  );
}

function normalizePainting(data, isEdit = false) {
  const optionalText = (value) => {
    const text = String(value || '').trim();
    if (text) return text;
    return isEdit ? null : undefined;
  };

  const surface = optionalText(data.surface);

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    thumbnailUrl: data.thumbnailUrl.trim() || (isEdit ? null : data.imageUrl.trim()),
    artistId: Number(data.artistId),
    categoryId: Number(data.categoryId),
    styleId: data.styleId ? Number(data.styleId) : (isEdit ? null : undefined),
    surface: surface ? surface.toLowerCase() : surface,
    medium: optionalText(data.medium),
    price: data.price !== '' ? Number(data.price) : (isEdit ? null : undefined),
    featured: Boolean(data.featured),
  };
}

function Thumb({ src, alt }) {
  return src ? <img src={src} alt={alt} className="admin-table-thumb" /> : <div className="admin-table-thumb" />;
}

function isPendingUpload(painting) {
  return Boolean(painting.uploadedById && !painting.featured);
}

function getReviewLabel(painting) {
  if (isPendingUpload(painting)) return 'Pending review';
  if (painting.featured) return 'Published';
  return 'Hidden';
}

function ReviewStatus({ painting }) {
  if (isPendingUpload(painting)) {
    return <StatusBadge variant="amber"><Clock3 size={12} /> Pending review</StatusBadge>;
  }
  return <StatusBadge variant={painting.featured ? 'emerald' : 'gray'}>{painting.featured ? 'Published' : 'Hidden'}</StatusBadge>;
}

function FilterButton({ active, onClick, children }) {
  return (
    <button type="button" className={`admin-filter-chip ${active ? 'is-active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function ActionGroup({ children }) {
  return <div className="admin-action-group">{children}</div>;
}

function IconButton({ children, onClick, danger, title }) {
  return (
    <button type="button" title={title} onClick={onClick} className={`admin-action-btn ${danger ? 'is-danger' : ''}`}>
      {children}
    </button>
  );
}

function AdminModal({ title, children, onClose }) {
  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="admin-modal__head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextArea({ label, value, onChange, required = false }) {
  return <label className="admin-field admin-field--wide"><span>{label}</span><textarea rows={4} value={value} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Select({ label, value, onChange, required = false, children }) {
  return <label className="admin-field"><span>{label}</span><select value={value} required={required} onChange={(e) => onChange(e.target.value)}>{children}</select></label>;
}

function DetailGrid({ image, rows }) {
  return (
    <div className="admin-detail-grid">
      {image && <img src={image} alt="" />}
      <div className="admin-detail-list">
        {rows.map(([label, value]) => (
          <div key={label}><span>{label}</span><strong>{value || '-'}</strong></div>
        ))}
      </div>
    </div>
  );
}
