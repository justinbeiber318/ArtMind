import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { favoriteApi, recognitionApi } from '../api/endpoints.js';
import { selectIsAuthed } from '../features/auth/authSlice.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function AIRecognition() {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const qc = useQueryClient();
  const isAuthed = useSelector(selectIsAuthed);
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('result');

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const savedResult = useQuery({
    queryKey: ['recognition', resultId],
    queryFn: () => recognitionApi.result(resultId),
    enabled: Boolean(resultId && isAuthed),
  });

  useEffect(() => {
    if (savedResult.data) {
      setResult(savedResult.data);
      setPreview(savedResult.data.imageUrl || savedResult.data.thumbnailUrl || '');
      setFile(null);
      setError('');
    }
  }, [savedResult.data]);

  const analyze = useMutation({
    mutationFn: (imageFile) => recognitionApi.analyze(imageFile),
    onSuccess: (data) => {
      setProgress(100);
      setResult(data);
      qc.invalidateQueries({ queryKey: ['recognition-history'] });
    },
    onError: (err) => {
      setProgress(0);
      setError(err.message || t('recognition_server_error'));
    },
  });

  useEffect(() => {
    if (!analyze.isPending) return undefined;
    setProgress(12);
    const timer = setInterval(() => {
      setProgress((value) => Math.min(value + 9, 92));
    }, 450);
    return () => clearInterval(timer);
  }, [analyze.isPending]);

  const pickFile = (nextFile) => {
    if (!nextFile) return;
    setError('');
    setResult(null);

    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError(t('upload_file_type_error'));
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError(t('recognition_file_size_error'));
      return;
    }

    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const removeImage = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (analyze.isPending) return;
    pickFile(e.dataTransfer.files?.[0]);
  };

  const onAnalyze = () => {
    if (!file) {
      setError(t('recognition_choose_image_error'));
      return;
    }
    setError('');
    analyze.mutate(file);
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">{t('recognition_page_eyebrow')}</div>
          <h1>{t('recognition_title')}</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
            {t('recognition_intro')}
          </p>
        </div>
      </div>

      <section className="section container recognition-layout">
        <div>
          <div
            className={`recognition-dropzone ${preview ? 'has-preview' : ''}`}
            onClick={() => !analyze.isPending && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {preview ? (
              <img src={preview} alt={t('upload_preview')} />
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>{t('recognition_drop_image')}</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
                  {t('recognition_browse_hint')}
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          <div className="recognition-actions">
            <button className="btn btn--ghost" type="button" onClick={() => inputRef.current?.click()} disabled={analyze.isPending}>
              {preview ? t('replace_image') : t('browse_image')}
            </button>
            {preview && (
              <button className="btn btn--ghost" type="button" onClick={removeImage} disabled={analyze.isPending}>
                {t('remove_image')}
              </button>
            )}
            <button className="btn" type="button" onClick={onAnalyze} disabled={analyze.isPending || !file}>
              {analyze.isPending ? t('analyzing') : t('analyze_artwork')}
            </button>
          </div>

          {file && <p className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>{file.name}</p>}
          {error && <p className="form-error">{error}</p>}

          {analyze.isPending && (
            <div className="recognition-progress" aria-label={t('recognition_progress')}>
              <div className="spinner" />
              <div className="recognition-progress__bar"><span style={{ width: `${progress}%` }} /></div>
              <p className="muted">{t('recognition_analyzing_note')}</p>
            </div>
          )}
        </div>

        <RecognitionResult result={result} preview={preview} />
      </section>

      {result?.recommendations?.length > 0 && (
        <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
          <div className="container">
            <div className="eyebrow">{t('similar_artworks')}</div>
            <h2 style={{ marginBottom: 28 }}>{t('similar_character_works')}</h2>
            <div className="recognition-similar-grid">
              {result.recommendations.map((p) => (
                <SimilarArtworkCard key={p.id} painting={p} isAuthed={isAuthed} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function RecognitionResult({ result, preview }) {
  const { t } = useTranslation();
  if (!result) {
    return (
      <div className="recognition-result recognition-result--empty">
        <p className="muted">{t('recognition_empty_result')}</p>
      </div>
    );
  }

  return (
    <div className="recognition-result">
      <div className="eyebrow">{t('recognition_result_eyebrow')}</div>
      <h2>{t('detected_attributes')}</h2>

      {preview && <img className="recognition-result__image" src={preview} alt={t('uploaded_artwork')} />}

      <div className="recognition-stats">
        <Stat label={t('painting_style')} value={result.style} />
        <Stat label={t('artwork_category')} value={result.category} />
        <Stat label={t('medium')} value={result.medium || t('unknown')} />
        <Stat label={t('surface_type')} value={result.surface || t('unknown')} />
        <Stat label={t('confidence_score')} value={`${Math.round((result.confidence || 0) * 100)}%`} />
      </div>

      <div className="recognition-colors">
        <div className="recognition-label">{t('dominant_colors')}</div>
        <div className="recognition-swatches">
          {(result.colors || []).map((hex) => (
            <span key={hex} title={hex} style={{ background: hex }} />
          ))}
        </div>
      </div>

      <div>
        <div className="recognition-label">{t('ai_summary')}</div>
        <p className="muted">{result.summary || t('no_summary_available')}</p>
      </div>
    </div>
  );
}

function SimilarArtworkCard({ painting, isAuthed }) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(Boolean(painting.isFavorited));

  useEffect(() => {
    setFavorited(Boolean(painting.isFavorited));
  }, [painting.id, painting.isFavorited]);
  const favorite = useMutation({
    mutationFn: () => favoriteApi.toggle(painting.id),
    onSuccess: (res) => setFavorited(res.favorited),
  });

  return (
    <article className="recognition-art-card">
      <img src={painting.thumbnailUrl || painting.imageUrl} alt={painting.title} />
      <div>
        <h3>{painting.title}</h3>
        <p className="muted">{painting.artist?.name || t('unknown_artist')}</p>
        <p className="tag">{painting.category?.name || t('artwork')}</p>
      </div>
      <div className="recognition-art-card__actions">
        <Link className="btn btn--ghost" to={`/paintings/${painting.slug}`}>{t('view_details')}</Link>
        {isAuthed ? (
          <button className="btn btn--ghost" type="button" onClick={() => favorite.mutate()} disabled={favorite.isPending}>
            {favorited ? t('favorited') : t('favorite')}
          </button>
        ) : (
          <Link className="btn btn--ghost" to="/login">{t('favorite')}</Link>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="recognition-stat">
      <div className="muted">{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
