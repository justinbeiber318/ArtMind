import { useEffect, useRef, useState } from 'react';
import { MuseumScene } from './MuseumScene.jsx';
import ArtworkDetailModal from './ArtworkDetailModal.jsx';
import GalleryControlsOverlay from './GalleryControlsOverlay.jsx';
import { usePaintingsForMuseum } from './usePaintingsForMuseum.js';

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#0f1524', color: '#f5efdd' }}>
      <div className="text-center">
        <div
          className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: '#d9b23a', borderTopColor: 'transparent' }}
        />
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: '#d9b23a' }}>
          Please wait
        </p>
        <h2 className="mt-3 font-serif text-2xl">Preparing your virtual exhibition...</h2>
      </div>
    </div>
  );
}

function ErrorScreen({ onRetry }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#0f1524', color: '#f5efdd' }}>
      <div className="max-w-md text-center">
        <h2 className="font-serif text-2xl">Could not load the virtual gallery.</h2>
        <p className="mt-2 text-sm opacity-80">Please try again in a moment.</p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-md px-5 py-2 text-sm font-semibold"
          style={{ background: '#d9b23a', color: '#1a1f30' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: '#0f1524', color: '#f5efdd' }}>
      <p className="font-serif text-xl opacity-80">No artworks available for this exhibition yet.</p>
    </div>
  );
}

export default function VirtualGalleryPage() {
  const { data, isLoading, isError, refetch } = usePaintingsForMuseum(16);
  const [selected, setSelected] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [locked, setLocked] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onLock = () => setLocked(Boolean(document.pointerLockElement));
    document.addEventListener('pointerlockchange', onLock);
    return () => document.removeEventListener('pointerlockchange', onLock);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const requestLock = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    canvas?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (isError || !data) {
    return <ErrorScreen onRetry={() => refetch()} />;
  }

  const paintings = data.paintings || [];
  if (paintings.length === 0) {
    return <EmptyScreen />;
  }

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden" style={{ background: '#0f1524' }}>
      <MuseumScene
        paintings={paintings}
        onSelect={(p) => setSelected(p)}
        onNearestChange={(p) => setNearest(p)}
      />
      <GalleryControlsOverlay
        hintText={nearest ? `${nearest.title} - ${nearest.artist}` : null}
        locked={locked}
        onRequestLock={requestLock}
      />
      <ArtworkDetailModal painting={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

