import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { gsap } from 'gsap';
import { paintingApi, favoriteApi } from '../api/endpoints.js';
import { selectIsAdmin, selectIsAuthed } from '../features/auth/authSlice.js';
import PaintingCard from '../components/PaintingCard.jsx';

export default function PaintingDetails() {
  const { t } = useTranslation();
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
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(infoRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
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
  if (!painting) return <p className="center muted section">{t('painting_not_found')}</p>;

  const colors = painting.dominantColors || [];

  const downloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 56;
    let y = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 95);
    doc.text('AURELIS - GALLERY WALL LABEL', margin, y);
    y += 30;
    doc.setTextColor(45, 45, 45);
    doc.setFontSize(22);
    doc.text(doc.splitTextToSize(painting.title, 480), margin, y);
    y += 30;
    doc.setFontSize(12);
    doc.setTextColor(107, 107, 107);
    doc.text(`${painting.artist?.name || t('unknown_artist')}${painting.year ? `, ${painting.year}` : ''}`, margin, y);
    y += 28;

    const meta = [
      [t('style'), painting.style?.name],
      [t('category'), painting.category?.name],
      [t('medium'), painting.medium],
      [t('surface'), painting.surface],
      [t('dimensions'), painting.widthCm && painting.heightCm ? `${painting.heightCm} x ${painting.widthCm} cm` : null],
      [t('views'), painting.viewCount?.toLocaleString()],
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
    const shareData = { title: painting.title, text: `${painting.title} - ${painting.artist?.name}`, url };
    try {
      if (navigator.share) { await navigator.share(shareData); return; }
      await navigator.clipboard.writeText(url);
      setShareNote(t('link_copied'));
      setTimeout(() => setShareNote(''), 2500);
    } catch {
      setShareNote('');
    }
  };

  return (
    <>
      <section className="section container painting-detail-layout">
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

          <dl className="painting-specs">
            <Spec label={t('style')} value={painting.style?.name} />
            <Spec label={t('medium')} value={painting.medium} />
            <Spec label={t('surface')} value={painting.surface} />
            {painting.widthCm && painting.heightCm &&
              <Spec label={t('dimensions')} value={`${painting.heightCm} x ${painting.widthCm} cm`} />}
            <Spec label={t('views')} value={painting.viewCount?.toLocaleString()} />
          </dl>

          {colors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>{t('dominant_colors')}</div>
              <div className="painting-swatches">
                {colors.map((hex) => (
                  <div key={hex} title={hex}
                    style={{ width: 40, height: 40, background: hex, border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          )}

          <div className="painting-actions">
            {authed && !isAdmin ? (
              <button className="btn" onClick={() => favoriteMutation.mutate()} disabled={favoriteMutation.isPending || !painting?.id}>
                {favorited ? t('in_favorites') : t('add_to_favorites')}
              </button>
            ) : !authed ? (
              <Link to="/login" state={{ from: `/paintings/${slug}` }} className="btn">{t('sign_in_to_favorite')}</Link>
            ) : null}
            <button className="btn btn--ghost" onClick={downloadPdf}>{t('download_pdf')}</button>
            <button className="btn btn--ghost" onClick={share}>{t('share')}</button>
          </div>
          {shareNote && <p className="muted" style={{ marginTop: 10, fontSize: '0.85rem' }}>{shareNote}</p>}

          <div style={{ marginTop: 36, padding: 24, background: 'var(--light-gray)' }}>
            <div className="eyebrow">{t('ai_summary')}</div>
            {aiSummary.data ? (
              <p style={{ lineHeight: 1.8 }}>{aiSummary.data.summary}</p>
            ) : (
              <>
                <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 14 }}>
                  {t('ai_summary_intro')}
                </p>
                <button className="btn btn--ghost" onClick={() => aiSummary.refetch()} disabled={aiSummary.isFetching}>
                  {aiSummary.isFetching ? t('generating') : t('generate_summary')}
                </button>
                {aiSummary.isError && (
                  <p className="form-error" style={{ marginTop: 10 }}>
                    {t('summary_unavailable')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section--tight" style={{ background: 'var(--light-gray)' }}>
        <div className="container">
          <div className="eyebrow">{t('you_may_also_like')}</div>
          <h2 style={{ marginBottom: 28 }}>{t('similar_works')}</h2>
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
