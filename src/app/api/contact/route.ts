import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "全項目を入力してください" }, { status: 400 });
    }

    await resend.emails.send({
      from: "AniTabi Contact <onboarding@resend.dev>",
      to: "kirin9867+ani@gmail.com",
      replyTo: email,
      subject: `[AniTabi] ${subject}`,
      text: `お名前: ${name}\nメール: ${email}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact send error:", e);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
