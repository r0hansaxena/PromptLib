import { LucideIcon } from "lucide-react"

export interface PromptCategory {
  id: Categories
  name: string
  gradient: string
  icon: LucideIcon
}

export interface PromptTag {
  icon?: any
  id: string
  name: string
  category: Categories
}

export interface Models{
    id: string
    name: string
    company: string
    baseurl: string | null
}

export interface Attachment {
  id: string
  url: string
  type: "image" | "video"
}

export interface Prompt {
  id: string
  title: string
  description: string
  prompt: string
  sourceAttachments: Attachment[]
  promptResult: Attachment[]
  tags: PromptTag[]
  likes: number
  userId: string
  userName: string
  hasImage: boolean
  aspectRatio: string
  createdAt: string
  mainImageUrl?: string
  category?: string
  model?: string
}

export interface Post {
  id: number
  created_at: string
  title: string
  description: string | null
  prompt: string
  category: string | null
  model: string | null
  tags: string[] | null
  attachments: string[] | null
  results: string[] | null
  upvotes: number
}

export interface LocalPost {
  id: string
  title: string
  description: string
  prompt: string
  category: string | null
  attachments: string[]
  tags: string[]
  upvotes: number
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  prompts: Prompt[]
  createdAt: string
  type: "liked" | "custom"
}

export interface AppState {
  prompts: Prompt[]
  folders: Folder[]
  userId: string
  userName: string
}

export interface LocalStorage {
  posts: LocalPost[]
  folders: Folder[]
  likedPostIds: string[]
}

export type Categories =
  | "writing"
  | "coding"
  | "design"
  | "business"
  | "learning"
  | "entertainment"
  | "productivity"
  | "creativity" 
  | "others"
