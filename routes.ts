// @ts-nocheck
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListingSchema, insertMessageSchema, insertConversationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const { search, category } = req.query;
      let listings;
      
      if (search || category) {
        listings = await storage.searchListings(
          search as string || "", 
          category as string
        );
      } else {
        listings = await storage.getAllListings();
      }
      
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Get listing by ID
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getListingById(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Increment views
      await storage.incrementViews(id);
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  // Create new listing
  app.post("/api/listings", async (req, res) => {
    try {
      const validatedData = insertListingSchema.parse(req.body);
      const listing = await storage.createListing(validatedData);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  // Update listing
  app.patch("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const listing = await storage.updateListing(id, updates);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  // Delete listing
  app.delete("/api/listings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteListing(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Get user listings
  app.get("/api/users/:userId/listings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Get user conversations
  app.get("/api/users/:userId/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Send message
  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.sendMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user favorites
  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add to favorites
  app.post("/api/users/:userId/favorites/:listingId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const listingId = parseInt(req.params.listingId);
      
      const favorite = await storage.addToFavorites(userId, listingId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  // Remove from favorites
  app.delete("/api/users/:userId/favorites/:listingId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const listingId = parseInt(req.params.listingId);
      
      const removed = await storage.removeFromFavorites(userId, listingId);
      
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Check if listing is favorite
  app.get("/api/users/:userId/favorites/:listingId/check", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const listingId = parseInt(req.params.listingId);
      
      const isFavorite = await storage.isFavorite(userId, listingId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
