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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waterRequests: Map<number, WaterRequest>;
  private driverLocations: Map<number, DriverLocation>;
  private anomalies: Map<number, Anomaly>;
  private userIdCounter: number;
  private requestIdCounter: number;
  private locationIdCounter: number;
  private anomalyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.waterRequests = new Map();
    this.driverLocations = new Map();
    this.anomalies = new Map();
    this.userIdCounter = 1;
    this.requestIdCounter = 1;
    this.locationIdCounter = 1;
    this.anomalyIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Water Request methods
  async getWaterRequest(id: number): Promise<WaterRequest | undefined> {
    return this.waterRequests.get(id);
  }

  async getWaterRequestById(requestId: string): Promise<WaterRequest | undefined> {
    return Array.from(this.waterRequests.values()).find(
      (request) => request.requestId === requestId
    );
  }

  async createWaterRequest(insertRequest: InsertWaterRequest): Promise<WaterRequest> {
    const id = this.requestIdCounter++;
    const now = new Date();
    const request: WaterRequest = {
      ...insertRequest,
      id,
      status: "pending",
      createdAt: now,
      acceptedAt: null,
      inTransitAt: null,
      deliveredAt: null,
      rating: null,
      feedback: null,
      driverId: null
    };
    this.waterRequests.set(id, request);
    return request;
  }

  async updateWaterRequest(id: number, updateData: Partial<UpdateWaterRequest>): Promise<WaterRequest | undefined> {
    const request = this.waterRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...updateData };
    this.waterRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getUserWaterRequests(userId: number): Promise<WaterRequest[]> {
    return Array.from(this.waterRequests.values()).filter(
      (request) => request.userId === userId
    );
  }

  async getDriverWaterRequests(driverId: number): Promise<WaterRequest[]> {
    return Array.from(this.waterRequests.values()).filter(
      (request) => request.driverId === driverId
    );
  }

  async getWaterRequestsByStatus(status: string): Promise<WaterRequest[]> {
    return Array.from(this.waterRequests.values()).filter(
      (request) => request.status === status
    );
  }

  async getAllWaterRequests(): Promise<WaterRequest[]> {
    return Array.from(this.waterRequests.values());
  }

  // Driver Location methods
  async createDriverLocation(insertLocation: InsertDriverLocation): Promise<DriverLocation> {
    const id = this.locationIdCounter++;
    const now = new Date();
    const location: DriverLocation = {
      ...insertLocation,
      id,
      timestamp: now
    };
    this.driverLocations.set(id, location);
    return location;
  }

  async getLatestDriverLocation(driverId: number): Promise<DriverLocation | undefined> {
    const driverLocations = Array.from(this.driverLocations.values())
      .filter(location => location.driverId === driverId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return driverLocations.length > 0 ? driverLocations[0] : undefined;
  }

  async getAllDriverLocations(): Promise<DriverLocation[]> {
    return Array.from(this.driverLocations.values());
  }

  // Anomaly methods
  async createAnomaly(insertAnomaly: InsertAnomaly): Promise<Anomaly> {
    const id = this.anomalyIdCounter++;
    const now = new Date();
    const anomaly: Anomaly = {
      ...insertAnomaly,
      id,
      resolved: false,
      createdAt: now
    };
    this.anomalies.set(id, anomaly);
    return anomaly;
  }

  async getAnomaliesByRequestId(requestId: number): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values()).filter(
      (anomaly) => anomaly.requestId === requestId
    );
  }

  async getAllAnomalies(): Promise<Anomaly[]> {
    return Array.from(this.anomalies.values());
  }

  async resolveAnomaly(id: number): Promise<Anomaly | undefined> {
    const anomaly = this.anomalies.get(id);
    if (!anomaly) return undefined;

    const resolvedAnomaly = { ...anomaly, resolved: true };
    this.anomalies.set(id, resolvedAnomaly);
    return resolvedAnomaly;
  }
}

export const storage = new MemStorage();
