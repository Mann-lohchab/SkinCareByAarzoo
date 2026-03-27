import React from 'react';
import { SearchIcon, ShieldIcon, ScaleIcon, CheckIcon, XIcon, ClinicalIcon } from './Icons';

export function HowWeWork() {
  return (
    <section className="section" id="approach" >
      <div className="container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="text-heading-lg" style={{ marginBottom: '1rem' }}>
            Our Clinical Approach
          </h2>
          <p className="text-body-lg" style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            We combine clinical expertise with a root-cause approach to deliver long-term skin health 
            rather than temporary results.
          </p>
        </div>
        
        {/* Methodology Architecture - Responsive */}
        <div className="brutalist-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '2rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
            Our Methodology
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Row 1: Initial Consultation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }} className="methodology-row">
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f5f5f5', 
                border: '3px solid var(--color-border)',
                textAlign: 'center',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <SearchIcon size={20} />
                Initial Assessment
              </div>
              <div style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--color-primary-blue)', fontWeight: 800 }}>↓</div>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: 'var(--color-primary-blue)', 
                border: '3px solid var(--color-border)',
                color: 'white',
                textAlign: 'center',
                fontWeight: 700,
                boxShadow: '4px 4px 0px black'
              }}>
                Clinical Analysis
              </div>
            </div>
            
            {/* Arrow down */}
            <div style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--color-primary-blue)', fontWeight: 800 }}>
              ↓
            </div>
            
            {/* Row 2: Processing Steps - Responsive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="methodology-grid">
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: 'white', 
                border: '3px solid var(--color-border)',
                textAlign: 'center',
                boxShadow: '4px 4px 0px black'
              }}>
                <SearchIcon size={24} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>1. Root Cause Analysis</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Identify internal imbalances
                </div>
              </div>
              
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: 'white', 
                border: '3px solid var(--color-border)',
                textAlign: 'center',
                boxShadow: '4px 4px 0px black'
              }}>
                <ShieldIcon size={24} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>2. Personalized Protocol</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Tailored treatment plan
                </div>
              </div>
              
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: 'white', 
                border: '3px solid var(--color-border)',
                textAlign: 'center',
                boxShadow: '4px 4px 0px black'
              }}>
                <ScaleIcon size={24} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>3. Long-Term Monitoring</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                  Ongoing support & adjustment
                </div>
              </div>
            </div>
            
            {/* Arrow down */}
            <div style={{ textAlign: 'center', fontSize: '1.5rem', color: '#22c55e', fontWeight: 800 }}>
              ↓
            </div>
            
            {/* Row 3: Outcome - Responsive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }} className="outcome-grid">
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f0fdf4', 
                border: '3px solid #22c55e',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap'
              }}>
                <CheckIcon size={14} style={{ color: '#22c55e' }} />
                Healthy Skin
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fef2f2', 
                border: '3px solid #dc2626',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap'
              }}>
                <XIcon size={14} style={{ color: '#dc2626' }} />
                Temp Fixes
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#fffbeb', 
                border: '3px solid #f59e0b',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap'
              }}>
                <ClinicalIcon size={14} style={{ color: '#f59e0b' }} />
                Sustainable
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Points - Responsive */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '3rem', maxWidth: '900px', margin: '3rem auto 0' }} className="key-points-grid">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--color-primary-blue)', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Clinical Expertise</h4>
              <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                Every protocol is developed and monitored by clinical skincare experts with years of experience.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--color-primary-blue)', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Root Cause Focus</h4>
              <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                We identify and treat the underlying causes of skin concerns, not just the symptoms.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--color-primary-blue)', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Personalized Protocols</h4>
              <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                Every recommendation is precise and every protocol is personalized to your unique skin needs.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: 'var(--color-primary-blue)', 
              color: 'white',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              flexShrink: 0
            }}>
              4
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sustainable Results</h4>
              <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.875rem' }}>
                We focus on restoring skin to a healthy resilient baseline using methods that are both effective and sustainable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .methodology-grid {
            grid-template-columns: 1fr !important;
          }
          .outcome-grid {
            grid-template-columns: 1fr !important;
          }
          .key-points-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 480px) {
          .brutalist-card {
            padding: 1rem !important;
          }
        }
      `}</style>
    </section>
  );
}
