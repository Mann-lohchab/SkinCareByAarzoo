const features = [
  {
    title: 'Root-cause analysis',
    description:
      'Detailed intake and skin-pattern mapping to identify the triggers behind recurring concerns.',
    cta: 'Explore diagnostics',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Personalized skincare plans',
    description:
      'Custom morning and evening routines calibrated to your sensitivity profile and lifestyle pace.',
    cta: 'View protocol design',
    image:
      'https://images.unsplash.com/photo-1526758097130-bab247274f58?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Barrier restoration strategy',
    description:
      'Ingredient sequencing focused on calm recovery, hydration depth, and resilience-first progress.',
    cta: 'See restoration flow',
    image:
      'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Long-term skin health',
    description:
      'A sustainable plan with ongoing review checkpoints to protect results and avoid cycle setbacks.',
    cta: 'Understand outcomes',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
]

export function FeatureGrid() {
  return (
    <section id="approach" className="lux-section lux-feature-section">
      <div className="home-luxury-shell">
        <header className="lux-feature-header" data-reveal>
          <div>
            <span className="lux-kicker">Our Method</span>
            <h2>Refined care architecture for calm, radiant skin.</h2>
          </div>
          <p>
            Every recommendation is selected to be practical, elegant, and clinically sensible from
            day one.
          </p>
        </header>

        <div className="lux-feature-grid">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="lux-feature-card"
              data-reveal
              style={{ '--reveal-delay': `${index * 0.08}s` }}
            >
              <div className="lux-feature-media">
                <img src={feature.image} alt={feature.title} loading="lazy" />
              </div>
              <div className="lux-feature-copy">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#results" className="lux-card-cta">
                  {feature.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
