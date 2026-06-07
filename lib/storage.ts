import type { AppState, Prompt, Folder, Post } from "./types"

const STORAGE_KEY = "promptlib_state"
const USER_ID_KEY = "promptlib_user_id"
const USER_POSTS_KEY = "promptlib_user_posts"
const POSTS_CACHE_KEY = "promptlib_posts_cache"
const UPVOTED_POSTS_KEY = "promptlib_upvoted_posts"

export const generateUserId = (): string => {
  return `anonymous-${Math.random().toString(36).substring(7)}`
}

export const getOrCreateUserId = (): string => {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = generateUserId()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export const trackUserPost = (postId: string): void => {
  if (typeof window === "undefined") return
  const userPosts = JSON.parse(localStorage.getItem(USER_POSTS_KEY) || "[]")
  if (!userPosts.includes(String(postId))) {
    userPosts.push(String(postId))
    localStorage.setItem(USER_POSTS_KEY, JSON.stringify(userPosts))
  }
}

export const isUserPost = (postId: string): boolean => {
  if (typeof window === "undefined") return false
  const userPosts = JSON.parse(localStorage.getItem(USER_POSTS_KEY) || "[]")
  const isUser = userPosts.includes(String(postId))
  return isUser
}

export const initializeAppState = (): AppState => {
  const userId = getOrCreateUserId()
  return {
    prompts: [],
    folders: [
      {
        id: "liked",
        name: "Liked",
        prompts: [],
        createdAt: new Date().toISOString(),
        type: "liked",
      },
    ],
    userId,
    userName: userId,
  }
}

export const getAppState = (): AppState => {
  if (typeof window === "undefined") return initializeAppState()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const state = initializeAppState()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return state
  }
  return JSON.parse(stored)
}

export const saveAppState = (state: AppState): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export const getPostsCache = (): Post[] => {
  if (typeof window === "undefined") return []
  const cached = localStorage.getItem(POSTS_CACHE_KEY)
  return cached ? JSON.parse(cached) : []
}

export const setPostsCache = (posts: Post[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(posts))
  }
}

export const getUpvotedPostIds = (): string[] => {
  if (typeof window === "undefined") return []
  const upvoted = localStorage.getItem(UPVOTED_POSTS_KEY) || "[]"
  return JSON.parse(upvoted)
}

export const hasUserUpvoted = (postId: string): boolean => {
  if (typeof window === "undefined") return false
  const upvoted = getUpvotedPostIds()
  return upvoted.includes(postId)
}

export const addUpvote = (postId: string): void => {
  if (typeof window === "undefined") return
  const upvoted = getUpvotedPostIds()
  if (!upvoted.includes(postId)) {
    upvoted.push(postId)
    localStorage.setItem(UPVOTED_POSTS_KEY, JSON.stringify(upvoted))
  }
}

export const removeUpvote = (postId: string): boolean => {
  if (typeof window === "undefined") return false
  const upvoted = getUpvotedPostIds()
  const index = upvoted.indexOf(postId)
  if (index > -1) {
    upvoted.splice(index, 1)
    localStorage.setItem(UPVOTED_POSTS_KEY, JSON.stringify(upvoted))
    return true
  }
  return false
}

export const convertPostToPrompt = (post: Post): Prompt => {
  const category = post.category || "Uncategorized"

  return {
    id: String(post.id),
    title: post.title,
    description: post.description || "",
    prompt: post.prompt,
    sourceAttachments: [],
    promptResult:
      post.attachments && post.attachments.length > 0
        ? [
            {
              id: `attachment-0`,
              url: post.attachments[0],
              type: "image" as const,
            },
          ]
        : [],
    tags:
      post.tags?.map((tagId) => ({
        id: tagId,
        name: tagId,
        category: category as any,
        color: "#999",
        icon: "📌",
      })) || [],
    likes: post.upvotes || 0,
    userId: "anonymous",
    userName: "Anonymous",
    hasImage: (post.attachments?.length || 0) > 0,
    aspectRatio: "1:1",
    createdAt: post.created_at,
    mainImageUrl: post.results?.[0],
    category,
    model: post.model || "",
  }
}

export const addPrompt = (prompt: Prompt): void => {
  const state = getAppState()
  state.prompts.unshift(prompt)
  saveAppState(state)
}

export const deletePrompt = (promptId: string): void => {
  const state = getAppState()
  state.prompts = state.prompts.filter((p) => p.id !== promptId)
  state.folders = state.folders.map((f) => ({
    ...f,
    prompts: f.prompts.filter((p) => p.id !== promptId),
  }))
  saveAppState(state)
}

export const toggleLike = (promptId: string): void => {
  const state = getAppState()
  const prompt = state.prompts.find((p) => p.id === promptId)
  if (!prompt) return

  const likedFolder = state.folders.find((f) => f.type === "liked")!
  const isLiked = likedFolder.prompts.some((p) => p.id === promptId)

  if (isLiked) {
    likedFolder.prompts = likedFolder.prompts.filter((p) => p.id !== promptId)
    prompt.likes = Math.max(0, prompt.likes - 1)
    removeUpvote(promptId)
  } else {
    likedFolder.prompts.unshift(prompt)
    prompt.likes += 1
    addUpvote(promptId)
  }

  saveAppState(state)
}

export const addFolder = (name: string): Folder => {
  const state = getAppState()
  const folder: Folder = {
    id: `folder-${Date.now()}`,
    name,
    prompts: [],
    createdAt: new Date().toISOString(),
    type: "custom",
  }
  state.folders.push(folder)
  saveAppState(state)
  return folder
}

export const savePromptToFolder = (promptId: string, folderId: string): void => {
  const state = getAppState()
  const prompt = state.prompts.find((p) => p.id === promptId)
  const folder = state.folders.find((f) => f.id === folderId)

  if (!prompt || !folder) return

  if (!folder.prompts.find((p) => p.id === promptId)) {
    folder.prompts.push(prompt)
  }

  saveAppState(state)
}

export const removePromptFromFolder = (promptId: string, folderId: string): void => {
  const state = getAppState()
  const folder = state.folders.find((f) => f.id === folderId)

  if (!folder) return

  folder.prompts = folder.prompts.filter((p) => p.id !== promptId)
  saveAppState(state)
}

export const updatePrompt = (promptId: string, updates: Partial<Prompt>): void => {
  const state = getAppState()
  const prompt = state.prompts.find((p) => p.id === promptId)
  if (!prompt) return

  Object.assign(prompt, updates)
  saveAppState(state)
}

export const deleteFolder = (folderId: string): void => {
  const state = getAppState()
  state.folders = state.folders.filter((f) => f.id !== folderId && f.type !== "liked")
  saveAppState(state)
}

export const renameFolder = (folderId: string, newName: string): void => {
  const state = getAppState()
  const folder = state.folders.find((f) => f.id === folderId)
  if (folder) {
    folder.name = newName
    saveAppState(state)
  }
}

export const updatePostLikes = (postId: string, newLikes: number): void => {
  if (typeof window !== "undefined") {
    const cache = getPostsCache()
    const post = cache.find((p) => p.id === Number(postId))
    if (post) {
      post.upvotes = newLikes
      setPostsCache(cache)
    }
  }
}

export const removeFromLikedFolder = (promptId: string): void => {
  if (typeof window === "undefined") return
  
  const state = getAppState()
  const likedFolder = state.folders.find(f => f.type === "liked")
  
  if (!likedFolder) return
  
  likedFolder.prompts = likedFolder.prompts.filter(p => p.id !== promptId)
  saveAppState(state)
}
