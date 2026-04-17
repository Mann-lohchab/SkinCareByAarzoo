import featureImageOne from '../../../media&images/WhatsApp Unknown 2026-04-14 at 7.29.12 PM/2e0d214c5ab870f42049975ed11480b6 (1).jpg.jpeg'
import featureImageTwo from '../../../media&images/WhatsApp Unknown 2026-04-14 at 7.29.12 PM/e7ccc217301e8dbef9ad054436d7c0f7.jpg.jpeg'
import featureImageThree from '../../../media&images/WhatsApp Unknown 2026-04-14 at 7.29.12 PM/2ad1016a0e3767d9c311176b898b5eb9.jpg.jpeg'
import featureImageFour from '../../../media&images/WhatsApp Unknown 2026-04-14 at 7.29.12 PM/xxxsfssdfsd.jpeg'

const features = [
  {
    title: 'Root-cause analysis',
    description:
      'Detailed intake and skin-pattern mapping to identify the triggers behind recurring concerns.',
    cta: 'Explore diagnostics',
    image: featureImageOne,
  },
  {
    title: 'Personalized skincare plans',
    description:
      'Custom morning and evening routines calibrated to your sensitivity profile and lifestyle pace.',
    cta: 'View protocol design',
    image: featureImageTwo,
  },
  {
    title: 'Barrier restoration strategy',
    description:
      'Ingredient sequencing focused on calm recovery, hydration depth, and resilience-first progress.',
    cta: 'See restoration flow',
    image: featureImageThree,
  },
  {
    title: 'Long-term skin health',
    description:
      'A sustainable plan with ongoing review checkpoints to protect results and avoid cycle setbacks.',
    cta: 'Understand outcomes',
    image: featureImageFour,
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
