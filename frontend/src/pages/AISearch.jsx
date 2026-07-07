import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BrainCircuit, Search, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { paintingApi, searchApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

const FALLBACK_PROMPT_KEYS = [
  'ai_fallback_blue_abstract',
  'ai_fallback_calm_paper',
  'ai_fallback_landscape',
];

export default function AISearch() {
  const { t } = useTranslation();
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
      if (artist) return t('ai_prompt_artist', { artist });
      return t('ai_prompt_similar', { title: painting.title });
    });
    return fromCollection.length ? fromCollection : FALLBACK_PROMPT_KEYS.map((key) => t(key));
  }, [collection.data, t]);

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
          <div className="eyebrow">{t('ai_search')}</div>
          <h1>{t('ai_search_title')}</h1>
          <p className="muted">{t('ai_search_intro')}</p>
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
                placeholder={t('ai_search_placeholder')}
              />
              {query && (
                <button type="button" className="ai-search-clear" onClick={() => setQuery('')} aria-label={t('clear')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="ai-search-actions">
              <button className="btn" disabled={search.isPending || query.trim().length < 2}>
                {search.isPending ? t('searching') : t('search')}
              </button>
              {result && <button type="button" className="btn btn--ghost" onClick={reset}>{t('reset')}</button>}
            </div>
          </form>

          <div className="ai-search-simple-suggestions">
            <div className="ai-search-label"><Sparkles size={14} /> {t('suggestions')}</div>
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
              <div className="eyebrow">{t('understood')}</div>
              <p className="muted">{lastQuery}</p>
            </div>
            <div className="ai-search-filter-list">
              {activeFilters.length === 0 ? (
                <span className="muted">{t('searching_titles')}</span>
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
                <h2>{t('no_matching_works')}</h2>
                <p className="muted">{t('try_broader_search')}</p>
              </div>
            ) : (
              <>
                <div className="ai-search-result-head">
                  <div>
                    <div className="eyebrow">{t('results')}</div>
                    <h2>{t('works_count', { count: result.meta.total })}</h2>
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
              <h2>{t('ai_search_empty_title')}</h2>
              <p className="muted">{t('ai_search_empty_example')}</p>
            </div>
          )}

          {search.isError && (
            <p className="form-error center">{t('ai_search_error')}</p>
          )}
        </div>
      </section>
    </>
  );
}
