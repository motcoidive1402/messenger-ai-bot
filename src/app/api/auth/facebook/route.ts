import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;
  const scopes = [
    "pages_show_list",
    "pages_messaging",
    "pages_manage_metadata",
    "pages_read_engagement",
  ].join(",");

  if (!appId) {
    return NextResponse.json(
      { error: "META_APP_ID not configured" },
      { status: 500 }
    );
  }

  const url = new URL("https://www.facebook.com/v20.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", "messenger-ai-bot");

  return NextResponse.redirect(url.toString());
}
