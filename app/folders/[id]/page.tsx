"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/layout/layout"
import { ChevronLeft } from "lucide-react"
import { getAppState } from "@/lib/storage"
import type { Folder, Prompt } from "@/lib/types"
import { PinterestCard } from "@/components/prompt-card/pinterest-card"

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  const [folder, setFolder] = useState<Folder | null>(null)
  const [prompts, setPrompts] = useState<Prompt[]>([])

  useEffect(() => {
    const state = getAppState()
    const foundFolder = state.folders.find((f) => f.id === folderId)
    if (foundFolder) {
      setFolder(foundFolder)
      setPrompts(foundFolder.prompts)
    }
  }, [folderId])

  if (!folder) {
    return (
      <Layout showSearch={false}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Folder not found</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/5">
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition">
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold capitalize">{folder.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
                </p>
              </div>
            </div>
          </div>

          {prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground mb-2">No prompts in this folder</p>
              <p className="text-sm text-muted-foreground">Add prompts from the home page or create new ones</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 lg:columns-4 gap-4 space-y-4">
              {prompts.map((prompt) => (
                <div key={prompt.id} className="break-inside-avoid">
                  <PinterestCard prompt={prompt} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
