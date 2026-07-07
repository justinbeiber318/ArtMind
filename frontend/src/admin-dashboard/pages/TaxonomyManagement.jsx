import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Layers, Pencil, Plus, Tags, Trash2 } from 'lucide-react';

import { categoryApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

const emptyForm = { name: '' };

const RESOURCE_CONFIG = {
  category: {
    title: 'Category Management',
    addTitle: 'Add Category',
    editTitle: 'Edit Category',
    queryKey: ['categories'],
    queryFn: categoryApi.list,
    create: categoryApi.create,
    update: categoryApi.update,
    remove: categoryApi.remove,
  },
  style: {
    title: 'Style Management',
    addTitle: 'Add Style',
    editTitle: 'Edit Style',
    queryKey: ['styles'],
    queryFn: categoryApi.styles,
    create: categoryApi.createStyle,
    update: categoryApi.updateStyle,
    remove: categoryApi.removeStyle,
  },
};

export default function TaxonomyManagement() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const categories = useQuery({ queryKey: RESOURCE_CONFIG.category.queryKey, queryFn: RESOURCE_CONFIG.category.queryFn });
  const styles = useQuery({ queryKey: RESOURCE_CONFIG.style.queryKey, queryFn: RESOURCE_CONFIG.style.queryFn });
  const surfaces = useQuery({ queryKey: ['surfaces'], queryFn: categoryApi.surfaces });

  const saveTerm = useMutation({
    mutationFn: ({ resource, id, name }) => {
      const config = RESOURCE_CONFIG[resource];
      return id ? config.update(id, { name }) : config.create({ name });
    },
    onSuccess: (_data, vars) => {
      closeModal();
      invalidateTaxonomy(vars.resource);
      toast.success('Saved successfully');
    },
    onError: (e) => toast.error(e?.response?.data?.message || e.message || 'Could not save item'),
  });

  const deleteTerm = useMutation({
    mutationFn: ({ resource, id }) => RESOURCE_CONFIG[resource].remove(id),
    onSuccess: (_data, vars) => {
      setError('');
      invalidateTaxonomy(vars.resource);
      toast.success('Deleted successfully');
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || 'Could not delete this item while paintings still use it.';
      setError(msg);
      toast.error(msg);
    },
  });

  const renameSurface = useMutation({
    mutationFn: ({ oldName, name }) => categoryApi.updateSurface(oldName, { name }),
    onSuccess: () => {
      closeModal();
      invalidateSurfaces();
      toast.success('Surface updated');
    },
    onError: (e) => toast.error(e?.response?.data?.message || e.message || 'Could not update surface'),
  });

  const deleteSurface = useMutation({
    mutationFn: (name) => categoryApi.removeSurface(name),
    onSuccess: () => {
      setError('');
      invalidateSurfaces();
      toast.success('Surface removed from paintings');
    },
    onError: (e) => {
      const msg = e?.response?.data?.message || 'Could not remove surface.';
      setError(msg);
      toast.error(msg);
    },
  });

  function invalidateTaxonomy(resource) {
    queryClient.invalidateQueries({ queryKey: RESOURCE_CONFIG[resource].queryKey });
    queryClient.invalidateQueries({ queryKey: ['admin', 'paintings'] });
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
  }

  function invalidateSurfaces() {
    queryClient.invalidateQueries({ queryKey: ['surfaces'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'paintings'] });
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
  }

  function openCreate(resource) {
    setForm(emptyForm);
    setModal({ type: 'term', resource, title: RESOURCE_CONFIG[resource].addTitle });
  }

  function openEdit(resource, item) {
    setForm({ name: item.name || '' });
    setModal({ type: 'term', resource, id: item.id, title: RESOURCE_CONFIG[resource].editTitle });
  }

  function openSurfaceEdit(item) {
    setForm({ name: item.name || '' });
    setModal({ type: 'surface', oldName: item.name, title: 'Edit Surface' });
  }

  function closeModal() {
    setModal(null);
    setForm(emptyForm);
  }

  function handleTermDelete(resource, item) {
    if (window.confirm(`Delete "${item.name}"?`)) {
      deleteTerm.mutate({ resource, id: item.id });
    }
  }

  function handleSurfaceDelete(item) {
    if (window.confirm(`Remove "${item.name}" from ${item._count?.paintings ?? 0} paintings?`)) {
      deleteSurface.mutate(item.name);
    }
  }

  return (
    <div className="space-y-8">
      <TaxonomyTable
        title="Category Management"
        subtitle={`${categories.data?.length || 0} categories`}
        icon={<Tags size={16} />}
        loading={categories.isLoading}
        error={error}
        rows={categories.data || []}
        onCreate={() => openCreate('category')}
        onEdit={(item) => openEdit('category', item)}
        onDelete={(item) => handleTermDelete('category', item)}
        addLabel="Add Category"
      />

      <TaxonomyTable
        title="Style Management"
        subtitle={`${styles.data?.length || 0} styles`}
        icon={<Layers size={16} />}
        loading={styles.isLoading}
        rows={styles.data || []}
        onCreate={() => openCreate('style')}
        onEdit={(item) => openEdit('style', item)}
        onDelete={(item) => handleTermDelete('style', item)}
        addLabel="Add Style"
      />

      <SurfaceTable
        rows={surfaces.data || []}
        loading={surfaces.isLoading}
        onEdit={openSurfaceEdit}
        onDelete={handleSurfaceDelete}
      />

      {modal && (
        <AdminModal title={modal.title} onClose={closeModal}>
          <form
            className="admin-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              const name = form.name.trim();
              if (!name) return;
              if (modal.type === 'surface') {
                renameSurface.mutate({ oldName: modal.oldName, name });
              } else {
                saveTerm.mutate({ resource: modal.resource, id: modal.id, name });
              }
            }}
          >
            <Field label="Name" value={form.name} onChange={(v) => setForm({ name: v })} required />
            <div className="admin-form-actions">
              <GlassButton onClick={closeModal}>Cancel</GlassButton>
              <GlassButton primary type="submit" disabled={saveTerm.isPending || renameSurface.isPending}>
                {saveTerm.isPending || renameSurface.isPending ? 'Saving...' : 'Save'}
              </GlassButton>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

function TaxonomyTable({ title, subtitle, icon, rows, loading, error, onCreate, onEdit, onDelete, addLabel }) {
  return (
    <DataTable
      title={title}
      subtitle={subtitle}
      icon={icon}
      head={['Name', 'Slug', 'Paintings', 'Actions']}
      loading={loading}
      error={error}
      actions={<GlassButton primary icon={<Plus size={16} />} onClick={onCreate}>{addLabel}</GlassButton>}
      rows={rows.map((item, i) => (
        <TableRow key={item.id} i={i}>
          <TableCell className="font-medium text-[#f0e6c8]">{item.name}</TableCell>
          <TableCell>{item.slug || '-'}</TableCell>
          <TableCell>
            <StatusBadge variant={(item._count?.paintings ?? 0) > 0 ? 'blue' : 'gray'}>
              {item._count?.paintings ?? 0} paintings
            </StatusBadge>
          </TableCell>
          <TableCell>
            <ActionGroup>
              <IconButton title="Edit" onClick={() => onEdit(item)}><Pencil size={15} /></IconButton>
              <IconButton title="Delete" danger disabled={(item._count?.paintings ?? 0) > 0} onClick={() => onDelete(item)}><Trash2 size={15} /></IconButton>
            </ActionGroup>
          </TableCell>
        </TableRow>
      ))}
    />
  );
}

function SurfaceTable({ rows, loading, onEdit, onDelete }) {
  return (
    <DataTable
      title="Surface Management"
      subtitle={`${rows.length} surfaces in use`}
      icon={<Layers size={16} />}
      head={['Name', 'Paintings', 'Actions']}
      loading={loading}
      rows={rows.map((item, i) => (
        <TableRow key={item.name} i={i}>
          <TableCell className="font-medium text-[#f0e6c8]">{item.name}</TableCell>
          <TableCell>
            <StatusBadge variant={(item._count?.paintings ?? 0) > 0 ? 'blue' : 'gray'}>
              {item._count?.paintings ?? 0} paintings
            </StatusBadge>
          </TableCell>
          <TableCell>
            <ActionGroup>
              <IconButton title="Edit" onClick={() => onEdit(item)}><Pencil size={15} /></IconButton>
              <IconButton title="Remove from paintings" danger onClick={() => onDelete(item)}><Trash2 size={15} /></IconButton>
            </ActionGroup>
          </TableCell>
        </TableRow>
      ))}
    />
  );
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

function Field({ label, value, onChange, required = false }) {
  return <label className="admin-field admin-field--wide"><span>{label}</span><input value={value} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}
