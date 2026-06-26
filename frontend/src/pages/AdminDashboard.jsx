import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  analyticsApi, artistApi, authApi, categoryApi, paintingApi, userApi,
} from '../api/endpoints.js';
import { logout } from '../features/auth/authSlice.js';
import i18n from '../i18n';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const GOLD = '#d4af5f';
const GOLD_SOFT = '#b8944f';
const CHART_COLORS = ['#d4af5f', '#b8944f', '#8f773f', '#6f5d34', '#514426', '#302819'];

const MENU = [
  ['dashboard', 'dashboard', 'dashboard'],
  ['paintings', 'image', 'painting_management'],
  ['categories', 'grid', 'categories'],
  ['artists', 'brush', 'artists'],
  ['chatbot', 'chat', 'chatbot_management'],
  ['users', 'users', 'user_management'],
  ['analytics', 'chart', 'analytics'],
];

const ADMIN_TEXT = {
  en: {
    dashboard: 'Dashboard',
    painting_management: 'Painting Management',
    categories: 'Categories',
    artists: 'Artists',
    chatbot_management: 'Chatbot Management',
    user_management: 'User Management',
    analytics: 'Analytics',
    admin: 'Admin',
    logout: 'Logout',
    total_paintings: 'Total Paintings',
    total_categories: 'Total Categories',
    total_artists: 'Total Artists',
    total_users: 'Total Users',
    total_favorites: 'Total Favorites',
    total_views: 'Total Views',
    total_ai_searches: 'Total AI Searches',
    chatbot_conversations: 'Chatbot Conversations',
    monthly_user_growth: 'Monthly User Growth',
    most_viewed_paintings: 'Most Viewed Paintings',
    top_categories: 'Top Categories',
    user_activity: 'User Activity',
    ai_recommendation_usage: 'AI Recommendation Usage',
    recent_users: 'Recent Users',
    latest_uploaded_paintings: 'Latest Uploaded Paintings',
    trending_paintings: 'Trending Paintings',
    ai_system_status: 'AI System Status',
    create_category: 'Create Category',
    category_name: 'Category Name',
    create: 'Create',
    add_artist: 'Add Artist',
    artist_directory: 'Artist Directory',
    add_painting: 'Add Painting',
    edit_painting: 'Edit Painting',
    painting_library: 'Painting Library',
    save_changes: 'Save Changes',
    clear: 'Clear',
    search: 'Search',
    status: 'Status',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    export_pdf: 'PDF',
    export_excel: 'Excel',
    export_csv: 'CSV',
    enabled: 'Enabled',
    save: 'Save',
  },
  vi: {
    dashboard: 'Tổng quan',
    painting_management: 'Quản lý tranh',
    categories: 'Danh mục',
    artists: 'Nghệ sĩ',
    chatbot_management: 'Quản lý chatbot',
    user_management: 'Quản lý người dùng',
    analytics: 'Phân tích',
    admin: 'Quản trị',
    logout: 'Đăng xuất',
    total_paintings: 'Tổng số tranh',
    total_categories: 'Tổng danh mục',
    total_artists: 'Tổng nghệ sĩ',
    total_users: 'Tổng người dùng',
    total_favorites: 'Tổng yêu thích',
    total_views: 'Tổng lượt xem',
    total_ai_searches: 'Tổng tìm kiếm AI',
    chatbot_conversations: 'Cuộc trò chuyện chatbot',
    monthly_user_growth: 'Tăng trưởng người dùng theo tháng',
    most_viewed_paintings: 'Tranh được xem nhiều',
    top_categories: 'Danh mục nổi bật',
    user_activity: 'Hoạt động người dùng',
    ai_recommendation_usage: 'Mức dùng gợi ý AI',
    recent_users: 'Người dùng mới',
    latest_uploaded_paintings: 'Tranh tải lên mới',
    trending_paintings: 'Tranh xu hướng',
    ai_system_status: 'Trạng thái hệ thống AI',
    create_category: 'Tạo danh mục',
    category_name: 'Tên danh mục',
    create: 'Tạo',
    add_artist: 'Thêm nghệ sĩ',
    artist_directory: 'Danh sách nghệ sĩ',
    add_painting: 'Thêm tranh',
    edit_painting: 'Sửa tranh',
    painting_library: 'Thư viện tranh',
    save_changes: 'Lưu thay đổi',
    clear: 'Xóa form',
    search: 'Tìm kiếm',
    status: 'Trạng thái',
    actions: 'Thao tác',
    view: 'Xem',
    edit: 'Sửa',
    delete: 'Xóa',
    export_pdf: 'PDF',
    export_excel: 'Excel',
    export_csv: 'CSV',
    enabled: 'Đang bật',
    save: 'Lưu',
  },
  fr: {
    dashboard: 'Tableau de bord',
    painting_management: 'Gestion des peintures',
    categories: 'Catégories',
    artists: 'Artistes',
    chatbot_management: 'Gestion du chatbot',
    user_management: 'Gestion des utilisateurs',
    analytics: 'Analytique',
    admin: 'Admin',
    logout: 'Déconnexion',
  },
  ja: {
    dashboard: 'ダッシュボード',
    painting_management: '作品管理',
    categories: 'カテゴリ',
    artists: 'アーティスト',
    chatbot_management: 'チャットボット管理',
    user_management: 'ユーザー管理',
    analytics: '分析',
    admin: '管理',
    logout: 'ログアウト',
  },
  ko: {
    dashboard: '대시보드',
    painting_management: '작품 관리',
    categories: '카테고리',
    artists: '아티스트',
    chatbot_management: '챗봇 관리',
    user_management: '사용자 관리',
    analytics: '분석',
    admin: '관리',
    logout: '로그아웃',
  },
};

