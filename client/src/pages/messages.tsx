import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, Phone, MoreVertical, Paperclip, Send } from "lucide-react";
import { useUserConversations, useConversationMessages, useSendMessage } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const userId = 1; // Current user ID (in real app, get from auth context)
  
  const { data: conversations = [] } = useUserConversations(userId);
  const { data: messages = [] } = useConversationMessages(selectedConversationId || 0);
  const sendMessageMutation = useSendMessage();

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      senderId: userId,
      content: messageText.trim(),
    }, {
      onSuccess: () => {
        setMessageText("");
      },
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatConversationTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} godz`;
    return d.toLocaleDateString("pl-PL");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Konwersacje</h2>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Szukaj konwersacji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-full">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {conversations.length === 0 ? "Brak konwersacji" : "Brak wyników wyszukiwania"}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                      selectedConversationId === conversation.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.otherUser.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatConversationTime(conversation.lastMessageAt!)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage?.content || "Brak wiadomości"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 truncate">
                            {conversation.listing.title}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.otherUser.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.listing.title} - {selectedConversation.listing.price} zł
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Rozpocznij konwersację
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3",
                          message.senderId === userId ? "justify-end" : ""
                        )}
                      >
                        {message.senderId !== userId && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gray-200 text-gray-500">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2 max-w-xs",
                            message.senderId === userId
                              ? "bg-primary text-primary-foreground"
                              : "bg-gray-100 text-gray-900"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span
                            className={cn(
                              "text-xs mt-1 block",
                              message.senderId === userId
                                ? "text-primary-foreground/70"
                                : "text-gray-500"
                            )}
                          >
                            {formatTime(message.createdAt!)}
                          </span>
                        </div>
                        {message.senderId === userId && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Napisz wiadomość..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <p>Wybierz konwersację, aby rozpocząć rozmowę</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
