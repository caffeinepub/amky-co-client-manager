import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, ClientId, ClientInput } from "../backend.d.ts";
import { useActor } from "./useActor";

export interface Reply {
  id: string;
  clientId: string;
  channel: string;
  message: string;
  createdAt: bigint;
}

interface ActorWithReplies {
  addReply(clientId: string, channel: string, message: string): Promise<void>;
  getReplies(clientId: string): Promise<Array<Reply>>;
  deleteReply(id: string): Promise<void>;
}

export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput) => {
      if (!actor) throw new Error("No actor");
      return actor.addClient(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useEditClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: ClientId; input: ClientInput }) => {
      if (!actor) throw new Error("No actor");
      return actor.editClient(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: ClientId) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteClient(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useGetReplies(clientId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Reply[]>({
    queryKey: ["replies", clientId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as ActorWithReplies).getReplies(clientId);
    },
    enabled: !!actor && !isFetching && !!clientId,
  });
}

export function useAddReply() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      clientId: string;
      channel: string;
      message: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ActorWithReplies).addReply(
        vars.clientId,
        vars.channel,
        vars.message,
      );
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["replies", variables.clientId] });
    },
  });
}

export function useDeleteReply() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; clientId: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as ActorWithReplies).deleteReply(vars.id);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["replies", variables.clientId] });
    },
  });
}
