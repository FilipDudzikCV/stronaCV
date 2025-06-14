import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message, InsertMessage, InsertConversation } from "@shared/schema";

type ConversationWithDetails = Conversation & {
  listing: any;
  otherUser: any;
  lastMessage?: Message;
  unreadCount: number;
};

export function useUserConversations(userId: number) {
  return useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/users", userId, "conversations"],
    enabled: !!userId,
  });
}

export function useConversationMessages(conversationId: number) {
  return useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversation: InsertConversation) => {
      const response = await apiRequest("POST", "/api/conversations", conversation);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.buyerId, "conversations"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", variables.sellerId, "conversations"] 
      });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: InsertMessage) => {
      const response = await apiRequest("POST", "/api/messages", message);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", variables.conversationId, "messages"] 
      });
    },
  });
}
