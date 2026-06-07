"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Layout } from "@/components/layout/layout"
import { Spinner } from "@/components/ui/spinner"
import type { Prompt, Post } from "@/lib/types"
import { convertPostToPrompt, setPostsCache } from "@/lib/storage"
import { DEFAULT_CATEGORIES } from "@/lib/categories"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { PinterestCard } from "@/components/prompt-card/pinterest-card"

export default function HomePage() {
  const router = useRouter()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"recent" | "popular">("popular")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState("")

  const fetchPosts = useCallback(async (pageNum: number, category: string, search: string, sort: string, append = false) => {
    if (append) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }

    try {
      let url = ""
      
      // Determine which endpoint to use
      if (search) {
        // Use search endpoint
        url = `/api/posts/search?q=${encodeURIComponent(search)}&page=${pageNum}&limit=20&sortBy=${sort}`
        if (category !== "All") {
          url += `&category=${encodeURIComponent(category)}`
        }
      } else if (category !== "All") {
        // Use category endpoint with 12 posts
        url = `/api/posts/category?category=${encodeURIComponent(category)}&page=${pageNum}&limit=12&sortBy=${sort}`
      } else {
        // Use regular posts endpoint
        url = `/api/posts?page=${pageNum}&limit=20&sortBy=${sort}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch posts")
      
      const { posts, hasMore: moreAvailable } = await response.json()

      // Cache posts for offline usage
      if (!append) {
        setPostsCache(posts)
      }

      const convertedPrompts = posts.map((post: Post) => convertPostToPrompt(post))

      if (append) {
        // Simply append to maintain order - no re-sorting
        setPrompts((prev) => [...prev, ...convertedPrompts])
      } else {
        // Initial load - set directly
        setPrompts(convertedPrompts)
      }

      setHasMore(moreAvailable)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load prompts. Please try again.")
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    setPrompts([]) // Clear existing prompts
    fetchPosts(1, selectedCategory, searchQuery, sortBy, false)
  }, [selectedCategory, searchQuery, sortBy, fetchPosts])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
      setPage(1) // Reset page when search changes
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchInput])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchPosts(nextPage, selectedCategory, searchQuery, sortBy, true)
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, isLoading, isLoadingMore, page, selectedCategory, searchQuery, sortBy, fetchPosts])

  if (isLoading && prompts.length === 0) {
    return (
      <Layout onSearchChange={setSearchInput} showSearch>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <Spinner />
          <p className="text-muted-foreground">Loading prompts...</p>
        </div>
      </Layout>
    )
  }

  const categoryOptions = ["All", ...DEFAULT_CATEGORIES.map((c) => c.name)]

  return (
    <Layout onSearchChange={setSearchInput} showSearch>
      <div className="w-full min-h-screen bg-background">
        {/* Category Pills & Sort - Sticky */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <div className="max-w-[2000px] mx-auto px-4 py-3">
            {/* Sort Toggle and Category Pills Container */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {/* Sort Toggle - Compact */}
              <div className="inline-flex rounded-lg bg-muted p-0.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setSortBy("recent")
                    setPage(1)
                    setPrompts([])
                  }}
                  className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    sortBy === "recent"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => {
                    setSortBy("popular")
                    setPage(1)
                    setPrompts([])
                  }}
                  className={`px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
                    sortBy === "popular"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Popular
                </button>
              </div>

              {/* Category Pills */}
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setPage(1)
                    setPrompts([])
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category
                      ? "bg-foreground text-background"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="max-w-[2000px] mx-auto px-4 py-6">
          {prompts.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                {searchQuery ? "No prompts found" : "No prompts yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search" : "Check back later for new prompts"}
              </p>
            </div>
          ) : (
            <>
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4">
                {prompts.map((prompt) => (
                  <PinterestCard key={prompt.id} prompt={prompt} />
                ))}
              </div>

              {/* Loading indicator for infinite scroll */}
              {isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <Spinner />
                </div>
              )}

              {/* Intersection observer target */}
              {hasMore && !isLoadingMore && (
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Scroll for more...</p>
                </div>
              )}

              {/* End of results */}
              {!hasMore && prompts.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <p className="text-sm text-muted-foreground">No more prompts to load</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
