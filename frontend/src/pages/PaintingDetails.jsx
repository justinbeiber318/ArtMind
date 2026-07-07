import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import { paintingApi, favoriteApi } from '../api/endpoints.js';
import { selectIsAdmin, selectIsAuthed } from '../features/auth/authSlice.js';
import PaintingCard from '../components/PaintingCard.jsx';
import { gsap } from 'gsap';

export default function PaintingDetails() {
  const { slug } = useParams();
  const qc = useQueryClient();
  const authed = useSelector(selectIsAuthed);
  const isAdmin = useSelector(selectIsAdmin);
  const [favorited, setFavorited] = useState(false);
  const [shareNote, setShareNote] = useState('');

  const imgContainerRef = useRef(null);
  const infoRef = useRef(null);

  const { data: painting, isLoading } = useQuery({
    queryKey: ['painting', slug],
    queryFn: () => paintingApi.detail(slug),
  });

  useEffect(() => {
    if (painting) {
      gsap.fromTo(imgContainerRef.current, 
        { opacity: 0, x: -40 }, 
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
      );
      gsap.fromTo(infoRef.current, 
        { opacity: 0, x: 40 }, 
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, [painting]);

  const similar = useQuery({
    queryKey: ['painting', painting?.id, 'similar'],
    queryFn: () => paintingApi.similar(painting.id),
    enabled: Boolean(painting?.id),
  });

  const aiSummary = useQuery({
    queryKey: ['painting', slug, 'ai-summary'],
    queryFn: () => paintingApi.aiSummary(slug),
    enabled: false,
  });

  useEffect(() => {
    if (painting) setFavorited(Boolean(painting.isFavorited));
  }, [painting?.id, painting?.isFavorited]);

  const favoriteMutation = useMutation({
    mutationFn: () => favoriteApi.toggle(painting.id),
    onSuccess: (res) => {
      setFavorited(res.favorited);
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['painting', slug] });
    },
  });

  if (isLoading) return <div className="spinner" />;
  if (!painting) return <p className="center muted section">Painting not found.</p>;

  const colors = painting.dominantColors || [];

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 56;
    let y = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 95);
    doc.text('AURELIS  ·  GALLERY WALL LABEL', margin, y);
    y += 30;
    doc.setTextColor(45, 45, 45);
    doc.setFontSize(22);
    doc.text(doc.splitTextToSize(painting.title, 480), margin, y);
    y += 30;
    doc.setFontSize(12);
    doc.setTextColor(107, 107, 107);
    doc.text(`${painting.artist?.name || 'Unknown artist'}${painting.year ? `, ${painting.year}` : ''}`, margin, y);
    y += 28;

    const meta = [
      ['Style', painting.style?.name],
      ['Category', painting.category?.name],
      ['Medium', painting.medium],
      ['Surface', painting.surface],
      ['Dimensions', painting.widthCm && painting.heightCm ? `${painting.heightCm} × ${painting.widthCm} cm` : null],
      ['Views', painting.viewCount?.toLocaleString()],
    ].filter(([, v]) => v);

    doc.setFontSize(11);
    doc.setTextColor(45, 45, 45);
    meta.forEach(([k, v]) => {
      doc.text(`${k}:`, margin, y);
      doc.text(String(v), margin + 90, y);
      y += 18;
    });

    y += 12;
    doc.setTextColor(107, 107, 107);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(painting.description || '', 480), margin, y);

    doc.save(`${painting.slug}.pdf`);
  };

  const share = async () => {
    const url = window.location.href;
    const shareData = { title: painting.title, text: `${painting.title} — ${painting.artist?.name}`, url };
    try {
      if (navigator.share) { await navigator.share(shareData); return; }
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied to clipboard');
      setTimeout(() => setShareNote(''), 2500);
    } catch {
      setShareNote('');
    }
  };

  return (
    <>
      <section className="section container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 56, alignItems: 'start' }}>
        <div ref={imgContainerRef} style={{ background: 'var(--light-gray)', opacity: 0 }}>
          <img src={painting.imageUrl} alt={painting.title}
            style={{ width: '100%', objectFit: 'contain' }} />
        </div>

        <div ref={infoRef} style={{ opacity: 0 }}>
          <div className="eyebrow">{painting.category?.name}</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>{painting.title}</h1>
          <p className="muted" style={{ fontSize: '1.05rem', marginTop: 6 }}>
            <Link to={`/gallery?artist=${painting.artist?.slug}`} style={{ color: 'var(--navy)' }}>
              {painting.artist?.name}
            </Link>
            {painting.year ? `, ${painting.year}` : ''}
          </p>

          <p style={{ margin: '24px 0', lineHeight: 1.8 }}>{painting.description}</p>

          <div className="divider" style={{ margin: '24px 0' }} />

          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 12, columnGap: 24, fontSize: '0.92rem' }}>
            <Spec label="Style" value={painting.style?.name} />
            <Spec label="Medium" value={painting.medium} />
            <Spec label="Surface" value={painting.surface} />
            {painting.widthCm && painting.heightCm &&
              <Spec label="Dimensions" value={`${painting.heightCm} × ${painting.widthCm} cm`} />}
            <Spec label="Views" value={painting.viewCount?.toLocaleString()} />
          </dl>

          {colors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Dominant colors</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {colors.map((hex) => (
                  <div key={hex} title={hex}
                    style={{ width: 40, height: 40, background: hex, border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            {authed && !isAdmin ? (
              <button className="btn" onClick={() => favoriteMutation.mutate()} disabled={favoriteMutation.isPending || !painting?.id}>
                {favorited ? '♥ In favorites' : '♡ Add to favorites'}
              </button>
            ) : !authed ? (
              <Link to="/login" state={{ from: `/paintings/${slug}` }} className="btn">Sign in to favorite</Link>
            ) : null}
            <button className="btn btn--ghost" onClick={downloadPdf}>Download PDF</button>
            <button className="btn btn--ghost" onClick={share}>Share</button>
          </div>
          {shareNote && <p className="muted" style={{ marginTop: 10, fontSize: '0.85rem' }}>{shareNote}</p>}

          {/* AI summary */}
          <div style={{ marginTop: 36, padding: 24, background: 'var(--light-gray)' }}>
            <div className="eyebrow">AI Summary</div>
            {aiSummary.data ? (
              <p style={{ lineHeight: 1.8 }}>{aiSummary.data.summary}</p>
            ) : (
              <>
                <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 14 }}>
                  Generate a concise curatorial note for this work using Aurelis's assistant.
                </p>
                <button className="btn btn--ghost" onClick={() => aiSummary.refetch()} disabled={aiSummary.isFetching}>
                  {aiSummary.isFetching ? 'Generating…' : 'Generate summary'}
                </button>
                {aiSummary.isError && (
                  <p className="form-error" style={{ marginTop: 10 }}>
                    The summary service is unavailable. An OpenAI API key must be configured on the server.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Similar */}
      <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
        <div className="container">
          <div className="eyebrow">You may also like</div>
          <h2 style={{ marginBottom: 28 }}>Similar works</h2>
          {similar.isLoading ? <div className="spinner" /> : (
            <div className="grid grid--cards">
              {(similar.data || []).map((p, i) => <PaintingCard key={p.id} painting={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <>
      <dt className="muted" style={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em', paddingTop: 2 }}>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
