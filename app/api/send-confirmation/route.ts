import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email, unsubscribeId } = await req.json();
  if (!email || !unsubscribeId) {
    return NextResponse.json({ error: "Missing email or unsubscribeId" }, { status: 400 });
  }

  try {
    const res = await resend.emails.send({
      from: "team@promptlib.site",
      to: email,
      subject: "Welcome to the Promptlib Waitlist 🎉",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>Welcome 👋</h2>
          <p>Thanks for joining the <b>Promptlib</b> waitlist!</p>
          <p>We’ll notify you when early access opens.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">
            If you’d like to unsubscribe, click
            <a href="${process.env.NEXT_PUBLIC_APP_API_URL}/unsubscribe?id=${unsubscribeId}">
              here
            </a>.
          </p>
        </div>
      `,
    });
    if(res.error) {
      throw new Error("Failed to send email");
    }
    console.log("Email sent:", res);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
