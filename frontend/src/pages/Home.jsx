import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const SCENES_DATA = [
  {
    tag: 'A silent sanctuary',
    title: 'AURELIS',
    sub: 'Where the dust of forgotten years settles on timeless canvas',
    image: '/scene0.png',
  },
  {
    tag: 'Beyond the frames',
    title: 'THE GALLERY',
    sub: 'Enter a corridor where brushstrokes whisper stories of a thousand lifetimes',
    image: '/scene1.jpeg',
    ctaLink: '/gallery',
    ctaLabel: 'Enter the Gallery',
  },
  {
    tag: 'Deep in the vault',
    title: 'THE LIBRARY',
    sub: 'Unlock the quiet memories of humanity\'s soul, curated by intelligence',
    image: '/scene2.jpeg',
    ctaLink: '/ai-search',
    ctaLabel: 'Try AI Search',
  },
];

const LABELS = ['Aurelis', 'Gallery', 'Library'];
const TRACK_H = 200;
const THUMB_H = 44;
const CF_A = { s: 0.28, e: 0.37 };
const CF_B = { s: 0.67, e: 0.76 };
const SC = [
  { s: 0, e: 0.30, ss: 1.00, se: 1.35 },
  { s: 0.30, e: 0.70, ss: 1.10, se: 1.40 },
  { s: 0.70, e: 1.00, ss: 1.00, se: 1.30 },
];

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function inv(a, b, v) {
  return clamp((v - a) / (b - a), 0, 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getActive(p) {
  return p < 0.35 ? 0 : p < 0.72 ? 1 : 2;
}

export default function Home() {
  const [activeIdx, setActiveIdx] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const fromGallery = location.state?.fromGallery;

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const hintRef = useRef(null);
  const pctRef = useRef(null);
  const dotLabelRef = useRef(null);
  const sceneRefs = useRef([]);
  const imgRefs = useRef([]);

  const scrollPctRef = useRef(fromGallery ? 1 : 0);
  const targetPctRef = useRef(fromGallery ? 1 : 0);
  const currentActiveRef = useRef(fromGallery ? 2 : 0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Direct render function (bypasses React state for 60fps animations)
    const renderSlider = (p) => {
      const o0 = p <= CF_A.s ? 1 : p <= CF_A.e ? 1 - inv(CF_A.s, CF_A.e, p) : 0;
      const o1 =
        p >= CF_A.s && p <= CF_A.e
          ? inv(CF_A.s, CF_A.e, p)
          : p > CF_A.e && p <= CF_B.s
          ? 1
          : p >= CF_B.s && p <= CF_B.e
          ? 1 - inv(CF_B.s, CF_B.e, p)
          : 0;
      const o2 = p >= CF_B.s && p <= CF_B.e ? inv(CF_B.s, CF_B.e, p) : p > CF_B.e ? 1 : 0;

      // Update opacities
      if (sceneRefs.current[0]) sceneRefs.current[0].style.opacity = o0;
      if (sceneRefs.current[1]) sceneRefs.current[1].style.opacity = o1;
      if (sceneRefs.current[2]) sceneRefs.current[2].style.opacity = o2;

      // Update scale transforms
      SC.forEach((sc, i) => {
        if (imgRefs.current[i]) {
          imgRefs.current[i].style.transform = `scale(${lerp(
            sc.ss,
            sc.se,
            inv(sc.s, sc.e, p)
          )})`;
        }
      });

      // Update progress thumb
      if (thumbRef.current) {
        const top = p * (TRACK_H - THUMB_H);
        thumbRef.current.style.height = `${THUMB_H}px`;
        thumbRef.current.style.marginTop = `${top}px`;
      }

      // Update dot label
      const active = getActive(p);
      if (dotLabelRef.current) {
        dotLabelRef.current.textContent = LABELS[active];
      }

      // React state update only when active slide index changes
      if (active !== currentActiveRef.current) {
        currentActiveRef.current = active;
        setActiveIdx(active);
      }

      // Update scroll hint opacity
      if (hintRef.current) {
        hintRef.current.style.opacity = p < 0.04 ? 1 : 0;
      }

      // Update percentage display
      if (pctRef.current) {
        pctRef.current.textContent = `${Math.round(p * 100)}%`;
      }
    };

    // Animation Loop
    let animationFrameId;
    const loop = () => {
      scrollPctRef.current += (targetPctRef.current - scrollPctRef.current) * 0.072;
      if (Math.abs(targetPctRef.current - scrollPctRef.current) < 0.0001) {
        scrollPctRef.current = targetPctRef.current;
      }
      renderSlider(scrollPctRef.current);
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    // Event Listeners
    const handleWheel = (e) => {
      e.preventDefault();
      if (targetPctRef.current === 1 && e.deltaY > 0) {
        navigate('/gallery');
        return;
      }
      targetPctRef.current = clamp(targetPctRef.current + e.deltaY / 2000, 0, 1);
    };

    let ts = 0;
    let tp = 0;
    const handleTouchStart = (e) => {
      ts = e.touches[0].clientY;
      tp = targetPctRef.current;
    };
    const handleTouchMove = (e) => {
      const deltaY = ts - e.touches[0].clientY;
      if (targetPctRef.current === 1 && deltaY > 40) {
        navigate('/gallery');
        return;
      }
      targetPctRef.current = clamp(tp + deltaY / 600, 0, 1);
      if (e.cancelable) e.preventDefault();
    };

    let dr = false;
    let dy0 = 0;
    let dp0 = 0;
    const handleMouseDown = (e) => {
      dr = true;
      dy0 = e.clientY;
      dp0 = targetPctRef.current;
    };
    const handleMouseMove = (e) => {
      if (!dr) return;
      const deltaY = e.clientY - dy0;
      if (targetPctRef.current === 1 && deltaY < -60) {
        navigate('/gallery');
        return;
      }
      targetPctRef.current = clamp(dp0 + (e.clientY - dy0) / 600, 0, 1);
    };
    const handleMouseUp = () => {
      dr = false;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 's') {
        if (targetPctRef.current === 1) {
          navigate('/gallery');
          return;
        }
        targetPctRef.current = clamp(targetPctRef.current + 0.05, 0, 1);
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        targetPctRef.current = clamp(targetPctRef.current - 0.05, 0, 1);
      }
      if (e.key === '1') targetPctRef.current = 0;
      if (e.key === '2') targetPctRef.current = 0.35;
      if (e.key === '3') targetPctRef.current = 0.72;
    };

    // Attach listeners
    root.addEventListener('wheel', handleWheel, { passive: false });
    root.addEventListener('touchstart', handleTouchStart, { passive: true });
    root.addEventListener('touchmove', handleTouchMove, { passive: false });
    root.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    // Initial render
    renderSlider(fromGallery ? 1 : 0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      root.removeEventListener('wheel', handleWheel);
      root.removeEventListener('touchstart', handleTouchStart);
      root.removeEventListener('touchmove', handleTouchMove);
      root.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDotClick = (index) => {
    const targets = [0, 0.35, 0.72];
    targetPctRef.current = targets[index];
  };

  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    targetPctRef.current = clamp((e.clientY - r.top) / r.height, 0, 1);
  };

  return (
    <div className="slider-root" ref={rootRef}>
      {SCENES_DATA.map((scene, i) => (
        <div
          key={i}
          ref={(el) => (sceneRefs.current[i] = el)}
          className={`slider-scene ${activeIdx === i ? 'active-scene' : ''}`}
        >
          <img
            id={`img${i}`}
            ref={(el) => (imgRefs.current[i] = el)}
            src={scene.image}
            alt={scene.title}
          />
          <div className="slider-overlay" />
          <div className="slider-label">
            <div className="tag">{scene.tag}</div>
            <div className="title">{scene.title}</div>
            <div className="sub">{scene.sub}</div>
            {scene.ctaLink && (
              <div className="slider-cta">
                <Link to={scene.ctaLink} className="btn">
                  {scene.ctaLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Progress track */}
      <div id="progress-track" ref={trackRef} onClick={handleTrackClick}>
        <div id="progress-thumb" ref={thumbRef} />
      </div>

      {/* Navigation dots */}
      <div id="scene-dots">
        {LABELS.map((_, i) => (
          <div
            key={i}
            className={`dot ${activeIdx === i ? 'active' : ''}`}
            onClick={() => handleDotClick(i)}
          />
        ))}
      </div>

      {/* Label and Hint */}
      <div className="dot-label" ref={dotLabelRef}>
        Aurelis
      </div>
      <div id="scroll-hint" ref={hintRef}>
        <div className="arrow">&#8595;</div>
        <span>Scroll to explore</span>
      </div>

      {/* Percentage Indicator */}
      <div id="pct-display" ref={pctRef}>
        0%
      </div>
    </div>
  );
}
