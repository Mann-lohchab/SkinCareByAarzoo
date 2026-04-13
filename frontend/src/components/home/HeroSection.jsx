import { Link } from 'react-router-dom'

const floatingHighlights = [
  'Evidence-based skincare',
  'Personalized protocols',
  'Clinical approach',
]

const heroImage =
  'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdam.northwell.edu%2Fasset%2Fce00e809-4429-41f5-b477-f4186b115e91%2FDrupal%2FTheWell_skincare_AS_619348721.jpg&f=1&nofb=1&ipt=fea408fe2e300b67f0b8aebebf440f3e4b73b564e752e4324897dcf0fafc7c67'

export function HeroSection() {
  return (
    <section id="home" className="lux-hero">
      <div className="lux-hero-media" aria-hidden="true">
        <img src={heroImage} alt="" loading="eager" />
      </div>

      <div className="lux-hero-overlay" aria-hidden="true" />

      <div className="home-luxury-shell lux-hero-content" data-reveal>
        <span className="lux-kicker lux-kicker-light">Clinical Skin Intelligence</span>
        <h1>Reset your skin at the root.</h1>
        <p>
          Move beyond random products with a premium, evidence-led routine built for long-term
          skin integrity and visible confidence.
        </p>

        <div className="lux-hero-actions">
          <Link to="/signup" className="lux-btn lux-btn-primary">
            Start Your Journey
          </Link>
          <a href="#approach" className="lux-btn lux-btn-secondary">
            See Our Method
          </a>
        </div>
      </div>

      <div className="lux-floating-wrap" aria-hidden="true">
        {floatingHighlights.map((item, index) => (
          <div key={item} className={`lux-floating-card card-${index + 1}`}>
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}
