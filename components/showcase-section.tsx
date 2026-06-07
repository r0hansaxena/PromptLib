"use client"
import code from '@/public/code.png'
import models from '@/public/models.png'
import document from '@/public/document.png'
import gallery from '@/public/gallery.png'
import Image from "next/image"

interface ShowcaseSectionProps {
  scrollToSection: (index: number) => void
}

export default function ShowcaseSection({ scrollToSection }: ShowcaseSectionProps) {
  const showcaseItems = [
    {
      title: "Sort by Models",
      image: models,
    },
    {
      title: "Image Generation",
      image: gallery,
    },
    {
      title: "Code Assistance",
      image: code,
    },
    {
      title: "Creative Writing",
      image: document,
    },
  ]

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full md:w-fit">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 text-balance">Explore by category</h2>
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto px-4">
            Browse thousands of prompts across different AI models and use cases
          </p>
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-4 w-max">
            {showcaseItems.map((item, index) => (
              <div
                key={index}
                className="liquid-glass group relative w-72 h-56 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl flex-shrink-0"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />

                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center gap-4">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    className={item.image === models ? "w-32" : "w-24"} 
                  />
                  <h3 className="text-xl font-bold text-black">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className="liquid-glass group relative h-48 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />

              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center gap-4">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  className={"w-32"} 
                />
                <h3 className="text-2xl font-bold text-black">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
