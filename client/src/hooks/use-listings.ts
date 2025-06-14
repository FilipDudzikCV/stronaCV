import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Listing, InsertListing } from "@shared/schema";

export function useListings(search?: string, category?: string) {
  return useQuery<Listing[]>({
    queryKey: ["/api/listings", search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category && category !== "all") params.append("category", category);
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch listings");
      return response.json();
    },
  });
}

export function useListing(id: number) {
  return useQuery<Listing>({
    queryKey: ["/api/listings", id],
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listing: InsertListing) => {
      const response = await apiRequest("POST", "/api/listings", listing);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Listing> }) => {
      const response = await apiRequest("PATCH", `/api/listings/${id}`, updates);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings", id] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });
}

export function useUserListings(userId: number) {
  return useQuery<Listing[]>({
    queryKey: ["/api/users", userId, "listings"],
    enabled: !!userId,
  });
}
