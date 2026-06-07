"use client"
import share from '@/public/share.png'
import organize from '@/public/organize.png'
import eye from '@/public/eye.png'
import Image from "next/image"

interface FeaturesSectionProps {
  scrollToSection: (index: number) => void
}

export default function FeaturesSection({ scrollToSection }: FeaturesSectionProps) {
  const features = [
    {
      icon: organize,
      title: "Organize",
      description: "Save and organize your favorite prompts by category, model, and use case",
    },
    {
      icon: share,
      title: "Share",
      description: "Share your best prompts with the community and get feedback",
    },
    {
      icon: eye,
      title: "Discover",
      description: "Find prompts that inspire you and learn from the community",
    },
  ]

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 text-balance">Everything you need</h2>
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto px-4">
            A complete platform for prompt creators and enthusiasts
          </p>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {features.map((feature, index) => (
              <div
                key={index}
                className="liquid-glass group relative w-72 p-6 rounded-2xl bg-card transition-all duration-300 hover:shadow-lg flex-shrink-0"
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-24 h-24 mb-4 flex items-center justify-center">
                    <Image src={feature.icon} alt={feature.title} className="w-20 h-20" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="liquid-glass group relative p-8 rounded-2xl bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-32 h-27 rounded-xl p-3 mb-2 flex items-center justify-center">
                  <Image src={feature.icon} alt={feature.title} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
