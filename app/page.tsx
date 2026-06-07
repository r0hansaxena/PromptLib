"use client"

import { useRef, useEffect, useState } from "react"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import ShowcaseSection from "@/components/showcase-section"
import WaitlistSection from "@/components/waitlist-section"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const sections = [
    { id: "hero", component: HeroSection },
    { id: "features", component: FeaturesSection },
    { id: "showcase", component: ShowcaseSection },
    { id: "waitlist", component: WaitlistSection },
  ]

  // Mouse wheel handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling) return

      const direction = e.deltaY > 0 ? 1 : -1
      const nextSection = Math.max(0, Math.min(sections.length - 1, currentSection + direction))

      if (nextSection !== currentSection) {
        setIsScrolling(true)
        setCurrentSection(nextSection)
        setTimeout(() => setIsScrolling(false), 800)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [currentSection, isScrolling, sections.length])

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isSwipeUp = distance > 50
    const isSwipeDown = distance < -50

    if (isScrolling) return

    if (isSwipeUp && currentSection < sections.length - 1) {
      setIsScrolling(true)
      setCurrentSection(currentSection + 1)
      setTimeout(() => setIsScrolling(false), 800)
    }

    if (isSwipeDown && currentSection > 0) {
      setIsScrolling(true)
      setCurrentSection(currentSection - 1)
      setTimeout(() => setIsScrolling(false), 800)
    }

    // Reset
    setTouchStart(0)
    setTouchEnd(0)
  }

  const scrollToSection = (index: number) => {
    setCurrentSection(index)
    setIsScrolling(true)
    setTimeout(() => setIsScrolling(false), 800)
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden bg-background"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {sections.map((section, index) => {
        const Component = section.component
        return (
          <div
            key={section.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSection
                ? "opacity-100 translate-y-0"
                : index < currentSection
                  ? "opacity-0 -translate-y-full"
                  : "opacity-0 translate-y-full"
            }`}
          >
            <Component scrollToSection={scrollToSection} />
          </div>
        )
      })}

      {/* Progress Dots */}
      <div className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-20 flex-col gap-4">
        {sections.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSection ? "bg-primary w-8" : "bg-foreground/20 hover:bg-foreground/40"
            }`}
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
