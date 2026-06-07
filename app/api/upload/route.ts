import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = `promptlib-media/${Date.now()}-${file.name}`

    const { data, error } = await supabase.storage.from("Post_bucket").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("Post_bucket").getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
