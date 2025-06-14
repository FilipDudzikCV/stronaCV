// storage.ts
// @ts-nocheck
import {
  users,
  listings,
  messages,
  conversations,
  favorites,
  type User,
  type InsertUser,
  type Listing,
  type InsertListing,
  type Message,
  type InsertMessage,
  type Conversation,
  type InsertConversation,
  type Favorite,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Listings
  getAllListings(): Promise<Listing[]>;
  getListingById(id: number): Promise<Listing | undefined>;
  getUserListings(userId: number): Promise<Listing[]>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, updates: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: number): Promise<boolean>;
  searchListings(query: string, category?: string): Promise<Listing[]>;
  incrementViews(id: number): Promise<void>;

  // Messages
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  getUserConversations(
    userId: number
  ): Promise<
    (Conversation & {
      listing: Listing;
      otherUser: User;
      lastMessage?: Message;
      unreadCount: number;
    })[]
  >;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: number): Promise<void>;

  // Favorites
  getUserFavorites(userId: number): Promise<(Favorite & { listing: Listing })[]>;
  addToFavorites(userId: number, listingId: number): Promise<Favorite>;
  removeFromFavorites(userId: number, listingId: number): Promise<boolean>;
  isFavorite(userId: number, listingId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private listings = new Map<number, Listing>();
  private messages = new Map<number, Message>();
  private conversations = new Map<number, Conversation>();
  private favorites = new Map<number, Favorite>();

  private unreadCounts = new Map<string, number>(); // Klucz: `${conversationId}:${userId}`

  private currentUserId = 1;
  private currentListingId = 1;
  private currentMessageId = 1;
  private currentConversationId = 1;
  private currentFavoriteId = 1;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    const user = await this.createUser({
      name: "Filip Dudzik",
      username: "Filipdudzik",
      password: "1234",
      location: "Kraków",
    });

    await this.createListing({
      title: "AUTO",
      description:
        "AUTOAUTOAUTOAUTOAUTO",
      price: "299",
      category: "akcesoria",
      userId: user.id,
      images: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dp",
      ],
      negotiable: true,
    });

    await this.createListing({
      title: "Buty",
      description:
        "Nowe buty 123123123123.",
      price: "999",
      category: "obuwie",
      userId: user.id,
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c25lYWtlcnN8ZW58MHx8MHx8fDA%3D.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
      ],
      negotiable: false,
    });

    await this.createListing({
      title: "ŁADOWARKA TURBO",
      description:
        "Ładowarka do laptopa",
      price: "1",
      category: "akcesoria",
      userId: user.id,
      images: [
        "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Q0hBUkdFUnxlbnwwfHwwfHx8MA%3D%3Des.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
      ],
      negotiable: true,
    });

    await this.createListing({
      title: "Samochód elektroniczny",
      description:
        "Tesla samochoód elektroniczny",
      price: "1200",
      category: "elektronika",
      userId: user.id,
      images: [
        "https://images.unsplash.com/photo-1585011664466-b7bbe92f34ef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dGVzbGF8ZW58MHx8MHx8fDA%3Dto-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop",
      ],
      negotiable: true,
    });
  }

  // Users

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      name: insertUser.name,
      location: insertUser.location,
      avatar: insertUser.avatar ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  // Listings

  async getAllListings(): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter((listing) => listing.status === "active")
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter((listing) => listing.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = {
      id,
      title: insertListing.title,
      description: insertListing.description,
      price: insertListing.price,
      category: insertListing.category,

      userId: insertListing.userId,
      images: insertListing.images ?? null,
      negotiable: insertListing.negotiable ?? null,
      status: "active",
      views: 0,
      favorites: 0,
      createdAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(
    id: number,
    updates: Partial<Listing>
  ): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;

    const updated = { ...listing, ...updates };
    this.listings.set(id, updated);
    return updated;
  }

  async deleteListing(id: number): Promise<boolean> {
    return this.listings.delete(id);
  }

  async searchListings(
    query: string,
    category?: string
  ): Promise<Listing[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.listings.values())
      .filter((listing) => {
        const matchesQuery =
          !query ||
          listing.title.toLowerCase().includes(queryLower) ||
          listing.description.toLowerCase().includes(queryLower);

        const matchesCategory =
          !category ||
          category === "all" ||
          listing.category.toLowerCase() === category.toLowerCase();

        return listing.status === "active" && matchesQuery && matchesCategory;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
  }

  async incrementViews(id: number): Promise<void> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.views = (listing.views ?? 0) + 1;
      this.listings.set(id, listing);
    }
  }

  // Conversations and Messages

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
      );
  }

  async getUserConversations(
    userId: number
  ): Promise<
    (Conversation & {
      listing: Listing;
      otherUser: User;
      lastMessage?: Message;
      unreadCount: number;
    })[]
  > {
    const userConversations = Array.from(this.conversations.values()).filter(
      (conv) => conv.buyerId === userId || conv.sellerId === userId
    );

    const result = [];
    for (const conversation of userConversations) {
      const listing = this.listings.get(conversation.listingId);
      const otherUserId =
        conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
      const otherUser = this.users.get(otherUserId);

      if (listing && otherUser) {
        const messages = await this.getConversationMessages(conversation.id);
        const lastMessage = messages[messages.length - 1];

        const key = `${conversation.id}:${userId}`;
        const unreadCount = this.unreadCounts.get(key) ?? 0;

        result.push({
          ...conversation,
          listing,
          otherUser,
          lastMessage,
          unreadCount,
        });
      }
    }

    return result.sort(
      (a, b) => new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime()
    );
  }

  async createConversation(
    insertConversation: InsertConversation
  ): Promise<Conversation> {
    const existing = Array.from(this.conversations.values()).find(
      (conv) =>
        conv.listingId === insertConversation.listingId &&
        conv.buyerId === insertConversation.buyerId &&
        conv.sellerId === insertConversation.sellerId
    );

    if (existing) return existing;

    const id = this.currentConversationId++;
    const conversation: Conversation = {
      ...insertConversation,
      id,
      lastMessageAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversation.id, conversation);

      const recipientId =
        insertMessage.senderId === conversation.buyerId
          ? conversation.sellerId
          : conversation.buyerId;

      const key = `${conversation.id}:${recipientId}`;
      const currentCount = this.unreadCounts.get(key) ?? 0;
      this.unreadCounts.set(key, currentCount + 1);
    }

    return message;
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    const key = `${conversationId}:${userId}`;
    this.unreadCounts.set(key, 0);
  }

  // Favorites

  async getUserFavorites(
    userId: number
  ): Promise<(Favorite & { listing: Listing })[]> {
    const userFavorites = Array.from(this.favorites.values()).filter(
      (fav) => fav.userId === userId
    );

    const result = [];
    for (const fav of userFavorites) {
      const listing = this.listings.get(fav.listingId);
      if (listing) {
        result.push({ ...fav, listing });
      }
    }

    return result;
  }

  async addToFavorites(userId: number, listingId: number): Promise<Favorite> {
    const exists = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.listingId === listingId
    );
    if (exists) return exists;

    const id = this.currentFavoriteId++;
    const favorite: Favorite = {
      id,
      userId,
      listingId,
    };
    this.favorites.set(id, favorite);

    const listing = this.listings.get(listingId);
    if (listing) {
      listing.favorites = (listing.favorites ?? 0) + 1;
      this.listings.set(listingId, listing);
    }

    return favorite;
  }

  async removeFromFavorites(userId: number, listingId: number): Promise<boolean> {
    const favEntry = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.listingId === listingId
    );
    if (!favEntry) return false;

    this.favorites.delete(favEntry.id);

    const listing = this.listings.get(listingId);
    if (listing) {
      listing.favorites = Math.max((listing.favorites ?? 1) - 1, 0);
      this.listings.set(listingId, listing);
    }

    return true;
  }

  async isFavorite(userId: number, listingId: number): Promise<boolean> {
    return (
      Array.from(this.favorites.values()).find(
        (fav) => fav.userId === userId && fav.listingId === listingId
      ) !== undefined
    );
  }
}

// Tu dodajemy eksport instancji klasy, której możesz używać w innych plikach
export const storage = new MemStorage();
