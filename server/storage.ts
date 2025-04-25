import { 
  users, 
  waterRequests, 
  driverLocations, 
  anomalies,
  type User, 
  type InsertUser, 
  type WaterRequest, 
  type InsertWaterRequest, 
  type UpdateWaterRequest,
  type DriverLocation,
  type InsertDriverLocation,
  type Anomaly,
  type InsertAnomaly
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Water Request methods
  getWaterRequest(id: number): Promise<WaterRequest | undefined>;
  getWaterRequestById(requestId: string): Promise<WaterRequest | undefined>;
  createWaterRequest(request: InsertWaterRequest): Promise<WaterRequest>;
  updateWaterRequest(id: number, updateData: Partial<UpdateWaterRequest>): Promise<WaterRequest | undefined>;
  getUserWaterRequests(userId: number): Promise<WaterRequest[]>;
  getDriverWaterRequests(driverId: number): Promise<WaterRequest[]>;
  getWaterRequestsByStatus(status: string): Promise<WaterRequest[]>;
  getAllWaterRequests(): Promise<WaterRequest[]>;
  
  // Driver Location methods
  createDriverLocation(location: InsertDriverLocation): Promise<DriverLocation>;
  getLatestDriverLocation(driverId: number): Promise<DriverLocation | undefined>;
  getAllDriverLocations(): Promise<DriverLocation[]>;
  
  // Anomaly methods
  createAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getAnomaliesByRequestId(requestId: number): Promise<Anomaly[]>;
  getAllAnomalies(): Promise<Anomaly[]>;
  resolveAnomaly(id: number): Promise<Anomaly | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Water Request methods
  async getWaterRequest(id: number): Promise<WaterRequest | undefined> {
    const [request] = await db.select().from(waterRequests).where(eq(waterRequests.id, id));
    return request;
  }

  async getWaterRequestById(requestId: string): Promise<WaterRequest | undefined> {
    const [request] = await db.select().from(waterRequests).where(eq(waterRequests.requestId, requestId));
    return request;
  }

  async createWaterRequest(insertRequest: InsertWaterRequest): Promise<WaterRequest> {
    const [request] = await db.insert(waterRequests)
      .values({
        ...insertRequest,
        status: "pending",
      })
      .returning();
    return request;
  }

  async updateWaterRequest(id: number, updateData: Partial<UpdateWaterRequest>): Promise<WaterRequest | undefined> {
    const [updatedRequest] = await db.update(waterRequests)
      .set(updateData)
      .where(eq(waterRequests.id, id))
      .returning();
    return updatedRequest;
  }

  async getUserWaterRequests(userId: number): Promise<WaterRequest[]> {
    return await db.select().from(waterRequests).where(eq(waterRequests.userId, userId));
  }

  async getDriverWaterRequests(driverId: number): Promise<WaterRequest[]> {
    return await db.select().from(waterRequests).where(eq(waterRequests.driverId, driverId));
  }

  async getWaterRequestsByStatus(status: string): Promise<WaterRequest[]> {
    return await db.select().from(waterRequests).where(eq(waterRequests.status, status));
  }

  async getAllWaterRequests(): Promise<WaterRequest[]> {
    return await db.select().from(waterRequests);
  }

  // Driver Location methods
  async createDriverLocation(insertLocation: InsertDriverLocation): Promise<DriverLocation> {
    const [location] = await db.insert(driverLocations)
      .values(insertLocation)
      .returning();
    return location;
  }

  async getLatestDriverLocation(driverId: number): Promise<DriverLocation | undefined> {
    const [location] = await db.select()
      .from(driverLocations)
      .where(eq(driverLocations.driverId, driverId))
      .orderBy(desc(driverLocations.timestamp))
      .limit(1);
    return location;
  }

  async getAllDriverLocations(): Promise<DriverLocation[]> {
    return await db.select().from(driverLocations);
  }

  // Anomaly methods
  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<Anomaly> {
    const [anomaly] = await db.insert(anomalies)
      .values({
        ...insertAnomaly,
        resolved: false
      })
      .returning();
    return anomaly;
  }

  async getAnomaliesByRequestId(requestId: number): Promise<Anomaly[]> {
    return await db.select().from(anomalies).where(eq(anomalies.requestId, requestId));
  }

  async getAllAnomalies(): Promise<Anomaly[]> {
    return await db.select().from(anomalies);
  }

  async resolveAnomaly(id: number): Promise<Anomaly | undefined> {
    const [anomaly] = await db.update(anomalies)
      .set({ resolved: true })
      .where(eq(anomalies.id, id))
      .returning();
    return anomaly;
  }
}

export const storage = new DatabaseStorage();