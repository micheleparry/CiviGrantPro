import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertOrganizationSchema, insertGrantSchema, 
  insertApplicationSchema, insertDocumentSchema, insertAiSuggestionSchema,
  insertActivityLogSchema
} from "@shared/schema";
import { 
  analyzeGrantMatch, generateNarrative, generateSuggestions, 
  analyzeFunderPriorities, analyzeOrganizationIntelligence,
  analyzeDocumentRequirements, generateApplicationSection
} from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.get("/api/auth/user", async (req, res) => {
    // For now, return mock user data for development
    // In production, this would check session/token
    const mockUser = {
      id: 1,
      email: "user@example.com",
      username: "demo_user",
      organizationId: 1,
      role: "user"
    };
    res.json(mockUser);
  });

  app.get("/api/login", (req, res) => {
    // Redirect to actual login implementation
    // For now, redirect to home since we're using mock auth
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    // Clear session/token and redirect to landing
    // For now, just redirect to root which will show landing page
    res.redirect("/");
  });

  // Users
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  // Organizations
  app.get("/api/organizations/:id", async (req, res) => {
    const org = await storage.getOrganization(parseInt(req.params.id));
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json(org);
  });

  app.post("/api/organizations", async (req, res) => {
    try {
      const orgData = insertOrganizationSchema.parse(req.body);
      const org = await storage.createOrganization(orgData);
      res.status(201).json(org);
    } catch (error) {
      res.status(400).json({ message: "Invalid organization data", error });
    }
  });

  // Grants
  app.get("/api/grants", async (req, res) => {
    const { status, focusAreas } = req.query;
    const filters: any = {};
    
    if (status) filters.status = status as string;
    if (focusAreas) filters.focusAreas = (focusAreas as string).split(",");
    
    const grants = await storage.getGrants(filters);
    res.json(grants);
  });

  app.get("/api/grants/:id", async (req, res) => {
    const grant = await storage.getGrant(parseInt(req.params.id));
    if (!grant) {
      return res.status(404).json({ message: "Grant not found" });
    }
    res.json(grant);
  });

  app.get("/api/grants/matches/:organizationId", async (req, res) => {
    const { limit } = req.query;
    const grants = await storage.getGrantsByMatch(
      parseInt(req.params.organizationId),
      limit ? parseInt(limit as string) : undefined
    );
    res.json(grants);
  });

  app.post("/api/grants", async (req, res) => {
    try {
      const grantData = insertGrantSchema.parse(req.body);
      const grant = await storage.createGrant(grantData);
      res.status(201).json(grant);
    } catch (error) {
      res.status(400).json({ message: "Invalid grant data", error });
    }
  });

  // Applications
  app.get("/api/applications/organization/:organizationId", async (req, res) => {
    const applications = await storage.getApplicationsByOrganization(
      parseInt(req.params.organizationId)
    );
    res.json(applications);
  });

  app.get("/api/applications/user/:userId", async (req, res) => {
    const applications = await storage.getApplicationsByUser(
      parseInt(req.params.userId)
    );
    res.json(applications);
  });

  app.get("/api/applications/:id", async (req, res) => {
    const application = await storage.getApplication(parseInt(req.params.id));
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const appData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(appData);
      
      // Log activity
      await storage.createActivityLog({
        userId: application.userId,
        type: "application_created",
        description: `New application created: ${application.title}`,
        metadata: { applicationId: application.id, grantId: application.grantId },
      });
      
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data", error });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const appData = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(parseInt(req.params.id), appData);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data", error });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    const deleted = await storage.deleteApplication(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(204).send();
  });

  // Documents
  app.get("/api/documents/application/:applicationId", async (req, res) => {
    const documents = await storage.getDocumentsByApplication(
      parseInt(req.params.applicationId)
    );
    res.json(documents);
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const docData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(docData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: "Invalid document data", error });
    }
  });

  // AI Suggestions
  app.get("/api/ai-suggestions/application/:applicationId", async (req, res) => {
    const suggestions = await storage.getAiSuggestionsByApplication(
      parseInt(req.params.applicationId)
    );
    res.json(suggestions);
  });

  app.post("/api/ai-suggestions", async (req, res) => {
    try {
      const suggestionData = insertAiSuggestionSchema.parse(req.body);
      const suggestion = await storage.createAiSuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      res.status(400).json({ message: "Invalid suggestion data", error });
    }
  });

  app.put("/api/ai-suggestions/:id", async (req, res) => {
    try {
      const suggestionData = insertAiSuggestionSchema.partial().parse(req.body);
      const suggestion = await storage.updateAiSuggestion(parseInt(req.params.id), suggestionData);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Suggestion not found" });
      }
      
      res.json(suggestion);
    } catch (error) {
      res.status(400).json({ message: "Invalid suggestion data", error });
    }
  });

  // Activity Log
  app.get("/api/activity/:userId", async (req, res) => {
    const { limit } = req.query;
    const activities = await storage.getActivityLog(
      parseInt(req.params.userId),
      limit ? parseInt(limit as string) : undefined
    );
    res.json(activities);
  });

  app.post("/api/activity", async (req, res) => {
    try {
      const activityData = insertActivityLogSchema.parse(req.body);
      const activity = await storage.createActivityLog(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data", error });
    }
  });

  // Dashboard Stats
  app.get("/api/dashboard/stats/:organizationId", async (req, res) => {
    const stats = await storage.getDashboardStats(parseInt(req.params.organizationId));
    res.json(stats);
  });

  // AI-powered endpoints
  app.post("/api/ai/analyze-grant-match", async (req, res) => {
    try {
      const { grantDescription, organizationProfile, focusAreas } = req.body;
      
      if (!grantDescription || !organizationProfile || !focusAreas) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const analysis = await analyzeGrantMatch(grantDescription, organizationProfile, focusAreas);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/ai/generate-narrative", async (req, res) => {
    try {
      const { grantDescription, organizationProfile, projectDescription, section } = req.body;
      
      if (!grantDescription || !organizationProfile || !projectDescription || !section) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const narrative = await generateNarrative(grantDescription, organizationProfile, projectDescription, section);
      res.json(narrative);
    } catch (error) {
      res.status(500).json({ message: "Narrative generation failed", error: (error as Error).message });
    }
  });

  app.post("/api/ai/generate-suggestions", async (req, res) => {
    try {
      const { applicationContent, grantRequirements, suggestionType } = req.body;
      
      if (!applicationContent || !grantRequirements || !suggestionType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const suggestions = await generateSuggestions(applicationContent, grantRequirements, suggestionType);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: "Suggestion generation failed", error: (error as Error).message });
    }
  });

  app.post("/api/ai/analyze-funder", async (req, res) => {
    try {
      const { funderDescription, pastAwards } = req.body;
      
      if (!funderDescription || !pastAwards) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const analysis = await analyzeFunderPriorities(funderDescription, pastAwards);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Funder analysis failed", error: (error as Error).message });
    }
  });

  // Enhanced AI intelligence features from Python integration
  app.post("/api/ai/organization-intelligence", async (req, res) => {
    try {
      const { organizationName, grantTitle } = req.body;
      
      if (!organizationName) {
        return res.status(400).json({ message: "Organization name is required" });
      }
      
      const intelligence = await analyzeOrganizationIntelligence(organizationName, grantTitle);
      res.json(intelligence);
    } catch (error) {
      res.status(500).json({ message: "Organization intelligence analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/ai/document-analysis", async (req, res) => {
    try {
      const { documentContent, documentType } = req.body;
      
      if (!documentContent) {
        return res.status(400).json({ message: "Document content is required" });
      }
      
      const analysis = await analyzeDocumentRequirements(documentContent, documentType);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Document analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/ai/application-section", async (req, res) => {
    try {
      const { sectionType, projectDetails, grantRequirements, organizationIntelligence } = req.body;
      
      if (!sectionType || !projectDetails || !grantRequirements || !organizationIntelligence) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const section = await generateApplicationSection(sectionType, projectDetails, grantRequirements, organizationIntelligence);
      res.json(section);
    } catch (error) {
      res.status(500).json({ message: "Application section generation failed", error: (error as Error).message });
    }
  });

  // Python-based Enhanced Grant Analysis
  app.post("/api/ai/analyze-grant-document", async (req, res) => {
    try {
      const { documentText, documentName } = req.body;
      
      if (!documentText) {
        return res.status(400).json({ message: "Document text is required" });
      }
      
      const { pythonAnalyzer } = await import("./services/pythonAnalyzer");
      const analysis = await pythonAnalyzer.analyzeGrantDocument(documentText, documentName);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Grant document analysis failed", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
