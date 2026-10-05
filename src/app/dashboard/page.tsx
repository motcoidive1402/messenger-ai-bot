import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, LogOut } from "lucide-react";
import { PageCard } from "@/components/page-card";
import { ActivityLog } from "@/components/activity-log";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = createServiceClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <MessageCircle className="h-6 w-6" />
            Messenger AI Auto-Chat
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/api/auth/facebook">
              <Button variant="outline" size="sm">
                Connect Facebook
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {params.connected && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            Successfully connected {params.connected} page(s).
          </div>
        )}
        {params.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            Connection error: {params.error}. Please try again.
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your connected Facebook Pages and auto-chat settings.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Connected Pages</h2>
            {!pages || pages.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No pages connected yet.</p>
                  <Link href="/api/auth/facebook" className="mt-4 inline-block">
                    <Button>Connect Facebook</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pages.map((page) => (
                  <PageCard key={page.id} page={page} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <ActivityLog messages={messages || []} pages={pages || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
