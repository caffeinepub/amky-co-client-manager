import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client, ClientId, ClientInput } from "../backend.d.ts";
import { useActor } from "./useActor";

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
