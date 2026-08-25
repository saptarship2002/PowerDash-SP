'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'acpet-tour-completed';

const BLOB = 'M60 18 C90 8 130 10 152 26 C172 40 176 62 164 78 C176 90 172 108 152 114 C126 122 92 122 70 110 C46 122 22 112 20 92 C6 82 8 62 22 52 C14 38 30 22 60 18 Z';

function WelcomeVisual() {
  return (
    <svg className="tour-visual-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="60" r="38" className="tour-ill-badge" />
      <path d="M116 34 L92 66 h16 l-6 30 30 -38 h-16 z" className="tour-ill-bolt" />
      <circle cx="42" cy="30" r="4" className="tour-ill-dot-accent" />
      <circle cx="184" cy="40" r="3" className="tour-ill-dot-muted" />
      <circle cx="176" cy="98" r="5" className="tour-ill-dot-map" />
      <circle cx="30" cy="96" r="3" className="tour-ill-dot-muted" />
    </svg>
  );
}

function ExploreMapVisual() {
  return (
    <svg className="tour-visual-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={BLOB} className="tour-ill-map" transform="translate(-4 0) scale(0.92)" />
      <rect x="176" y="20" width="20" height="32" rx="10" className="tour-ill-outline" />
      <line x1="186" y1="28" x2="186" y2="36" className="tour-ill-outline" strokeLinecap="round" />
      <path d="M182 60 v10 m-4 -5 l4 5 4 -5" className="tour-ill-outline" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OpenReportVisual() {
  return (
    <svg className="tour-visual-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d={BLOB} className="tour-ill-map-idle" transform="translate(-14 4) scale(0.72)" />
      <circle cx="70" cy="58" r="10" className="tour-ill-dot-accent" />
      <path d="M78 68 L96 84" className="tour-ill-outline" strokeLinecap="round" />
      <path d="M94 80 l4 8 -10 -2 z" className="tour-ill-bolt" />
      <rect x="118" y="34" width="76" height="66" rx="8" className="tour-ill-card" />
      <line x1="132" y1="52" x2="180" y2="52" className="tour-ill-outline" strokeLinecap="round" />
      <line x1="132" y1="66" x2="180" y2="66" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="132" y1="78" x2="166" y2="78" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="132" y1="90" x2="172" y2="90" className="tour-ill-outline-soft" strokeLinecap="round" />
    </svg>
  );
}

function CompareVisual() {
  return (
    <svg className="tour-visual-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="26" width="72" height="78" rx="10" className="tour-ill-card" />
      <circle cx="42" cy="50" r="7" className="tour-ill-dot-cat0" />
      <line x1="58" y1="47" x2="80" y2="47" className="tour-ill-outline" strokeLinecap="round" />
      <line x1="30" y1="70" x2="80" y2="70" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="30" y1="82" x2="66" y2="82" className="tour-ill-outline-soft" strokeLinecap="round" />

      <rect x="130" y="26" width="72" height="78" rx="10" className="tour-ill-card" />
      <circle cx="154" cy="50" r="7" className="tour-ill-dot-cat1" />
      <line x1="170" y1="47" x2="192" y2="47" className="tour-ill-outline" strokeLinecap="round" />
      <line x1="142" y1="70" x2="192" y2="70" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="142" y1="82" x2="178" y2="82" className="tour-ill-outline-soft" strokeLinecap="round" />

      <circle cx="110" cy="65" r="15" className="tour-ill-badge" />
      <path d="M104 65 h12 m-4 -4 l4 4 -4 4" className="tour-ill-outline" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarVisual() {
  return (
    <svg className="tour-visual-svg" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="16" width="30" height="30" rx="8" className="tour-ill-badge-solid" />
      <line x1="22" y1="26" x2="36" y2="26" className="tour-ill-bar" strokeLinecap="round" />
      <line x1="22" y1="32" x2="36" y2="32" className="tour-ill-bar" strokeLinecap="round" />
      <line x1="22" y1="38" x2="36" y2="38" className="tour-ill-bar" strokeLinecap="round" />

      <rect x="70" y="14" width="136" height="102" rx="10" className="tour-ill-card" />
      <rect x="82" y="26" width="112" height="18" rx="6" className="tour-ill-row-active" />
      <line x1="90" y1="35" x2="140" y2="35" className="tour-ill-outline-oninverse" strokeLinecap="round" />
      <line x1="90" y1="56" x2="150" y2="56" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="90" y1="76" x2="150" y2="76" className="tour-ill-outline-soft" strokeLinecap="round" />
      <line x1="90" y1="96" x2="150" y2="96" className="tour-ill-outline-soft" strokeLinecap="round" />

      <path d="M50 30 C 58 30, 62 30, 68 30" className="tour-ill-outline" strokeLinecap="round" strokeDasharray="3 4" />
      <path d="M62 24 l6 6 -6 6" className="tour-ill-outline" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SLIDES = [
  {
    title: 'Welcome to the DISCOM Performance Dashboard',
    body: 'A quick look at how to find your way around before you dive in — this only takes a few seconds.',
    visual: <WelcomeVisual />,
  },
  {
    title: 'Explore the map',
    body: 'Scroll down on the home page to bring the map of India into focus. Every clay-colored state is one ACPET tracks.',
    visual: <ExploreMapVisual />,
  },
  {
    title: 'Open a state’s report',
    body: 'Click any tracked state on the map to jump straight to its full performance report.',
    visual: <OpenReportVisual />,
  },
  {
    title: 'Compare states side by side',
    body: 'Turn on Compare mode from the map controls, click states to add them, then review them together.',
    visual: <CompareVisual />,
  },
  {
    title: 'Use the sidebar to navigate',
    body: 'The menu icon in the top-left opens Home, Accessibility, and Methodology at any time.',
    visual: <SidebarVisual />,
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — skip the tour rather than risk a crash
    }
  }, []);

  function finish() {
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore — worst case the tour reappears next visit
    }
  }

  if (!visible) return null;

  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  return (
    <div className="tour-scrim" role="presentation">
      <div className="tour-dialog" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <button type="button" className="tour-skip" onClick={finish}>
          Skip tour
        </button>
        <div className="tour-visual" aria-hidden="true">
          {slide.visual}
        </div>
        <div className="tour-step-count">
          {step + 1} / {SLIDES.length}
        </div>
        <h2 id="tour-title">{slide.title}</h2>
        <p>{slide.body}</p>
        <div className="tour-dots" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span key={i} className={`tour-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>
        <div className="tour-actions">
          <button type="button" className="tour-btn tour-btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </button>
          <button type="button" className="tour-btn tour-btn--primary" onClick={() => (isLast ? finish() : setStep((s) => s + 1))}>
            {isLast ? 'Get started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
