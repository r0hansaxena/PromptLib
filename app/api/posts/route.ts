import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const category = searchParams.get("category")
    const sortBy = searchParams.get("sortBy") || "recent"
    
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from("Posts")
      .select("*", { count: "exact" })
      .range(from, to)

    // Apply sorting
    if (sortBy === "popular") {
      query = query
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    // Filter by category if provided
    if (category && category !== "All") {
      query = query.eq("category", category)
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
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data: post, error } = await supabase
      .from("Posts")
      .insert({
        title: body.title,
        description: body.description,
        prompt: body.prompt,
        model: body.model,
        category: body.category,
        tags: body.tags,
        attachments: body.attachments,
        results: body.results,
        upvotes: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: post.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
