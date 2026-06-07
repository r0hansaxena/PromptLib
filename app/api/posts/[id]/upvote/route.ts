import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body // 'upvote' or 'downvote'

    // Get current upvotes
    const { data: post, error: fetchError } = await supabase.from("Posts").select("upvotes").eq("id", id).single()

    if (fetchError) throw fetchError

    const currentUpvotes = post?.upvotes || 0
    const newUpvotes = action === 'downvote' 
      ? Math.max(0, currentUpvotes - 1) // Prevent negative upvotes
      : currentUpvotes + 1

    // Update upvotes
    const { data: updatedPost, error: updateError } = await supabase
      .from("Posts")
      .update({ upvotes: newUpvotes })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ upvotes: updatedPost.upvotes })
  } catch (error) {
    console.error("Error updating upvote:", error)
    return NextResponse.json({ error: "Failed to update upvote" }, { status: 500 })
  }
}
