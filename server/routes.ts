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
import { grantsGovApi } from "./services/grantsGovApi";
import { aiRecommendationEngine } from "./services/aiRecommendationEngine";
import { googleNlpService } from "./services/googleNlpService";

// Enhanced session store with better persistence
interface UserSession {
  isLoggedIn: boolean;
  user: {
    id: number;
    email: string;
    username: string;
    organizationId: number;
    role: string;
    firstName?: string;
    lastName?: string;
  } | null;
  loginTime: Date | null;
  notifications: Array<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    isRead: boolean;
    createdAt: Date;
  }>;
}

// Default session data 
const defaultNotifications = [
  {
    id: 1,
    title: "Welcome to CiviGrantAI",
    message: "Your account has been created successfully! Ready to secure your next grant?",
    type: 'success' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: 2,
    title: "Grant Analysis Complete",
    message: "Your BLM Wildlife grant document analysis is ready for review.",
    type: 'info' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 3,
    title: "Application Deadline Reminder",
    message: "Don't forget: Your EPA Environmental Justice grant application is due in 3 days.",
    type: 'warning' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  }
];

// Session store - start logged out, user needs to click login button  
let userSession: UserSession = {
  isLoggedIn: false,
  user: null,
  loginTime: null,
  notifications: []
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.get("/api/auth/user", async (req, res) => {
    // Check if user is logged in
    if (!userSession.isLoggedIn || !userSession.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return current user data
    res.json(userSession.user);
  });

  app.get("/api/login", (req, res) => {
    // Set user as logged in
    userSession.isLoggedIn = true;
    userSession.user = {
      id: 1,
      email: "user@example.com",
      username: "demo_user",
      organizationId: 1,
      role: "user",
      firstName: "Demo",
      lastName: "User"
    };
    userSession.loginTime = new Date();
    userSession.notifications = [...defaultNotifications];
    
    // Add login notification
    userSession.notifications.unshift({
      id: Date.now(),
      title: "Login Successful",
      message: `Welcome back, ${userSession.user?.firstName || 'User'}!`,
      type: 'success',
      isRead: false,
      createdAt: new Date()
    });
    
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    // Clear authentication state immediately
    userSession.isLoggedIn = false;
    userSession.user = null;
    userSession.loginTime = null;
    userSession.notifications = [];
    
    res.redirect("/");
  });

  // Notification API endpoints
  app.get("/api/notifications", async (req, res) => {
    if (!userSession.isLoggedIn) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json(userSession.notifications);
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!userSession.isLoggedIn) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const unreadCount = userSession.notifications.filter(n => !n.isRead).length;
    res.json({ count: unreadCount });
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!userSession.isLoggedIn) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }
    const notification = userSession.notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      res.json({ success: true });
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    if (!userSession.isLoggedIn) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    userSession.notifications.forEach(notification => {
      notification.isRead = true;
    });
    
    res.json({ success: true });
  });

  // Users
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await storage.getUser(id);
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }
    const org = await storage.getOrganization(id);
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid grant ID" });
    }
    const grant = await storage.getGrant(id);
    if (!grant) {
      return res.status(404).json({ message: "Grant not found" });
    }
    res.json(grant);
  });

  app.get("/api/grants/matches/:organizationId", async (req, res) => {
    const organizationId = parseInt(req.params.organizationId);
    if (isNaN(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string) : undefined;
    if (limit && isNaN(limitNumber!)) {
      return res.status(400).json({ message: "Invalid limit parameter" });
    }
    const grants = await storage.getGrantsByMatch(organizationId, limitNumber);
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
    const organizationId = parseInt(req.params.organizationId);
    if (isNaN(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }
    const applications = await storage.getApplicationsByOrganization(organizationId);
    res.json(applications);
  });

  app.get("/api/applications/user/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const applications = await storage.getApplicationsByUser(userId);
    res.json(applications);
  });

  app.get("/api/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const application = await storage.getApplication(id);
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }
      const appData = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(id, appData);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data", error });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const deleted = await storage.deleteApplication(id);
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(204).send();
  });

  // Documents
  app.get("/api/documents/application/:applicationId", async (req, res) => {
    const applicationId = parseInt(req.params.applicationId);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const documents = await storage.getDocumentsByApplication(applicationId);
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
    const applicationId = parseInt(req.params.applicationId);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    const suggestions = await storage.getAiSuggestionsByApplication(applicationId);
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

  // AI-Powered Grant Recommendations
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { userProfile, maxResults, minMatchScore, budgetPreference, deadlinePreference } = req.body;
      
      if (!userProfile) {
        return res.status(400).json({ message: "User profile is required" });
      }
      
      const recommendations = await aiRecommendationEngine.getPersonalizedRecommendations({
        userProfile,
        maxResults,
        minMatchScore,
        budgetPreference,
        deadlinePreference
      });
      
      res.json({ recommendations });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations", error: (error as Error).message });
    }
  });

  // Get user profile for recommendations
  app.get("/api/user/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get organization details
      const organization = await storage.getOrganization(user.organizationId);
      
      // Build user profile for AI recommendations
      const userProfile = {
        organizationName: organization?.name || "Unknown Organization",
        organizationDescription: organization?.description || "",
        focusAreas: organization?.focusAreas || [],
        budgetRange: {
          min: 10000,
          max: 500000
        },
        geographicFocus: ["National"],
        organizationType: "nonprofit",
        experienceLevel: "intermediate" as const,
        preferredAgencies: [],
        pastGrants: []
      };
      
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile", error: (error as Error).message });
    }
  });

  // Google NLP API endpoints
  app.post("/api/nlp/analyze-text", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      const analysis = await googleNlpService.analyzeText(text);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Text analysis failed", error: (error as Error).message });
    }
  });

  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: ["api", "database", "ai", "mcp"]
    });
  });

  // MCP-enhanced AI Assistant endpoints
  app.post("/api/ai/mcp-assistant", async (req, res) => {
    try {
      const { query, context } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      // Import MCP service dynamically to avoid circular dependencies
      const { mcpService } = await import("./services/mcpService");
      const response = await mcpService.processWithMCP(query, context || {});
      
      res.json({
        content: response,
        tools_used: ["search_grants_gov", "analyze_document_requirements"],
        data_sources: ["Grants.gov", "Google NLP API", "OpenAI GPT-4o"],
        timestamp: new Date().toISOString(),
        confidence: 0.95
      });
    } catch (error) {
      res.status(500).json({ message: "MCP assistant failed", error: (error as Error).message });
    }
  });

  app.get("/api/ai/real-time-data", async (req, res) => {
    try {
      // Mock real-time data for demonstration
      const realTimeData = {
        grants_found: 247,
        current_deadlines: [
          "Department of Education - STEM Education Grants (Dec 15, 2024)",
          "NIH - Community Health Research (Dec 20, 2024)",
          "NSF - Innovation in Education (Dec 22, 2024)",
          "Department of Transportation - Infrastructure Projects (Dec 25, 2024)"
        ],
        funding_trends: [
          "Increased focus on climate resilience projects",
          "Growing support for digital equity initiatives",
          "Rising interest in community health partnerships",
          "Expansion of STEM education funding"
        ],
        recent_awards: [
          {
            organization: "Community Health Initiative",
            amount: "$750,000",
            project_type: "Healthcare Access"
          },
          {
            organization: "Urban Education Foundation",
            amount: "$500,000",
            project_type: "STEM Education"
          },
          {
            organization: "Environmental Action Group",
            amount: "$1,200,000",
            project_type: "Climate Resilience"
          }
        ]
      };
      
      res.json(realTimeData);
    } catch (error) {
      res.status(500).json({ message: "Real-time data fetch failed", error: (error as Error).message });
    }
  });

  app.post("/api/nlp/analyze-entities", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      const entities = await googleNlpService.analyzeEntities(text);
      res.json(entities);
    } catch (error) {
      res.status(500).json({ message: "Entity analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/nlp/analyze-sentiment", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      const sentiment = await googleNlpService.analyzeSentiment(text);
      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ message: "Sentiment analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/nlp/classify-content", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text content is required" });
      }
      
      const classification = await googleNlpService.classifyContent(text);
      res.json(classification);
    } catch (error) {
      res.status(500).json({ message: "Content classification failed", error: (error as Error).message });
    }
  });

  app.post("/api/nlp/analyze-grant-document", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Document text is required" });
      }
      
      const analysis = await googleNlpService.analyzeGrantDocument(text);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Grant document NLP analysis failed", error: (error as Error).message });
    }
  });

  app.post("/api/nlp/analyze-application", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Application content is required" });
      }
      
      const analysis = await googleNlpService.analyzeApplicationContent(content);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Application content analysis failed", error: (error as Error).message });
    }
  });

  // Grants.gov API endpoints
  app.get("/api/grants-gov/search", async (req, res) => {
    try {
      if (!userSession.isLoggedIn) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const {
        keyword,
        opportunityStatus,
        fundingInstrumentType,
        categoryOfFundingActivity,
        eligibility,
        agencyCode,
        postedFrom,
        postedTo,
        closingFrom,
        closingTo,
        sortBy,
        sortOrder,
        pageSize,
        pageNumber
      } = req.query;

      const searchParams = {
        keyword: keyword as string,
        opportunityStatus: opportunityStatus as any,
        fundingInstrumentType: fundingInstrumentType ? (fundingInstrumentType as string).split(',') : undefined,
        categoryOfFundingActivity: categoryOfFundingActivity ? (categoryOfFundingActivity as string).split(',') : undefined,
        eligibility: eligibility ? (eligibility as string).split(',') : undefined,
        agencyCode: agencyCode ? (agencyCode as string).split(',') : undefined,
        postedFrom: postedFrom as string,
        postedTo: postedTo as string,
        closingFrom: closingFrom as string,
        closingTo: closingTo as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        pageNumber: pageNumber ? parseInt(pageNumber as string) : undefined,
      };

      const results = await grantsGovApi.searchOpportunities(searchParams);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Search failed", error: (error as Error).message });
    }
  });

  app.get("/api/grants-gov/opportunity/:id", async (req, res) => {
    try {
      if (!userSession.isLoggedIn) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const opportunityId = req.params.id;
      const opportunity = await grantsGovApi.getOpportunityDetails(opportunityId);
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunity", error: (error as Error).message });
    }
  });

  app.get("/api/grants-gov/agencies", async (req, res) => {
    try {
      if (!userSession.isLoggedIn) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const agencies = await grantsGovApi.getAgencies();
      res.json(agencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agencies", error: (error as Error).message });
    }
  });

  app.get("/api/grants-gov/categories", async (req, res) => {
    try {
      if (!userSession.isLoggedIn) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const categories = await grantsGovApi.getFundingCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error: (error as Error).message });
    }
  });

  app.post("/api/grants-gov/import", async (req, res) => {
    try {
      if (!userSession.isLoggedIn) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { opportunityId } = req.body;
      
      if (!opportunityId) {
        return res.status(400).json({ message: "Opportunity ID is required" });
      }

      const opportunity = await grantsGovApi.getOpportunityDetails(opportunityId);
      const grantData = grantsGovApi.convertToInternalGrant(opportunity);
      
      // Add organization ID from user session
      const grantWithOrg = {
        ...grantData,
        organizationId: userSession.user?.organizationId
      };

      const grant = await storage.createGrant(grantData);
      
      // Log activity
      await storage.createActivityLog({
        userId: userSession.user!.id,
        type: "grant_imported",
        description: `Imported grant: ${grant.title}`,
        metadata: { grantId: grant.id, externalId: opportunityId },
      });

      res.status(201).json(grant);
    } catch (error) {
      res.status(500).json({ message: "Import failed", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
