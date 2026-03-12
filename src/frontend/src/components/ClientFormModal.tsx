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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Client, ClientInput } from "../backend.d.ts";

interface ClientFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (input: ClientInput) => void;
  isSaving: boolean;
  editingClient?: Client | null;
}

const empty: ClientInput = { name: "", email: "", phone: "", notes: "" };

export function ClientFormModal({
  open,
  onOpenChange,
  onSave,
  isSaving,
  editingClient,
}: ClientFormModalProps) {
  const [form, setForm] = useState<ClientInput>(empty);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

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
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="client_form.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            {editingClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
