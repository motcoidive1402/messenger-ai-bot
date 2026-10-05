import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  fb_page_id: string;
  sender_psid: string;
  role: string;
  content: string;
  created_at: string;
}

interface Page {
  fb_page_id: string;
  page_name: string;
}

export function ActivityLog({
  messages,
  pages,
}: {
  messages: Message[];
  pages: Page[];
}) {
  const pageMap = Object.fromEntries(
    pages.map((p) => [p.fb_page_id, p.page_name])
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Latest Conversations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-lg border p-3 text-sm space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={msg.role === "user" ? "secondary" : "default"}
                  className="text-[10px]"
                >
                  {msg.role}
                </Badge>
                <span className="text-[10px] text-muted-foreground truncate">
                  {pageMap[msg.fb_page_id] || msg.fb_page_id}
                </span>
              </div>
              <p className="line-clamp-2">{msg.content}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
