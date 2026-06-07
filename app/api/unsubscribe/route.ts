import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await supabase.from("waitlist").update({ subscribed: false }).eq("id", id);
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribed`);
}
