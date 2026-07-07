import type { Painting } from "./types";
import { X, Heart, ExternalLink } from "lucide-react";
import { useState } from "react";

export function ArtworkDetailModal({
  painting,
  onClose,
}: {
  painting: Painting | null;
  onClose: () => void;
}) {
  const [liked, setLiked] = useState(false);
  if (!painting) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 15, 30, 0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border md:grid-cols-[1.2fr,1fr]"
        style={{
          background: "rgba(20, 27, 46, 0.85)",
          borderColor: "rgba(217, 178, 58, 0.35)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          color: "#f5efdd",
          maxHeight: "90vh",
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 transition"
          style={{ background: "rgba(0,0,0,0.35)", color: "#f5efdd" }}
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center p-6" style={{ background: "#0b0f1a" }}>
          <img
            src={painting.imageUrl}
            alt={painting.title}
            className="max-h-[70vh] w-auto rounded shadow-2xl"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          />
        </div>

        <div className="overflow-y-auto p-8">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#d9b23a" }}>
            {painting.category ?? "Artwork"}
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-tight">{painting.title}</h2>
          <p className="mt-1 text-sm opacity-80">
            {painting.artist}
            {painting.year ? ` · ${painting.year}` : ""}
          </p>

          {painting.description && (
            <p className="mt-5 text-sm leading-relaxed opacity-90">{painting.description}</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Field label="Style" value={painting.style} />
            <Field label="Medium" value={painting.medium} />
            <Field label="Surface" value={painting.surface} />
            <Field label="Dimensions" value={painting.dimensions} />
            {painting.price && <Field label="Price" value={String(painting.price)} />}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setLiked((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
              style={{
                background: liked ? "#d9b23a" : "transparent",
                color: liked ? "#1a1f30" : "#d9b23a",
                border: "1px solid #d9b23a",
              }}
            >
              <Heart size={16} fill={liked ? "#1a1f30" : "none"} />
              {liked ? "Favorited" : "Favorite"}
            </button>
            <a
              href={`/paintings/${painting.id}`}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition"
              style={{ background: "#d9b23a", color: "#1a1f30" }}
            >
              <ExternalLink size={16} />
              View full detail
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest opacity-60">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}