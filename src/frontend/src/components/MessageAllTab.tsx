import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useGetAllClients } from "../hooks/useQueries";

type AttachedImage = { url: string; name: string };

export function MessageAllTab() {
  const { data: clients = [] } = useGetAllClients();
  const [message, setMessage] = useState("");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [images, setImages] = useState<AttachedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            data-ocid="broadcast.primary_button"
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
              data-ocid="broadcast.button"
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
          data-ocid="broadcast.upload_button"
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
                      data-ocid="broadcast.button"
                    >
                      <Download className="h-3 w-3 text-white" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    data-ocid={`broadcast.delete_button.${idx + 1}`}
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
