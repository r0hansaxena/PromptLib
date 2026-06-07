import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "recent"
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    if (!query || query.trim() === "") {
      return NextResponse.json({ posts: [], total: 0, hasMore: false, page, limit })
    }

    const searchTerm = query.trim()

    // Build the search query - search across multiple fields
    let searchQuery = supabase
      .from("Posts")
      .select("*", { count: "exact" })
      .or(
        `title.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `prompt.ilike.%${searchTerm}%,` +
        `model.ilike.%${searchTerm}%,` +
        `category.ilike.%${searchTerm}%`
      )
      .range(from, to)

    // Apply sorting
    if (sortBy === "popular") {
      searchQuery = searchQuery
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: false })
    } else {
      searchQuery = searchQuery.order("created_at", { ascending: false })
    }

    // Filter by category if provided (and not "All")
    if (category && category !== "All") {
      searchQuery = searchQuery.eq("category", category)
    }

    const { data: posts, error, count } = await searchQuery

    if (error) {
      console.error("Search error:", error)
      throw error
    }

    return NextResponse.json({ 
      posts: posts || [], 
      total: count || 0,
      hasMore: count ? to < count - 1 : false,
      page,
      limit
    })
  } catch (error) {
    console.error("Error searching posts:", error)
    return NextResponse.json({ 
      error: "Failed to search posts",
      posts: [],
      total: 0,
      hasMore: false
    }, { status: 500 })
  }
}
