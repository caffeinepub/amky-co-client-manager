import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  CheckCheck,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Info,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useGetAllClients } from "../hooks/useQueries";

type AttachedFile = {
  dataUrl: string;
  name: string;
  size: number;
  ext: string;
};

function getExt(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function FileIcon({ ext }: { ext: string }) {
  if (ext === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (ext === "xls" || ext === "xlsx")
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (ext === "doc" || ext === "docx")
    return <FileText className="h-5 w-5 text-blue-500" />;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
    return <ImageIcon className="h-5 w-5 text-purple-500" />;
  if (ext === "zip" || ext === "rar")
    return <Archive className="h-5 w-5 text-amber-600" />;
  return <FileText className="h-5 w-5 text-muted-foreground" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SIGNATURE_TEXT = `
--
CA Aman Yadav | AMKY & Co | Chartered Accountants
amkyandco@gmail.com | +91 8433526111 | +91 9372627583
Shop No 28, Palika Bazar, Ghodbunder Rd, Kapurbawdi, Thane West - 400607`;

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // If already has country code (91 + 10 digits = 12 digits)
  if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned;
  return `91${cleaned}`;
}

export function MessageAllTab() {
  const { data: clients = [] } = useGetAllClients();
  const [message, setMessage] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step-through broadcast state
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [broadcastIndex, setBroadcastIndex] = useState(0);

  const allEmails = clients.map((c) => c.email).join(", ");
  const clientsWithPhone = clients.filter((c) => c.phone?.trim());

  const fullMessage = message + SIGNATURE_TEXT;

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
    await navigator.clipboard.writeText(fullMessage);
    setCopiedMsg(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleGmailBroadcast = () => {
    const subject = "Important Update from AMKY & Co";
    const bcc = clients.map((c) => c.email).join(",");
    const url = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  // Start broadcast: resets index and marks active
  const startBroadcast = () => {
    if (!message.trim()) {
      toast.error("Please type a message first.");
      return;
    }
    if (clientsWithPhone.length === 0) {
      toast.error("No clients with phone numbers found.");
      return;
    }
    setBroadcastIndex(0);
    setBroadcastActive(true);
  };

  // Send to current client and advance
  const sendToCurrentAndAdvance = () => {
    const client = clientsWithPhone[broadcastIndex];
    if (!client) return;
    const withCountry = formatPhone(client.phone ?? "");
    const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");

    const next = broadcastIndex + 1;
    if (next >= clientsWithPhone.length) {
      setBroadcastActive(false);
      setBroadcastIndex(0);
      toast.success(
        `WhatsApp opened for all ${clientsWithPhone.length} clients!`,
      );
    } else {
      setBroadcastIndex(next);
    }
  };

  const cancelBroadcast = () => {
    setBroadcastActive(false);
    setBroadcastIndex(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    if (!rawFiles.length) return;
    for (const file of rawFiles) {
      const reader = new FileReader();
      const ext = getExt(file.name);
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setFiles((prev) => [
          ...prev,
          { dataUrl, name: file.name, size: file.size, ext },
        ]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const currentClient = broadcastActive
    ? clientsWithPhone[broadcastIndex]
    : null;
  const isLastClient = broadcastIndex === clientsWithPhone.length - 1;

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
          Compose your message below, then click{" "}
          <strong>Start WhatsApp Broadcast</strong>. It will open WhatsApp for
          each client one by one — just press Send in WhatsApp, then come back
          and click <strong>Next</strong> for the next client.
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
            data-ocid="broadcast.secondary_button"
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
          placeholder={
            "Dear Clients,\n\nWe are pleased to inform you that...\n\nWarm regards,\nCA Aman Yadav\nAMKY & Co"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="resize-none font-body text-sm"
        />

        {/* Signature preview */}
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 flex items-center gap-4">
          <img
            src="/assets/uploads/IMG-20260312-WA0002-2-1.jpg"
            alt="AMKY & Co"
            className="h-12 w-auto rounded object-contain bg-white p-0.5 border border-border shrink-0"
          />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground">CA Aman Yadav</p>
            <p className="font-semibold text-foreground/80">
              AMKY &amp; Co | Chartered Accountants
            </p>
            <p>amkyandco@gmail.com</p>
            <p>+91 8433526111 &nbsp;&bull;&nbsp; +91 9372627583</p>
            <p>Shop No 28, Palika Bazar, Kapurbawdi, Thane West - 400607</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {message.length} characters
          </span>
          <div className="flex gap-2">
            <Button
              data-ocid="broadcast.copy_button"
              onClick={copyMessage}
              variant="outline"
              className="gap-2"
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
            <Button
              data-ocid="broadcast.gmail_button"
              variant="outline"
              onClick={handleGmailBroadcast}
              disabled={clients.length === 0}
              className="gap-2 border-red-400/50 text-red-600 hover:bg-red-50 hover:border-red-500"
            >
              <Mail className="h-4 w-4" />
              Gmail Broadcast
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Broadcast Section */}
      <div className="rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              WhatsApp Broadcast
            </p>
            <p className="text-xs text-muted-foreground">
              {clientsWithPhone.length} client
              {clientsWithPhone.length !== 1 ? "s" : ""} with phone numbers
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!broadcastActive ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-2 rounded-lg border border-green-300/60 bg-green-100/40 dark:bg-green-900/20 px-3 py-2.5">
                <Info className="h-3.5 w-3.5 text-green-700 dark:text-green-400 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                  Click <strong>Start Broadcast</strong> to begin. WhatsApp will
                  open for each client one at a time with your message
                  pre-filled. Press <strong>Send</strong> in WhatsApp, then
                  return here and click <strong>Next Client</strong>.
                </p>
              </div>
              <Button
                data-ocid="broadcast.primary_button"
                onClick={startBroadcast}
                disabled={clientsWithPhone.length === 0 || !message.trim()}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base"
              >
                <Send className="h-5 w-5" />
                Start WhatsApp Broadcast ({clientsWithPhone.length} clients)
              </Button>
              {!message.trim() && clientsWithPhone.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Type a message above to enable broadcast.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Progress */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Sending to client {broadcastIndex + 1} of{" "}
                  {clientsWithPhone.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {clientsWithPhone.length - broadcastIndex - 1} remaining after
                  this
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-green-200/60 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(broadcastIndex / clientsWithPhone.length) * 100}%`,
                  }}
                />
              </div>

              {/* Current client card */}
              {currentClient && (
                <div className="flex items-center gap-3 rounded-lg border-2 border-green-400/60 bg-white dark:bg-green-900/30 px-4 py-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {currentClient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentClient.phone}
                    </p>
                  </div>
                </div>
              )}

              <Button
                data-ocid="broadcast.send_next_button"
                onClick={sendToCurrentAndAdvance}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base"
              >
                {isLastClient ? (
                  <>
                    <Send className="h-5 w-5" />
                    Open WhatsApp for {currentClient?.name} (Last Client)
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-5 w-5" />
                    Open WhatsApp for {currentClient?.name} &rarr; Next
                  </>
                )}
              </Button>

              <Button
                data-ocid="broadcast.cancel_button"
                variant="outline"
                onClick={cancelBroadcast}
                className="w-full gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Cancel Broadcast
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {clientsWithPhone.length === 0 && clients.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Add phone numbers to clients to enable this button.
          </p>
        )}
        {clients.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            No clients added yet.
          </p>
        )}
      </div>

      {/* Per-client WhatsApp list */}
      {clientsWithPhone.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Or Send Individually
          </Label>
          <div className="space-y-2">
            {clientsWithPhone.map((client, idx) => (
              <div
                key={client.id}
                data-ocid={`broadcast.item.${idx + 1}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.phone}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  data-ocid={`broadcast.button.${idx + 1}`}
                  onClick={() => {
                    if (!message.trim()) {
                      toast.error("Please type a message first.");
                      return;
                    }
                    const withCountry = formatPhone(client.phone ?? "");
                    const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(fullMessage)}`;
                    window.open(url, "_blank");
                  }}
                  className="gap-1.5 shrink-0 border-green-500/50 text-green-700 hover:bg-green-50 hover:border-green-500"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File attachments */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Attach Files
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg,.gif,.zip,.rar"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="broadcast.upload_button"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2 border-dashed w-full justify-center py-5 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Click to attach PDF, Excel, Word, PNG, ZIP…
        </Button>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {files.map((file, idx) => (
                <motion.div
                  key={`${file.name}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                >
                  <FileIcon ext={file.ext} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    data-ocid={`broadcast.delete_button.${idx + 1}`}
                    className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
