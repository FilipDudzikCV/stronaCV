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
  type Favorite
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
  getUserConversations(userId: number): Promise<(Conversation & { 
    listing: Listing; 
    otherUser: User; 
    lastMessage?: Message;
    unreadCount: number;
  })[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  sendMessage(message: InsertMessage): Promise<Message>;
  
  // Favorites
  getUserFavorites(userId: number): Promise<(Favorite & { listing: Listing })[]>;
  addToFavorites(userId: number, listingId: number): Promise<Favorite>;
  removeFromFavorites(userId: number, listingId: number): Promise<boolean>;
  isFavorite(userId: number, listingId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private listings: Map<number, Listing>;
  private messages: Map<number, Message>;
  private conversations: Map<number, Conversation>;
  private favorites: Map<number, Favorite>;
  private currentUserId: number;
  private currentListingId: number;
  private currentMessageId: number;
  private currentConversationId: number;
  private currentFavoriteId: number;

  constructor() {
    this.users = new Map();
    this.listings = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.favorites = new Map();
    this.currentUserId = 1;
    this.currentListingId = 1;
    this.currentMessageId = 1;
    this.currentConversationId = 1;
    this.currentFavoriteId = 1;
    
    // Create default user
    this.createUser({
      name: "Jan Kowalski",
      username: "jan.kowalski",
      password: "password123",
      location: "Warszawa",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      avatar: null 
    };
    this.users.set(id, user);
    return user;
  }

  async getAllListings(): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter(listing => listing.status === 'active')
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getListingById(id: number): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter(listing => listing.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = this.currentListingId++;
    const listing: Listing = {
      ...insertListing,
      id,
      views: 0,
      favorites: 0,
      status: 'active',
      createdAt: new Date(),
    };
    this.listings.set(id, listing);
    return listing;
  }

  async updateListing(id: number, updates: Partial<Listing>): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;
    
    const updated = { ...listing, ...updates };
    this.listings.set(id, updated);
    return updated;
  }

  async deleteListing(id: number): Promise<boolean> {
    return this.listings.delete(id);
  }

  async searchListings(query: string, category?: string): Promise<Listing[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.listings.values())
      .filter(listing => {
        const matchesQuery = !query || 
          listing.title.toLowerCase().includes(queryLower) ||
          listing.description.toLowerCase().includes(queryLower);
        
        const matchesCategory = !category || category === 'all' || 
          listing.category.toLowerCase() === category.toLowerCase();
        
        return listing.status === 'active' && matchesQuery && matchesCategory;
      })
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async incrementViews(id: number): Promise<void> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      this.listings.set(id, listing);
    }
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getUserConversations(userId: number): Promise<(Conversation & { 
    listing: Listing; 
    otherUser: User; 
    lastMessage?: Message;
    unreadCount: number;
  })[]> {
    const userConversations = Array.from(this.conversations.values())
      .filter(conv => conv.buyerId === userId || conv.sellerId === userId);

    const result = [];
    for (const conversation of userConversations) {
      const listing = this.listings.get(conversation.listingId);
      const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
      const otherUser = this.users.get(otherUserId);
      
      if (listing && otherUser) {
        const messages = await this.getConversationMessages(conversation.id);
        const lastMessage = messages[messages.length - 1];
        
        result.push({
          ...conversation,
          listing,
          otherUser,
          lastMessage,
          unreadCount: 0, // Simplified for now
        });
      }
    }

    return result.sort((a, b) => 
      new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime()
    );
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    // Check if conversation already exists
    const existing = Array.from(this.conversations.values())
      .find(conv => 
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

    // Update conversation last message time
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(conversation.id, conversation);
    }

    return message;
  }

  async getUserFavorites(userId: number): Promise<(Favorite & { listing: Listing })[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(fav => fav.userId === userId);

    const result = [];
    for (const favorite of userFavorites) {
      const listing = this.listings.get(favorite.listingId);
      if (listing) {
        result.push({ ...favorite, listing });
      }
    }

    return result;
  }

  async addToFavorites(userId: number, listingId: number): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = { id, userId, listingId };
    this.favorites.set(id, favorite);

    // Increment listing favorites count
    const listing = this.listings.get(listingId);
    if (listing) {
      listing.favorites = (listing.favorites || 0) + 1;
      this.listings.set(listingId, listing);
    }

    return favorite;
  }

  async removeFromFavorites(userId: number, listingId: number): Promise<boolean> {
    const favorite = Array.from(this.favorites.values())
      .find(fav => fav.userId === userId && fav.listingId === listingId);
    
    if (!favorite) return false;

    this.favorites.delete(favorite.id);

    // Decrement listing favorites count
    const listing = this.listings.get(listingId);
    if (listing && listing.favorites && listing.favorites > 0) {
      listing.favorites = listing.favorites - 1;
      this.listings.set(listingId, listing);
    }

    return true;
  }

  async isFavorite(userId: number, listingId: number): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(fav => fav.userId === userId && fav.listingId === listingId);
  }
}

export const storage = new MemStorage();
