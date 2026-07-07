import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { favoriteApi, recognitionApi } from '../api/endpoints.js';
import { selectIsAuthed } from '../features/auth/authSlice.js';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function AIRecognition() {
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
      setError(err.message || 'Server error. Please try again.');
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
      setError('Unsupported file. Please use JPG, JPEG, PNG or WEBP.');
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError('Image is too large. Maximum size is 5 MB.');
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
      setError('Please choose an image before analysis.');
      return;
    }
    setError('');
    analyze.mutate(file);
  };

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="eyebrow">AI Image Recognition</div>
          <h1>Analyze an artwork</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 620 }}>
            Upload an image and Aurelis will infer its style and category, extract the dominant
            color palette, and surface related works from the collection.
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
              <img src={preview} alt="Upload preview" />
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>Drag & drop an image here</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
                  or browse JPG, JPEG, PNG, WEBP up to 5 MB
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
              {preview ? 'Replace image' : 'Browse image'}
            </button>
            {preview && (
              <button className="btn btn--ghost" type="button" onClick={removeImage} disabled={analyze.isPending}>
                Remove image
              </button>
            )}
            <button className="btn" type="button" onClick={onAnalyze} disabled={analyze.isPending || !file}>
              {analyze.isPending ? 'Analyzing...' : 'Analyze Artwork'}
            </button>
          </div>

          {file && <p className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>{file.name}</p>}
          {error && <p className="form-error">{error}</p>}

          {analyze.isPending && (
            <div className="recognition-progress" aria-label="Recognition progress">
              <div className="spinner" />
              <div className="recognition-progress__bar"><span style={{ width: `${progress}%` }} /></div>
              <p className="muted">AI is analyzing the artwork...</p>
            </div>
          )}
        </div>

        <RecognitionResult result={result} preview={preview} />
      </section>

      {result?.recommendations?.length > 0 && (
        <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
          <div className="container">
            <div className="eyebrow">Similar Artworks</div>
            <h2 style={{ marginBottom: 28 }}>Works with a similar character</h2>
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
  if (!result) {
    return (
      <div className="recognition-result recognition-result--empty">
        <p className="muted">Recognition results will appear here after analysis.</p>
      </div>
    );
  }

  return (
    <div className="recognition-result">
      <div className="eyebrow">AI Recognition Result</div>
      <h2>Detected attributes</h2>

      {preview && <img className="recognition-result__image" src={preview} alt="Uploaded artwork" />}

      <div className="recognition-stats">
        <Stat label="Painting Style" value={result.style} />
        <Stat label="Artwork Category" value={result.category} />
        <Stat label="Medium" value={result.medium || 'Unknown'} />
        <Stat label="Surface Type" value={result.surface || 'Unknown'} />
        <Stat label="Confidence Score" value={`${Math.round((result.confidence || 0) * 100)}%`} />
      </div>

      <div className="recognition-colors">
        <div className="recognition-label">Dominant Colors</div>
        <div className="recognition-swatches">
          {(result.colors || []).map((hex) => (
            <span key={hex} title={hex} style={{ background: hex }} />
          ))}
        </div>
      </div>

      <div>
        <div className="recognition-label">AI Summary</div>
        <p className="muted">{result.summary || 'No summary available.'}</p>
      </div>
    </div>
  );
}

function SimilarArtworkCard({ painting, isAuthed }) {
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
        <p className="muted">{painting.artist?.name || 'Unknown artist'}</p>
        <p className="tag">{painting.category?.name || 'Artwork'}</p>
      </div>
      <div className="recognition-art-card__actions">
        <Link className="btn btn--ghost" to={`/paintings/${painting.slug}`}>View Details</Link>
        {isAuthed ? (
          <button className="btn btn--ghost" type="button" onClick={() => favorite.mutate()} disabled={favorite.isPending}>
            {favorited ? 'Favorited' : 'Favorite'}
          </button>
        ) : (
          <Link className="btn btn--ghost" to="/login">Favorite</Link>
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
