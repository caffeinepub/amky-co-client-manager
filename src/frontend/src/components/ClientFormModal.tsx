import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Client, ClientInput } from "../backend.d.ts";
import { getProfilePic } from "../utils/profilePictures";

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (input: ClientInput, profilePic?: string) => void;
  isSaving: boolean;
  editingClient?: Client | null;
}

const empty: ClientInput = { name: "", email: "", phone: "", notes: "" };

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ClientFormModal({
  open,
  onOpenChange,
  onSave,
  isSaving,
  editingClient,
}: ClientFormModalProps) {
  const [form, setForm] = useState<ClientInput>(empty);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [pendingPic, setPendingPic] = useState<string | null>(null);
  const picInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(
        editingClient
          ? {
              name: editingClient.name,
              email: editingClient.email,
              phone: editingClient.phone,
              notes: editingClient.notes,
            }
          : empty,
      );
      setErrors({});
      // Load existing pic for edit mode
      if (editingClient) {
        setPendingPic(getProfilePic(editingClient.id));
      } else {
        setPendingPic(null);
      }
    }
  }, [open, editingClient]);

  const validate = () => {
    const e: { name?: string; email?: string } = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form, pendingPic ?? undefined);
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingPic(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const displayPic = pendingPic;
  const initials = getInitials(form.name || "?");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="client_form.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {editingClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar upload */}
          <div className="flex justify-center">
            <button
              type="button"
              data-ocid="client_form.upload_button"
              onClick={() => picInputRef.current?.click()}
              className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Upload profile picture"
            >
              {displayPic ? (
                <img
                  src={displayPic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {initials}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <input
              ref={picInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePicChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cf-name"
              data-ocid="client_form.input"
              placeholder="e.g. Rajesh Mehta"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p
                className="text-xs text-destructive"
                data-ocid="client_form.error_state"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cf-email"
              data-ocid="client_form.input"
              type="email"
              placeholder="e.g. rajesh@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="cf-phone"
              data-ocid="client_form.input"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="cf-notes"
              data-ocid="client_form.textarea"
              placeholder="GST registration, filing deadlines, key details..."
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="client_form.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="client_form.submit_button"
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-navy-light"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editingClient ? (
                "Save Changes"
              ) : (
                "Add Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
