"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { togglePageActive, updateSystemPrompt } from "@/app/actions/page";
import { Settings } from "lucide-react";

interface Page {
  id: string;
  fb_page_id: string;
  page_name: string;
  system_prompt: string | null;
  is_active: boolean;
}

export function PageCard({ page }: { page: Page }) {
  const [isPending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState(
    page.system_prompt ||
      "You are a helpful customer service assistant for this business. Be polite, concise, and helpful."
  );
  const [open, setOpen] = useState(false);

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      await togglePageActive(page.id, checked);
    });
  };

  const handleSavePrompt = () => {
    startTransition(async () => {
      await updateSystemPrompt(page.id, prompt);
      setOpen(false);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{page.page_name}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            ID: {page.fb_page_id}
          </p>
        </div>
        <Badge variant={page.is_active ? "success" : "secondary"}>
          {page.is_active ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`toggle-${page.id}`}>Enable Auto-Chat</Label>
          <Switch
            id={`toggle-${page.id}`}
            checked={page.is_active}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Edit System Prompt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>System Prompt — {page.page_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="You are a helpful assistant..."
              />
            </div>
            <DialogFooter>
              <Button onClick={handleSavePrompt} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
