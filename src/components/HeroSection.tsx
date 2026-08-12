'use client';

import { useEffect, useRef, useState } from 'react';
import HeroMap from './HeroMap';
import TransmissionLayer from './TransmissionLayer';
import StatCards from './StatCards';
import ControlPanel from './ControlPanel';
import ComparePanel from './ComparePanel';
import StatePopup from './StatePopup';
import { compareColor } from '@/lib/computations';
import type { Discom, IndiaGeoJSON } from '@/lib/types';

/** Guide paths for the animated "current" dots (in the tower-photo-overlay's own 724x345
 * viewBox space), not rendered themselves. This overlay lives inside hero-map-backdrop, so it
 * scales/shifts together with the map through the scroll transition. x stays >= ~260: below that,
 * given how far right .hero-map-backdrop's transform-origin/scale currently dock the map (see
 * hero.css), the left end of the path lands back under the header text — go lower only after
 * re-checking against whatever transform-origin/scale the map is using at the time. Each dot
 * gets its own duration/delay so the three don't move in lockstep — durations are short on
 * purpose: at 16-26s a full sweep barely registers as motion in a normal glance and just looks
 * stuck, so these are fast enough that the travel is unmistakable. */
const TOWER_FLOW_PATHS = [
  { d: 'M 260,270 Q 460,190 700,90', duration: 6, delay: -1 },
  { d: 'M 280,150 Q 480,110 690,230', duration: 8, delay: -4 },
  { d: 'M 300,50 Q 500,160 660,310', duration: 10, delay: -7 },
];

