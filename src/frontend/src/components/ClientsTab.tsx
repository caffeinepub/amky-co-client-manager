import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Client, ClientInput } from "../backend.d.ts";
import {
  useAddClient,
  useDeleteClient,
  useEditClient,
  useGetAllClients,
} from "../hooks/useQueries";
import { ClientFormModal } from "./ClientFormModal";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ClientsTab() {
  const { data: clients, isLoading } = useGetAllClients();
  const addClient = useAddClient();
  const editClient = useEditClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (input: ClientInput) => {
    try {
      if (editingClient) {
        await editClient.mutateAsync({ id: editingClient.id, input });
        toast.success("Client updated successfully");
      } else {
        await addClient.mutateAsync(input);
        toast.success("Client added successfully");
      }
      setModalOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteClient.mutateAsync(deletingId);
      toast.success("Client removed");
    } catch {
      toast.error("Failed to delete client.");
    } finally {
      setDeletingId(null);
    }
  };

  const isSaving = addClient.isPending || editClient.isPending;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="clients.search_input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Button
          data-ocid="clients.add_button"
          onClick={() => {
            setEditingClient(null);
            setModalOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:opacity-90 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Count badge */}
      {!isLoading && clients && clients.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-body">
            {filtered.length} of {clients.length} client
            {clients.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="clients.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-5 space-y-3"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center"
          data-ocid="clients.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary/50" />
          </div>
          <div>
            <p className="font-display text-lg text-foreground/70 font-semibold">
              {search ? "No clients match your search" : "No clients yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try a different name or email."
                : 'Click "Add Client" to get started.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Client grid */}
      {!isLoading && filtered.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filtered.map((client, index) => (
              <motion.div
                key={client.id}
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.95 }}
                data-ocid={`clients.item.${index + 1}`}
                className="group relative bg-card border border-border rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden"
              >
                {/* Gold left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-base text-foreground truncate">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">
                          {client.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-ocid={`clients.edit_button.${index + 1}`}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditingClient(client);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-ocid={`clients.delete_button.${index + 1}`}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeletingId(client.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {client.phone && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {client.phone}
                      </span>
                    </div>
                  )}
                  {client.notes && (
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-border">
                      <StickyNote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <ClientFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        isSaving={isSaving}
        editingClient={editingClient}
      />

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
      >
        <AlertDialogContent data-ocid="clients.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Remove Client?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the client and all their information.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="clients.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="clients.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
