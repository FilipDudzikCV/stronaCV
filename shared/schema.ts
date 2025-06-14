import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  avatar: text("avatar"),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  userId: integer("user_id").notNull(),
  images: text("images").array(),
  negotiable: boolean("negotiable").default(false),
  status: text("status").default("active"), // active, sold, paused
  views: integer("views").default(0),
  favorites: integer("favorites").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertListingSchema = createInsertSchema(listings).omit({ 
  id: true, 
  views: true, 
  favorites: true, 
  createdAt: true 
});
export const insertMessageSchema = createInsertSchema(messages).omit({ 
  id: true, 
  createdAt: true 
});
export const insertConversationSchema = createInsertSchema(conversations).omit({ 
  id: true, 
  lastMessageAt: true 
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Favorite = typeof favorites.$inferSelect;
