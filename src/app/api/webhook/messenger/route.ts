import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  // Always acknowledge immediately to avoid Meta retries
  const body = await request.json().catch(() => null);

  // Process asynchronously after responding
  if (body) {
    processWebhook(body).catch((err) =>
      console.error("Webhook processing error:", err)
    );
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

async function processWebhook(body: any) {
  const supabase = createServiceClient();

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      // Skip echoes and non-text messages
      if (
        event.message?.is_echo ||
        !event.message?.text ||
        !event.sender?.id ||
        !event.recipient?.id
      ) {
        continue;
      }

      const senderPsid = event.sender.id;
      const pageId = event.recipient.id;
      const userText = event.message.text;

      // Find active page
      const { data: page } = await supabase
        .from("pages")
        .select("*")
        .eq("fb_page_id", pageId)
        .eq("is_active", true)
        .single();

      if (!page) continue;

      // Save user message
      await supabase.from("messages").insert({
        fb_page_id: pageId,
        sender_psid: senderPsid,
        role: "user",
        content: userText,
      });

      // Fetch last 5 messages for context
      const { data: history } = await supabase
        .from("messages")
        .select("role, content")
        .eq("fb_page_id", pageId)
        .eq("sender_psid", senderPsid)
        .order("created_at", { ascending: false })
        .limit(5);

      const messages = (history || [])
        .reverse()
        .map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      // Generate AI reply
      let aiReply = "Sorry, I couldn't generate a response right now.";

      try {
        const model = process.env.OPENAI_API_KEY
          ? openai("gpt-4o-mini")
          : process.env.GEMINI_API_KEY
            ? google("gemini-1.5-flash")
            : null;

        if (model) {
          const { text } = await generateText({
            model,
            system:
              page.system_prompt ||
              "You are a helpful customer service assistant for this business. Be polite, concise, and helpful.",
            messages,
          });
          aiReply = text;
        }
      } catch (aiErr) {
        console.error("AI generation error:", aiErr);
      }

      // Send reply via Meta Graph API
      const sendRes = await fetch(
        `https://graph.facebook.com/v20.0/me/messages?access_token=${page.access_token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: senderPsid },
            message: { text: aiReply },
          }),
        }
      );

      if (!sendRes.ok) {
        const errBody = await sendRes.text();
        console.error("Meta send error:", errBody);
      }

      // Save assistant reply
      await supabase.from("messages").insert({
        fb_page_id: pageId,
        sender_psid: senderPsid,
        role: "assistant",
        content: aiReply,
      });
    }
  }
}
