import { Link } from 'react-router-dom';

export default function GalleryControlsOverlay({
  hintText,
  locked,
  onRequestLock,
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <div className="pointer-events-none absolute right-4 top-4 z-20">
        <Link
          to="/"
          className="pointer-events-auto rounded-md px-3 py-2 text-xs font-medium tracking-wide"
          style={{
            background: 'rgba(20,27,46,0.65)',
            color: '#f5efdd',
            border: '1px solid rgba(217,178,58,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          Exit Gallery
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-20">
        <div
          className="rounded-md px-4 py-2 text-xs"
          style={{
            background: 'rgba(20,27,46,0.65)',
            color: '#f5efdd',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(8px)',
            letterSpacing: 0.4,
          }}
        >
          <span style={{ color: '#d9b23a' }}>WASD</span> Move &nbsp;·&nbsp;
          <span style={{ color: '#d9b23a' }}>Mouse</span> Look &nbsp;·&nbsp;
          <span style={{ color: '#d9b23a' }}>Shift</span> Run &nbsp;·&nbsp;
          <span style={{ color: '#d9b23a' }}>E / Click</span> View &nbsp;·&nbsp;
          <span style={{ color: '#d9b23a' }}>Esc</span> Release
        </div>
      </div>

      {locked && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'rgba(217,178,58,0.9)',
            boxShadow: '0 0 6px rgba(217,178,58,0.6)',
          }}
        />
      )}

      {locked && hintText && (
        <div
          className="pointer-events-none absolute left-1/2 top-[62%] z-10 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-medium"
          style={{
            background: 'rgba(20,27,46,0.85)',
            border: '1px solid rgba(217,178,58,0.5)',
            color: '#f5efdd',
            backdropFilter: 'blur(6px)',
            letterSpacing: 0.5,
          }}
        >
          {hintText} <span style={{ color: '#d9b23a' }}>Press E</span>
        </div>
      )}

      {!locked && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(20,27,46,0.55) 0%, rgba(6,9,18,0.9) 100%)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="max-w-md rounded-2xl p-10 text-center"
            style={{
              background: 'rgba(18,24,42,0.92)',
              border: '1px solid rgba(217,178,58,0.35)',
              color: '#f5efdd',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <p className="text-[10px] uppercase" style={{ color: '#d9b23a', letterSpacing: '0.4em', fontFamily: "'Inter', sans-serif" }}>
              - Virtual Exhibition -
            </p>
            <h2 className="mt-4 text-4xl italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, letterSpacing: 0.3 }}>
              Enter the Gallery
            </h2>
            <div className="mx-auto mt-4 h-px w-16" style={{ background: 'linear-gradient(to right, transparent, #d9b23a, transparent)' }} />
            <p className="mt-5 text-sm opacity-80" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
              Walk with <b>WASD</b>, look with your mouse. Approach any painting and press{' '}
              <b style={{ color: '#d9b23a' }}>E</b> to view details.
            </p>
            <button
              onClick={onRequestLock}
              className="mt-7 rounded-sm px-8 py-3 text-xs font-semibold uppercase transition hover:brightness-110"
              style={{ background: 'linear-gradient(180deg, #e8c76a, #c9a24a)', color: '#1a1f30', letterSpacing: '0.25em', boxShadow: '0 8px 24px rgba(217,178,58,0.25)' }}
            >
              Enter Exhibition
            </button>
            <p className="mt-4 text-[11px] opacity-50" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: 0.5 }}>
              Press Esc anytime to release the cursor.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

