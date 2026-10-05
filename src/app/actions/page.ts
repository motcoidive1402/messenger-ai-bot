"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function togglePageActive(pageId: string, activate: boolean) {
  const supabase = createServiceClient();

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .single();

  if (error || !page) {
    return { success: false, error: "Page not found" };
  }

  try {
    if (activate) {
      // Subscribe the page to the app's webhooks
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${page.fb_page_id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks&access_token=${page.access_token}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.text();
        console.error("Subscribe error:", err);
        return { success: false, error: "Failed to subscribe page to webhooks" };
      }
    } else {
      // Unsubscribe
      const res = await fetch(
        `https://graph.facebook.com/v20.0/${page.fb_page_id}/subscribed_apps?access_token=${page.access_token}`,
        { method: "DELETE" }
      );
      // Non-blocking if already unsubscribed
    }

    await supabase
      .from("pages")
      .update({ is_active: activate })
      .eq("id", pageId);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Toggle error:", err);
    return { success: false, error: "Unexpected error" };
  }
}

export async function updateSystemPrompt(pageId: string, systemPrompt: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("pages")
    .update({ system_prompt: systemPrompt })
    .eq("id", pageId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
