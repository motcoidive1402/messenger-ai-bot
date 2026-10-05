import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=auth_failed`
    );
  }

  try {
    // Exchange code for short-lived user token
    const tokenUrl = new URL(
      "https://graph.facebook.com/v20.0/oauth/access_token"
    );
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set(
      "redirect_uri",
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    );
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData.error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_failed`
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived user token
    const longLivedUrl = new URL(
      "https://graph.facebook.com/v20.0/oauth/access_token"
    );
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    longLivedUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLivedToken);

    const longRes = await fetch(longLivedUrl.toString());
    const longData = await longRes.json();
    const userToken = longData.access_token || shortLivedToken;

    // Fetch pages the user manages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${userToken}&fields=id,name,access_token`
    );
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      console.error("Pages fetch error:", pagesData.error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=pages_failed`
      );
    }

    const supabase = createServiceClient();
    const pages = pagesData.data || [];

    // Upsert each page
    for (const page of pages) {
      await supabase.from("pages").upsert(
        {
          fb_page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          is_active: false,
        },
        { onConflict: "fb_page_id" }
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=${pages.length}`
    );
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unknown`
    );
  }
}
