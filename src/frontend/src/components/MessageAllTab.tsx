import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  CheckCheck,
  ChevronDown,
  ChevronUp,
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
  if (cleaned.startsWith("91") && cleaned.length === 12) return cleaned;
  return `91${cleaned}`;
}

function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const digits =
    cleaned.startsWith("91") && cleaned.length === 12
      ? cleaned.slice(2)
      : cleaned.slice(-10);
  return `+91${digits}`;
}

function SenderDetailsBar({
  senderEmail,
  setSenderEmail,
  senderPhone,
  setSenderPhone,
}: {
  senderEmail: string;
  setSenderEmail: (v: string) => void;
  senderPhone: string;
  setSenderPhone: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        data-ocid="broadcast.toggle"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Sender Details
          </span>
          <span className="text-xs text-muted-foreground">
            (optional override)
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="sender-details-broadcast"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
              <div className="space-y-1.5">
                <Label
                  htmlFor="broadcast-sender-email"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Sender Email
                </Label>
                <Input
                  id="broadcast-sender-email"
                  data-ocid="broadcast.input"
                  type="email"
                  placeholder="amkyandco@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="broadcast-sender-phone"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Sender WhatsApp Number
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md">
                    <span className="text-sm font-medium text-foreground">
                      +91
                    </span>
                  </div>
                  <Input
                    id="broadcast-sender-phone"
                    data-ocid="broadcast.input"
                    type="tel"
                    placeholder="10-digit number"
                    value={senderPhone}
                    onChange={(e) =>
                      setSenderPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    className="h-9 text-sm rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MessageAllTab() {
  const { data: clients = [] } = useGetAllClients();
  const [message, setMessage] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [sentClients, setSentClients] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clientsWithPhone = clients.filter((c) => c.phone?.trim());
  const effectiveSenderEmail = senderEmail.trim() || "amkyandco@gmail.com";
  const fullMessage = message + SIGNATURE_TEXT;

  const openWhatsApp = (clientId: string, phone: string) => {
    if (!message.trim()) {
      toast.error("Please type a message first.");
      return;
    }
    const withCountry = formatPhone(phone);
    const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
    setSentClients((prev) => new Set([...prev, clientId]));
  };

  const sendToAll = () => {
    if (!message.trim()) {
      toast.error("Please type a message first.");
      return;
    }
    if (clientsWithPhone.length === 0) {
      toast.error("No clients with phone numbers found.");
      return;
    }
    // Open each WhatsApp link in sequence with small delay
    // Each is triggered by the same user gesture chain
    clientsWithPhone.forEach((client, index) => {
      setTimeout(() => {
        const withCountry = formatPhone(client.phone ?? "");
        const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(fullMessage)}`;
        window.open(url, "_blank");
        setSentClients((prev) => new Set([...prev, client.id]));
      }, index * 600);
    });
    toast.success(
      `Opening WhatsApp for all ${clientsWithPhone.length} clients. Each will open in a new tab.`,
    );
  };

  const handleGmailBroadcast = () => {
    const subject = "Important Update from AMKY & Co";
    const bcc = clients.map((c) => c.email).join(",");
    const url = `https://mail.google.com/mail/?view=cm&fs=1&from=${encodeURIComponent(effectiveSenderEmail)}&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  const copyEmails = async () => {
    const allEmails = clients.map((c) => c.email).join(", ");
    if (!allEmails) return;
    await navigator.clipboard.writeText(allEmails);
    setCopiedEmails(true);
    toast.success("All emails copied to clipboard!");
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const resetSent = () => setSentClients(new Set());

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

  const allEmails = clients.map((c) => c.email).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Sender Details Bar */}
      <SenderDetailsBar
        senderEmail={senderEmail}
        setSenderEmail={setSenderEmail}
        senderPhone={senderPhone}
        setSenderPhone={setSenderPhone}
      />

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
          placeholder="Dear Client,\n\nWe are pleased to inform you that...\n\nWarm regards,\nCA Aman Yadav\nAMKY & Co"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="resize-none font-body text-sm"
        />

        {/* Signature preview */}
        <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 flex items-center gap-4">
          <img
            src="/assets/uploads/Final-Crop-Gif-1-1.gif"
            alt="AMKY & Co"
            className="h-12 w-auto rounded object-contain bg-white p-0.5 border border-border shrink-0"
          />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground">CA Aman Yadav</p>
            <p className="font-semibold text-foreground/80">
              AMKY &amp; Co | Chartered Accountants
            </p>
            <p>{effectiveSenderEmail}</p>
            <p>+91 8433526111 &nbsp;&bull;&nbsp; +91 9372627583</p>
            <p>Shop No 28, Palika Bazar, Kapurbawdi, Thane West - 400607</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            data-ocid="broadcast.gmail_button"
            variant="outline"
            onClick={handleGmailBroadcast}
            disabled={clients.length === 0}
            className="gap-2 border-red-400/50 text-red-600 hover:bg-red-50 hover:border-red-500"
          >
            <Mail className="h-4 w-4" />
            Gmail to All
          </Button>
          <Button
            data-ocid="broadcast.copy_button"
            variant="outline"
            onClick={copyEmails}
            disabled={!allEmails}
            className="gap-2"
          >
            {copiedEmails ? (
              <>
                <CheckCheck className="h-4 w-4 text-green-600" /> Copied!
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" /> Copy Emails
              </>
            )}
          </Button>
        </div>
      </div>

      {/* WhatsApp Broadcast Panel */}
      <div className="rounded-xl border-2 border-green-500/40 bg-green-50/50 dark:bg-green-950/20 p-5 space-y-4">
        <div className="flex items-center justify-between">
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
                {sentClients.size > 0 && ` · ${sentClients.size} sent`}
              </p>
            </div>
          </div>
          {sentClients.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSent}
              className="text-xs text-muted-foreground gap-1"
            >
              <X className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>

        {clientsWithPhone.length === 0 ? (
          <div className="text-center py-8" data-ocid="broadcast.empty_state">
            <Phone className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">
              No clients with phone numbers yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add phone numbers when creating clients to enable broadcast.
            </p>
          </div>
        ) : (
          <>
            {/* How to use note */}
            <div className="flex gap-2 rounded-lg border border-green-300/60 bg-green-100/40 dark:bg-green-900/20 px-3 py-2.5">
              <Info className="h-3.5 w-3.5 text-green-700 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                Type your message above, then click each client's green button
                below. WhatsApp opens with your message pre-filled — just press
                Send. Each client receives it as an individual private message.
              </p>
            </div>

            {/* Send to All button */}
            <Button
              data-ocid="broadcast.primary_button"
              onClick={sendToAll}
              disabled={!message.trim()}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-base"
            >
              <Send className="h-5 w-5" />
              Send to All {clientsWithPhone.length} Clients on WhatsApp
            </Button>

            {!message.trim() && (
              <p className="text-xs text-muted-foreground text-center -mt-1">
                Type a message above to enable this button.
              </p>
            )}

            {/* Individual client buttons — all visible at once */}
            <div className="space-y-2 mt-1">
              <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">
                Individual Clients
              </p>
              {clientsWithPhone.map((client, idx) => {
                const sent = sentClients.has(client.id);
                return (
                  <div
                    key={client.id}
                    data-ocid={`broadcast.item.${idx + 1}`}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      sent
                        ? "border-green-400/60 bg-green-100/50 dark:bg-green-900/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                          sent ? "bg-green-500" : "bg-green-100"
                        }`}
                      >
                        {sent ? (
                          <CheckCheck className="h-4 w-4 text-white" />
                        ) : (
                          <Phone className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatPhoneDisplay(client.phone ?? "")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      data-ocid={`broadcast.button.${idx + 1}`}
                      onClick={() =>
                        openWhatsApp(client.id, client.phone ?? "")
                      }
                      className={`gap-1.5 shrink-0 ${
                        sent
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "border border-green-500/50 bg-white text-green-700 hover:bg-green-50 hover:border-green-500"
                      }`}
                      variant={sent ? "default" : "outline"}
                    >
                      {sent ? (
                        <>
                          <CheckCheck className="h-3.5 w-3.5" /> Sent
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-3.5 w-3.5" /> Send
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
