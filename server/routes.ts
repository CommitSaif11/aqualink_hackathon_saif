import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertWaterRequestSchema,
  updateWaterRequestSchema,
  insertDriverLocationSchema,
  insertAnomalySchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  };

  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "Email already in use" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already in use" });
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Specific user routes (must come before generic parametrized routes)
  app.get("/api/users/email/:email", async (req: Request, res: Response) => {
    const { email } = req.params;
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  app.get("/api/users/role/:role", async (req: Request, res: Response) => {
    const { role } = req.params;
    const users = await storage.getUsersByRole(role);
    res.json(users);
  });

  // Generic user route (must come after specific routes)
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // Water Request routes
  app.post("/api/requests", async (req: Request, res: Response) => {
    try {
      const requestData = insertWaterRequestSchema.parse(req.body);
      const newRequest = await storage.createWaterRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/requests", async (req: Request, res: Response) => {
    const requests = await storage.getAllWaterRequests();
    res.json(requests);
  });

  // Specific request routes (must come before generic parametrized routes)
  app.get("/api/requests/user/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const requests = await storage.getUserWaterRequests(userId);
    res.json(requests);
  });

  app.get("/api/requests/driver/:driverId", async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.driverId);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    
    const requests = await storage.getDriverWaterRequests(driverId);
    res.json(requests);
  });

  app.get("/api/requests/status/:status", async (req: Request, res: Response) => {
    const { status } = req.params;
    const requests = await storage.getWaterRequestsByStatus(status);
    res.json(requests);
  });

  // Generic request route (must come after specific routes)
  app.get("/api/requests/:id", async (req: Request, res: Response) => {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    
    const request = await storage.getWaterRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json(request);
  });

  app.patch("/api/requests/:id", async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const updateData = updateWaterRequestSchema.partial().parse(req.body);
      const updatedRequest = await storage.updateWaterRequest(requestId, updateData);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Driver Location routes
  app.post("/api/locations", async (req: Request, res: Response) => {
    try {
      const locationData = insertDriverLocationSchema.parse(req.body);
      const newLocation = await storage.createDriverLocation(locationData);
      res.status(201).json(newLocation);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/locations/driver/:driverId", async (req: Request, res: Response) => {
    const driverId = parseInt(req.params.driverId);
    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    
    const location = await storage.getLatestDriverLocation(driverId);
    if (!location) {
      return res.status(404).json({ message: "Driver location not found" });
    }
    
    res.json(location);
  });

  app.get("/api/locations", async (req: Request, res: Response) => {
    const locations = await storage.getAllDriverLocations();
    res.json(locations);
  });

  // Anomaly routes
  app.post("/api/anomalies", async (req: Request, res: Response) => {
    try {
      const anomalyData = insertAnomalySchema.parse(req.body);
      const newAnomaly = await storage.createAnomaly(anomalyData);
      res.status(201).json(newAnomaly);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/anomalies", async (req: Request, res: Response) => {
    const anomalies = await storage.getAllAnomalies();
    res.json(anomalies);
  });

  // Specific anomaly routes (must come before generic parametrized routes)
  app.get("/api/anomalies/request/:requestId", async (req: Request, res: Response) => {
    const requestId = parseInt(req.params.requestId);
    if (isNaN(requestId)) {
      return res.status(400).json({ message: "Invalid request ID" });
    }
    
    const anomalies = await storage.getAnomaliesByRequestId(requestId);
    res.json(anomalies);
  });

  app.patch("/api/anomalies/:id/resolve", async (req: Request, res: Response) => {
    const anomalyId = parseInt(req.params.id);
    if (isNaN(anomalyId)) {
      return res.status(400).json({ message: "Invalid anomaly ID" });
    }
    
    const resolvedAnomaly = await storage.resolveAnomaly(anomalyId);
    if (!resolvedAnomaly) {
      return res.status(404).json({ message: "Anomaly not found" });
    }
    
    res.json(resolvedAnomaly);
  });

  const httpServer = createServer(app);
  return httpServer;
}
