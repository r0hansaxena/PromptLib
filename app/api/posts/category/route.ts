import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "popular"
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    if (!category || category === "All") {
      return NextResponse.json({ posts: [], total: 0, hasMore: false, page, limit })
    }

    let query = supabase
      .from("Posts")
      .select("*", { count: "exact" })
      .eq("category", category)
      .range(from, to)

    // Apply sorting
    if (sortBy === "popular") {
      query = query
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data: posts, error, count } = await query

    if (error) throw error

    return NextResponse.json({ 
      posts, 
      total: count,
      hasMore: count ? to < count - 1 : false,
      page,
      limit
    })
  } catch (error) {
    console.error("Error fetching category posts:", error)
    return NextResponse.json({ error: "Failed to fetch category posts" }, { status: 500 })
  }
}
