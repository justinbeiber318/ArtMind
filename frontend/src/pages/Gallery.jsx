import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { paintingApi, categoryApi, artistApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';
import { useTranslation } from 'react-i18next';

const SORTS = [
  { value: 'newest', key: 'newest' },
  { value: 'popular', key: 'popular' },
  { value: 'trending', key: 'trending' },
];

const SURFACES = [
  { value: 'canvas', label: 'Canvas' },
  { value: 'panel', label: 'Panel' },
  { value: 'paper', label: 'Paper' },
  { value: 'linen', label: 'Linen' },
  { value: 'board', label: 'Board' },
];

const PAGE_SIZE = 12;
const TAXONOMY_STALE_TIME = 5 * 60 * 1000;

export default function Gallery() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', style: '', artist: '', surface: '' });
  const [sort, setSort] = useState('newest');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    setSearch(query);
    setSearchTerm(query.trim());
    setFilters({
      category: params.get('category') || '',
      style: params.get('style') || '',
      artist: params.get('artist') || '',
      surface: (params.get('surface') || '').toLowerCase(),
      color: params.get('color') || '',
    });
    const nextSort = params.get('sort');
    if (nextSort && SORTS.some((item) => item.value === nextSort)) setSort(nextSort);
  }, [location.search]);

  useEffect(() => {
    let ts = 0;
    const passive = { passive: true };
    
    const handleWheel = (e) => {
      if (window.scrollY === 0 && e.deltaY < 0) {
        navigate('/', { state: { fromGallery: true } });
      }
    };

    const handleTouchStart = (e) => {
      ts = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const deltaY = e.touches[0].clientY - ts;
      if (window.scrollY === 0 && deltaY > 40) {
        navigate('/', { state: { fromGallery: true } });
      }
    };

    const handleKeyDown = (e) => {
      if (window.scrollY === 0 && (e.key === 'ArrowUp' || e.key === 'w')) {
        navigate('/', { state: { fromGallery: true } });
      }
    };

    window.addEventListener('wheel', handleWheel, passive);
    window.addEventListener('touchstart', handleTouchStart, passive);
    window.addEventListener('touchmove', handleTouchMove, passive);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel, passive);
      window.removeEventListener('touchstart', handleTouchStart, passive);
      window.removeEventListener('touchmove', handleTouchMove, passive);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list, staleTime: TAXONOMY_STALE_TIME });
  const styles = useQuery({ queryKey: ['styles'], queryFn: categoryApi.styles, staleTime: TAXONOMY_STALE_TIME });
  const artists = useQuery({ queryKey: ['artists', 'all'], queryFn: () => artistApi.list({ limit: 50 }), staleTime: TAXONOMY_STALE_TIME });

  const queryParams = useMemo(() => {
    const p = { sort, limit: PAGE_SIZE };
    if (searchTerm) p.search = searchTerm;
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v; });
    return p;
  }, [sort, searchTerm, filters]);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery', queryParams],
    queryFn: ({ pageParam = 1 }) => paintingApi.list({ ...queryParams, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta || {};
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const paintings = useMemo(() => data?.pages.flatMap((pg) => pg.data) || [], [data]);
  const total = data?.pages[0]?.meta?.total ?? 0;

  const scrollToTop = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const updateFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: f[key] === value ? '' : value }));
    scrollToTop();
  }, [scrollToTop]);

  const onSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearchTerm(search.trim());
    scrollToTop();
  }, [scrollToTop, search]);

  const clearAll = useCallback(() => {
    setFilters({ category: '', style: '', artist: '', surface: '' });
    setSearch(''); setSearchTerm(''); setSort('newest');
    navigate('/gallery', { replace: true });
  }, [navigate]);

  return (
    <>
      <div className="page-head gallery-reveal">
        <div className="container">
          <div className="eyebrow">{t('collection')}</div>
          <h1>{t('gallery')}</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {total.toLocaleString()} {t('works_available')}
          </p>
        </div>
      </div>

      <section className="section container gallery-layout">
        {/* Filter rail */}
        <aside
          className="gallery-filters gallery-reveal gallery-reveal--delay"
        >
          <form onSubmit={onSearchSubmit} className="field">
            <label>{t('search')}</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('title_or_description')} />
          </form>

          <FilterGroup label={t('category')}>
            {(categories.data || []).map((c) => (
              <FilterChip key={c.id} active={filters.category === c.slug}
                onClick={() => updateFilter('category', c.slug)}>{c.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={t('style')}>
            {(styles.data || []).map((s) => (
              <FilterChip key={s.id} active={filters.style === s.slug}
                onClick={() => updateFilter('style', s.slug)}>{s.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={t('artist')}>
            {(artists.data?.data || []).map((a) => (
              <FilterChip key={a.id} active={filters.artist === a.slug}
                onClick={() => updateFilter('artist', a.slug)}>{a.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={t('surface')}>
            {SURFACES.map((s) => (
              <FilterChip key={s.value} active={filters.surface === s.value}
                onClick={() => updateFilter('surface', s.value)}>{s.label}</FilterChip>
            ))}
          </FilterGroup>

          <button type="button" className="btn btn--ghost btn--block" onClick={clearAll}
            style={{ marginTop: 8 }}>{t('clear_all')}</button>
        </aside>

        {/* Results */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Link to="/virtual-gallery" className="btn btn--ghost">
              {t('virtual_gallery', { defaultValue: 'Virtual Museum' })}
            </Link>
            <span className="muted" style={{ fontSize: '0.85rem' }}>{t('sort_by')}</span>
            <select value={sort} onChange={(e) => { setSort(e.target.value); scrollToTop(); }}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', background: 'var(--white)', color: 'var(--dark-gray)' }}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="spinner" />
          ) : paintings.length === 0 ? (
            <p className="muted center" style={{ padding: '48px 0' }}>{t('no_results')}</p>
          ) : (
            <>
              <div className="grid grid--cards">
                {paintings.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
              </div>
              <div className="center" style={{ marginTop: 40 }}>
                {hasNextPage && (
                  <button className="btn btn--ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? t('loading') : t('load_more')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

    </>
  );
}

const FilterGroup = memo(function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dark-gray)', fontWeight: 600, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );
});

const FilterChip = memo(function FilterChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={(e) => { e.currentTarget.blur(); onClick(); }}
      style={{
        fontSize: '0.78rem', padding: '5px 11px', cursor: 'pointer',
        border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
        background: active ? 'var(--navy)' : 'transparent',
        color: active ? 'var(--white)' : 'var(--muted)',
        transition: 'all 0.15s ease',
      }}>{children}</button>
  );
});
