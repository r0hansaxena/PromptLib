"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

interface HeaderProps {
  onSearchChange?: (query: string) => void
  showSearch?: boolean
}

export function Header({ onSearchChange, showSearch = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const router = useRouter()

  const menuItems = [
    { label: "home", href: "/home" },
    { label: "folders", href: "/folders" },
    { label: "feedback", href: "https://forms.gle/cJZoPjAiRaNoqbvi7"},
  ]

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onSearchChange?.(value)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-2 text-xl md:text-2xl font-medium tracking-wide">
            <span className="">Promptlib</span>
          </Link>

          {/* Hamburger Menu */}
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-muted rounded-lg transition">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-40 bg-background/90 backdrop-blur-xl rounded-lg shadow-lg p-2 space-y-1 border border-border/40">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 rounded-md hover:bg-muted transition capitalize text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for prompts"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-background/60 backdrop-blur border border-border/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Search size={12} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/create-post")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
          title="Create new post"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Post</span>
        </button>
      </div>
    </header>
  )
}
