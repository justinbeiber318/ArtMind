import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, Palette, Pencil, Plus, Trash2 } from 'lucide-react';

import { artistApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

const emptyForm = {
  name: '',
  bio: '',
  nationality: '',
  portraitUrl: '',
  bornYear: '',
  diedYear: '',
};

export default function ArtistsTable() {
  const queryClient = useQueryClient();
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'artists'],
    queryFn: () => artistApi.list({ limit: 100 }),
  });

  const artists = data?.data || [];

  const saveArtist = useMutation({
    mutationFn: ({ id, form: values }) => {
      const body = normalizeArtist(values);
      return id ? artistApi.update(id, body) : artistApi.create(body);
    },
    onSuccess: () => {
      closeModal();
      invalidate();
      toast.success('Artist saved');
    },
    onError: e => toast.error(e?.response?.data?.message || e.message || 'Could not save artist.'),
  });

  const deleteArtist = useMutation({
    mutationFn: id => artistApi.remove(id),
    onSuccess: () => {
      setErr('');
      invalidate();
      toast.success('Artist deleted');
    },
    onError: e => {
      const msg = e?.response?.data?.message || 'Could not delete this artist.';
      setErr(msg);
      toast.error(msg);
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'artists'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'paintings'] });
  }

  function openCreate() {
    setForm(emptyForm);
    setModal({ type: 'form', title: 'Add Artist' });
  }

  function openEdit(artist) {
    setForm({
      name: artist.name || '',
      bio: artist.bio || '',
      nationality: artist.nationality || '',
      portraitUrl: artist.portraitUrl || '',
      bornYear: artist.bornYear ? String(artist.bornYear) : '',
      diedYear: artist.diedYear ? String(artist.diedYear) : '',
    });
    setModal({ type: 'form', title: 'Edit Artist', id: artist.id });
  }

  function openView(artist) {
    setModal({ type: 'view', title: artist.name, artist });
  }

  function closeModal() {
    setModal(null);
    setForm(emptyForm);
  }

  function handleDelete(artist) {
    if (window.confirm(`Delete artist "${artist.name}"?`)) {
      deleteArtist.mutate(artist.id);
    }
  }

  return (
    <>
      <DataTable
        title="Artist Management"
        subtitle={`${artists.length} artists`}
        icon={<Palette size={16} />}
        head={['Profile Image', 'Name', 'Nationality', 'Number of Paintings', 'Biography', 'Actions']}
        loading={isLoading}
        error={err}
        actions={<GlassButton primary icon={<Plus size={16} />} onClick={openCreate}>Add Artist</GlassButton>}
        rows={artists.map((artist, i) => {
          const paintingsCount = artist._count?.paintings ?? 0;

          return (
            <TableRow key={artist.id} i={i}>
              <TableCell><Avatar src={artist.portraitUrl} name={artist.name} /></TableCell>
              <TableCell className="font-medium text-[#f0e6c8]">{artist.name}</TableCell>
              <TableCell>{artist.nationality || '-'}</TableCell>
              <TableCell>
                <StatusBadge variant={paintingsCount > 0 ? 'blue' : 'gray'}>
                  {paintingsCount} paintings
                </StatusBadge>
              </TableCell>
              <TableCell className="max-w-[320px] text-[#8a8a8a]">
                <span className="line-clamp-2">{artist.bio || '-'}</span>
              </TableCell>
              <TableCell>
                <ActionGroup>
                  <IconButton title="View" onClick={() => openView(artist)}><Eye size={15} /></IconButton>
                  <IconButton title="Edit" onClick={() => openEdit(artist)}><Pencil size={15} /></IconButton>
                  <IconButton title="Delete" danger disabled={paintingsCount > 0} onClick={() => handleDelete(artist)}><Trash2 size={15} /></IconButton>
                </ActionGroup>
              </TableCell>
            </TableRow>
          );
        })}
      />

      {modal?.type === 'form' && (
        <AdminModal title={modal.title} onClose={closeModal}>
          <form className="admin-form-grid" onSubmit={(e) => { e.preventDefault(); saveArtist.mutate({ id: modal.id, form }); }}>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Nationality" value={form.nationality} onChange={(v) => setForm({ ...form, nationality: v })} />
            <Field label="Profile Image URL" value={form.portraitUrl} onChange={(v) => setForm({ ...form, portraitUrl: v })} />
            <Field label="Born Year" type="number" value={form.bornYear} onChange={(v) => setForm({ ...form, bornYear: v })} />
            <Field label="Died Year" type="number" value={form.diedYear} onChange={(v) => setForm({ ...form, diedYear: v })} />
            <Field label="Social Links" value="" onChange={() => {}} placeholder="Add this field in database to store links" disabled />
            <TextArea label="Biography" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
            <div className="admin-form-actions">
              <GlassButton onClick={closeModal}>Cancel</GlassButton>
              <GlassButton primary type="submit" disabled={saveArtist.isPending}>{saveArtist.isPending ? 'Saving...' : 'Save Artist'}</GlassButton>
            </div>
          </form>
        </AdminModal>
      )}

      {modal?.type === 'view' && (
        <AdminModal title="Artist Details" onClose={closeModal}>
          <DetailGrid
            image={modal.artist.portraitUrl}
            rows={[
              ['Name', modal.artist.name],
              ['Biography', modal.artist.bio],
              ['Nationality', modal.artist.nationality],
              ['Profile Image', modal.artist.portraitUrl],
              ['Number of Paintings', modal.artist._count?.paintings ?? 0],
              ['Social Links', 'Not configured in database'],
            ]}
          />
        </AdminModal>
      )}
    </>
  );
}

function normalizeArtist(data) {
  const optionalText = (value) => {
    const text = String(value || '').trim();
    return text || null;
  };

  return {
    name: data.name.trim(),
    bio: optionalText(data.bio),
    nationality: optionalText(data.nationality),
    portraitUrl: optionalText(data.portraitUrl),
    bornYear: data.bornYear ? Number(data.bornYear) : null,
    diedYear: data.diedYear ? Number(data.diedYear) : null,
  };
}

function Avatar({ src, name }) {
  if (src) return <img src={src} alt={name} className="admin-table-avatar" />;
  return <div className="admin-table-avatar">{name?.[0]?.toUpperCase() || '?'}</div>;
}

function ActionGroup({ children }) {
  return <div className="admin-action-group">{children}</div>;
}

function IconButton({ children, onClick, danger, title, disabled = false }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className={`admin-action-btn ${danger ? 'is-danger' : ''}`}>
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

function Field({ label, value, onChange, type = 'text', required = false, disabled = false, placeholder = '' }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} required={required} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextArea({ label, value, onChange }) {
  return <label className="admin-field admin-field--wide"><span>{label}</span><textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
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
