import React from 'react';
import { ClinicalIcon, NutrientIcon, BarrierIcon, CheckIcon } from './Icons';

const pillars = [
  {
    icon: <ClinicalIcon size={28} />,
    title: "Clinical Skincare",
    description: "Evidence-based product protocols tailored to your specific skin condition. We use clinically proven ingredients at therapeutic concentrations.",
    features: [
      "Personalized product selection",
      "Science-backed formulations",
      "Proven efficacy",
      "Therapeutic concentrations"
    ]
  },
  {
    icon: <NutrientIcon size={28} />,
    title: "Nutridermatology",
    description: "We target internal imbalances that manifest on your skin. The gut-skin connection is real, and we address it directly.",
    features: [
      "Internal balance assessment",
      "Nutritional guidance",
      "Gut-skin axis optimization",
      "Holistic approach"
    ]
  },
  {
    icon: <BarrierIcon size={28} />,
    title: "Skin Barrier Restoration",
    description: "We repair and strengthen your skin's protective function—the foundation of healthy, resilient skin.",
    features: [
      "Barrier repair protocols",
      "Strengthening treatments",
      "Long-term resilience",
      "Protective function optimization"
    ]
  }
];

export function Pillars() {
  return (
    <section className="section" id="pillars" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="container" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem'}}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' ,}}>
          <h2 className="text-heading-lg" style={{ marginBottom: '1rem' }}>
            Our Three Pillars
          </h2>
          <p className="text-body-lg" style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            A comprehensive approach to skin health that addresses every aspect of your skin's needs 
            from the inside out.
          </p>
        </div>
        
        <div className="grid-3">
          {pillars.map((pillar, index) => (
            <div key={index} className="brutalist-card-blue" style={{ height: '100%' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                backgroundColor: 'var(--color-primary-blue)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '3px solid var(--color-border)',
                marginBottom: '1.25rem',
                color: 'white'
              }}>
                {pillar.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                {pillar.title}
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6, marginBottom: '1rem', fontSize: '0.875rem' }}>
                {pillar.description}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {pillar.features.map((feature, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.375rem 0',
                    fontSize: '0.8rem',
                    color: '#444'
                  }}>
                    <CheckIcon size={14} style={{ color: 'var(--color-primary-blue)' }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
