import { useEffect, useRef, useState } from "react";
import { MuseumScene } from "./MuseumScene";
import { ArtworkDetailModal } from "./ArtworkDetailModal";
import { GalleryControlsOverlay } from "./GalleryControlsOverlay";
import { usePaintingsForMuseum } from "./usePaintingsForMuseum";
import type { Painting } from "./types";

export function VirtualGalleryPage() {
  const { data: paintings, isLoading, isError, refetch } = usePaintingsForMuseum(16);
  const [selected, setSelected] = useState<Painting | null>(null);
  const [nearest, setNearest] = useState<Painting | null>(null);
  const [locked, setLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onLock = () => setLocked(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const requestLock = () => {
    // PointerLockControls listens for clicks on the canvas; simulate one.
    const canvas = containerRef.current?.querySelector("canvas");
    canvas?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (isError || !paintings) {
    return <ErrorScreen onRetry={() => refetch()} />;
  }
  if (paintings.length === 0) {
    return <EmptyScreen />;
  }

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden" style={{ background: "#0f1524" }}>
      <MuseumScene
        paintings={paintings}
        onSelect={(p) => setSelected(p)}
        onNearestChange={(p) => setNearest(p)}
      />
      <GalleryControlsOverlay
        hintText={nearest ? `${nearest.title} — ${nearest.artist}` : null}
        locked={locked}
        onRequestLock={requestLock}
      />
      <ArtworkDetailModal painting={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0f1524", color: "#f5efdd" }}>
      <div className="text-center">
        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#d9b23a", borderTopColor: "transparent" }} />
        <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#d9b23a" }}>Please wait</p>
        <h2 className="mt-3 font-serif text-2xl">Preparing your virtual exhibition…</h2>
      </div>
    </div>
  );
}

function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0f1524", color: "#f5efdd" }}>
      <div className="max-w-md text-center">
        <h2 className="font-serif text-2xl">Could not load the virtual gallery.</h2>
        <p className="mt-2 text-sm opacity-80">Please try again in a moment.</p>
        <button onClick={onRetry} className="mt-6 rounded-md px-5 py-2 text-sm font-semibold" style={{ background: "#d9b23a", color: "#1a1f30" }}>
          Try again
        </button>
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#0f1524", color: "#f5efdd" }}>
      <p className="font-serif text-xl opacity-80">No artworks available for this exhibition yet.</p>
    </div>
  );
}