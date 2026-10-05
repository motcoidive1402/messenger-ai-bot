import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Zap, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <MessageCircle className="h-6 w-6" />
            Messenger AI Auto-Chat
          </div>
          <Link href="/dashboard">
            <Button>Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI-Powered Auto-Replies for Facebook Messenger
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect your Facebook Pages, set a system prompt, and let AI handle
            customer conversations automatically — 24/7.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/api/auth/facebook">
              <Button size="lg">Connect Facebook</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Instant Replies</CardTitle>
              <CardDescription>
                Webhook-driven responses using GPT or Gemini. Context-aware with
                last 5 messages.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Per-Page Prompts</CardTitle>
              <CardDescription>
                Customize the system prompt for each Facebook Page you manage.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="mt-2">Secure & Simple</CardTitle>
              <CardDescription>
                Long-lived tokens, Supabase storage, one-click enable/disable
                auto-chat.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
