import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, Eye, Pencil, Plus, Trash2, UserCheck, Users } from 'lucide-react';

import { userApi } from '../../api/endpoints';
import DataTable from '../components/ui/DataTable';
import GlassButton from '../components/ui/GlassButton';
import StatusBadge from '../components/ui/StatusBadge';
import TableCell from '../components/ui/TableCell';
import TableRow from '../components/ui/TableRow';

const roleOptions = [
  { label: 'User', value: 'USER' },
  { label: 'Content Admin', value: 'ADMIN' },
  { label: 'AI Admin', value: 'ADMIN' },
  { label: 'Super Admin', value: 'ADMIN' },
];

const roleVariant = {
  ADMIN: 'blue',
  USER: 'gray',
};

const emptyForm = {
  avatarUrl: '',
  name: '',
  email: '',
  password: '',
  role: 'USER',
  status: 'Active',
  bio: '',
};

export default function UsersTable() {
  const queryClient = useQueryClient();
  const [err, setErr] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userApi.list({ limit: 100 }),
  });

  const users = data?.data || [];

  const saveUser = useMutation({
    mutationFn: ({ id, form: values }) => {
      const body = normalizeUser(values, Boolean(id));
      return id ? userApi.updateAdmin(id, body) : userApi.create(body);
    },
    onSuccess: () => {
      closeModal();
      invalidate();
      toast.success('User saved');
    },
    onError: e => toast.error(e?.response?.data?.message || e.message || 'Could not save user.'),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }) => userApi.setStatus(id, status),
    onSuccess: () => {
      invalidate();
      toast.success('User status updated');
    },
    onError: e => toast.error(e?.response?.data?.message || e.message || 'Could not update status.'),
  });

  const deleteUser = useMutation({
    mutationFn: id => userApi.remove(id),
    onSuccess: () => {
      setErr('');
      invalidate();
      toast.success('User deleted');
    },
    onError: e => {
      const msg = e?.response?.data?.message || 'Could not delete this user.';
      setErr(msg);
      toast.error(msg);
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
  }

  function openCreate() {
    setForm(emptyForm);
    setModal({ type: 'form', title: 'Add User' });
  }

  function openEdit(user) {
    setForm({
      avatarUrl: user.avatarUrl || '',
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
      status: user.status || 'Active',
      bio: user.bio || '',
    });
    setModal({ type: 'form', title: 'Edit User', id: user.id });
  }

  function openView(user) {
    setModal({ type: 'view', title: user.name, user });
  }

  function closeModal() {
    setModal(null);
    setForm(emptyForm);
  }

  function handleBlock(user) {
    const nextStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    setStatus.mutate({ id: user.id, status: nextStatus });
  }

  function handleDelete(user) {
    if (window.confirm(`Delete user "${user.name}"?`)) {
      deleteUser.mutate(user.id);
    }
  }

  return (
    <>
      <DataTable
        title="User Management"
        subtitle={`${users.length} registered accounts`}
        icon={<Users size={16} />}
        head={['Avatar', 'Name', 'Email', 'Role', 'Status', 'Registration Date', 'Actions']}
        loading={isLoading}
        error={err}
        actions={<GlassButton primary icon={<Plus size={16} />} onClick={openCreate}>Add User</GlassButton>}
        rows={users.map((user, i) => (
          <TableRow key={user.id} i={i}>
            <TableCell><Avatar src={user.avatarUrl} name={user.name} /></TableCell>
            <TableCell className="font-medium text-[#f0e6c8]">{user.name}</TableCell>
            <TableCell className="text-[#8a8a8a]">{user.email}</TableCell>
            <TableCell>
              <StatusBadge variant={roleVariant[user.role] || 'gray'}>
                {displayRole(user.role)}
              </StatusBadge>
            </TableCell>
            <TableCell>
              <StatusBadge variant={user.status === 'Blocked' ? 'red' : 'emerald'}>
                {user.status || 'Active'}
              </StatusBadge>
            </TableCell>
            <TableCell className="text-[#8a8a8a] text-xs">
              {new Date(user.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <ActionGroup>
                <IconButton title="View" onClick={() => openView(user)}><Eye size={15} /></IconButton>
                <IconButton title="Edit" onClick={() => openEdit(user)}><Pencil size={15} /></IconButton>
                <IconButton title={user.status === 'Blocked' ? 'Unblock' : 'Block'} onClick={() => handleBlock(user)}>
                  {user.status === 'Blocked' ? <UserCheck size={15} /> : <Ban size={15} />}
                </IconButton>
                <IconButton title="Delete" danger onClick={() => handleDelete(user)}><Trash2 size={15} /></IconButton>
              </ActionGroup>
            </TableCell>
          </TableRow>
        ))}
      />

      {modal?.type === 'form' && (
        <AdminModal title={modal.title} onClose={closeModal}>
          <form className="admin-form-grid" onSubmit={(e) => { e.preventDefault(); saveUser.mutate({ id: modal.id, form }); }}>
            <Field label="Avatar URL" value={form.avatarUrl} onChange={(v) => setForm({ ...form, avatarUrl: v })} />
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field label={modal.id ? 'New Password' : 'Password'} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required={!modal.id} />
            <Select label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })}>
              {roleOptions.map((role, index) => <option key={`${role.label}-${index}`} value={role.value}>{role.label}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </Select>
            <TextArea label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
            <div className="admin-form-actions">
              <GlassButton onClick={closeModal}>Cancel</GlassButton>
              <GlassButton primary type="submit" disabled={saveUser.isPending}>{saveUser.isPending ? 'Saving...' : 'Save User'}</GlassButton>
            </div>
          </form>
        </AdminModal>
      )}

      {modal?.type === 'view' && (
        <AdminModal title="User Details" onClose={closeModal}>
          <DetailGrid
            image={modal.user.avatarUrl}
            rows={[
              ['Name', modal.user.name],
              ['Email', modal.user.email],
              ['Role', displayRole(modal.user.role)],
              ['Status', modal.user.status || 'Active'],
              ['Registration Date', new Date(modal.user.createdAt).toLocaleString()],
              ['Biography', modal.user.bio],
            ]}
          />
        </AdminModal>
      )}
    </>
  );
}

function normalizeUser(data, isEdit) {
  const optionalText = (value) => {
    const text = String(value || '').trim();
    if (text) return text;
    return isEdit ? null : undefined;
  };

  const payload = {
    avatarUrl: optionalText(data.avatarUrl),
    name: data.name.trim(),
    email: data.email.trim(),
    role: data.role,
    status: data.status,
    bio: optionalText(data.bio),
  };

  if (data.password || !isEdit) {
    payload.password = data.password;
  }

  return payload;
}

function displayRole(role) {
  return role === 'ADMIN' ? 'Content Admin' : 'User';
}

function Avatar({ src, name }) {
  if (src) return <img src={src} alt={name} className="admin-table-avatar" />;
  return <div className="admin-table-avatar">{name?.[0]?.toUpperCase() || '?'}</div>;
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

function TextArea({ label, value, onChange }) {
  return <label className="admin-field admin-field--wide"><span>{label}</span><textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Select({ label, value, onChange, children }) {
  return <label className="admin-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select></label>;
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
