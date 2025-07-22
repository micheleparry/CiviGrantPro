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
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateUser).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrg).returning();
    return org;
  }

  async updateOrganization(id: number, updateOrg: Partial<InsertOrganization>): Promise<Organization | undefined> {
    const [org] = await db.update(organizations).set(updateOrg).where(eq(organizations.id, id)).returning();
    return org || undefined;
  }

  async getGrant(id: number): Promise<Grant | undefined> {
    const [grant] = await db.select().from(grants).where(eq(grants.id, id));
    return grant || undefined;
  }

  async getGrants(filters?: { status?: string; focusAreas?: string[] }): Promise<Grant[]> {
    let query = db.select().from(grants);
    
    if (filters?.status) {
      query = query.where(eq(grants.status, filters.status));
    }
    
    const result = await query;
    return result;
  }

  async createGrant(insertGrant: InsertGrant): Promise<Grant> {
    const [grant] = await db.insert(grants).values(insertGrant).returning();
    return grant;
  }

  async updateGrant(id: number, updateGrant: Partial<InsertGrant>): Promise<Grant | undefined> {
    const [grant] = await db.update(grants).set(updateGrant).where(eq(grants.id, id)).returning();
    return grant || undefined;
  }

  async getGrantsByMatch(organizationId: number, limit = 10): Promise<Grant[]> {
    return await db.select().from(grants).limit(limit);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app || undefined;
  }

  async getApplicationsByOrganization(organizationId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.organizationId, organizationId));
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(insertApp).returning();
    return app;
  }

  async updateApplication(id: number, updateApp: Partial<InsertApplication>): Promise<Application | undefined> {
    const [app] = await db.update(applications).set(updateApp).where(eq(applications.id, id)).returning();
    return app || undefined;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id)).returning();
    return result.length > 0;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.applicationId, applicationId));
  }

  async createDocument(insertDoc: InsertDocument): Promise<Document> {
    const [doc] = await db.insert(documents).values(insertDoc).returning();
    return doc;
  }

  async updateDocument(id: number, updateDoc: Partial<InsertDocument>): Promise<Document | undefined> {
    const [doc] = await db.update(documents).set(updateDoc).where(eq(documents.id, id)).returning();
    return doc || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  async getAiSuggestion(id: number): Promise<AiSuggestion | undefined> {
    const [suggestion] = await db.select().from(aiSuggestions).where(eq(aiSuggestions.id, id));
    return suggestion || undefined;
  }

  async getAiSuggestionsByApplication(applicationId: number): Promise<AiSuggestion[]> {
    return await db.select().from(aiSuggestions).where(eq(aiSuggestions.applicationId, applicationId));
  }

  async createAiSuggestion(insertSuggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const [suggestion] = await db.insert(aiSuggestions).values(insertSuggestion).returning();
    return suggestion;
  }

  async updateAiSuggestion(id: number, updateSuggestion: Partial<InsertAiSuggestion>): Promise<AiSuggestion | undefined> {
    const [suggestion] = await db.update(aiSuggestions).set(updateSuggestion).where(eq(aiSuggestions.id, id)).returning();
    return suggestion || undefined;
  }

  async getActivityLog(userId: number, limit = 10): Promise<ActivityLog[]> {
    return await db.select().from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLog).values(insertLog).returning();
    return log;
  }

  async getDashboardStats(organizationId: number): Promise<{
    activeApplications: number;
    successRate: number;
    fundingSecured: number;
    aiSuggestions: number;
  }> {
    // For now, return mock data since we need to initialize the database first
    return {
      activeApplications: 2,
      successRate: 65,
      fundingSecured: 125000,
      aiSuggestions: 15
    };
  }
}

export const storage = new DatabaseStorage();