'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'acpet-tour-completed';

const SLIDES = [
  {
    title: 'Welcome to the DISCOM Performance Dashboard',
    body: 'A quick look at how to find your way around before you dive in — this only takes a few seconds.',
  },
  {
    title: 'Explore the map',
    body: 'Scroll down on the home page to bring the map of India into focus. Every clay-colored state is one ACPET tracks.',
    image: '/tour/map.png',
  },
  {
    title: 'Open a state’s report',
    body: 'Click any tracked state on the map to jump straight to its full performance report.',
    image: '/tour/report.png',
  },
  {
    title: 'Compare states side by side',
    body: 'Turn on Compare mode from the map controls, click states to add them, then review them together.',
    image: '/tour/compare.png',
  },
  {
    title: 'Use the sidebar to navigate',
    body: 'The menu icon in the top-left opens Home, Accessibility, and Methodology at any time.',
    image: '/tour/sidebar.png',
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  function goTo(next: number) {
    setDirection(next > step ? 'forward' : 'back');
    setStep(next);
  }

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
        <div className="tour-track">
          <div key={step} className={`tour-slide tour-slide--${direction}`}>
            {slide.image && (
              <div className="tour-visual" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image} alt="" className="tour-visual-img" />
              </div>
            )}
            <div className="tour-step-count">
              {step + 1} / {SLIDES.length}
            </div>
            <h2 id="tour-title">{slide.title}</h2>
            <p>{slide.body}</p>
          </div>
        </div>
        <div className="tour-bottom">
          <div className="tour-dots" aria-hidden="true">
            {SLIDES.map((_, i) => (
              <span key={i} className={`tour-dot${i === step ? ' active' : ''}`} />
            ))}
          </div>
          <div className="tour-actions">
            <button type="button" className="tour-btn tour-btn--ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
              Back
            </button>
            <button type="button" className="tour-btn tour-btn--primary" onClick={() => (isLast ? finish() : goTo(step + 1))}>
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
