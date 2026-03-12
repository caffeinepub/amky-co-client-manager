import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d.ts";
import { useAddReply } from "../hooks/useQueries";

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
}

export function ReplyDialog({ open, onOpenChange, client }: ReplyDialogProps) {
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [message, setMessage] = useState("");
  const addReply = useAddReply();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter the client's reply message.");
      return;
    }
    try {
      await addReply.mutateAsync({
        clientId: client.id,
        channel,
        message: message.trim(),
      });
      toast.success("Reply logged successfully");
      setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save reply. Please try again.");
    }
  };

  const handleClose = () => {
    setMessage("");
    setChannel("whatsapp");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-ocid="reply.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">
            Log Reply from {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Channel selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Channel</Label>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="reply.toggle"
                onClick={() => setChannel("whatsapp")}
                className={`flex items-center gap-2 flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  channel === "whatsapp"
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "border-border bg-card text-muted-foreground hover:border-green-500/50"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                type="button"
                data-ocid="reply.toggle"
                onClick={() => setChannel("email")}
                className={`flex items-center gap-2 flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  channel === "email"
                    ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                    : "border-border bg-card text-muted-foreground hover:border-red-400/50"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
            </div>
          </div>

          {/* Reply message */}
          <div className="space-y-2">
            <Label htmlFor="reply-message" className="text-sm font-semibold">
              Client's Reply
            </Label>
            <Textarea
              id="reply-message"
              data-ocid="reply.textarea"
              placeholder="What did the client say in response…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            data-ocid="reply.cancel_button"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="reply.submit_button"
            onClick={handleSubmit}
            disabled={addReply.isPending}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            {addReply.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Reply"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
