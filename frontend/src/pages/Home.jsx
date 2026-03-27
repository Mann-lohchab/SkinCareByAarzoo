import React from 'react'
import '../style/Home.css'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { ProblemSection } from '../components/ProblemSection'
import { HowWeWork } from '../components/HowWeWork'
import { Pillars } from '../components/Pillars'
import { CTASection } from '../components/CTASection'
import { Footer } from '../components/Footer'

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowWeWork />
        <Pillars />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}

export default Home
