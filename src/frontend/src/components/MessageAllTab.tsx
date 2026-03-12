import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCheck, Copy, Info, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetAllClients } from "../hooks/useQueries";

export function MessageAllTab() {
  const { data: clients = [] } = useGetAllClients();
  const [message, setMessage] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const allEmails = clients.map((c) => c.email).join(", ");

  const copyEmails = async () => {
    if (!allEmails) return;
    await navigator.clipboard.writeText(allEmails);
    setCopiedEmails(true);
    toast.success("All emails copied to clipboard!");
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const copyMessage = async () => {
    if (!message.trim()) {
      toast.error("Please type a message first.");
      return;
    }
    await navigator.clipboard.writeText(message);
    setCopiedMsg(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Instruction banner */}
      <div className="flex gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3">
        <Info className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-accent-foreground leading-relaxed">
          Compose your message below, then copy the email list into your email
          client&apos;s
          <strong className="font-semibold"> BCC</strong> field and paste your
          message.
        </p>
      </div>

      {/* All emails */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          All Client Emails ({clients.length})
        </Label>
        <div className="relative">
          <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 pr-36 min-h-[52px] text-sm text-foreground/80 font-mono leading-relaxed break-all">
            {allEmails || (
              <span className="text-muted-foreground italic">
                No clients added yet.
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            data-ocid="broadcast.copy_emails_button"
            onClick={copyEmails}
            disabled={!allEmails}
            className="absolute right-2 top-2 gap-1.5 text-xs"
          >
            {copiedEmails ? (
              <>
                <CheckCheck className="h-3.5 w-3.5 text-green-600" /> Copied!
              </>
            ) : (
              <>
                <Mail className="h-3.5 w-3.5" /> Copy Emails
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Message composer */}
      <div className="space-y-2">
        <Label
          htmlFor="broadcast-msg"
          className="text-sm font-semibold text-foreground"
        >
          Broadcast Message
        </Label>
        <Textarea
          id="broadcast-msg"
          data-ocid="broadcast.textarea"
          placeholder="Dear Clients,&#10;&#10;We are pleased to inform you that...&#10;&#10;Regards,&#10;AMKY & Co"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="resize-none font-body text-sm"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {message.length} characters
          </span>
          <Button
            data-ocid="broadcast.copy_button"
            onClick={copyMessage}
            className="bg-primary text-primary-foreground hover:opacity-90 gap-2"
          >
            {copiedMsg ? (
              <>
                <CheckCheck className="h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Message
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
