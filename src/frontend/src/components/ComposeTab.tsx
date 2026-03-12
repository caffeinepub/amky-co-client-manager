import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCheck, Copy, Info, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d.ts";
import { useGetAllClients } from "../hooks/useQueries";

export function ComposeTab() {
  const { data: clients = [] } = useGetAllClients();
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const selectedClient: Client | undefined = clients.find(
    (c) => c.id === selectedId,
  );

  useEffect(() => {
    if (selectedClient) {
      setMessage(
        `Dear ${selectedClient.name},\n\n\n\nWarm regards,\nAMKY & Co\nChartered Accountants`,
      );
    } else {
      setMessage("");
    }
  }, [selectedClient]);

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

  const copyEmail = async () => {
    if (!selectedClient) return;
    await navigator.clipboard.writeText(selectedClient.email);
    setCopiedEmail(true);
    toast.success("Email address copied!");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Instruction */}
      <div className="flex gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3">
        <Info className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-accent-foreground">
          Select a client, compose your message, then copy the email and message
          into your email client.
        </p>
      </div>

      {/* Client selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Select Client
        </Label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger data-ocid="compose.select" className="bg-card">
            <SelectValue placeholder="Choose a client\u2026" />
          </SelectTrigger>
          <SelectContent>
            {clients.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No clients added yet.
              </div>
            ) : (
              clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} \u2014 {c.email}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Email chip */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 min-w-0">
            <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">
              {selectedClient.email}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            data-ocid="compose.copy_email_button"
            onClick={copyEmail}
            className="shrink-0 gap-1.5 text-xs"
          >
            {copiedEmail ? (
              <>
                <CheckCheck className="h-3.5 w-3.5 text-green-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Email
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Message composer */}
      <div className="space-y-2">
        <Label
          htmlFor="compose-msg"
          className="text-sm font-semibold text-foreground"
        >
          Message
        </Label>
        <Textarea
          id="compose-msg"
          data-ocid="compose.textarea"
          placeholder="Select a client above to start composing\u2026"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          className="resize-none font-body text-sm"
          disabled={!selectedClient}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {message.length} characters
          </span>
          <Button
            data-ocid="compose.copy_button"
            onClick={copyMessage}
            disabled={!selectedClient}
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