function useAdminText() {
  const { i18n: instance } = useTranslation();
  const lang = instance.language?.split('-')[0] || 'en';
  return (key) => ADMIN_TEXT[lang]?.[key] || ADMIN_TEXT.en[key] || key;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#8a8a8a' } },
    y: { grid: { color: '#242424' }, beginAtZero: true, ticks: { color: '#8a8a8a' } },
  },
};

const statusOptions = ['Published', 'Draft', 'Hidden', 'Pending Review'];
const sampleCategories = ['Abstract', 'Landscape', 'Flower', 'Nature', 'Figurative', 'Religious'];
const sampleQuestions = [
  ['guest', 'What is Impressionism?', 'Impressionism focuses on light, movement, and fleeting perception.', 'Today'],
  ['demo@artmind.test', 'Recommend flower paintings', 'Try filtering Gallery by Flower and Nature categories.', 'Yesterday'],
];

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState('');
  const tAdmin = useAdminText();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activeKey = MENU.find(([key]) => key === active)?.[2] || 'dashboard';
  const activeLabel = tAdmin(activeKey);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className={`admin-shell ${collapsed ? 'admin-shell--collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <button className="admin-icon-btn" onClick={() => setCollapsed((v) => !v)} aria-label="Toggle sidebar">
            <span />
            <span />
            <span />
          </button>
          {!collapsed && <strong>AURELIS ADMIN</strong>}
        </div>

        <nav className="admin-menu">
          {MENU.map(([key, icon, labelKey]) => (
            <button
              key={key}
              className={`admin-menu__item ${active === key ? 'is-active' : ''}`}
              onClick={() => setActive(key)}
              title={tAdmin(labelKey)}
            >
              <span className="admin-menu__icon"><AdminIcon name={icon} /></span>
              {!collapsed && <span>{tAdmin(labelKey)}</span>}
            </button>
          ))}
        </nav>

        <button className="admin-menu__item admin-menu__logout" onClick={handleLogout} title={tAdmin('logout')}>
          <span className="admin-menu__icon"><AdminIcon name="logout" /></span>
          {!collapsed && <span>{tAdmin('logout')}</span>}
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumb">{tAdmin('admin')} / {activeLabel}</div>
            <h1>{activeLabel}</h1>
          </div>
          <div className="admin-topbar__actions">
            <select
              value={i18n.language}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                localStorage.setItem('language', e.target.value);
              }}
              className="admin-language"
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ja">JA</option>
              <option value="ko">KO</option>
            </select>
          </div>
        </header>

        {notice && <div className="admin-toast" onClick={() => setNotice('')}>{notice}</div>}

        <main className="admin-content">
          {active === 'dashboard' && <DashboardOverview />}
          {active === 'paintings' && <PaintingManagement setNotice={setNotice} />}
          {active === 'categories' && <CategoryManagement setNotice={setNotice} />}
          {active === 'artists' && <ArtistManagement setNotice={setNotice} />}
          {active === 'chatbot' && <ChatbotManagement />}
          {active === 'users' && <UserManagement setNotice={setNotice} />}
          {active === 'analytics' && <Analytics />}
        </main>
      </div>
    </div>
  );
}

function AdminIcon({ name }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="8" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="15" width="7" height="6" /></>,
    image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8" cy="10" r="1.6" /><path d="M21 16l-5-5-4 4-2-2-5 5" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
    brush: <><path d="M4 20c2.5 0 4-1.5 4-4" /><path d="M7 17l10.5-10.5a2.1 2.1 0 013 3L10 20" /><path d="M14 7l3 3" /></>,
    chat: <><path d="M5 5h14v10H8l-4 4V6a1 1 0 011-1z" /><path d="M8 9h8M8 12h5" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><circle cx="17" cy="9" r="2" /><path d="M15.5 16.5A4 4 0 0120.5 20" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><rect x="7" y="11" width="3" height="5" /><rect x="12" y="8" width="3" height="8" /><rect x="17" y="4" width="3" height="12" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 4v16" /></>,
  };
  return <svg {...common}>{paths[name] || paths.dashboard}</svg>;
}

function DashboardOverview() {
  const tAdmin = useAdminText();
  const overview = useQuery({ queryKey: ['admin-overview'], queryFn: analyticsApi.overview });
  const mostViewed = useQuery({ queryKey: ['admin-most-viewed'], queryFn: analyticsApi.mostViewed });
  const categories = useQuery({ queryKey: ['admin-categories-analytics'], queryFn: analyticsApi.categories });
  const growth = useQuery({ queryKey: ['admin-user-growth'], queryFn: analyticsApi.userGrowth });
  const aiLogs = useQuery({ queryKey: ['admin-ai-logs'], queryFn: analyticsApi.aiLogs });
  const paintings = useQuery({ queryKey: ['admin-latest-paintings'], queryFn: () => paintingApi.adminList({ limit: 6, sort: 'newest' }) });
  const users = useQuery({ queryKey: ['admin-recent-users'], queryFn: () => userApi.list({ limit: 6 }) });

  const o = overview.data || {};
  const paintingRows = paintings.data?.data || [];
  const userRows = users.data?.data || [];

  return (
    <div className="admin-stack">
      <div className="admin-grid admin-grid--cards">
        <Metric label={tAdmin('total_paintings')} value={o.paintings} />
        <Metric label={tAdmin('total_categories')} value={o.categories ?? categories.data?.length} />
        <Metric label={tAdmin('total_artists')} value={o.artists} />
        <Metric label={tAdmin('total_users')} value={o.users} />
        <Metric label={tAdmin('total_favorites')} value={o.favorites ?? 0} />
        <Metric label={tAdmin('total_views')} value={o.totalViews} />
        <Metric label={tAdmin('total_ai_searches')} value={o.searches} />
        <Metric label={tAdmin('chatbot_conversations')} value={aiLogs.data?.length} />
      </div>

      <div className="admin-grid admin-grid--charts">
        <ChartCard title={tAdmin('monthly_user_growth')}>
          <Line data={{
            labels: (growth.data || []).map((d) => d.date.slice(5)),
            datasets: [{ data: (growth.data || []).map((d) => d.count), borderColor: GOLD, backgroundColor: GOLD, tension: 0.35, pointRadius: 2 }],
          }} options={chartOptions} />
        </ChartCard>
        <ChartCard title={tAdmin('most_viewed_paintings')}>
          <Bar data={{
            labels: (mostViewed.data || []).map((p) => p.title),
            datasets: [{ data: (mostViewed.data || []).map((p) => p.viewCount), backgroundColor: GOLD }],
          }} options={{ ...chartOptions, indexAxis: 'y' }} />
        </ChartCard>
        <ChartCard title={tAdmin('top_categories')}>
          <Doughnut data={{
            labels: (categories.data || []).map((c) => c.category),
            datasets: [{ data: (categories.data || []).map((c) => c.views), backgroundColor: CHART_COLORS }],
          }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f0e6c8' } } } }} />
        </ChartCard>
        <ChartCard title={tAdmin('user_activity')}>
          <Bar data={sampleBar(['Views', 'Favorites', 'Searches', 'Uploads'], [62, 38, 51, 19])} options={chartOptions} />
        </ChartCard>
        <ChartCard title={tAdmin('ai_recommendation_usage')}>
          <Line data={sampleLine(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], [24, 42, 39, 61, 58, 77])} options={chartOptions} />
        </ChartCard>
      </div>

      <div className="admin-grid admin-grid--widgets">
        <Widget title={tAdmin('recent_users')} items={userRows.map((u) => `${u.name} - ${u.email}`)} />
        <Widget title={tAdmin('latest_uploaded_paintings')} items={paintingRows.map((p) => p.title)} />
        <Widget title={tAdmin('trending_paintings')} items={(mostViewed.data || []).slice(0, 5).map((p) => `${p.title} - ${p.viewCount} views`)} />
        <div className="admin-card">
          <h3>{tAdmin('ai_system_status')}</h3>
          <StatusRow label="OpenAI Connection" status="Operational" />
          <StatusRow label="Recommendation Engine" status="Operational" />
          <StatusRow label="Image Recognition" status="Monitoring" />
          <StatusRow label="Last Sync" status="2 minutes ago" />
        </div>
      </div>
    </div>
  );
}

function PaintingManagement({ setNotice }) {
  const tAdmin = useAdminText();
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ search: '', category: '', artist: '', style: '', status: '' });
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultPaintingForm);
  const paintings = useQuery({ queryKey: ['admin-paintings'], queryFn: () => paintingApi.adminList({ limit: 100, sort: 'newest' }) });
  const categories = useQuery({ queryKey: ['admin-category-list'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['admin-style-list'], queryFn: categoryApi.styles });
  const artists = useQuery({ queryKey: ['admin-artist-list'], queryFn: () => artistApi.list({ limit: 100 }) });
  const rows = useFilteredPaintings(paintings.data?.data || [], filters);

  const save = useMutation({
    mutationFn: (payload) => editing ? paintingApi.update(editing.id, payload) : paintingApi.create(payload),
    onSuccess: () => {
      setNotice(editing ? 'Painting updated.' : 'Painting created.');
      setEditing(null);
      setForm(defaultPaintingForm);
      qc.invalidateQueries({ queryKey: ['admin-paintings'] });
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
  const remove = useMutation({
    mutationFn: paintingApi.remove,
    onSuccess: () => {
      setNotice('Painting deleted.');
      qc.invalidateQueries({ queryKey: ['admin-paintings'] });
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
  const moderation = useMutation({
    mutationFn: ({ id, approved }) => paintingApi.update(id, { featured: approved }),
    onSuccess: (_data, variables) => {
      setNotice(variables.approved ? 'Painting approved for gallery.' : 'Painting hidden from gallery.');
      qc.invalidateQueries({ queryKey: ['admin-paintings'] });
      qc.invalidateQueries({ queryKey: ['admin-latest-paintings'] });
      qc.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      thumbnailUrl: form.imageUrl,
      medium: form.medium,
      surface: form.surface,
      price: Number(form.price || 0),
      artistId: Number(form.artistId),
      categoryId: Number(form.categoryId),
      styleId: form.styleId ? Number(form.styleId) : undefined,
      dominantColors: form.aiTags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: form.status === 'Published',
    };
    save.mutate(payload);
  };

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      artistId: p.artistId || p.artist?.id || '',
      categoryId: p.categoryId || p.category?.id || '',
      styleId: p.styleId || p.style?.id || '',
      surface: p.surface || '',
      medium: p.medium || '',
      description: p.description || '',
      price: p.price || '',
      imageUrl: p.imageUrl || '',
      aiTags: (p.dominantColors || []).join(', '),
      status: paintingStatus(p),
    });
  };

  const runBulk = async (label) => {
    if (!selected.length) return;
    const selectedRows = rows.filter((p) => selected.includes(p.id));
    if (label === 'Delete Multiple') {
      await Promise.all(selectedRows.map((p) => paintingApi.remove(p.id)));
    }
    if (label === 'Publish Multiple') {
      await Promise.all(selectedRows.map((p) => paintingApi.update(p.id, { featured: true })));
    }
    if (label === 'Hide Multiple') {
      await Promise.all(selectedRows.map((p) => paintingApi.update(p.id, { featured: false })));
    }
    setSelected([]);
    setNotice(`${label} applied to ${selectedRows.length} painting(s).`);
    qc.invalidateQueries({ queryKey: ['admin-paintings'] });
    qc.invalidateQueries({ queryKey: ['admin-latest-paintings'] });
    qc.invalidateQueries({ queryKey: ['gallery'] });
  };

  return (
    <div className="admin-stack">
      <Panel title={editing ? tAdmin('edit_painting') : tAdmin('add_painting')} action={<button className="admin-ghost" onClick={() => { setEditing(null); setForm(defaultPaintingForm); }}>{tAdmin('clear')}</button>}>
        <form className="admin-form" onSubmit={submit}>
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <SelectField label="Artist" value={form.artistId} onChange={(v) => setForm({ ...form, artistId: v })} options={(artists.data?.data || []).map((a) => [a.id, a.name])} />
          <SelectField label="Category" value={form.categoryId} onChange={(v) => setForm({ ...form, categoryId: v })} options={(categories.data || []).map((c) => [c.id, c.name])} />
          <SelectField label="Style" value={form.styleId} onChange={(v) => setForm({ ...form, styleId: v })} options={(styles.data || []).map((s) => [s.id, s.name])} optional />
          <Field label="Surface Material" value={form.surface} onChange={(v) => setForm({ ...form, surface: v })} />
          <Field label="Color Medium" value={form.medium} onChange={(v) => setForm({ ...form, medium: v })} />
          <Field label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <SelectField label={tAdmin('status')} value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={statusOptions.map((s) => [s, s])} />
          <Field label="Upload Images / Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} required />
          <Field label="AI Tags" value={form.aiTags} onChange={(v) => setForm({ ...form, aiTags: v })} placeholder="#d4af5f, abstract, gold" />
          <label className="admin-field admin-field--wide"><span>Description</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <button className="admin-primary" disabled={save.isPending}>{save.isPending ? 'Saving...' : editing ? tAdmin('save_changes') : tAdmin('add_painting')}</button>
        </form>
      </Panel>

      <Panel title={tAdmin('painting_library')} action={<BulkActions selected={selected.length} onRun={runBulk} />}>
        <div className="admin-filters">
          <Field label={tAdmin('search')} value={filters.search} onChange={(v) => setFilters({ ...filters, search: v })} />
          <Field label="Category" value={filters.category} onChange={(v) => setFilters({ ...filters, category: v })} />
          <Field label="Artist" value={filters.artist} onChange={(v) => setFilters({ ...filters, artist: v })} />
          <Field label="Style" value={filters.style} onChange={(v) => setFilters({ ...filters, style: v })} />
          <SelectField label={tAdmin('status')} value={filters.status} onChange={(v) => setFilters({ ...filters, status: v })} options={statusOptions.map((s) => [s, s])} optional />
        </div>
        {paintings.isLoading ? <SkeletonRows /> : (
          <DataTable
            head={['', 'Image', 'Painting Name', 'Artist', 'Category', 'Style', 'Surface Type', 'Color Medium', 'Price', tAdmin('status'), 'Created Date', tAdmin('actions')]}
            rows={rows}
            render={(p) => [
              <input type="checkbox" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id))} />,
              <img src={p.thumbnailUrl || p.imageUrl} alt="" className="admin-thumb" />,
              p.title,
              p.artist?.name || '-',
              p.category?.name || '-',
              p.style?.name || '-',
              p.surface || '-',
              p.medium || '-',
              money(p.price),
              <Badge>{paintingStatus(p)}</Badge>,
              p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-',
              <div className="admin-row-actions">
                {p.uploadedById && !p.featured && <button disabled={moderation.isPending} onClick={() => moderation.mutate({ id: p.id, approved: true })}>Approve</button>}
                {p.uploadedById && p.featured && <button disabled={moderation.isPending} onClick={() => moderation.mutate({ id: p.id, approved: false })}>Hide</button>}
                <button onClick={() => setNotice(`Viewing ${p.title}`)}>View</button>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => remove.mutate(p.id)}>Delete</button>
              </div>,
            ]}
          />
        )}
      </Panel>
    </div>
  );
}

const defaultPaintingForm = {
  title: '', artistId: '', categoryId: '', styleId: '', surface: '', medium: '',
  description: '', price: '', imageUrl: '', aiTags: '', status: 'Draft',
};

function CategoryManagement({ setNotice }) {
  const tAdmin = useAdminText();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const categories = useQuery({ queryKey: ['admin-categories'], queryFn: categoryApi.list });
  const create = useMutation({
    mutationFn: () => categoryApi.create({ name }),
    onSuccess: () => { setName(''); setNotice('Category created.'); qc.invalidateQueries({ queryKey: ['admin-categories'] }); },
  });
  const remove = useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => { setNotice('Category deleted.'); qc.invalidateQueries({ queryKey: ['admin-categories'] }); },
  });
  const rows = categories.data?.length ? categories.data : sampleCategories.map((name, i) => ({ id: `s-${i}`, name, _count: { paintings: 0 }, sample: true }));

  return (
    <div className="admin-stack">
      <Panel title={tAdmin('create_category')}>
        <div className="admin-inline">
          <Field label={tAdmin('category_name')} value={name} onChange={setName} placeholder="Abstract" />
          <button className="admin-primary" onClick={() => create.mutate()} disabled={!name || create.isPending}>{tAdmin('create')}</button>
        </div>
      </Panel>
      <div className="admin-grid admin-grid--category">
        {rows.map((c) => (
          <div className="admin-card admin-category-card" key={c.id}>
            <div className="admin-category-card__image">{c.name.slice(0, 2).toUpperCase()}</div>
            <h3>{c.name}</h3>
            <p>{c._count?.paintings ?? 0} paintings</p>
            <Badge>{c.sample ? 'Sample' : 'Active'}</Badge>
            <div className="admin-row-actions">
              <button onClick={() => setNotice(`Edit ${c.name}`)}>Edit</button>
              <button disabled={c.sample} onClick={() => remove.mutate(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtistManagement({ setNotice }) {
  const tAdmin = useAdminText();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', bio: '', nationality: '', portraitUrl: '', socialLinks: '' });
  const artists = useQuery({ queryKey: ['admin-artists'], queryFn: () => artistApi.list({ limit: 100 }) });
  const create = useMutation({
    mutationFn: () => artistApi.create({ name: form.name, bio: form.bio, nationality: form.nationality, portraitUrl: form.portraitUrl || undefined }),
    onSuccess: () => { setForm({ name: '', bio: '', nationality: '', portraitUrl: '', socialLinks: '' }); setNotice('Artist created.'); qc.invalidateQueries({ queryKey: ['admin-artists'] }); },
  });
  const remove = useMutation({
    mutationFn: artistApi.remove,
    onSuccess: () => { setNotice('Artist deleted.'); qc.invalidateQueries({ queryKey: ['admin-artists'] }); },
  });

  return (
    <div className="admin-stack">
      <Panel title={tAdmin('add_artist')}>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Nationality" value={form.nationality} onChange={(v) => setForm({ ...form, nationality: v })} />
          <Field label="Profile Image" value={form.portraitUrl} onChange={(v) => setForm({ ...form, portraitUrl: v })} />
          <Field label="Social Links" value={form.socialLinks} onChange={(v) => setForm({ ...form, socialLinks: v })} placeholder="website, instagram" />
          <label className="admin-field admin-field--wide"><span>Biography</span><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
          <button className="admin-primary" disabled={!form.name || create.isPending}>{tAdmin('add_artist')}</button>
        </form>
      </Panel>
      <Panel title={tAdmin('artist_directory')}>
        <DataTable
          head={['Profile', 'Name', 'Biography', 'Nationality', 'Number of Paintings', 'Social Links', 'Actions']}
          rows={artists.data?.data || []}
          render={(a) => [
            a.portraitUrl ? <img src={a.portraitUrl} alt="" className="admin-avatar" /> : <span className="admin-avatar">{initials(a.name)}</span>,
            a.name,
            truncate(a.bio, 80),
            a.nationality || '-',
            a._count?.paintings ?? 0,
            '-',
            <RowActions onView={() => setNotice(`Viewing ${a.name}`)} onEdit={() => setNotice(`Edit ${a.name}`)} onDelete={() => remove.mutate(a.id)} />,
          ]}
        />
      </Panel>
    </div>
  );
}

function ChatbotManagement() {
  const logs = useQuery({ queryKey: ['admin-chatbot-logs'], queryFn: analyticsApi.aiLogs });
  return (
    <div className="admin-stack">
      <div className="admin-grid admin-grid--cards">
        <Metric label="Total Conversations" value={logs.data?.length} />
        <Metric label="Active Users" value="12" />
        <Metric label="Average Response Time" value="1.2s" />
        <Metric label="Satisfaction Score" value="94%" />
      </div>
      <div className="admin-grid admin-grid--two">
        <Panel title="AI Prompt Configuration">
          <textarea className="admin-textarea" defaultValue="You are the Aurelis gallery concierge. Detect the visitor language and answer in the same language." />
        </Panel>
        <Panel title="Knowledge Base Management">
          <Widget title="Most Asked Questions" items={['What is Impressionism?', 'How do I search by color?', 'Can AI identify my painting?']} />
        </Panel>
      </div>
      <Panel title="Chat History">
        <DataTable head={['User', 'Question', 'AI Answer', 'Date']} rows={logs.data || sampleQuestions} render={(l) => Array.isArray(l) ? l : [l.user?.email || 'guest', truncate(l.prompt, 80), truncate(l.response, 100), new Date(l.createdAt).toLocaleString()]} />
      </Panel>
    </div>
  );
}

function UserManagement({ setNotice }) {
  const tAdmin = useAdminText();
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ['admin-users'], queryFn: () => userApi.list({ limit: 100 }) });
  const role = useMutation({
    mutationFn: ({ id, nextRole }) => userApi.setRole(id, nextRole),
    onSuccess: () => { setNotice('User role updated.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });
  const remove = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => { setNotice('User deleted.'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
  });
  return (
    <Panel title={tAdmin('user_management')}>
      <DataTable
        head={['Avatar', 'Name', 'Email', 'Role', tAdmin('status'), 'Registration Date', tAdmin('actions')]}
        rows={users.data?.data || []}
        render={(u) => [
          <span className="admin-avatar">{initials(u.name)}</span>,
          u.name,
          u.email,
          <select value={u.role} onChange={(e) => role.mutate({ id: u.id, nextRole: e.target.value })}><option>USER</option><option>ADMIN</option></select>,
          <Badge>Active</Badge>,
          new Date(u.createdAt).toLocaleDateString(),
          <RowActions onView={() => setNotice(`Viewing ${u.email}`)} onEdit={() => setNotice('User edit drawer opened.')} onDelete={() => remove.mutate(u.id)} labels={['View', 'Block', 'Delete']} />,
        ]}
      />
      <p className="admin-note">Role model suggestion: User, Content Admin, AI Admin, Super Admin.</p>
    </Panel>
  );
}

function Analytics() {
  const growth = useQuery({ queryKey: ['analytics-growth'], queryFn: analyticsApi.userGrowth });
  const categories = useQuery({ queryKey: ['analytics-categories'], queryFn: analyticsApi.categories });
  return (
    <div className="admin-stack">
      <div className="admin-filters"><button className="admin-ghost">Daily</button><button className="admin-ghost">Weekly</button><button className="admin-primary">Monthly</button><button className="admin-ghost">Yearly</button></div>
      <div className="admin-grid admin-grid--charts">
        <ChartCard title="User Growth"><Line data={{ labels: (growth.data || []).map((d) => d.date.slice(5)), datasets: [{ data: (growth.data || []).map((d) => d.count), borderColor: GOLD, backgroundColor: GOLD }] }} options={chartOptions} /></ChartCard>
        <ChartCard title="Painting Views"><Bar data={sampleBar(['Gallery', 'Details', 'Search', 'PDF'], [440, 310, 210, 80])} options={chartOptions} /></ChartCard>
        <ChartCard title="Favorite Trends"><Line data={sampleLine(['W1', 'W2', 'W3', 'W4'], [18, 25, 32, 44])} options={chartOptions} /></ChartCard>
        <ChartCard title="Search Trends"><Bar data={sampleBar(['Text', 'AI', 'Style', 'Color'], [120, 86, 63, 42])} options={chartOptions} /></ChartCard>
        <ChartCard title="AI Usage"><Line data={sampleLine(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [30, 41, 38, 55, 70])} options={chartOptions} /></ChartCard>
        <ChartCard title="Category Popularity"><Doughnut data={sampleDoughnut((categories.data || []).map((c) => c.category), (categories.data || []).map((c) => c.views))} options={{ responsive: true, maintainAspectRatio: false }} /></ChartCard>
      </div>
    </div>
  );
}

function useFilteredPaintings(rows, filters) {
  return useMemo(() => rows.filter((p) => {
    const haystack = `${p.title} ${p.artist?.name} ${p.category?.name} ${p.style?.name}`.toLowerCase();
    return (!filters.search || haystack.includes(filters.search.toLowerCase()))
      && (!filters.category || (p.category?.name || '').toLowerCase().includes(filters.category.toLowerCase()))
      && (!filters.artist || (p.artist?.name || '').toLowerCase().includes(filters.artist.toLowerCase()))
      && (!filters.style || (p.style?.name || '').toLowerCase().includes(filters.style.toLowerCase()))
      && (!filters.status || paintingStatus(p) === filters.status);
  }), [rows, filters]);
}

function paintingStatus(p) {
  if (p.uploadedById && !p.featured) return 'Pending Review';
  if (p.featured) return 'Published';
  return 'Draft';
}

function Metric({ label, value }) {
  return <div className="admin-card admin-metric"><span>{label}</span><strong>{value ?? '-'}</strong></div>;
}

function Panel({ title, action, children }) {
  return <section className="admin-card"><div className="admin-card__head"><h3>{title}</h3>{action}</div>{children}</section>;
}

function ChartCard({ title, children }) {
  return <Panel title={title}><div className="admin-chart">{children}</div></Panel>;
}

function Widget({ title, items }) {
  return <div className="admin-card"><h3>{title}</h3><ul className="admin-list">{(items.length ? items : ['No data yet']).map((item, i) => <li key={i}>{item}</li>)}</ul></div>;
}

function StatusRow({ label, status }) {
  return <div className="admin-status-row"><span>{label}</span><strong>{status}</strong></div>;
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return <label className="admin-field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} required={required} onChange={(e) => onChange(e.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options, optional }) {
  return <label className="admin-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} required={!optional}><option value="">Select {label}</option>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>;
}

function BulkActions({ selected, onRun }) {
  return <div className="admin-row-actions"><span className="admin-note">{selected} selected</span>{['Delete Multiple', 'Publish Multiple', 'Hide Multiple'].map((label) => <button key={label} disabled={!selected} onClick={() => onRun(label)}>{label}</button>)}</div>;
}

function DataTable({ head, rows, render }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {visible.length ? visible.map((row, i) => <tr key={row.id || i}>{render(row).map((cell, j) => <td key={j}>{cell}</td>)}</tr>) : <tr><td colSpan={head.length} className="admin-empty">No records found.</td></tr>}
        </tbody>
      </table>
      <div className="admin-pagination">
        <button onClick={() => setPage(Math.max(1, page - 1))}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</button>
      </div>
    </div>
  );
}

function RowActions({ onView, onEdit, onDelete, labels = ['View', 'Edit', 'Delete'] }) {
  return <div className="admin-row-actions"><button onClick={onView}>{labels[0]}</button><button onClick={onEdit}>{labels[1]}</button><button onClick={onDelete}>{labels[2]}</button></div>;
}

function Badge({ children }) {
  return <span className="admin-badge">{children}</span>;
}

function Toggle({ label, checked }) {
  return <label className="admin-toggle"><input type="checkbox" defaultChecked={checked} /><span>{label}</span></label>;
}

function SkeletonRows() {
  return <div className="admin-skeleton">{Array.from({ length: 5 }).map((_, i) => <span key={i} />)}</div>;
}

function CodeBlock({ lines }) {
  return <pre className="admin-code">{lines.join('\n')}</pre>;
}

const truncate = (s, n) => (s && s.length > n ? `${s.slice(0, n)}...` : s || '-');
const money = (n) => (n ? `$${Number(n).toLocaleString()}` : '-');
const initials = (name = '') => name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() || 'AD';
const sampleBar = (labels, values) => ({ labels, datasets: [{ data: values, backgroundColor: GOLD }] });
const sampleLine = (labels, values) => ({ labels, datasets: [{ data: values, borderColor: GOLD, backgroundColor: GOLD_SOFT, tension: 0.35 }] });
const sampleDoughnut = (labels, values) => {
  const finalLabels = labels?.length ? labels : sampleCategories;
  return { labels: finalLabels, datasets: [{ data: values?.length ? values : finalLabels.map(() => 1), backgroundColor: CHART_COLORS }] };
};
