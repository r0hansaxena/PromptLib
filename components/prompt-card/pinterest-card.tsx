"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Heart, Copy, Bookmark } from "lucide-react"
import { toast } from "sonner"
import type { Prompt } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/categories"
import {
  hasUserUpvoted,
  addUpvote,
  removeUpvote,
  updatePostLikes,
  getAppState,
  saveAppState,
  removeFromLikedFolder,
  savePromptToFolder,
  removePromptFromFolder,
} from "@/lib/storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PinterestCardProps {
  prompt: Prompt
}

export function PinterestCard({ prompt }: PinterestCardProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mediaLoaded, setMediaLoaded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(prompt.likes)
  const [copied, setCopied] = useState(false)
  const [folders, setFolders] = useState<any[]>([])
  const [gradient, setGradient] = useState<string>("from-gray-500 to-gray-700")

  useEffect(() => {
    const hasUpvoted = hasUserUpvoted(prompt.id)
    setIsLiked(hasUpvoted)
    console.log(prompt)
    getGradient()
    
    const state = getAppState()
    setFolders(state.folders.filter(f => f.type !== "liked"))
  }, [prompt.id])

  const mainMedia = prompt.mainImageUrl || prompt.promptResult?.[0]?.url
  
  // Check if media is a video
  const isVideo = mainMedia && (
    mainMedia.endsWith('.mp4') || 
    mainMedia.endsWith('.webm') || 
    mainMedia.endsWith('.mov') ||
    mainMedia.includes('video')
  )

  // Play/pause video on hover
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {
          // Autoplay failed, ignore
        })
      } else {
        videoRef.current.pause()
      }
    }
  }, [isHovered])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasLiked = isLiked
    
    setIsLiked(!isLiked)
    setLikes((prev) => wasLiked ? prev - 1 : prev + 1)

    try {
      const response = await fetch(`/api/posts/${prompt.id}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: wasLiked ? 'downvote' : 'upvote' }),
      })

      if (!response.ok) throw new Error("Failed to update like")

      const { upvotes } = await response.json()
      setLikes(upvotes)
      updatePostLikes(prompt.id, upvotes)

      if (wasLiked) {
        removeUpvote(prompt.id)
        removeFromLikedFolder(prompt.id)
        toast.success("Removed from likes")
      } else {
        addUpvote(prompt.id)
        const state = getAppState()
        const likedFolder = state.folders.find(f => f.type === "liked")
        
        if (likedFolder && !likedFolder.prompts.find(p => p.id === prompt.id)) {
          likedFolder.prompts.unshift(prompt)
          saveAppState(state)
        }
        toast.success("Added to likes ❤️")
      }
    } catch (error) {
      console.error("Error updating like:", error)
      setIsLiked(wasLiked)
      setLikes((prev) => wasLiked ? prev + 1 : prev - 1)
      toast.error("Failed to update like")
    }
  }

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)
    toast.success("Prompt copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveToFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation()
    const state = getAppState()
    const isInFolder = state.folders.find((f) => f.id === folderId)?.prompts.some((p) => p.id === prompt.id)

    if (isInFolder) {
      removePromptFromFolder(prompt.id, folderId)
      toast.info("Removed from folder")
    } else {
      savePromptToFolder(prompt.id, folderId)
      toast.success("Saved to folder")
    }
  }

  function getGradient() {
    DEFAULT_CATEGORIES.map((cat: { id: string; gradient: string }) => {
      if (cat.id === prompt.category?.toLowerCase()) {
        setGradient(cat.gradient)
      }
    })
  }
  return (
    <div
      className="mb-4 break-inside-avoid cursor-pointer group"
      onClick={() => router.push(`/post/${prompt.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative rounded-2xl overflow-hidden bg-muted shadow-lg hover:shadow-xl transition-shadow">
        {/* Image/Video Card */}
        {mainMedia ? (
          <div className="relative">
            {isVideo ? (
              <video
                ref={videoRef}
                src={mainMedia}
                muted
                loop
                playsInline
                className={`w-full h-auto transition-all duration-300 ${
                  mediaLoaded ? "opacity-100" : "opacity-0"
                } ${isHovered ? "brightness-90" : ""}`}
                onLoadedData={() => setMediaLoaded(true)}
                preload="metadata"
              />
            ) : (
              <img
                src={mainMedia}
                alt={prompt.title}
                className={`w-full h-auto transition-all duration-300 ${
                  mediaLoaded ? "opacity-100" : "opacity-0"
                } ${isHovered ? "brightness-90" : ""}`}
                onLoad={() => setMediaLoaded(true)}
                loading="lazy"
              />
            )}
            
            {!mediaLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            {/* Gradient overlay for text visibility (always visible) */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

            {/* Title (always visible on bottom) */}
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <h3 className="text-white font-bold text-base line-clamp-2 drop-shadow-lg">
                {prompt.title}
              </h3>
            </div>

            {/* Overlay on Hover */}
            <div
              className={`absolute inset-0 bg-black/50 transition-opacity duration-200 flex flex-col justify-between p-4 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Top Actions */}
              <div className="flex items-start justify-end gap-2">
                <div className="absolute top-6 left-3 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-foreground shadow-lg">
                  {prompt?.model || ""}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button
                      className="p-2.5 bg-white hover:bg-white/90 rounded-full transition shadow-lg"
                      title="Save to folder"
                    >
                      <Bookmark size={18} className="text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    {folders.length > 0 ? (
                      folders.map((folder) => (
                        <DropdownMenuItem key={folder.id} onClick={(e) => handleSaveToFolder(e as any, folder.id)}>
                          {folder.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No folders yet</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-white/90 rounded-full transition shadow-lg"
                  title={isLiked ? "Unlike" : "Like"}
                >
                  <Heart
                    size={16}
                    className={`transition ${isLiked ? "text-red-500 fill-red-500" : "text-foreground"}`}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  <span className="text-sm font-semibold text-foreground">{likes}</span>
                </button>
                
                <button
                  onClick={handleCopyPrompt}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition shadow-lg ${
                    copied 
                      ? "bg-green-500 text-white" 
                      : "bg-white hover:bg-white/90 text-foreground"
                  }`}
                  title="Copy prompt"
                >
                  <Copy size={16} />
                  <span className="text-sm font-semibold">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Text-only Card with Gradient */
          <div className={`relative min-h-[280px] bg-gradient-to-br ${gradient} p-6 flex flex-col`}>
            {/* Save Button - Top Right (show on hover) */}
            <div className={`flex justify-end mb-4 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute top-6 left-3 px-3 py-3 rounded-full bg-white/90 text-xs font-medium text-foreground shadow-lg">
                    {prompt?.model || ""}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button
                    className="p-2.5 bg-white hover:bg-white/90 rounded-full transition shadow-lg"
                    title="Save to folder"
                  >
                    <Bookmark size={18} className="text-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {folders.length > 0 ? (
                    folders.map((folder) => (
                      <DropdownMenuItem key={folder.id} onClick={(e) => handleSaveToFolder(e as any, folder.id)}>
                        {folder.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No folders yet</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center">
              {isHovered ? (
                <p className="text-center text-sm font-medium text-foreground/90 line-clamp-3 leading-relaxed px-2">
                  {prompt.prompt}
                </p>
              ) : (
                <h3 className="text-center font-bold text-xl text-foreground line-clamp-3 px-2">
                  {prompt.title}
                </h3>
              )}
            </div>

            {/* Action Buttons - Bottom (show on hover) */}
            <div className={`flex items-center justify-center gap-2 mt-4 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-white/90 rounded-full transition shadow-lg"
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart
                  size={16}
                  className={`transition ${isLiked ? "text-red-500 fill-red-500" : "text-foreground"}`}
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span className="text-sm font-semibold text-foreground">{likes}</span>
              </button>
              
              <button
                onClick={handleCopyPrompt}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition shadow-lg ${
                  copied 
                    ? "bg-green-500 text-white" 
                    : "bg-white hover:bg-white/90 text-foreground"
                }`}
                title="Copy prompt"
              >
                <Copy size={16} />
                <span className="text-sm font-semibold">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
