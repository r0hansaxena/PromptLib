"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, X, Mail } from "lucide-react"
import { toast } from "sonner"

interface WaitlistSectionProps {
  scrollToSection: (index: number) => void
}

export default function WaitlistSection({ scrollToSection }: WaitlistSectionProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading("Joining the waitlist...")
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    toast.dismiss(toastId);
    if (res.ok) {
      toast.success(data.message, { id: toastId });
      setSubmitted(true);
    } else {
      toast.error(data?.message || data.error || "Something went wrong", { id: toastId });
    }
    setLoading(false);
  }

  return (
    <section className="w-full h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="mb-8 inline-block">
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">Be First</div>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">Join the waitlist</h2>

        <p className="text-xl text-foreground/60 mb-12 max-w-xl mx-auto text-balance">
          Be the first to access Promptlib when we launch. Get early access to exclusive features and be part of our
          founding community.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 rounded-full !text-black placeholder:!text-black/50 liquid-glass !border-black focus:!border-black focus:!ring-2 focus:!ring-black focus-visible:!ring-black focus-visible:!ring-offset-0"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 mb-8 animate-in fade-in duration-300">
            <CheckCircle className="w-16 h-16 text-primary animate-bounce" />
            <p className="text-lg font-semibold text-foreground">Welcome to the waitlist! 🎉</p>
            <p className="text-foreground/60">Check your email for confirmation</p>
          </div>
        )}

        <p className="text-sm text-foreground/50">We'll never spam you. Unsubscribe anytime.</p>

        {/* Social Proof */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex items-center justify-center gap-6 text-foreground/50">
            <a href="https://x.com/rishabkrjha" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <X />
            </a>
            <a href="mailto:team@promptlib.site">
              <Mail />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
