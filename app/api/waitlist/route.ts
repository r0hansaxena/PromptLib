import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id, subscribed")
    .eq("email", email)
    .single();

  if (existing) {
    if(!existing.subscribed) {
        await supabase.from("waitlist").update({ subscribed: true }).eq("id", existing.id);
        return NextResponse.json({ message: "Resubscribed to the waitlist!" });
    }
    return NextResponse.json({ message: "Already on the waitlist!" }, {status: 409});
  }

  const { data, error } = await supabase
    .from("waitlist")
    .insert([{ email, subscribed: true }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            email,
            unsubscribeId: data.id,
            }),
        });
        
        if (!res.ok) {
            throw new Error("Failed to send confirmation email");
        }
        
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: "Successfully added to the waitlist!, unable to send the mail" });
    }
  } else {
      return NextResponse.json({ message: "Successfully added to the waitlist!, unable to send the mail" });
  }

  return NextResponse.json({ message: "Successfully added to the waitlist!" });
}
