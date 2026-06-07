"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import FloatingGallery from "./ui/FloatingGallery"
import { useRouter } from "next/navigation"

interface HeroSectionProps {
  scrollToSection: (index: number) => void
}

export default function HeroSection({ scrollToSection }: HeroSectionProps) {
  const router = useRouter();
  return (
    <FloatingGallery>
      <div className="fixed top-6 left-6 z-30">
        <div className="text-xl md:text-2xl font-medium tracking-wide">Promptlib</div>
      </div>

      <section className="z-10 w-full h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">

        <div className="relative z-20 text-center max-w-4xl mx-auto md:mt-11">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-medium text-foreground mb-6 leading-tight text-balance">
            All your prompts
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">in one place</span>
          </h1>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => scrollToSection(3)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-18 py-6 text-lg rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              Join Waitlist
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/home')}
              className="rounded-full py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
              variant="outline">
              Try Demo
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 w-full h-40 bg-gradient-to-t from-white to-transparent" />
      </section>
    </FloatingGallery>
  )
}
