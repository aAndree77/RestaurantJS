import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import MenuSection from "./components/MenuSection"
import AboutSection from "./components/AboutSection"
import TestimonialsSection from "./components/TestimonialsSection"

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <MenuSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <Footer />
    </>
  )
}
