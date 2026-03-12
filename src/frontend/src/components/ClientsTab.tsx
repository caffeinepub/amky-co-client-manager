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
  MessageSquare,
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
  useGetReplies,
} from "../hooks/useQueries";
import {
  getProfilePic,
  removeProfilePic,
  setProfilePic,
} from "../utils/profilePictures";
import { ClientFormModal } from "./ClientFormModal";
import { RepliesSheet } from "./RepliesSheet";
import { ReplyDialog } from "./ReplyDialog";
import { SenderDetailsBar } from "./SenderDetailsBar";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function ReplyBadge({ clientId }: { clientId: string }) {
  const { data: replies = [] } = useGetReplies(clientId);
  if (replies.length === 0) {
    return <span className="text-xs text-muted-foreground">No replies</span>;
  }
  return (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-xs border-green-200 dark:border-green-800"
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      {replies.length} {replies.length === 1 ? "reply" : "replies"}
    </Badge>
  );
}

interface ClientsTabProps {
  senderEmail: string;
  senderPhone: string;
  onSenderEmailChange: (v: string) => void;
  onSenderPhoneChange: (v: string) => void;
}

export function ClientsTab({
  senderEmail,
  senderPhone,
  onSenderEmailChange,
  onSenderPhoneChange,
}: ClientsTabProps) {
  const { data: clients, isLoading, refetch } = useGetAllClients();
  const addClient = useAddClient();
  const editClient = useEditClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyDialogClient, setReplyDialogClient] = useState<Client | null>(
    null,
  );
  const [repliesSheetClient, setRepliesSheetClient] = useState<Client | null>(
    null,
  );
  const [picVersion, setPicVersion] = useState(0);

  const filtered = (clients ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (input: ClientInput, profilePic?: string) => {
    try {
      if (editingClient) {
        await editClient.mutateAsync({ id: editingClient.id, input });
        if (profilePic !== undefined) {
          setProfilePic(editingClient.id, profilePic);
          setPicVersion((v) => v + 1);
        }
        toast.success("Client updated successfully");
      } else {
        await addClient.mutateAsync(input);
        if (profilePic) {
          const updated = await refetch();
          const newClient = (updated.data ?? []).find(
            (c) => c.name === input.name && c.email === input.email,
          );
          if (newClient) {
            setProfilePic(newClient.id, profilePic);
            setPicVersion((v) => v + 1);
          }
        }
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
      removeProfilePic(deletingId);
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
      {/* Sender Details Bar */}
      <SenderDetailsBar
        email={senderEmail}
        phone={senderPhone}
        onEmailChange={onSenderEmailChange}
        onPhoneChange={onSenderPhoneChange}
      />

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
          key={picVersion}
        >
          <AnimatePresence>
            {filtered.map((client, index) => {
              const pic = getProfilePic(client.id);
              const initials = getInitials(client.name);
              return (
                <motion.div
                  key={client.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  data-ocid={`clients.item.${index + 1}`}
                  className="group relative bg-card border border-border rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />

                  <div className="pl-2">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {pic ? (
                          <img
                            src={pic}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-accent shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-navy-light flex items-center justify-center shrink-0 border-2 border-accent/40">
                            <span className="text-xs font-bold text-primary-foreground">
                              {initials}
                            </span>
                          </div>
                        )}
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

                    {/* Reply indicators and actions */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
                      <ReplyBadge clientId={client.id} />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`clients.secondary_button.${index + 1}`}
                          className="h-7 text-xs px-2.5 gap-1"
                          onClick={() => setReplyDialogClient(client)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          Log Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-ocid={`clients.button.${index + 1}`}
                          className="h-7 text-xs px-2.5 gap-1 text-primary hover:text-primary"
                          onClick={() => setRepliesSheetClient(client)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

      {/* Reply Dialog */}
      {replyDialogClient && (
        <ReplyDialog
          open={!!replyDialogClient}
          onOpenChange={(open) => !open && setReplyDialogClient(null)}
          client={replyDialogClient}
          defaultEmail={senderEmail}
          defaultPhone={senderPhone}
        />
      )}

      {/* Replies Sheet */}
      {repliesSheetClient && (
        <RepliesSheet
          open={!!repliesSheetClient}
          onOpenChange={(open) => !open && setRepliesSheetClient(null)}
          client={repliesSheetClient}
        />
      )}
    </div>
  );
}
