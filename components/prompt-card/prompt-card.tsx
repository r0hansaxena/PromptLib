"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Bookmark, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import type { Prompt } from "@/lib/types"
import {
  savePromptToFolder,
  removePromptFromFolder,
  getAppState,
  hasUserUpvoted,
  addUpvote,
  updatePostLikes,
  saveAppState,
  removeUpvote,
  removeFromLikedFolder,
} from "@/lib/storage"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface PromptCardProps {
  prompt: Prompt
  onLikeChange?: () => void
}

const GRADIENTS = [
  "from-pink-100 to-purple-100",
  "from-blue-100 to-cyan-100",
  "from-green-100 to-emerald-100",
  "from-yellow-100 to-orange-100",
  "from-red-100 to-pink-100",
  "from-violet-100 to-purple-100",
  "from-indigo-100 to-blue-100",
  "from-teal-100 to-green-100",
]

export function PromptCard({ prompt, onLikeChange }: PromptCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const [likes, setLikes] = useState(prompt.likes)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [randomGradient, setRandomGradient] = useState("")
  const touchStartX = useRef(0)

  useEffect(() => {
    setIsLiked(hasUserUpvoted(prompt.id))
    setRandomGradient(GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)])
  }, [prompt.id])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const wasLiked = isLiked
    
    // Toggle optimistically
    setIsLiked(!isLiked)
    setLikes((prev) => wasLiked ? prev - 1 : prev + 1)

    try {
      const response = await fetch(`/api/posts/${prompt.id}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: wasLiked ? 'downvote' : 'upvote' }),
      })

      if (!response.ok) {
        throw new Error("Failed to update like")
      }

      const { upvotes } = await response.json()
      setLikes(upvotes)
      updatePostLikes(prompt.id, upvotes)

      if (wasLiked) {
        // Downvote: Remove from liked folder
        removeUpvote(prompt.id)
        removeFromLikedFolder(prompt.id)
        toast.success("Removed from likes")
      } else {
        // Upvote: Add to liked folder
        addUpvote(prompt.id)
        const state = getAppState()
        const likedFolder = state.folders.find(f => f.type === "liked")
        
        if (likedFolder && !likedFolder.prompts.find(p => p.id === prompt.id)) {
          likedFolder.prompts.unshift(prompt)
          saveAppState(state)
        }
        toast.success("Added to likes ❤️")
      }

      onLikeChange?.()
    } catch (error) {
      console.error("Error updating like:", error)
      // Revert on error
      setIsLiked(wasLiked)
      setLikes((prev) => wasLiked ? prev + 1 : prev - 1)
      toast.error("Failed to update like. Please try again.")
    }
  }

  const handleSaveToFolder = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const state = getAppState()
    const isInFolder = state.folders.find((f) => f.id === folderId)?.prompts.some((p) => p.id === prompt.id)

    if (isInFolder) {
      removePromptFromFolder(prompt.id, folderId)
      toast.info("Removed from folder")
    } else {
      savePromptToFolder(prompt.id, folderId)
      toast.info("Saved to folder")
    }
  }

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    toast.success("Prompt copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (prompt.promptResult && prompt.promptResult.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? prompt.promptResult!.length - 1 : prev - 1))
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (prompt.promptResult && prompt.promptResult.length > 0) {
      setCurrentImageIndex((prev) => (prev === prompt.promptResult!.length - 1 ? 0 : prev + 1))
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX
    if (touchStartX.current - touchEndX > 50) {
      handleNextImage(e as any)
    } else if (touchEndX - touchStartX.current > 50) {
      handlePrevImage(e as any)
    }
  }

  const mainTag = prompt.tags[0]
  const cardWidth = 300
  //aspect ratios:
  const aspectRatios: { [key: string]: number } = {
    "1:1": 300,
    "2:3": 450,
    "4:5": 375,
    "16:9": 169,
  }
  const cardHeight = aspectRatios[prompt.aspectRatio] || 300

  const state = getAppState()
  const attachments =
    prompt.promptResult && prompt.promptResult.length > 0 ? prompt.promptResult : prompt.sourceAttachments || []

  return (
    <Link href={`/post/${prompt.id}`}>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 bg-background/60 backdrop-blur border border-border/40 group hover:border-primary/40 shadow-lg hover:shadow-xl"
        style={{ width: cardWidth, height: cardHeight }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {prompt.mainImageUrl ? (
          <>
            <Image
              src={attachments[currentImageIndex]?.url || prompt.mainImageUrl || "/placeholder.svg"}
              alt={prompt.title}
              fill
              className="object-cover"
              sizes="300px"
            />
            {isHovering && (
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-3 animate-in fade-in backdrop-blur-sm">
                <div>
                  <h3 className="text-white font-semibold line-clamp-2 text-sm">{prompt.title}</h3>
                  {prompt.category && <p className="text-white/80 text-xs mt-1">{prompt.category}</p>}
                </div>

                {attachments.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                    <button
                      onClick={handlePrevImage}
                      className="pointer-events-auto p-1 bg-white/20 hover:bg-white/40 rounded text-white transition"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="pointer-events-auto p-1 bg-white/20 hover:bg-white/40 rounded text-white transition"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1"
                        >
                          {tag.icon} {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLike}
                        className="flex items-center gap-1 hover:opacity-70 transition"
                        title={isLiked ? "Unlike" : "Like"}
                      >
                        <Heart
                          size={16}
                          className={`transition ${isLiked ? "text-red-500 fill-red-500" : ""}`}
                          fill={isLiked ? "currentColor" : "none"}
                        />
                        <span className="text-sm font-medium">{likes}</span>
                      </button>
                      <button onClick={handleCopyPrompt} className="hover:opacity-70 transition" title="Copy prompt">
                        <Copy size={14} />
                      </button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="hover:opacity-70 transition" title="Save to folder">
                          <Bookmark size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        {state.folders.map((folder) => (
                          <DropdownMenuItem key={folder.id} onClick={(e) => handleSaveToFolder(e as any, folder.id)}>
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className={`w-full h-full p-4 flex flex-col justify-center items-center bg-gradient-to-br ${randomGradient} transition-all ${
              isHovering ? "backdrop-blur-md" : ""
            }`}
          >
            {!isHovering && (
              <div className="text-center space-y-3 w-full">
                {mainTag && <div className="text-4xl">{mainTag.icon}</div>}
                <h3 className="font-bold text-lg line-clamp-3 text-foreground">{prompt.title}</h3>
                {prompt.category && <p className="text-xs text-foreground/60">{prompt.category}</p>}
              </div>
            )}

            {isHovering && (
              <div className="absolute inset-0 bg-black/20 flex flex-col justify-between p-4 animate-in fade-in">
                <div className="text-center space-y-3 w-full flex-1 flex flex-col justify-center items-center">
                  {mainTag && <div className="text-5xl">{mainTag.icon}</div>}
                  <p className="text-white font-semibold text-sm line-clamp-4 leading-relaxed">{prompt.prompt}</p>
                </div>

                <div className="flex items-center justify-between text-white gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className="flex items-center gap-1 hover:opacity-70 transition"
                      title={isLiked ? "Unlike" : "Like"}
                    >
                      <Heart
                        size={16}
                        className={`transition ${isLiked ? "text-red-500 fill-red-500" : ""}`}
                        fill={isLiked ? "currentColor" : "none"}
                      />
                      <span className="text-sm font-medium">{likes}</span>
                    </button>
                    <button onClick={handleCopyPrompt} className="hover:opacity-70 transition" title="Copy prompt">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
