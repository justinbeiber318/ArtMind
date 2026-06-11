import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recognitionApi } from '../api/endpoints.js';
import PaintingCard from '../components/PaintingCard.jsx';

export default function AIRecognition() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');

  const analyze = useMutation({ mutationFn: (file) => recognitionApi.analyze(file) });

  const onFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    analyze.mutate(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    onFile(e.dataTransfer.files?.[0]);
  };

  const result = analyze.data;

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

      <section className="section container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Upload */}
        <div>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{
              border: '1.5px dashed var(--border)', background: 'var(--light-gray)',
              padding: preview ? 0 : '64px 24px', textAlign: 'center', cursor: 'pointer',
              minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {preview ? (
              <img src={preview} alt="Upload preview" style={{ width: '100%', maxHeight: 480, objectFit: 'contain' }} />
            ) : (
              <div>
                <p style={{ fontWeight: 500 }}>Drop an image here</p>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>or click to browse · JPEG, PNG, WebP · up to 8&nbsp;MB</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
            onChange={(e) => onFile(e.target.files?.[0])} />
          {fileName && <p className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>{fileName}</p>}
        </div>

        {/* Result */}
        <div>
          {analyze.isPending && <div className="spinner" />}

          {analyze.isError && (
            <p className="form-error">Analysis failed. The image may be too large, or the recognition service is unavailable.</p>
          )}

          {result && (
            <>
              <div className="eyebrow">Analysis</div>
              <h2 style={{ marginBottom: 20 }}>Detected attributes</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <Stat label="Style" value={result.style} />
                <Stat label="Category" value={result.category} />
                <Stat label="Confidence" value={`${Math.round((result.confidence || 0) * 100)}%`} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Dominant colors</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(result.colors || []).map((hex) => (
                    <div key={hex} title={hex} style={{ flex: 1, height: 48, background: hex, border: '1px solid var(--border)' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {(result.colors || []).map((hex) => (
                    <span key={hex} className="muted" style={{ flex: 1, fontSize: '0.68rem', textAlign: 'center' }}>{hex}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {result?.recommendations?.length > 0 && (
        <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
          <div className="container">
            <div className="eyebrow">Related in the collection</div>
            <h2 style={{ marginBottom: 28 }}>Works with a similar character</h2>
            <div className="grid grid--cards">
              {result.recommendations.map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: '1px solid var(--border)', padding: '16px 18px' }}>
      <div className="muted" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginTop: 4 }}>{value}</div>
    </div>
  );
}
