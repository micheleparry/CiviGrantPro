import { db } from "./db";
import { users, organizations, grants, applications, documents, aiSuggestions, activityLog } from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Clear existing data
    await db.delete(activityLog);
    await db.delete(aiSuggestions);
    await db.delete(documents);
    await db.delete(applications);
    await db.delete(users);
    await db.delete(grants);
    await db.delete(organizations);

    // Create sample organization
    const [org] = await db.insert(organizations).values({
      name: "Community Health Initiative",
      description: "Supporting community health programs across underserved areas",
      website: "https://healthinitiative.org",
      contactEmail: "info@healthinitiative.org",
      focusAreas: ["Health", "Community Development", "Education"],
    }).returning();

    // Create sample user
    const [user] = await db.insert(users).values({
      username: "sarah.johnson",
      email: "sarah@healthinitiative.org",
      password: "hashed_password",
      organizationId: org.id,
      role: "admin",
    }).returning();

    // Create sample grants
    const grantsData = [
      {
        title: "Community Health Innovation Grant",
        description: "Supporting innovative approaches to community health challenges in underserved areas",
        funder: "Health Foundation",
        amount: 50000,
        deadline: new Date("2024-12-31"),
        status: "open",
        focusAreas: ["Health", "Community Development"],
        eligibilityRequirements: ["501(c)(3) status", "Community focus", "Health programs"],
        matchPercentage: 85,
      },
      {
        title: "Education Excellence Initiative",
        description: "Funding educational programs that improve outcomes for underserved youth",
        funder: "Education Foundation",
        amount: 75000,
        deadline: new Date("2024-11-15"),
        status: "open",
        focusAreas: ["Education", "Youth Development"],
        eligibilityRequirements: ["Educational focus", "Youth programs", "Measurable outcomes"],
        matchPercentage: 78,
      },
      {
        title: "Rural Development Program",
        description: "Supporting economic development in rural communities",
        funder: "Rural Development Agency",
        amount: 100000,
        deadline: new Date("2024-10-30"),
        status: "open",
        focusAreas: ["Economic Development", "Rural Communities"],
        eligibilityRequirements: ["Rural focus", "Economic impact", "Community involvement"],
        matchPercentage: 72,
      },
    ];

    const insertedGrants = await db.insert(grants).values(grantsData).returning();

    // Create sample applications
    const applicationsData = [
      {
        grantId: insertedGrants[0].id,
        organizationId: org.id,
        userId: user.id,
        title: "Mobile Health Clinic Initiative",
        status: "in_progress",
        narrative: "Our mobile health clinic will provide essential healthcare services to underserved communities, focusing on preventive care and health education.",
        progress: 65,
        budget: {
          totalAmount: 45000,
          categories: [
            { name: "Personnel", amount: 25000 },
            { name: "Equipment", amount: 15000 },
            { name: "Operations", amount: 5000 }
          ]
        },
        timeline: {
          phases: [
            { name: "Planning", duration: "2 months", status: "completed" },
            { name: "Implementation", duration: "6 months", status: "in_progress" },
            { name: "Evaluation", duration: "1 month", status: "pending" }
          ]
        }
      },
      {
        grantId: insertedGrants[1].id,
        organizationId: org.id,
        userId: user.id,
        title: "Youth Leadership Program",
        status: "draft",
        narrative: "A comprehensive program to develop leadership skills in underserved youth through mentorship and community engagement.",
        progress: 25,
        budget: {
          totalAmount: 60000,
          categories: [
            { name: "Staff", amount: 35000 },
            { name: "Materials", amount: 15000 },
            { name: "Activities", amount: 10000 }
          ]
        },
        timeline: {
          phases: [
            { name: "Recruitment", duration: "1 month", status: "pending" },
            { name: "Training", duration: "3 months", status: "pending" },
            { name: "Program Delivery", duration: "8 months", status: "pending" }
          ]
        }
      }
    ];

    const insertedApplications = await db.insert(applications).values(applicationsData).returning();

    // Create sample AI suggestions
    const suggestionsData = [
      {
        applicationId: insertedApplications[0].id,
        type: "narrative",
        suggestion: "Consider emphasizing the long-term sustainability of your mobile health clinic by including plans for community partnerships and ongoing funding.",
        confidence: 85,
        isAccepted: false,
      },
      {
        applicationId: insertedApplications[0].id,
        type: "budget",
        suggestion: "You may want to allocate more budget for community outreach and marketing to ensure maximum utilization of the mobile clinic services.",
        confidence: 78,
        isAccepted: true,
      },
      {
        applicationId: insertedApplications[1].id,
        type: "timeline",
        suggestion: "Consider extending the training phase to include more comprehensive leadership development modules.",
        confidence: 82,
        isAccepted: false,
      }
    ];

    await db.insert(aiSuggestions).values(suggestionsData);

    // Create sample activity log entries
    const activityData = [
      {
        userId: user.id,
        type: "application_submitted",
        description: "Submitted application for Community Health Innovation Grant",
        metadata: { applicationId: insertedApplications[0].id },
      },
      {
        userId: user.id,
        type: "ai_suggestion_received",
        description: "Received AI suggestion for narrative improvement",
        metadata: { suggestionId: 1 },
      },
      {
        userId: user.id,
        type: "application_updated",
        description: "Updated budget section based on AI recommendation",
        metadata: { applicationId: insertedApplications[0].id },
      },
      {
        userId: user.id,
        type: "grant_matched",
        description: "New grant match found: Education Excellence Initiative",
        metadata: { grantId: insertedGrants[1].id },
      }
    ];

    await db.insert(activityLog).values(activityData);

    console.log("Database seeded successfully!");
    console.log(`Created ${insertedGrants.length} grants, ${insertedApplications.length} applications, and ${suggestionsData.length} AI suggestions`);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0)).catch(console.error);
}