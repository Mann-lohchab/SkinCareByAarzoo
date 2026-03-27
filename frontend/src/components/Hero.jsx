import React from 'react';
import ColorBends from './ColorBends';

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

        <div className="hero-spotlight brutalist-card">
          <div className="hero-spotlight-label">Why patients start here</div>
          <p className="hero-spotlight-text">
            We focus on understanding what is driving your skin concerns before pushing
            products, so your plan is built for your skin instead of trends.
          </p>

          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="hero-metric-value">01</span>
              <span className="hero-metric-label">Assessment first</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">02</span>
              <span className="hero-metric-label">Barrier-led care</span>
            </div>
            <div className="hero-metric">
              <span className="hero-metric-value">03</span>
              <span className="hero-metric-label">Practical routines</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
}
