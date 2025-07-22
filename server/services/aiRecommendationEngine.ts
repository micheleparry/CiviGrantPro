import { grantsGovApi } from './grantsGovApi';
import { analyzeGrantMatch, analyzeOrganizationIntelligence } from './openai';

interface UserProfile {
  organizationName: string;
  organizationDescription: string;
  focusAreas: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  geographicFocus: string[];
  organizationType: string; // nonprofit, government, education, etc.
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredAgencies?: string[];
  pastGrants?: Array<{
    title: string;
    amount: number;
    status: 'awarded' | 'pending' | 'rejected';
  }>;
}

interface GrantRecommendation {
  opportunity: any; // Grants.gov opportunity
  matchScore: number;
  confidence: number;
  reasoning: string[];
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedSuccessRate: number;
  timeToDeadline: number; // days
  complexity: 'low' | 'medium' | 'high';
}

interface RecommendationRequest {
  userProfile: UserProfile;
  maxResults?: number;
  minMatchScore?: number;
  includeForecasted?: boolean;
  budgetPreference?: 'exact' | 'flexible' | 'any';
  deadlinePreference?: 'urgent' | 'standard' | 'flexible';
}

export class AIRecommendationEngine {
  private cache = new Map<string, any>();
  private cacheExpiry = 30 * 60 * 1000; // 30 minutes

