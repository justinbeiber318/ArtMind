import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BrainCircuit, Search, Sparkles, X } from 'lucide-react';
import { paintingApi, searchApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const FALLBACK_PROMPTS = [
  'Show blue abstract paintings',
  'Find calm works on paper',
  'Show popular landscape paintings',
];

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  const search = useMutation({
    mutationFn: (value) => searchApi.nl(value, { limit: 12 }),
  });

  const collection = useQuery({
    queryKey: ['ai-search', 'simple-prompts'],
    queryFn: () => paintingApi.list({ limit: 4, sort: 'popular' }),
    staleTime: 5 * 60 * 1000,
  });

  const suggestions = useMemo(() => {
    const paintings = collection.data?.data || [];
    const fromCollection = paintings.slice(0, 3).map((painting) => {
      const artist = painting.artist?.name;
      if (artist) return `Show paintings by ${artist}`;
      return `Find artworks similar to ${painting.title}`;
    });
    return fromCollection.length ? fromCollection : FALLBACK_PROMPTS;
  }, [collection.data]);

  const run = (nextQuery) => {
    const value = (nextQuery ?? query).trim();
    if (value.length < 2) return;
    setQuery(value);
    setLastQuery(value);
    search.mutate(value);
  };

  const reset = () => {
    setQuery('');
    setLastQuery('');
    search.reset();
  };

  const result = search.data;
  const filters = result?.meta?.parsedFilters || {};
  const activeFilters = Object.entries(filters).filter(([, value]) => value);

  return (
    <>
      <div className="page-head ai-search-head">
        <div className="container">
          <div className="eyebrow">AI Search</div>
          <h1>Search the collection naturally</h1>
          <p className="muted">
            Ask by artist, color, style, mood, surface, or a painting you want something similar to.
          </p>
        </div>
      </div>

      <section className="section container ai-search-shell ai-search-shell--simple">
        <div className="ai-search-panel ai-search-panel--simple">
          <form className="ai-search-form" onSubmit={(e) => { e.preventDefault(); run(); }}>
            <div className="ai-search-box">
              <Search size={19} />
              <textarea
                className="ai-search-input"
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. tranh màu xanh giống Water Lilies"
              />
              {query && (
                <button type="button" className="ai-search-clear" onClick={() => setQuery('')} aria-label="Clear">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="ai-search-actions">
              <button className="btn" disabled={search.isPending || query.trim().length < 2}>
                {search.isPending ? 'Searching...' : 'Search'}
              </button>
              {result && <button type="button" className="btn btn--ghost" onClick={reset}>Reset</button>}
            </div>
          </form>

          <div className="ai-search-simple-suggestions">
            <div className="ai-search-label"><Sparkles size={14} /> Suggestions</div>
            <div className="ai-search-chips">
              {suggestions.map((item) => (
                <button key={item} type="button" onClick={() => run(item)}>{item}</button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="ai-search-interpretation ai-search-interpretation--simple">
            <div>
              <div className="eyebrow">Understood</div>
              <p className="muted">{lastQuery}</p>
            </div>
            <div className="ai-search-filter-list">
              {activeFilters.length === 0 ? (
                <span className="muted">Searching titles and descriptions.</span>
              ) : activeFilters.map(([key, value]) => (
                <span key={key} className="tag">{key}: {String(value)}</span>
              ))}
            </div>
          </div>
        )}

        <div className="ai-search-results">
          {search.isPending ? (
            <div className="ai-search-loading">
              {Array.from({ length: 6 }).map((_, index) => <span key={index} />)}
            </div>
          ) : result ? (
            result.data.length === 0 ? (
              <div className="ai-search-empty">
                <BrainCircuit size={28} />
                <h2>No matching works.</h2>
                <p className="muted">Try a broader color, artist, style, or surface.</p>
              </div>
            ) : (
              <>
                <div className="ai-search-result-head">
                  <div>
                    <div className="eyebrow">Results</div>
                    <h2>{result.meta.total} work{result.meta.total === 1 ? '' : 's'}</h2>
                  </div>
                </div>
                <div className="grid grid--cards">
                  {result.data.map((painting, index) => (
                    <PaintingCard key={painting.id} painting={painting} index={index} />
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="ai-search-empty">
              <Sparkles size={28} />
              <h2>Ask for the kind of art you want.</h2>
              <p className="muted">Example: "popular impressionist paintings on canvas".</p>
            </div>
          )}

          {search.isError && (
            <p className="form-error center">
              Search is rate-limited or temporarily unavailable. Please try again shortly.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
