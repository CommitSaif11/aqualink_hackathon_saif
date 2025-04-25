import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("resident"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const waterRequests = pgTable("water_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  address: text("address").notNull(),
  waterAmount: integer("water_amount").notNull(),
  urgency: text("urgency").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  driverId: integer("driver_id"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  inTransitAt: timestamp("in_transit_at"),
  deliveredAt: timestamp("delivered_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const driverLocations = pgTable("driver_locations", {
  id: serial("id").primaryKey(),
  driverId: integer("driver_id").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
  profileImageUrl: true,
});

export const insertWaterRequestSchema = createInsertSchema(waterRequests).pick({
  requestId: true,
  userId: true,
  address: true,
  waterAmount: true,
  urgency: true,
  notes: true,
  latitude: true,
  longitude: true,
});

export const updateWaterRequestSchema = createInsertSchema(waterRequests).pick({
  status: true,
  driverId: true,
  acceptedAt: true,
  inTransitAt: true,
  deliveredAt: true,
  rating: true,
  feedback: true,
});

export const insertDriverLocationSchema = createInsertSchema(driverLocations).pick({
  driverId: true,
  latitude: true,
  longitude: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).pick({
  requestId: true,
  type: true,
  description: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaterRequest = z.infer<typeof insertWaterRequestSchema>;
export type UpdateWaterRequest = z.infer<typeof updateWaterRequestSchema>;
export type WaterRequest = typeof waterRequests.$inferSelect;

export type InsertDriverLocation = z.infer<typeof insertDriverLocationSchema>;
export type DriverLocation = typeof driverLocations.$inferSelect;

export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;