  async getPersonalizedRecommendations(request: RecommendationRequest): Promise<GrantRecommendation[]> {
    try {
      // Step 1: Search Grants.gov for relevant opportunities
      const searchParams = this.buildSearchParams(request.userProfile);
      const searchResults = await grantsGovApi.searchOpportunities(searchParams);
      
      // Step 2: Analyze organization intelligence
      const organizationIntelligence = await analyzeOrganizationIntelligence(
        request.userProfile.organizationName
      );

      // Step 3: Score and rank opportunities using AI
      const recommendations = await this.scoreOpportunities(
        searchResults.opportunities,
        request.userProfile,
        organizationIntelligence
      );

      // Step 4: Apply filters and sort by priority
      const filteredRecommendations = this.applyFilters(
        recommendations,
        request
      );

      return filteredRecommendations.slice(0, request.maxResults || 10);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${(error as Error).message}`);
    }
  }

  private buildSearchParams(userProfile: UserProfile) {
    const params: any = {
      opportunityStatus: 'posted',
      pageSize: 50, // Get more results for better analysis
      sortBy: 'closeDate',
      sortOrder: 'asc'
    };

    // Add keyword search based on focus areas
    if (userProfile.focusAreas.length > 0) {
      params.keyword = userProfile.focusAreas.join(' ');
    }

    // Add agency filter if specified
    if (userProfile.preferredAgencies && userProfile.preferredAgencies.length > 0) {
      params.agencyCode = userProfile.preferredAgencies.join(',');
    }

    return params;
  }

  private async scoreOpportunities(
    opportunities: any[],
    userProfile: UserProfile,
    organizationIntelligence: any
  ): Promise<GrantRecommendation[]> {
    const recommendations: GrantRecommendation[] = [];

    for (const opportunity of opportunities) {
      try {
        // Analyze match using AI
        const matchAnalysis = await analyzeGrantMatch(
          opportunity.description,
          userProfile.organizationDescription,
          userProfile.focusAreas
        );

        // Calculate additional scoring factors
        const budgetScore = this.calculateBudgetScore(opportunity, userProfile);
        const deadlineScore = this.calculateDeadlineScore(opportunity);
        const complexityScore = this.calculateComplexityScore(opportunity, userProfile);
        const agencyScore = this.calculateAgencyScore(opportunity, userProfile);

        // Combine scores
        const overallScore = (
          matchAnalysis.matchPercentage * 0.4 +
          budgetScore * 0.2 +
          deadlineScore * 0.15 +
          complexityScore * 0.15 +
          agencyScore * 0.1
        );

        // Generate reasoning
        const reasoning = this.generateReasoning(
          opportunity,
          matchAnalysis,
          userProfile,
          organizationIntelligence
        );

        // Determine priority
        const priority = this.determinePriority(overallScore, opportunity);

        // Estimate success rate
        const estimatedSuccessRate = this.estimateSuccessRate(
          overallScore,
          userProfile,
          opportunity
        );

        recommendations.push({
          opportunity,
          matchScore: overallScore,
          confidence: matchAnalysis.matchPercentage / 100,
          reasoning: reasoning.reasons,
          strengths: reasoning.strengths,
          challenges: reasoning.challenges,
          recommendations: reasoning.recommendations,
          priority,
          estimatedSuccessRate,
          timeToDeadline: this.calculateTimeToDeadline(opportunity.closeDate),
          complexity: this.determineComplexity(opportunity, userProfile)
        });
      } catch (error) {
        console.error(`Error scoring opportunity ${opportunity.opportunityId}:`, error);
        // Continue with other opportunities
      }
    }

    // Sort by match score (highest first)
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateBudgetScore(opportunity: any, userProfile: UserProfile): number {
    const awardCeiling = opportunity.awardCeiling;
    const { min, max } = userProfile.budgetRange;

    if (awardCeiling >= min && awardCeiling <= max) {
      return 100; // Perfect match
    } else if (awardCeiling >= min * 0.8 && awardCeiling <= max * 1.2) {
      return 80; // Good match with some flexibility
    } else if (awardCeiling >= min * 0.5 && awardCeiling <= max * 2) {
      return 60; // Acceptable range
    } else {
      return 20; // Poor match
    }
  }

  private calculateDeadlineScore(opportunity: any): number {
    const daysToDeadline = this.calculateTimeToDeadline(opportunity.closeDate);
    
    if (daysToDeadline >= 30 && daysToDeadline <= 90) {
      return 100; // Ideal timeframe
    } else if (daysToDeadline >= 14 && daysToDeadline <= 120) {
      return 80; // Good timeframe
    } else if (daysToDeadline >= 7 && daysToDeadline <= 180) {
      return 60; // Acceptable timeframe
    } else {
      return 30; // Too soon or too far
    }
  }

  private calculateComplexityScore(opportunity: any, userProfile: UserProfile): number {
    const complexity = this.determineComplexity(opportunity, userProfile);
    
    switch (complexity) {
      case 'low':
        return userProfile.experienceLevel === 'beginner' ? 100 : 60;
      case 'medium':
        return userProfile.experienceLevel === 'intermediate' ? 100 : 80;
      case 'high':
        return userProfile.experienceLevel === 'advanced' ? 100 : 40;
      default:
        return 70;
    }
  }

  private calculateAgencyScore(opportunity: any, userProfile: UserProfile): number {
    if (!userProfile.preferredAgencies || userProfile.preferredAgencies.length === 0) {
      return 70; // Neutral score if no preferences
    }

    return userProfile.preferredAgencies.includes(opportunity.agencyCode) ? 100 : 50;
  }

  private generateReasoning(
    opportunity: any,
    matchAnalysis: any,
    userProfile: UserProfile,
    organizationIntelligence: any
  ) {
    const reasons: string[] = [];
    const strengths: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    // Add AI analysis reasoning
    if (matchAnalysis.matchPercentage > 80) {
      reasons.push(`Strong alignment (${matchAnalysis.matchPercentage}% match) with your organization's focus areas`);
      strengths.push(...matchAnalysis.strengths);
    } else if (matchAnalysis.matchPercentage > 60) {
      reasons.push(`Good potential match (${matchAnalysis.matchPercentage}% match) with room for improvement`);
      challenges.push(...matchAnalysis.improvements);
    } else {
      reasons.push(`Moderate match (${matchAnalysis.matchPercentage}% match) - consider if this aligns with your mission`);
      challenges.push(...matchAnalysis.improvements);
    }

    // Add budget reasoning
    const budgetScore = this.calculateBudgetScore(opportunity, userProfile);
    if (budgetScore >= 80) {
      reasons.push(`Budget range ($${opportunity.awardCeiling.toLocaleString()}) fits your organization's capacity`);
    } else if (budgetScore >= 60) {
      reasons.push(`Budget is within acceptable range but may require additional planning`);
      challenges.push(`Consider if you can realistically manage a $${opportunity.awardCeiling.toLocaleString()} grant`);
    } else {
      challenges.push(`Budget may be outside your organization's typical range`);
    }

    // Add deadline reasoning
    const daysToDeadline = this.calculateTimeToDeadline(opportunity.closeDate);
    if (daysToDeadline >= 30 && daysToDeadline <= 90) {
      reasons.push(`Deadline provides adequate time for quality application development`);
    } else if (daysToDeadline < 30) {
      challenges.push(`Tight deadline - requires immediate action if interested`);
      recommendations.push(`Start application immediately if pursuing this opportunity`);
    } else {
      reasons.push(`Extended deadline allows for thorough planning and preparation`);
    }

    // Add agency-specific reasoning
    if (organizationIntelligence) {
      if (organizationIntelligence.successFactors) {
        strengths.push(...organizationIntelligence.successFactors.slice(0, 2));
      }
      if (organizationIntelligence.applicationTips) {
        recommendations.push(...organizationIntelligence.applicationTips.slice(0, 2));
      }
    }

    // Add focus area alignment
    const focusAreaOverlap = opportunity.categoryOfFundingActivity?.filter((cat: string) =>
      userProfile.focusAreas.some(focus => 
        focus.toLowerCase().includes(cat.toLowerCase()) || 
        cat.toLowerCase().includes(focus.toLowerCase())
      )
    );
    
    if (focusAreaOverlap && focusAreaOverlap.length > 0) {
      reasons.push(`Direct alignment with your focus areas: ${focusAreaOverlap.join(', ')}`);
    }

    return { reasons, strengths, challenges, recommendations };
  }

