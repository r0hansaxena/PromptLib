"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { ChevronLeft, Plus, X } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { addPrompt, getOrCreateUserId, trackUserPost } from "@/lib/storage"
import { DEFAULT_TAGS, getTagsByCategory } from "@/lib/tags"
import { DEFAULT_CATEGORIES } from "@/lib/categories"
import { DEFAULT_MODELS } from "@/lib/models"
import type { Prompt, Categories } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { getAspectRatioFromURL } from "@/lib/utils"
import { toast } from "sonner"

export default function CreatePostPage() {
  const router = useRouter()
  const sourceFileInputRef = useRef<HTMLInputElement>(null)
  const resultFileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prompt: "",
    tags: [] as string[],
    model: "",
    category: "" as Categories | "",
  })
  const [sourceAttachmentFiles, setSourceAttachmentFiles] = useState<File[]>([])
  const [resultAttachmentFiles, setResultAttachmentFiles] = useState<File[]>([])
  const [sourceAttachmentPreviews, setSourceAttachmentPreviews] = useState<Array<{ url: string; type: 'image' | 'video' }>>([])
  const [resultAttachmentPreviews, setResultAttachmentPreviews] = useState<Array<{ url: string; type: 'image' | 'video' }>>([])
  const [tagInput, setTagInput] = useState("")
  const [sourceHasVideo, setSourceHasVideo] = useState(false)
  const [resultHasVideo, setResultHasVideo] = useState(false)

  const handleAddFile = async(e: React.ChangeEvent<HTMLInputElement>, source: boolean) => {
    const files = e.target.files
    if (!files) return

    const currentFiles = source ? sourceAttachmentFiles : resultAttachmentFiles
    const hasVideo = source ? sourceHasVideo : resultHasVideo
    const file = files[0] // Only handle one file at a time
    
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    // Check if trying to mix media types
    if (hasVideo && isImage) {
      toast.error("Cannot mix images and videos. Remove the video first.")
      e.target.value = '' 
      return
    }

    if (currentFiles.length > 0 && currentFiles[0].type.startsWith('video/') && isImage) {
      toast.error("Cannot mix images and videos. Remove the video first.")
      e.target.value = '' // Clear input
      return
    }

    if (currentFiles.length > 0 && currentFiles[0].type.startsWith('image/') && isVideo) {
      toast.error("Cannot mix images and videos. Remove the images first.")
      e.target.value = '' // Clear input
      return
    }

    // Video: max 1, max 10MB
    if (isVideo) {
      if (currentFiles.length > 0) {
        toast.error("Only 1 video allowed")
        e.target.value = '' // Clear input
        return
      }

      const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10MB
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error("Video must be under 10MB")
        e.target.value = '' // Clear input
        return
      }

      // Add video
      const videoUrl = URL.createObjectURL(file)
      if (source) {
        setSourceAttachmentFiles([file])
        setSourceAttachmentPreviews([{ url: videoUrl, type: 'video' }])
        setSourceHasVideo(true)
      } else {
        setResultAttachmentFiles([file])
        setResultAttachmentPreviews([{ url: videoUrl, type: 'video' }])
        setResultHasVideo(true)
      }
      toast.success("Video added")
      e.target.value = '' // Clear input for next selection
      return
    }

    // Images: max 5, max 5MB each
    if (isImage) {
      const remainingSlots = 5 - currentFiles.length
      if (remainingSlots === 0) {
        toast.error("Maximum 5 images allowed")
        e.target.value = '' // Clear input
        return
      }

      const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image must be under 5MB")
        e.target.value = '' // Clear input
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        if (source) {
          setSourceAttachmentFiles((prev) => [...prev, file])
          setSourceAttachmentPreviews((prev) => [...prev, { url: preview, type: 'image' }])
        } else {
          setResultAttachmentFiles((prev) => [...prev, file])
          setResultAttachmentPreviews((prev) => [...prev, { url: preview, type: 'image' }])
        }
      }
      reader.readAsDataURL(file)
      toast.success("Image added")
      e.target.value = '' // Clear input for next selection
    }
  }

  const removeAttachment = (index: number, source: boolean) => {
    if (source) {
      const removedFile = sourceAttachmentFiles[index]
      setSourceAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
      setSourceAttachmentPreviews((prev) => prev.filter((_, i) => i !== index))
      
      if (removedFile?.type.startsWith('video/')) {
        setSourceHasVideo(false)
      }
    } else {
      const removedFile = resultAttachmentFiles[index]
      setResultAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
      setResultAttachmentPreviews((prev) => prev.filter((_, i) => i !== index))
      
      if (removedFile?.type.startsWith('video/')) {
        setResultHasVideo(false)
      }
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const uploadAttachments = async (): Promise<string[][]> => {
    const urls: string[][] = [[], []]

    for (const file of sourceAttachmentFiles) {
      const form = new FormData()
      form.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const { url } = await response.json()
      urls[0].push(url)
    }

    for (const file of resultAttachmentFiles) {
      const form = new FormData()
      form.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: form,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const { url } = await response.json()
      urls[1].push(url)
    }

    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.prompt.trim() || !formData.model || !formData.category) {
      toast.error("Title, Model, Category and Prompt are required fields")
      return
    }

    setIsLoading(true)

    try {
      let uploadedUrls: string[][] = [[], []]
      if (sourceAttachmentFiles.length > 0 || resultAttachmentFiles.length > 0) {
        uploadedUrls = await uploadAttachments()
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          prompt: formData.prompt,
          model: formData.model,
          category: formData.category,
          tags: formData.tags.length > 0 ? formData.tags : [],
          attachments: uploadedUrls[0].length > 0 ? uploadedUrls[0] : [],
          results: uploadedUrls[1].length > 0 ? uploadedUrls[1] : [],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create post")
      }

      const { id } = await response.json()

      trackUserPost(String(id))

      // Get aspect ratio AFTER upload, using the actual uploaded URL
      let aspectRatio = "1:1"
      if (uploadedUrls[1].length > 0) {
        try {
          aspectRatio = await getAspectRatioFromURL(uploadedUrls[1][0])
        } catch (error) {
          console.error("Error getting aspect ratio:", error)
          // Default to 16:9 for videos, 1:1 for images
          aspectRatio = resultHasVideo ? "16:9" : "1:1"
        }
      }

      const newPrompt: Prompt = {
        id: String(id),
        title: formData.title,
        description: formData.description || "",
        prompt: formData.prompt,
        sourceAttachments: uploadedUrls[0].map((url, idx) => ({
          id: `attachment-${idx}`,
          url,
          type: sourceAttachmentPreviews[idx]?.type || "image",
        })),
        promptResult: uploadedUrls[1].map((url, idx) => ({
          id: `result-${idx}`,
          url,
          type: resultAttachmentPreviews[idx]?.type || "image",
        })),
        tags: formData.tags.map((tag) => {
          const matchedTag = DEFAULT_TAGS.find((t) => t.name.toLowerCase() === tag.toLowerCase())
          return (
            matchedTag || {
              id: tag,
              name: tag,
              category: "others" as Categories,
            }
          )
        }),
        likes: 0,
        userId: getOrCreateUserId(),
        userName: "You",
        hasImage: uploadedUrls[1].length > 0,
        aspectRatio: aspectRatio,
        createdAt: new Date().toISOString(),
        mainImageUrl: uploadedUrls[1][0] || undefined,
        category: formData.category || undefined,
      }

      addPrompt(newPrompt)
      toast.success("Post created successfully!")
      router.push(`/post/${id}`)
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create post. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-muted/20">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-6 transition"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
              <label className="block text-sm font-semibold mb-3 text-muted-foreground tracking-wider">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                maxLength={100}
                required
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Add title for your prompt"
                className="w-full px-0 py-2 bg-transparent border-none focus:outline-none text-base placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Description */}
            <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
              <label className="block text-sm font-semibold mb-3 text-muted-foreground tracking-wider">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                maxLength={500}
                placeholder="A brief description of your prompt"
                className="w-full px-0 py-2 bg-transparent border-none focus:outline-none text-base resize-none placeholder:text-muted-foreground/50"
                rows={3}
              />
            </div>

            {/* Model & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <label className="block text-sm font-semibold mb-3 text-muted-foreground tracking-wider">
                  Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.model}
                  required
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full px-0 py-2 bg-transparent border-none focus:outline-none text-base cursor-pointer"
                >
                  <option value="">Select a Model</option>
                  {DEFAULT_MODELS.map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <label className="block text-sm font-semibold mb-3 text-muted-foreground tracking-wider">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  {formData.category && (() => {
                    const selectedCat = DEFAULT_CATEGORIES.find(cat => cat.name === formData.category)
                    if (selectedCat) {
                      const Icon = selectedCat.icon
                      return <Icon size={18} className="absolute left-3 text-muted-foreground pointer-events-none" />
                    }
                    return null
                  })()}
                  <select
                    value={formData.category}
                    required
                    onChange={(e) => {
                      const selectedCategory = e.target.value as Categories
                      setFormData((prev) => ({
                        ...prev,
                        category: selectedCategory,
                        tags: [],
                      }))
                      setTagInput("")
                    }}
                    className={`w-full px-0 py-2 bg-transparent border-none focus:outline-none text-base cursor-pointer ${
                      formData.category ? 'pl-9' : ''
                    }`}
                  >
                    <option value="">Select a category</option>
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attachments Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Attachments */}
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <label className="block text-sm font-semibold mb-4 text-muted-foreground tracking-wider">
                  Source Attachments <span className="text-xs font-normal text-muted-foreground/70">(Max 5 images or 1 video)</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {sourceAttachmentPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {preview.type === 'video' ? (
                        <video
                          src={preview.url}
                          className="w-24 h-24 object-cover rounded-xl"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt="attachment"
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index, true)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {((sourceHasVideo && sourceAttachmentFiles.length === 0) || (!sourceHasVideo && sourceAttachmentFiles.length < 5)) && (
                    <button
                      type="button"
                      onClick={() => sourceFileInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:bg-muted/50 transition text-muted-foreground"
                    >
                      <Plus size={24} />
                    </button>
                  )}
                </div>
                <input
                  ref={sourceFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => handleAddFile(event, true)}
                  className="hidden"
                />
              </div>

              {/* Prompt Result */}
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <label className="block text-sm font-semibold mb-4 text-muted-foreground tracking-wider">
                  Prompt Result <span className="text-xs font-normal text-muted-foreground/70">(Max 5 images or 1 video)</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {resultAttachmentPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {preview.type === 'video' ? (
                        <video
                          src={preview.url}
                          className="w-24 h-24 object-cover rounded-xl"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt="result"
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeAttachment(index, false)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {((resultHasVideo && resultAttachmentFiles.length === 0) || (!resultHasVideo && resultAttachmentFiles.length < 5)) && (
                    <button
                      type="button"
                      onClick={() => resultFileInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:bg-muted/50 transition text-muted-foreground"
                    >
                      <Plus size={24} />
                    </button>
                  )}
                </div>
                <input
                  ref={resultFileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => handleAddFile(event, false)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Prompt and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prompt */}
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <label className="block text-sm font-semibold mb-3 text-muted-foreground tracking-wider">
                  Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Paste your prompt here"
                  required
                  className="w-full px-0 py-2 bg-transparent border-none focus:outline-none text-base resize-none placeholder:text-muted-foreground/50"
                  rows={8}
                />
              </div>

              {/* Tags */}
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-muted-foreground tracking-wider">
                    Tags
                  </label>
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput || !formData.category}
                    className="text-primary text-2xl font-bold hover:text-primary/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <select
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 mb-4 bg-muted/50 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                    !formData.category ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">
                    {formData.category ? "Search" : "Select a category first"}
                  </option>
                  {formData.category &&
                    getTagsByCategory(formData.category).map((tag) => (
                      <option key={tag.id} value={tag.name}>
                        {tag.name}
                      </option>
                    ))}
                </select>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-2 border border-primary/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(idx)}
                          className="hover:opacity-70 transition"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  <span className="ml-2">Creating Post...</span>
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
