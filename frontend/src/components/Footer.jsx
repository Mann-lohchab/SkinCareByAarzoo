import React from 'react';
import { SkinIcon, HeartIcon } from './Icons';

export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#0A0A0A',
      color: 'white',
      padding: '4rem 2rem',
      borderTop: '3px solid var(--color-border)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
        maxWidth: '1280px',
        margin: '0 auto',
      }} className="footer-content">
        
        {/* Brand Section */}
        <div style={{ maxWidth: '300px', minWidth: '250px' }} className="footer-brand">
          <a href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'white',
            textDecoration: 'none',
            marginBottom: '1rem',
          }}>
            <SkinIcon size={28} />
            <span>SKINCARE BY AARZOO</span>
          </a>
          <p style={{ color: '#a0a0a0', lineHeight: 1.6, fontSize: '0.875rem' }}>
            Clinical skin health that addresses root causes, not just surface symptoms. 
            We combine clinical expertise with a root-cause approach to deliver long-term skin health.
          </p>
        </div>
        
        {/* Quick Links */}
        <div className="footer-section">
          <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700 }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="#philosophy" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Our Philosophy</a>
            <a href="#approach" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Our Approach</a>
            <a href="#pillars" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Three Pillars</a>
            <a href="#contact" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Book Consultation</a>
          </div>
        </div>
        
        {/* Our Services */}
        <div className="footer-section">
          <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700 }}>Our Services</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Clinical Skincare</a>
            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Nutridermatology</a>
            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Barrier Restoration</a>
            <a href="#" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>Personalized Protocols</a>
          </div>
        </div>
        
        {/* Contact */}
        <div className="footer-section">
          <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 700 }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="mailto:info@dermaclinical.com" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>skincare.by.aarzoo@gmail.com</a>
            <a href="tel:+1234567890" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '0.875rem' }}>+91 9811658943</a>
            <p style={{ color: '#a0a0a0', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Available for consultations by appointment
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div style={{ 
        marginTop: '3rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid #333', 
        color: '#666',
        textAlign: 'center',
        fontSize: '0.875rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          Made with <HeartIcon size={16} style={{ color: '#dc2626' }} /> for healthy skin
        </div>
        <p>© 2024 SkinCareByAarzoo. All rights reserved. | This is not routine skincare — it's clinical skin health.</p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column !important;
            align-items: flex-start;
          }
          .footer-section {
            width: 100%;
          }
          .footer-brand {
            width: 100%;
            max-width: 100% !important;
          }
        }
      `}</style>
    </footer>
  );
}
