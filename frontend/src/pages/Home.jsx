import { LuxuryNavbar } from '../components/home/LuxuryNavbar'
import { HeroSection } from '../components/home/HeroSection'
import { FeatureGrid } from '../components/home/FeatureGrid'
import { Footer } from '../components/Footer'
import '../style/Home.css'

const principles = [
  {
    label: 'Barrier-first planning',
    copy: 'Every protocol starts by protecting skin function before active escalation.',
  },
  {
    label: 'Clinical personalization',
    copy: 'We adapt texture, timing, and ingredient loads to your skin behavior and lifestyle.',
  },
]

const outcomes = [
  {
    value: '12+ Weeks',
    title: 'Consistency Window',
    detail: 'Structured care cycles designed for measurable skin resilience, not quick spikes.',
  },
  {
    value: '1:1',
    title: 'Protocol Precision',
    detail: 'A routine mapped to your triggers, sensitivity profile, and recovery speed.',
  },
  {
    value: '360°',
    title: 'Whole-Skin Method',
    detail: 'Topical, habit, and clinical decisions aligned into a single long-term strategy.',
  },
]

const testimonials = [
  {
    quote:
      'My routine finally feels calm and intentional. The plan was simple to follow, and my skin stopped reacting to every change.',
    name: 'Riya M.',
    detail: 'Sensitive skin protocol',
  },
  {
    quote:
      'The consultation helped me understand what my skin actually needed instead of buying another random product.',
    name: 'Ananya S.',
    detail: 'Barrier repair plan',
  },
  {
    quote:
      'I liked how minimal the routine was. It felt premium, personal, and realistic for everyday life.',
    name: 'Mehak K.',
    detail: 'Personalized skincare plan',
  },
]

function Home() {
  return (
    <>
      <LuxuryNavbar />
      <main className="home-luxury-page">
        <HeroSection />

        <section id="about" className="lux-section lux-about">
          <div className="home-luxury-shell lux-about-grid">
            <div className="lux-about-copy">
              <span className="lux-kicker">Editorial Precision</span>
              <h2>Luxury skincare that is intentional, measured, and built to last.</h2>
              <p>
                We replace trial-and-error routines with a calm clinical framework. Every step is
                selected to support healthy skin architecture over time, so your glow is not
                temporary.
              </p>
            </div>

            <div className="lux-about-panel">
              {principles.map((item) => (
                <article key={item.label} className="lux-principle-item">
                  <h3>{item.label}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <FeatureGrid />

        <section id="results" className="lux-section lux-results">
          <div className="home-luxury-shell">
            <header className="lux-results-header">
              <span className="lux-kicker">Results</span>
              <h2>Skin confidence built through method, not guesswork.</h2>
            </header>

            <div className="lux-results-grid">
              {outcomes.map((item, index) => (
                <article
                  key={item.title}
                  className="lux-result-card"
                >
                  <p className="lux-result-value">{item.value}</p>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="lux-section lux-testimonials">
          <div className="home-luxury-shell">
            <header className="lux-testimonials-header">
              <span className="lux-kicker">Client Notes</span>
              <h2>Small routines. Clearer skin stories.</h2>
            </header>

            <div className="lux-testimonial-grid">
              {testimonials.map((item, index) => (
                <article
                  key={item.name}
                  className="lux-testimonial-card"
                >
                  <p className="lux-testimonial-quote">"{item.quote}"</p>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default Home
