"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { ChevronLeft, Heart, Copy, Bookmark, ChevronRight, X, Play, Pause, ChevronDown, ChevronUp, ExternalLink, Maximize2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  getAppState,
  savePromptToFolder,
  convertPostToPrompt,
  addPrompt,
  hasUserUpvoted,
  addUpvote,
  saveAppState,
  removeUpvote,
  removeFromLikedFolder,
} from "@/lib/storage"
import type { Post,Models } from "@/lib/types"
import { DEFAULT_MODELS } from "@/lib/models"
import { toast } from "sonner"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [folders, setFolders] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [modalImageSource, setModalImageSource] = useState<'results' | 'attachments'>('results')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ? 'video' : 'image'
  }
  const [currentModel, setCurrentModel] = useState<Models | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`)
        if (!response.ok) throw new Error("Failed to fetch post")
        const { post: found } = await response.json()
        
        if (found) {
          setPost(found)
          setUpvoteCount(found.upvotes || 0)
          setIsLiked(hasUserUpvoted(postId))

          const prompt = convertPostToPrompt(found)
          addPrompt(prompt)
        }

        const state = getAppState()
        setFolders(state.folders.filter((f) => f.type === "custom"))
      
        // Find the current model
        DEFAULT_MODELS.forEach((model)=> {
          if (model.name === found.model) {
            setCurrentModel(model)
          }
        })

      } catch (error) {
        console.error("Error fetching post:", error)
        toast.error("Failed to load the post. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleUpvote = async () => {
    const wasLiked = isLiked
    
    setUpvoteCount(wasLiked ? upvoteCount - 1 : upvoteCount + 1)
    setIsLiked(!wasLiked)
    setIsUpvoting(true)

    try {
      const response = await fetch(`/api/posts/${postId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: wasLiked ? 'downvote' : 'upvote' }),
      })

      if (!response.ok) throw new Error("Failed to update upvote")

      const { upvotes } = await response.json()
      setUpvoteCount(upvotes)

      if (wasLiked) {
        removeUpvote(postId)
        removeFromLikedFolder(postId)
        toast.success("Removed from likes")
      } else {
        addUpvote(postId)
        if (post) {
          const prompt = convertPostToPrompt(post)
          const state = getAppState()
          const likedFolder = state.folders.find(f => f.type === "liked")
          
          if (likedFolder && !likedFolder.prompts.find(p => p.id === prompt.id)) {
            likedFolder.prompts.unshift(prompt)
            saveAppState(state)
          }
        }
        toast.success("Added to likes ❤️")
      }
      
    } catch (error) {
      console.error("Error upvoting post:", error)
      setUpvoteCount(wasLiked ? upvoteCount + 1 : upvoteCount - 1)
      setIsLiked(wasLiked)
      toast.error("Failed to update like. Please try again.")
    } finally {
      setIsUpvoting(false)
    }
  }

  const handleSaveToFolder = (folderId: string) => {
    setIsSaving(true)
    try {
      if (post) {
        const prompt = convertPostToPrompt(post)
        savePromptToFolder(prompt.id, folderId)
        toast.success("Saved to folder")
      }
    } catch (error) {
      console.error("Error saving to folder:", error)
      toast.error("Failed to save to folder")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyPrompt = async () => {
    if (post) {
      await navigator.clipboard.writeText(post.prompt)
      setCopied(true)
      toast.success("Prompt copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrevImage = () => {
    if (post?.results && post.results.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? post.results!.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (post?.results && post.results.length > 0) {
      setCurrentImageIndex((prev) => (prev === post.results!.length - 1 ? 0 : prev + 1))
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleModalPlayPause = () => {
    if (modalVideoRef.current) {
      if (modalVideoRef.current.paused) {
        modalVideoRef.current.play()
      } else {
        modalVideoRef.current.pause()
      }
    }
  }

  const openImageModal = (index: number, source: 'results' | 'attachments' = 'results') => {
    setModalImageIndex(index)
    setModalImageSource(source)
    setShowImageModal(true)
  }

  const handleModalPrevImage = () => {
    const images = modalImageSource === 'results' ? post?.results : post?.attachments
    if (images && images.length > 0) {
      setModalImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }
  }

  const handleModalNextImage = () => {
    const images = modalImageSource === 'results' ? post?.results : post?.attachments
    if (images && images.length > 0) {
      setModalImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleOpenModelLink = () => {
    if (currentModel?.baseurl && post?.prompt) {
      const url = `${currentModel.baseurl}${encodeURIComponent(post.prompt)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <Layout showSearch={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
          <Spinner />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </Layout>
    )
  }

  if (!post) {
    return (
      <Layout showSearch={false}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    )
  }

  const currentResultMedia = post.results?.[currentImageIndex]
  const currentResultType = currentResultMedia ? getMediaType(currentResultMedia) : 'image'

  // Check if description or prompt needs expand button (more than 4 lines ~280 chars for description, ~400 for prompt)
  const descriptionNeedsExpand = post.description && post.description.length > 280
  const promptNeedsExpand = post.prompt && post.prompt.length > 400

  return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-background">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-6 transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 leading-tight max-w-4xl break-words">
            {post.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_600px] gap-6 lg:gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-6 order-2 lg:order-1">
              {/* Description Card */}
              {post.description && (
                <div className="bg-muted/30 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xs sm:text-sm font-bold mb-4 text-muted-foreground uppercase tracking-widest">
                    Description
                  </h2>
                  <div className="relative">
                    <p className={`text-sm sm:text-base leading-relaxed text-foreground break-words overflow-wrap-anywhere ${
                      !isDescriptionExpanded && descriptionNeedsExpand ? 'line-clamp-4' : ''
                    }`}>
                      {post.description}
                    </p>
                    {descriptionNeedsExpand && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition font-medium"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            Show less <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            Show more <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Source Attachments Card */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="bg-muted/30 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xs sm:text-sm font-bold mb-6 text-muted-foreground uppercase tracking-widest">
                    Source Attachments
                  </h2>
                  <div className="flex gap-4 flex-wrap">
                    {post.attachments.map((url, index) => {
                      const mediaType = getMediaType(url)
                      return (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => openImageModal(index, 'attachments')}
                        >
                          {mediaType === 'video' ? (
                            <div className="relative">
                              <video
                                src={url}
                                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl hover:opacity-80 transition"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-2xl">
                                <Maximize2 className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`attachment-${index}`}
                              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl hover:opacity-80 transition"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Prompt Card */}
              <div className="bg-muted/30 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Prompt
                  </h2>
                  <button
                    onClick={handleCopyPrompt}
                    className="p-2 hover:bg-background/50 rounded-lg transition"
                    title="Copy prompt"
                  >
                    <Copy size={16} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="relative">
                  <p className={`text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap ${
                    !isPromptExpanded && promptNeedsExpand ? 'line-clamp-4' : ''
                  }`}>
                    {post.prompt}
                  </p>
                  {promptNeedsExpand && (
                    <button
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="mt-2 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition font-medium"
                    >
                      {isPromptExpanded ? (
                        <>
                          Show less <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
               {/* Tags Card */}
              {post.tags && post.tags.length > 0 && (
                <div className="bg-muted/30 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xs sm:text-sm font-bold mb-4 text-muted-foreground uppercase tracking-widest">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-primary/15 text-primary rounded-full text-xs font-semibold border border-primary/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Model & Category - Desktop and Mobile */}
              <div className="grid grid-cols-2 gap-4">
                {post.model && (
                  <div className="bg-muted/30 rounded-3xl p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex-shrink-0">
                        MODEL
                      </h3>
                      {currentModel?.baseurl && (
                        <button
                          onClick={handleOpenModelLink}
                          className="p-1.5 hover:bg-background/50 rounded-lg transition flex-shrink-0"
                          title="Try in model"
                        >
                          <ExternalLink size={14} className="text-muted-foreground hover:text-primary" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-medium break-words">{post.model}</p>
                  </div>
                )}
                {post.category && (
                  <div className="bg-muted/30 rounded-3xl p-4 sm:p-6">
                    <h3 className="text-xs font-bold mb-2 text-muted-foreground uppercase tracking-widest">
                      CATEGORY
                    </h3>
                    <p className="text-sm font-medium break-words">{post.category}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 order-1 lg:order-2 lg:sticky lg:top-6">
              {/* Media Carousel */}
              {post.results && post.results.length > 0 && (
                <div className="bg-muted/30 rounded-3xl p-4 sm:p-6">
                  <div className="relative rounded-2xl overflow-hidden aspect-square group">
                    {currentResultType === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          src={currentResultMedia}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          loop
                        />
                        {/* Fullscreen button - always visible on mobile, hover on desktop */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openImageModal(currentImageIndex, 'results')
                          }}
                          className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 rounded-lg text-white transition z-10 lg:opacity-0 lg:group-hover:opacity-100"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                        {/* Play/Pause button - center overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePlayPause()
                            }}
                            className="p-4 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
                          >
                            {isPlaying ? (
                              <Pause className="w-10 h-10" />
                            ) : (
                              <Play className="w-10 h-10" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={currentResultMedia || "/placeholder.svg"}
                          alt="result"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openImageModal(currentImageIndex, 'results')}
                        />
                        {/* Fullscreen button for images too */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openImageModal(currentImageIndex, 'results')
                          }}
                          className="absolute top-3 right-3 p-2.5 bg-black/60 hover:bg-black/80 rounded-lg text-white transition z-10 lg:opacity-0 lg:group-hover:opacity-100"
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {post.results.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Author and Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <span className="text-sm text-muted-foreground font-medium">
                  Anonymous User
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleUpvote}
                    disabled={isUpvoting}
                    className="flex items-center gap-1.5 text-sm hover:text-red-500 transition"
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      size={18}
                      className={isLiked ? "text-red-500 fill-red-500" : ""}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span className="font-semibold">{upvoteCount}</span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center gap-1.5 text-sm hover:text-primary transition"
                        title="Save to folder"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Spinner />
                        ) : (
                          <>
                            <Bookmark size={18} />
                            <span className="font-semibold">Save</span>
                          </>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {folders.length > 0 ? (
                        folders.map((folder) => (
                          <DropdownMenuItem key={folder.id} onClick={() => handleSaveToFolder(folder.id)}>
                            {folder.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">No folders yet</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Media Modal */}
      {showImageModal && post && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-10"
            title="Close"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            {(() => {
              const images = modalImageSource === 'results' ? post.results : post.attachments
              const currentImage = images?.[modalImageIndex]
              const mediaType = currentImage ? getMediaType(currentImage) : 'image'
              
              return mediaType === 'video' ? (
                <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
                  <video
                    ref={modalVideoRef}
                    src={currentImage}
                    className="max-w-full max-h-[90vh] object-contain"
                    controls
                    autoPlay
                    playsInline
                    loop
                  />
                </div>
              ) : (
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt={`preview-${modalImageIndex}`}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )
            })()}

            {(() => {
              const images = modalImageSource === 'results' ? post.results : post.attachments
              return images && images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModalPrevImage()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                    title="Previous"
                  >
                    <ChevronLeft size={32} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModalNextImage()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                    title="Next"
                  >
                    <ChevronRight size={32} />
                  </button>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full font-medium">
                    {modalImageIndex + 1} / {images.length}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </Layout>
  )
}