interface Props {
  discoms: Discom[];
  allStates: string[];
  years: string[];
  year: string;
  onYearChange: (y: string) => void;
  geojson: IndiaGeoJSON;
  stateHue: Record<string, string>;
  compareSet: string[];
  onToggleState: (name: string) => void;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onViewFullReport: (name: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
  compareMode: boolean;
  onToggleCompareMode: () => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function HeroSection({
  discoms,
  allStates,
  years,
  year,
  onYearChange,
  geojson,
  stateHue,
  compareSet,
  onToggleState,
  onAdd,
  onRemove,
  onViewFullReport,
  onCompare,
  onClearAll,
  compareMode,
  onToggleCompareMode,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mapBgRef = useRef<HTMLDivElement>(null);
  const bgFabricRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const revealLayerRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const [centroids, setCentroids] = useState<Record<string, [number, number]>>({});
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [popupPoint, setPopupPoint] = useState<{ x: number; y: number } | null>(null);

  // popup visibility is derived from compareSet (not tracked separately), so anything else that
  // clears the selection — the sidebar's Clear button, entering compare mode, re-clicking the
  // same state — closes it too, with nothing extra to keep in sync. This just remembers *where*
  // to anchor it, using the same centroids/mapBgRef data HeroMap and the scroll rig already use;
  // it only fires on single-select clicks (revealedRef gates clicks generally, and clicks only
  // register once the map is at/near its full, undocked scale, so the click position lines up
  // with the map's on-screen box without needing to account for the landing-state scale/dock).
  function handleStateClick(name: string) {
    if (!compareMode) {
      const c = centroids[name];
      const mapBox = mapBgRef.current?.getBoundingClientRect();
      if (c && mapBox) {
        const rawX = mapBox.left + c[0];
        const rawY = mapBox.top + c[1];
        setPopupPoint({
          x: Math.min(Math.max(150, rawX), window.innerWidth - 150),
          y: Math.min(Math.max(60, rawY), window.innerHeight - 40),
        });
      }
    }
    onToggleState(name);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const mapBg = mapBgRef.current;
    const bgFabric = bgFabricRef.current;
    const header = headerRef.current;
    const revealLayer = revealLayerRef.current;
    if (!stage || !sticky || !mapBg || !bgFabric || !header || !revealLayer) return;

    function measure() {
      const rect = stage!.getBoundingClientRect();
      const scrollRange = Math.max(1, rect.height - window.innerHeight);
      const scrolled = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, scrolled / scrollRange));
      return { rect, scrollRange, p };
    }

    function applyStyles(p: number) {
      // map starts crisp and docked toward the right (via transform-origin), then eases to its
      // full centered/full-bleed size as the section scrolls into view
      mapBg!.style.transform = `scale(${lerp(0.8, 1, p)})`;
      mapBg!.style.filter = `brightness(${lerp(0.88, 1, p)})`;
      // tower-photo fabric backdrop is hidden on landing, fades in over the first half of the scroll
      bgFabric!.style.opacity = String(Math.max(0, Math.min(1, (p - 0.08) / 0.55)));
      header!.style.opacity = String(lerp(1, 0, Math.min(1, p * 1.7)));
      header!.style.transform = `translateY(${lerp(0, -40, p)}px)`;
      const revealP = Math.max(0, Math.min(1, (p - 0.5) / 0.38));
      revealLayer!.style.opacity = String(revealP);
    }

    // the raw scroll fraction is only ever used as a *target* — every visual property eases
    // toward it a little each frame instead of snapping straight to the scrollbar position.
    // That soft, springy lag (rather than a 1:1 scroll-to-style mapping) is what makes the
    // whole transition read as smooth/"jelly" instead of mechanically tied to the scroll.
    let smoothP = measure().p;
    let rafId: number | null = null;

    function loop() {
      const { p: targetP } = measure();
      smoothP += (targetP - smoothP) * 0.14;
      const settled = Math.abs(targetP - smoothP) < 0.0008;
      if (settled) smoothP = targetP;
      applyStyles(smoothP);
      revealedRef.current = targetP > 0.8;
      sticky!.classList.toggle('revealed', revealedRef.current);
      rafId = settled ? null : requestAnimationFrame(loop);
    }
    function ensureLoop() {
      if (rafId == null) rafId = requestAnimationFrame(loop);
    }

    let endTimer: ReturnType<typeof setTimeout>;
    function settle() {
      const { rect, scrollRange, p } = measure();
      if (p <= 0.02 || p >= 0.98) return; // already at an end state
      const targetP = p < 0.5 ? 0 : 1;
      const targetTop = window.scrollY + rect.top + targetP * scrollRange;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    function onScroll() {
      ensureLoop();
      clearTimeout(endTimer);
      endTimer = setTimeout(settle, 140);
    }
    function onResize() {
      ensureLoop();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    applyStyles(smoothP); // paint the initial state immediately, with no lag
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(endTimer);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-stage" ref={stageRef}>
      <div className="hero-sticky" ref={stickyRef}>
        {/* always-on ambient drift, independent of the tower-photo fabric below (which stays
            hidden until scroll) — just some slow motion so the landing view isn't static */}
        <div className="hero-ambient-glow" aria-hidden="true" />

        <div className="hero-bg-fabric" aria-hidden="true" ref={bgFabricRef}>
          <div className="tower-photo-layer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tower-photo.png" alt="" className="tower-photo-img" />
          </div>
        </div>

        <div className="hero-map-backdrop" ref={mapBgRef}>
          <HeroMap
            discoms={discoms}
            geojson={geojson}
            year={year}
            compareSet={compareSet}
            compareColorOf={(name) => compareColor(compareSet, name)}
            onStateClick={handleStateClick}
            revealedRef={revealedRef}
            onCentroids={(c, size) => {
              setCentroids(c);
              setMapSize(size);
            }}
          />
          <TransmissionLayer centroids={centroids} size={mapSize} />

          {/* animated current dot: lives inside the same scaled/shifted container as the map
              itself, so it stays visually attached to it through the whole scroll transition
              instead of sitting at a fixed screen position while the map moves under it */}
          <div className="tower-flow-layer" aria-hidden="true">
            <svg className="tower-photo-overlay" viewBox="0 0 724 345">
              {TOWER_FLOW_PATHS.map((f, i) => (
                <circle
                  key={`flow-${i}`}
                  r="2.6"
                  className="tower-flow-dot"
                  style={{ offsetPath: `path("${f.d}")`, animationDuration: `${f.duration}s`, animationDelay: `${f.delay}s` } as React.CSSProperties}
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="hero-vignette" />

        <div className="hero-header" ref={headerRef}>
          <div className="kicker">
            <span className="bar" />
            <span className="label">Research Dashboard</span>
          </div>
          <h1>Power Distribution Quality &amp; Standards</h1>
          <p className="lede">
            Understanding how electricity service standards and reported performance vary across India&rsquo;s distribution utilities — comparing
            state regulatory (SERC) standards with DISCOM-reported data.
          </p>
          <div className="scroll-cue">Scroll to explore the map ↓</div>
        </div>

        <div className="hero-reveal-layer" ref={revealLayerRef}>
          <StatCards discoms={discoms} allStates={allStates} year={year} />

          <div className="control-stack">
            <ControlPanel years={years} year={year} onYearChange={onYearChange} />
            <ComparePanel
              allStates={allStates}
              stateHue={stateHue}
              compareSet={compareSet}
              onAdd={onAdd}
              onRemove={onRemove}
              onCompare={onCompare}
              onClearAll={onClearAll}
              compareMode={compareMode}
              onToggleCompareMode={onToggleCompareMode}
            />
          </div>
        </div>

        {/* not nested inside hero-map-backdrop: that div has a transform, which would make
            position:fixed below resolve against it instead of the viewport, breaking the
            getBoundingClientRect()-based coordinates computed in handleStateClick */}
        {!compareMode && compareSet.length === 1 && popupPoint && (
          <StatePopup
            name={compareSet[0]}
            x={popupPoint.x}
            y={popupPoint.y}
            discoms={discoms}
            year={year}
            stateHue={stateHue}
            geojson={geojson}
            onClose={() => onRemove(compareSet[0])}
            onViewFullReport={onViewFullReport}
          />
        )}
      </div>
    </section>
  );
}
