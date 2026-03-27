import React from 'react';
import { ClinicalIcon, NutrientIcon, BarrierIcon, LeafIcon, ShieldIcon, ScaleIcon } from './Icons';

export function ProblemSection() {
  return (
    <section className="section" id="philosophy" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem'}}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="text-heading-lg" style={{ marginBottom: '1rem' }}>
            Why Surface-Level Skincare Doesn't Work
          </h2>
          <p className="text-body-lg" style={{ color: '#666', marginBottom: '3rem' }}>
            Conventional skincare focuses on masking symptoms rather than addressing root causes. 
            True skin health requires a deeper understanding of internal imbalances.
          </p>
        </div>
        
        <div className="grid-3">
          {/* Card 1: Quick Fixes */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: 'var(--color-primary-blue)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <LeafIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Temporary Solutions
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Quick fixes and trend-based products provide short-term improvements 
              but don't address the underlying causes of skin concerns.
            </p>
          </div>
          
          {/* Card 2: Missing Root Cause */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#dc2626', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <SearchIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Ignoring Root Causes
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Surface treatments fail to identify internal imbalances, gut health issues, 
              and structural problems that manifest as skin conditions.
            </p>
          </div>
          
          {/* Card 3: One-Size-Fits-All */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#ea580c', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <ScaleIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              One-Size-Fits-All Approach
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Generic routines don't account for individual skin types, genetics, 
              lifestyle factors, or unique internal conditions.
            </p>
          </div>
          
          {/* Card 4: Overloaded Routines */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#7c3aed', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <ShieldIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Overloaded Routines
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Multi-step routines with numerous products can damage the skin barrier 
              and cause more harm than good.
            </p>
          </div>
          
          {/* Card 5: Harsh Ingredients */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#0891b2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <ClinicalIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Harsh Temporary Solutions
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Aggressive treatments and harsh ingredients may show quick results 
              but compromise long-term skin health.
            </p>
          </div>
          
          {/* Card 6: Trial and Error */}
          <div className="brutalist-card">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#be185d', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '3px solid var(--color-border)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <NutrientIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Endless Trial and Error
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Without expert guidance, individuals waste time and money on products 
              that never address their specific skin needs.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .brutalist-card {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </section>
  );
}

// Helper component for icon
function SearchIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
