"use client"

import type { ReactNode } from "react"
import { Header } from "./header"

interface LayoutProps {
  children: ReactNode
  onSearchChange?: (query: string) => void
  showSearch?: boolean
}

export function Layout({ children, onSearchChange, showSearch = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onSearchChange={onSearchChange} showSearch={showSearch} />
      <main className="w-full">{children}</main>
    </div>
  )
}
