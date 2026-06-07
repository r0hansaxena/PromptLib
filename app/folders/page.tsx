"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layout } from "@/components/layout/layout"
import { Heart, Plus } from "lucide-react"
import { getAppState, addFolder } from "@/lib/storage"
import type { Folder } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [newFolderName, setNewFolderName] = useState("")
  const [showAddFolder, setShowAddFolder] = useState(false)

  useEffect(() => {
    const state = getAppState()
    setFolders(state.folders)
  }, [])

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    const folder = addFolder(newFolderName)
    setFolders((prev) => [...prev, folder])
    setNewFolderName("")
    setShowAddFolder(false)
  }

  const getFolderThumbnail = (folder: Folder) => {
    if (folder.type === "liked") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
          <Heart size={48} fill="white" className="text-white" />
        </div>
      )
    }

    if (folder.prompts.length === 0) {
      return (
        <div className="w-full h-full glass flex items-center justify-center">
          <span className="text-4xl">📁</span>
        </div>
      )
    }

    const lastPrompt = folder.prompts[0]
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {lastPrompt.mainImageUrl ? (
          <img
            src={lastPrompt.mainImageUrl || "/placeholder.svg"}
            alt={lastPrompt.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <span className="text-3xl">{lastPrompt.tags[0]?.icon || "📌"}</span>
        )}
      </div>
    )
  }

  return (
    <Layout showSearch={false}>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/5">
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Folders</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Liked Folder */}
            {folders
              .filter((f) => f.type === "liked")
              .map((folder) => (
                <Link key={folder.id} href={`/folders/${folder.id}`}>
                  <div className="group cursor-pointer">
                    <div className="rounded-2xl overflow-hidden glass mb-3 h-64 hover:scale-105 transition-transform duration-300">
                      {getFolderThumbnail(folder)}
                    </div>
                    <h3 className="font-semibold text-lg capitalize">Liked</h3>
                    <p className="text-sm text-muted-foreground">
                      {folder.prompts.length} {folder.prompts.length === 1 ? "prompt" : "prompts"}
                    </p>
                  </div>
                </Link>
              ))}

            {/* Custom Folders */}
            {folders
              .filter((f) => f.type === "custom")
              .map((folder) => (
                <Link key={folder.id} href={`/folders/${folder.id}`}>
                  <div className="group cursor-pointer">
                    <div className="rounded-2xl overflow-hidden glass mb-3 h-64 hover:scale-105 transition-transform duration-300">
                      {getFolderThumbnail(folder)}
                    </div>
                    <h3 className="font-semibold text-lg">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {folder.prompts.length} {folder.prompts.length === 1 ? "prompt" : "prompts"}
                    </p>
                  </div>
                </Link>
              ))}

            {/* Add Folder Button */}
            <button
              onClick={() => setShowAddFolder(!showAddFolder)}
              className="rounded-2xl overflow-hidden glass h-64 flex items-center justify-center hover:scale-105 transition-transform duration-300 group"
            >
              <div className="text-center space-y-3">
                <Plus size={40} className="mx-auto text-muted-foreground group-hover:text-foreground transition" />
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition">
                  Add Folder
                </p>
              </div>
            </button>
          </div>

          {/* Add Folder Form Modal */}
          {showAddFolder && (
            <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4">
              <div className="glass rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Create New Folder</h2>
                <form onSubmit={handleAddFolder} className="space-y-4">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="w-full px-4 py-2 glass rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                    >
                      Create
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowAddFolder(false)
                        setNewFolderName("")
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
