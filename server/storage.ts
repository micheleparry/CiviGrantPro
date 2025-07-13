import { 
  users, organizations, grants, applications, documents, 
  aiSuggestions, activityLog,
  type User, type InsertUser,
  type Organization, type InsertOrganization,
  type Grant, type InsertGrant,
  type Application, type InsertApplication,
  type Document, type InsertDocument,
  type AiSuggestion, type InsertAiSuggestion,
  type ActivityLog, type InsertActivityLog
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Organizations
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: number, org: Partial<InsertOrganization>): Promise<Organization | undefined>;

  // Grants
  getGrant(id: number): Promise<Grant | undefined>;
  getGrants(filters?: { status?: string; focusAreas?: string[] }): Promise<Grant[]>;
  createGrant(grant: InsertGrant): Promise<Grant>;
  updateGrant(id: number, grant: Partial<InsertGrant>): Promise<Grant | undefined>;
  getGrantsByMatch(organizationId: number, limit?: number): Promise<Grant[]>;

  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByOrganization(organizationId: number): Promise<Application[]>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;

  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByApplication(applicationId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // AI Suggestions
  getAiSuggestion(id: number): Promise<AiSuggestion | undefined>;
  getAiSuggestionsByApplication(applicationId: number): Promise<AiSuggestion[]>;
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestion(id: number, suggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion | undefined>;

  // Activity Log
  getActivityLog(userId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Dashboard Stats
  getDashboardStats(organizationId: number): Promise<{
    activeApplications: number;
    successRate: number;
    fundingSecured: number;
    aiSuggestions: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private organizations: Map<number, Organization> = new Map();
  private grants: Map<number, Grant> = new Map();
  private applications: Map<number, Application> = new Map();
  private documents: Map<number, Document> = new Map();
  private aiSuggestions: Map<number, AiSuggestion> = new Map();
  private activityLog: Map<number, ActivityLog> = new Map();
  
  private currentUserId = 1;
  private currentOrgId = 1;
  private currentGrantId = 1;
  private currentApplicationId = 1;
  private currentDocumentId = 1;
  private currentSuggestionId = 1;
  private currentActivityId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample organization
    const org: Organization = {
      id: 1,
      name: "Community Health Initiative",
      description: "Supporting community health programs across underserved areas",
      website: "https://healthinitiative.org",
      contactEmail: "info@healthinitiative.org",
      focusAreas: ["Health", "Community Development", "Education"],
      createdAt: new Date(),
    };
    this.organizations.set(1, org);
    this.currentOrgId = 2;

    // Create sample user
    const user: User = {
      id: 1,
      username: "sarah.johnson",
      email: "sarah@healthinitiative.org",
      password: "hashed_password",
      organizationId: 1,
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(1, user);
    this.currentUserId = 2;

    // Create sample grants
    const grants: Grant[] = [
      {
        id: 1,
        title: "Community Health Innovation Grant",
        description: "Supporting innovative approaches to community health challenges in underserved populations",
        funder: "National Science Foundation",
        amount: 500000,
        maxAmount: 2000000,
        deadline: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        status: "open",
        eligibilityRequirements: ["Non-profit status", "Community focus", "Health impact"],
        focusAreas: ["Health", "Innovation", "Community"],
        matchPercentage: 95,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Digital Equity Initiative",
        description: "Bridging the digital divide in underserved communities through technology access and education",
        funder: "Ford Foundation",
        amount: 100000,
        maxAmount: 500000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: "open",
        eligibilityRequirements: ["Technology focus", "Community impact", "Equity mission"],
        focusAreas: ["Technology", "Education", "Equity"],
        matchPercentage: 87,
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Environmental Justice Grant",
        description: "Addressing environmental challenges in vulnerable communities through grassroots initiatives",
        funder: "EPA",
        amount: 250000,
        maxAmount: 1000000,
        deadline: new Date(Date.now() + 67 * 24 * 60 * 60 * 1000),
        status: "open",
        eligibilityRequirements: ["Environmental focus", "Community-based", "Justice orientation"],
        focusAreas: ["Environment", "Justice", "Community"],
        matchPercentage: 82,
        createdAt: new Date(),
      },
    ];

    grants.forEach(grant => this.grants.set(grant.id, grant));
    this.currentGrantId = 4;

    // Create sample applications
    const applications: Application[] = [
      {
        id: 1,
        grantId: 1,
        organizationId: 1,
        userId: 1,
        title: "Mobile Health Clinics for Rural Communities",
        status: "submitted",
        narrative: "Our organization proposes to establish mobile health clinics...",
        budget: { total: 750000, personnel: 400000, equipment: 200000, operations: 150000 },
        timeline: { start: "2024-01-01", end: "2025-12-31", milestones: [] },
        progress: 100,
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        grantId: 2,
        organizationId: 1,
        userId: 1,
        title: "Community Tech Center Initiative",
        status: "draft",
        narrative: "We propose to establish technology centers in underserved neighborhoods...",
        budget: { total: 300000, personnel: 150000, equipment: 100000, operations: 50000 },
        timeline: { start: "2024-03-01", end: "2025-02-28", milestones: [] },
        progress: 65,
        submittedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    applications.forEach(app => this.applications.set(app.id, app));
    this.currentApplicationId = 3;

    // Create sample AI suggestions
    const suggestions: AiSuggestion[] = [
      {
        id: 1,
        applicationId: 2,
        type: "narrative",
        suggestion: "Your project narrative could be stronger with more specific impact metrics. Consider adding quantifiable outcomes and success measures.",
        confidence: 85,
        isAccepted: false,
        createdAt: new Date(),
      },
      {
        id: 2,
        applicationId: 2,
        type: "budget",
        suggestion: "The budget allocation for personnel seems high relative to direct program costs. Consider rebalancing for better funder appeal.",
        confidence: 78,
        isAccepted: false,
        createdAt: new Date(),
      },
    ];

    suggestions.forEach(suggestion => this.aiSuggestions.set(suggestion.id, suggestion));
    this.currentSuggestionId = 3;

    // Create sample activity log
    const activities: ActivityLog[] = [
      {
        id: 1,
        userId: 1,
        type: "application_submitted",
        description: "Community Health Grant application submitted",
        metadata: { applicationId: 1, grantId: 1 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: 1,
        type: "ai_suggestion",
        description: "AI generated 3 new narrative suggestions",
        metadata: { applicationId: 2, suggestionCount: 3 },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId: 1,
        type: "grant_match",
        description: "New high-match grant opportunity found",
        metadata: { grantId: 3, matchPercentage: 95 },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    activities.forEach(activity => this.activityLog.set(activity.id, activity));
    this.currentActivityId = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      role: insertUser.role ?? null,
      organizationId: insertUser.organizationId ?? null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateUser };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Organization methods
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const org: Organization = {
      id: this.currentOrgId++,
      ...insertOrg,
      description: insertOrg.description ?? null,
      website: insertOrg.website ?? null,
      focusAreas: insertOrg.focusAreas ? insertOrg.focusAreas as string[] : null,
      createdAt: new Date(),
    };
    this.organizations.set(org.id, org);
    return org;
  }

  async updateOrganization(id: number, updateOrg: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const org = this.organizations.get(id);
    if (!org) return undefined;

    const updatedOrg = { ...org, ...updateOrg };
    this.organizations.set(id, updatedOrg);
    return updatedOrg;
  }

  // Grant methods
  async getGrant(id: number): Promise<Grant | undefined> {
    return this.grants.get(id);
  }

  async getGrants(filters?: { status?: string; focusAreas?: string[] }): Promise<Grant[]> {
    let grants = Array.from(this.grants.values());
    
    if (filters?.status) {
      grants = grants.filter(grant => grant.status === filters.status);
    }
    
    if (filters?.focusAreas && filters.focusAreas.length > 0) {
      grants = grants.filter(grant => 
        grant.focusAreas?.some(area => filters.focusAreas!.includes(area))
      );
    }
    
    return grants.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
  }

  async createGrant(insertGrant: InsertGrant): Promise<Grant> {
    const grant: Grant = {
      id: this.currentGrantId++,
      ...insertGrant,
      status: insertGrant.status ?? null,
      focusAreas: insertGrant.focusAreas ? insertGrant.focusAreas as string[] : null,
      maxAmount: insertGrant.maxAmount ?? null,
      eligibilityRequirements: insertGrant.eligibilityRequirements ? insertGrant.eligibilityRequirements as string[] : null,
      matchPercentage: insertGrant.matchPercentage ?? null,
      createdAt: new Date(),
    };
    this.grants.set(grant.id, grant);
    return grant;
  }

  async updateGrant(id: number, updateGrant: Partial<InsertGrant>): Promise<Grant | undefined> {
    const grant = this.grants.get(id);
    if (!grant) return undefined;

    const updatedGrant = { ...grant, ...updateGrant };
    this.grants.set(id, updatedGrant);
    return updatedGrant;
  }

  async getGrantsByMatch(organizationId: number, limit = 10): Promise<Grant[]> {
    const grants = Array.from(this.grants.values())
      .filter(grant => grant.status === "open")
      .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      .slice(0, limit);
    
    return grants;
  }

  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByOrganization(organizationId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.organizationId === organizationId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const app: Application = {
      id: this.currentApplicationId++,
      ...insertApp,
      status: insertApp.status ?? null,
      narrative: insertApp.narrative ?? null,
      budget: insertApp.budget ?? null,
      timeline: insertApp.timeline ?? null,
      progress: insertApp.progress ?? null,
      submittedAt: insertApp.submittedAt ? new Date(insertApp.submittedAt) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(app.id, app);
    return app;
  }

  async updateApplication(id: number, updateApp: Partial<InsertApplication>): Promise<Application | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const updatedApp = { ...app, ...updateApp, updatedAt: new Date() };
    this.applications.set(id, updatedApp);
    return updatedApp;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.applicationId === applicationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const doc: Document = {
      id: this.currentDocumentId++,
      ...insertDoc,
      content: insertDoc.content ?? null,
      url: insertDoc.url ?? null,
      createdAt: new Date(),
    };
    this.documents.set(doc.id, doc);
    return doc;
  }

  async updateDocument(id: number, updateDoc: Partial<InsertDocument>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;

    const updatedDoc = { ...doc, ...updateDoc };
    this.documents.set(id, updatedDoc);
    return updatedDoc;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // AI Suggestion methods
  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    return this.aiSuggestions.get(id);
  }

  async getAiSuggestionsByApplication(applicationId: number): Promise<AiSuggestion[]> {
    return Array.from(this.aiSuggestions.values())
      .filter(suggestion => suggestion.applicationId === applicationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const suggestion: AiSuggestion = {
      id: this.currentSuggestionId++,
      ...insertSuggestion,
      confidence: insertSuggestion.confidence ?? null,
      isAccepted: insertSuggestion.isAccepted ?? null,
      createdAt: new Date(),
    };
    this.aiSuggestions.set(suggestion.id, suggestion);
    return suggestion;
  }

  async updateAiSuggestion(id: number, updateSuggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion | undefined> {
    const suggestion = this.aiSuggestions.get(id);
    if (!suggestion) return undefined;

    const updatedSuggestion = { ...suggestion, ...updateSuggestion };
    this.aiSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Activity Log methods
  async getActivityLog(userId: number, limit = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLog.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: this.currentActivityId++,
      ...insertLog,
      metadata: insertLog.metadata || null,
      createdAt: new Date(),
    };
    this.activityLog.set(log.id, log);
    return log;
  }

  // Dashboard Stats
  async getDashboardStats(organizationId: number): Promise<{
    activeApplications: number;
    successRate: number;
    fundingSecured: number;
    aiSuggestions: number;
  }> {
    const applications = Array.from(this.applications.values())
      .filter(app => app.organizationId === organizationId);
    
    const activeApplications = applications.filter(app => 
      app.status === "draft" || app.status === "submitted" || app.status === "under_review"
    ).length;
    
    const submittedApplications = applications.filter(app => app.submittedAt).length;
    const approvedApplications = applications.filter(app => app.status === "approved").length;
    const successRate = submittedApplications > 0 ? (approvedApplications / submittedApplications) * 100 : 0;
    
    const fundingSecured = applications
      .filter(app => app.status === "approved")
      .reduce((total, app) => {
        const grant = this.grants.get(app.grantId);
        return total + (grant?.amount || 0);
      }, 0);
    
    const aiSuggestions = Array.from(this.aiSuggestions.values())
      .filter(suggestion => {
        const app = this.applications.get(suggestion.applicationId);
        return app?.organizationId === organizationId;
      }).length;
    
    return {
      activeApplications,
      successRate: Math.round(successRate),
      fundingSecured,
      aiSuggestions,
    };
  }
}

export const storage = new MemStorage();
