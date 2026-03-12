import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  CheckCheck,
  ChevronsUpDown,
  Copy,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Info,
  Mail,
  MessageCircle,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d.ts";
import { useGetAllClients, useGetReplies } from "../hooks/useQueries";
import { ReplyDialog } from "./ReplyDialog";

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

function ClientReplyBadge({
  clientId,
  onLogReply,
}: { clientId: string; onLogReply: () => void }) {
  const { data: replies = [] } = useGetReplies(clientId);
  return (
    <button
      type="button"
      data-ocid="compose.toggle"
      onClick={onLogReply}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded px-2 py-1 hover:bg-muted"
    >
      <MessageSquare className="h-3.5 w-3.5" />
      {replies.length > 0 ? (
        <span className="text-green-600 font-medium">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </span>
      ) : (
        "Log reply from client"
      )}
    </button>
  );
}

export function ComposeTab() {
  const { data: clients = [] } = useGetAllClients();
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClient: Client | undefined = clients.find(
    (c) => c.id === selectedId,
  );

  useEffect(() => {
    if (selectedClient) {
      setMessage(
        `Dear ${selectedClient.name},\n\n\n\nWarm regards,\nCA Aman Yadav\nAMKY & Co | Chartered Accountants`,
      );
    } else {
      setMessage("");
    }
    setFiles([]);
  }, [selectedClient]);

  const fullMessage = message + SIGNATURE_TEXT;

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

  const copyEmail = async () => {
    if (!selectedClient) return;
    await navigator.clipboard.writeText(selectedClient.email);
    setCopiedEmail(true);
    toast.success("Email address copied!");
    setTimeout(() => setCopiedEmail(false), 2500);
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

  const handleWhatsApp = () => {
    if (!selectedClient) {
      toast.error("Please select a client first.");
      return;
    }
    if (!selectedClient.phone) {
      toast.error("This client has no phone number.");
      return;
    }
    const phone = selectedClient.phone.replace(/\D/g, "");
    // Handle numbers that already have country code
    const withCountry =
      phone.startsWith("91") && phone.length === 12 ? phone : `91${phone}`;
    const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  const handleGmail = () => {
    if (!selectedClient) {
      toast.error("Please select a client first.");
      return;
    }
    const subject = "Message from AMKY & Co";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selectedClient.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(url, "_blank");
  };

  const handleDetain = () => {
    setSelectedId("");
    setMessage("");
    setFiles([]);
    toast.success("Message cleared");
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
          Select a client, compose your message, then send via WhatsApp or open
          in Gmail.
        </p>
      </div>

      {/* Searchable client selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Select Client
        </Label>
        <Popover open={selectorOpen} onOpenChange={setSelectorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-ocid="compose.select"
              aria-expanded={selectorOpen}
              className="w-full justify-between bg-card font-normal h-10"
            >
              {selectedClient
                ? `${selectedClient.name} — ${selectedClient.email}`
                : "Search and select a client…"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput
                data-ocid="compose.search_input"
                placeholder="Search by name or email…"
              />
              <CommandList>
                <CommandEmpty>No clients found.</CommandEmpty>
                <CommandGroup>
                  {clients.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`${c.name} ${c.email}`}
                      onSelect={() => {
                        setSelectedId(c.id);
                        setSelectorOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{c.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Email chip + reply badge */}
      {selectedClient && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap items-center gap-2"
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
            data-ocid="compose.secondary_button"
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
          <ClientReplyBadge
            clientId={selectedClient.id}
            onLogReply={() => setReplyDialogOpen(true)}
          />
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
          placeholder="Select a client above to start composing…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={10}
          className="resize-none font-body text-sm"
          disabled={!selectedClient}
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

        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {message.length} characters
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button
              data-ocid="compose.delete_button"
              variant="destructive"
              onClick={handleDetain}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" /> Detain
            </Button>
            <Button
              data-ocid="compose.primary_button"
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
      </div>

      {/* WhatsApp + Gmail */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          data-ocid="compose.button"
          variant="outline"
          onClick={handleWhatsApp}
          disabled={!selectedClient}
          className="gap-2 border-green-500/50 text-green-700 hover:bg-green-50 hover:border-green-500"
        >
          <MessageCircle className="h-4 w-4" />
          Send via WhatsApp
        </Button>
        <Button
          data-ocid="compose.button"
          variant="outline"
          onClick={handleGmail}
          disabled={!selectedClient}
          className="gap-2 border-red-400/50 text-red-600 hover:bg-red-50 hover:border-red-500"
        >
          <Mail className="h-4 w-4" />
          Open in Gmail
        </Button>
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
          data-ocid="compose.upload_button"
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
                    data-ocid={`compose.delete_button.${idx + 1}`}
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

        {files.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Note: Attachments shown here for reference. Attach them manually
            when sending via Gmail.
          </p>
        )}
      </div>

      {/* Reply Dialog */}
      {selectedClient && (
        <ReplyDialog
          open={replyDialogOpen}
          onOpenChange={setReplyDialogOpen}
          client={selectedClient}
        />
      )}
    </motion.div>
  );
}
