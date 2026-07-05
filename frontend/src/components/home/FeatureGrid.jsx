import featureImageOne from '../../assets/feature1.jpeg'
import featureImageTwo from '../../assets/feature2.jpeg'
import featureImageThree from '../../assets/feature3.jpeg'
import featureImageFour from '../../assets/feature4.jpeg'

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
                <img src={feature.image} alt={feature.title} />
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
