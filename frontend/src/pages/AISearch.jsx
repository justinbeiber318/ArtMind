import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const EXAMPLES = [
  'Show abstract blue paintings',
  'Find watercolor landscape art',
  'Calm minimalist works on paper',
  'Bold red portraits, most popular first',
];

export default function AISearch() {
  const [query, setQuery] = useState('');

  const search = useMutation({
    mutationFn: (q) => searchApi.nl(q),
  });

  const run = (q) => {
    const value = (q ?? query).trim();
    if (value.length < 2) return;
    setQuery(value);
    search.mutate(value);
  };

  const result = search.data;
  const filters = result?.meta?.parsedFilters;

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">Natural Language Search</div>
          <h1>Describe what you want to see</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
            Aurelis interprets plain-language requests — style, subject, color, and mood — and
            translates them into a filtered search across the collection.
          </p>
        </div>
      </div>

      <section className="section container">
        <form onSubmit={(e) => { e.preventDefault(); run(); }}
          style={{ display: 'flex', gap: 12, maxWidth: 720 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Show abstract blue paintings"
            style={{ flex: 1, padding: '14px 16px', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '1rem' }} />
          <button className="btn" disabled={search.isPending}>
            {search.isPending ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="tag" style={{ cursor: 'pointer' }}
              onClick={() => run(ex)}>{ex}</button>
          ))}
        </div>

        {filters && (
          <div style={{ marginTop: 28, padding: 18, background: 'var(--light-gray)' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Interpreted as</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.85rem' }}>
              {Object.entries(filters).filter(([, v]) => v).length === 0 && (
                <span className="muted">Free-text search across titles and descriptions.</span>
              )}
              {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
                <span key={k} className="tag">{k}: {String(v)}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 36 }}>
          {search.isPending ? (
            <div className="spinner" />
          ) : result ? (
            result.data.length === 0 ? (
              <p className="muted center" style={{ padding: '32px 0' }}>No works matched that description.</p>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: 20 }}>{result.meta.total} result(s)</p>
                <div className="grid grid--cards">
                  {result.data.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
                </div>
              </>
            )
          ) : (
            <p className="muted center" style={{ padding: '32px 0' }}>Enter a description above to begin.</p>
          )}
          {search.isError && (
            <p className="form-error center">Search is rate-limited or temporarily unavailable. Please try again shortly.</p>
          )}
        </div>
      </section>
    </>
  );
}
