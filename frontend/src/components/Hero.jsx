import React from 'react';
import ColorBends from './ColorBends';

const trustHighlights = [
  { label: 'Assessment-first approach', icon: 'scan' },
  { label: 'Barrier-safe, personalized care', icon: 'shield' },
  { label: 'Practical routines that fit your life', icon: 'routine' },
  { label: 'Results designed to last', icon: 'trend' },
];

const trustSteps = [
  { value: '01', label: 'Assessment first' },
  { value: '02', label: 'Barrier-safe care' },
  { value: '03', label: 'Lifestyle-fit routines' },
];

function TrustLineIcon({ icon }) {
  if (icon === 'scan') {
    return (
      <svg className="hero-trust-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9V6a2 2 0 0 1 2-2h3" />
        <path d="M15 4h3a2 2 0 0 1 2 2v3" />
        <path d="M20 15v3a2 2 0 0 1-2 2h-3" />
        <path d="M9 20H6a2 2 0 0 1-2-2v-3" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  if (icon === 'shield') {
    return (
      <svg className="hero-trust-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5.5 6v5.2c0 4.1 2.8 7.9 6.5 9.8 3.7-1.9 6.5-5.7 6.5-9.8V6L12 3Z" />
        <path d="m9.5 12 1.9 1.9 3.1-3.1" />
      </svg>
    );
  }

  if (icon === 'routine') {
    return (
      <svg className="hero-trust-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h13" />
        <path d="M4 12h9" />
        <path d="M4 18h13" />
        <circle cx="18" cy="6" r="1.4" />
        <circle cx="14" cy="12" r="1.4" />
        <circle cx="18" cy="18" r="1.4" />
      </svg>
    );
  }

  return (
    <svg className="hero-trust-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 15 5-5 4 4 7-7" />
      <path d="M16 7h4v4" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-background" aria-hidden="true">
        <ColorBends
          colors={['#C4A484', '#d9b89b', '#f6e6d6', '#C4A484']}
          speed={0.3}
          rotation={38}
          scale={1.2}
          frequency={1.5}
          warpStrength={1.2}
          mouseInfluence={0.5}
          parallax={0.3}
          noise={0.05}
          transparent
        />
      </div>

      <div className="container hero-shell">
        <div className="hero-copy">
          <div className="hero-eyebrow">Clinical Skin Health</div>

          <h1 className="hero-title">
            Reset your skincare around
            <span> root-cause clarity.</span>
          </h1>

          <p className="hero-description">
            SkinCare By Aarzoo helps you move beyond random products and temporary fixes
            with a clinical, personalized approach designed around long-term skin
            integrity.
          </p>

          <div className="hero-actions">
            <a href="#contact" className="btn-primary hero-primary-cta">
              Start Your Journey
            </a>
            <a href="#approach" className="btn-secondary hero-secondary-cta">
              See Our Method
            </a>
          </div>

          <div className="hero-proof-row">
            <div className="hero-proof-pill">Root-cause analysis</div>
            <div className="hero-proof-pill">Personalized protocols</div>
            <div className="hero-proof-pill">Long-term skin health</div>
          </div>
        </div>

        <div className="hero-spotlight">
          <div className="hero-spotlight-header">
            <div className="hero-spotlight-label">PATIENT TRUST</div>
            <h2 className="hero-spotlight-title">Why Patients Trust Us</h2>
          </div>

          <ul className="hero-trust-list" role="list">
            {trustHighlights.map((item) => (
              <li className="hero-trust-item" key={item.label}>
                <span className="hero-trust-icon-wrap" aria-hidden="true">
                  <TrustLineIcon icon={item.icon} />
                </span>
                <span className="hero-trust-text">{item.label}</span>
              </li>
            ))}
          </ul>

          <div className="hero-metrics" aria-label="Our care sequence">
            {trustSteps.map((step) => (
              <div className="hero-metric" key={step.value}>
                <span className="hero-metric-value">{step.value}</span>
                <span className="hero-metric-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
}
