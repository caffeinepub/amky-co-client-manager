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
import {
  CheckCheck,
  Copy,
  Download,
  ImagePlus,
  Info,
  Mail,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Client } from "../backend.d.ts";
import { useGetAllClients } from "../hooks/useQueries";

type AttachedImage = { url: string; name: string };

export function ComposeTab() {
  const { data: clients = [] } = useGetAllClients();
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [images, setImages] = useState<AttachedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setImages([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setImages((prev) => [...prev, { url, name: file.name }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadImage = (img: AttachedImage) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = img.name;
    a.click();
  };

  const downloadAll = () => {
    for (const img of images) {
      downloadImage(img);
    }
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

      {/* Image attachments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-foreground">
            Attach Images
          </Label>
          {images.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={downloadAll}
              className="gap-1.5 text-xs"
              data-ocid="compose.button"
            >
              <Download className="h-3.5 w-3.5" />
              Download All ({images.length})
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
          <ImagePlus className="h-4 w-4" />
          Click to attach images
        </Button>

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-4 gap-2"
            >
              {images.map((img, idx) => (
                <motion.div
                  key={`${img.name}-${idx}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-secondary"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => downloadImage(img)}
                      className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                      title="Download"
                      data-ocid="compose.button"
                    >
                      <Download className="h-3 w-3 text-white" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    data-ocid={`compose.delete_button.${idx + 1}`}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[9px] truncate">{img.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Download images above, then manually attach them in your email
            client.
          </p>
        )}
      </div>
    </motion.div>
  );
}
