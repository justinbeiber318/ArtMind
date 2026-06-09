import { useState, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { paintingApi, categoryApi, artistApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
];

const SURFACES = ['Canvas', 'Panel', 'Paper', 'Linen', 'Board'];

const COLOR_THEMES = [
  { hex: '#1e3a5f', label: 'Navy' },
  { hex: '#2d2d2d', label: 'Charcoal' },
  { hex: '#8b2e2e', label: 'Crimson' },
  { hex: '#c9a227', label: 'Gold' },
  { hex: '#3d6b4f', label: 'Green' },
  { hex: '#f5f5f5', label: 'Ivory' },
];

const PAGE_SIZE = 12;

export default function Gallery() {
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', style: '', artist: '', surface: '', color: '' });
  const [sort, setSort] = useState('newest');

  const categories = useQuery({ queryKey: ['categories'], queryFn: categoryApi.list });
  const styles = useQuery({ queryKey: ['styles'], queryFn: categoryApi.styles });
  const artists = useQuery({ queryKey: ['artists', 'all'], queryFn: () => artistApi.list({ limit: 50 }) });

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

  const paintings = data?.pages.flatMap((pg) => pg.data) || [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  const updateFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: f[key] === value ? '' : value }));

  const onSearchSubmit = (e) => { e.preventDefault(); setSearchTerm(search.trim()); };

  const clearAll = () => {
    setFilters({ category: '', style: '', artist: '', surface: '', color: '' });
    setSearch(''); setSearchTerm(''); setSort('newest');
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">The Collection</div>
          <h1>Gallery</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {total.toLocaleString()} works available to explore.
          </p>
        </div>
      </div>

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>
        {/* Filter rail */}
        <aside style={{ position: 'sticky', top: 90 }}>
          <form onSubmit={onSearchSubmit} className="field">
            <label>Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title or description" />
          </form>

          <FilterGroup label="Category">
            {(categories.data || []).map((c) => (
              <FilterChip key={c.id} active={filters.category === c.slug}
                onClick={() => updateFilter('category', c.slug)}>{c.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Style">
            {(styles.data || []).map((s) => (
              <FilterChip key={s.id} active={filters.style === s.slug}
                onClick={() => updateFilter('style', s.slug)}>{s.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Artist">
            {(artists.data?.data || []).map((a) => (
              <FilterChip key={a.id} active={filters.artist === a.slug}
                onClick={() => updateFilter('artist', a.slug)}>{a.name}</FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Color theme">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COLOR_THEMES.map((c) => (
                <button key={c.hex} type="button" title={c.label}
                  onClick={() => updateFilter('color', c.hex)}
                  style={{
                    width: 26, height: 26, background: c.hex, cursor: 'pointer',
                    border: filters.color === c.hex ? '2px solid var(--navy)' : '1px solid var(--border)',
                    outline: filters.color === c.hex ? '2px solid var(--light-gray)' : 'none',
                  }} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Surface">
            {SURFACES.map((s) => (
              <FilterChip key={s} active={filters.surface === s}
                onClick={() => updateFilter('surface', s)}>{s}</FilterChip>
            ))}
          </FilterGroup>

          <button type="button" className="btn btn--ghost btn--block" onClick={clearAll}
            style={{ marginTop: 8 }}>Clear all</button>
        </aside>

        {/* Results */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span className="muted" style={{ fontSize: '0.85rem' }}>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="spinner" />
          ) : paintings.length === 0 ? (
            <p className="muted center" style={{ padding: '48px 0' }}>No works match these filters.</p>
          ) : (
            <>
              <div className="grid grid--cards">
                {paintings.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
              </div>
              <div className="center" style={{ marginTop: 40 }}>
                {hasNextPage && (
                  <button className="btn btn--ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading…' : 'Load more works'}
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

function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dark-gray)', fontWeight: 600, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        fontSize: '0.78rem', padding: '5px 11px', cursor: 'pointer',
        border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
        background: active ? 'var(--navy)' : 'transparent',
        color: active ? 'var(--white)' : 'var(--muted)',
        transition: 'all 0.15s ease',
      }}>{children}</button>
  );
}
