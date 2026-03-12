import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Client } from "../backend.d.ts";
import { useDeleteReply, useGetReplies } from "../hooks/useQueries";

interface RepliesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

function formatNano(nano: bigint): string {
  const ms = Number(nano) / 1_000_000;
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RepliesSheet({
  open,
  onOpenChange,
  client,
}: RepliesSheetProps) {
  const { data: replies = [], isLoading } = useGetReplies(client.id);
  const deleteReply = useDeleteReply();

  const handleDelete = async (id: string) => {
    try {
      await deleteReply.mutateAsync({ id, clientId: client.id });
      toast.success("Reply deleted");
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg" data-ocid="replies.sheet">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="font-display text-lg">
            Replies from {client.name}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          {isLoading && (
            <div
              className="flex items-center justify-center py-16"
              data-ocid="replies.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && replies.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6"
              data-ocid="replies.empty_state"
            >
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground/70">
                  No replies logged yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use &ldquo;Log Reply&rdquo; to record when a client responds.
                </p>
              </div>
            </div>
          )}

          {!isLoading && replies.length > 0 && (
            <div className="space-y-3 pr-2">
              {replies.map((reply, idx) => (
                <div
                  key={reply.id}
                  data-ocid={`replies.item.${idx + 1}`}
                  className="rounded-lg border border-border bg-card p-4 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {reply.channel === "whatsapp" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-400 px-2.5 py-1 rounded-full">
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-400 px-2.5 py-1 rounded-full">
                          <Mail className="h-3 w-3" />
                          Email
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      data-ocid={`replies.delete_button.${idx + 1}`}
                      onClick={() => handleDelete(reply.id)}
                      disabled={deleteReply.isPending}
                      className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete reply"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">
                    {reply.message}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatNano(reply.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
