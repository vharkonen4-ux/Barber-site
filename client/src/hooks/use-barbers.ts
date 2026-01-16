import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBarber, type Barber } from "@shared/schema";

export function useBarbers() {
  return useQuery({
    queryKey: [api.barbers.list.path],
    queryFn: async () => {
      const res = await fetch(api.barbers.list.path);
      if (!res.ok) throw new Error("Failed to fetch barbers");
      return api.barbers.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBarber) => {
      const res = await fetch(api.barbers.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create barber");
      return api.barbers.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.barbers.list.path] });
    },
  });
}

export function useUpdateBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertBarber>) => {
      const url = buildUrl(api.barbers.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update barber");
      return api.barbers.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.barbers.list.path] });
    },
  });
}

export function useDeleteBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.barbers.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete barber");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.barbers.list.path] });
    },
  });
}