  private determinePriority(matchScore: number, opportunity: any): 'high' | 'medium' | 'low' {
    const daysToDeadline = this.calculateTimeToDeadline(opportunity.closeDate);
    
    if (matchScore >= 85 && daysToDeadline <= 60) {
      return 'high';
    } else if (matchScore >= 70 && daysToDeadline <= 90) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private estimateSuccessRate(matchScore: number, userProfile: UserProfile, opportunity: any): number {
    let baseRate = matchScore * 0.8; // Base rate from match score

    // Adjust for experience level
    switch (userProfile.experienceLevel) {
      case 'advanced':
        baseRate += 10;
        break;
      case 'intermediate':
        baseRate += 5;
        break;
      case 'beginner':
        baseRate -= 5;
        break;
    }

    // Adjust for past success
    if (userProfile.pastGrants) {
      const successRate = userProfile.pastGrants.filter(g => g.status === 'awarded').length / userProfile.pastGrants.length;
      baseRate += (successRate - 0.5) * 20; // Adjust by ±10% based on past performance
    }

    // Adjust for deadline pressure
    const daysToDeadline = this.calculateTimeToDeadline(opportunity.closeDate);
    if (daysToDeadline < 30) {
      baseRate -= 10; // Tight deadlines reduce success rate
    }

    return Math.max(5, Math.min(95, baseRate)); // Clamp between 5% and 95%
  }

  private calculateTimeToDeadline(closeDate: string): number {
    const deadline = new Date(closeDate);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineComplexity(opportunity: any, userProfile: UserProfile): 'low' | 'medium' | 'high' {
    // Simple heuristic based on award amount and requirements
    const amount = opportunity.awardCeiling;
    const requirements = opportunity.eligibility?.length || 0;

    if (amount > 500000 || requirements > 5) {
      return 'high';
    } else if (amount > 100000 || requirements > 3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private applyFilters(
    recommendations: GrantRecommendation[],
    request: RecommendationRequest
  ): GrantRecommendation[] {
    let filtered = recommendations;

    // Apply minimum match score filter
    if (request.minMatchScore) {
      filtered = filtered.filter(rec => rec.matchScore >= request.minMatchScore!);
    }

    // Apply budget preference filter
    if (request.budgetPreference === 'exact') {
      filtered = filtered.filter(rec => {
        const budgetScore = this.calculateBudgetScore(rec.opportunity, request.userProfile);
        return budgetScore >= 80;
      });
    }

    // Apply deadline preference filter
    if (request.deadlinePreference === 'urgent') {
      filtered = filtered.filter(rec => rec.timeToDeadline <= 30);
    } else if (request.deadlinePreference === 'flexible') {
      filtered = filtered.filter(rec => rec.timeToDeadline >= 60);
    }

    return filtered;
  }

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine(); 