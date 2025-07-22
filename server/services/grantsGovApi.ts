interface GrantsGovSearchParams {
  keyword?: string;
  opportunityStatus?: 'forecasted' | 'posted' | 'closed' | 'archived';
  fundingInstrumentType?: string[];
  categoryOfFundingActivity?: string[];
  eligibility?: string[];
  agencyCode?: string[];
  postedFrom?: string;
  postedTo?: string;
  closingFrom?: string;
  closingTo?: string;
  sortBy?: 'openDate' | 'closeDate' | 'opportunityTitle' | 'agency';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  pageNumber?: number;
}

interface GrantsGovOpportunity {
  opportunityId: string;
  opportunityTitle: string;
  opportunityNumber: string;
  opportunityStatus: string;
  postedDate: string;
  closeDate: string;
  archiveDate?: string;
  expectedNumberOfAwards: number;
  estimatedTotalProgramFunding: number;
  awardCeiling: number;
  awardFloor: number;
  fundingInstrumentType: string[];
  categoryOfFundingActivity: string[];
  eligibility: string[];
  agencyCode: string;
  agencyName: string;
  description: string;
  version: string;
  lastUpdatedDate: string;
  opportunityCategory: string;
  isForecasted: boolean;
  forecastedPostDate?: string;
  forecastedCloseDate?: string;
  forecastedCloseDateExplanation?: string;
  forecastedAwardDate?: string;
  forecastedProjectStartDate?: string;
  fiscalYear: number;
  contactEmail?: string;
  contactPhone?: string;
  contactText?: string;
  additionalInformationText?: string;
  additionalInformationURL?: string;
  opportunityURL?: string;
  cfdaNumbers?: string[];
  costSharingOrMatchingRequirement?: string;
  versionComments?: string;
}

interface GrantsGovSearchResponse {
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  opportunities: GrantsGovOpportunity[];
}

import { grantsGovMock } from './grantsGovMock';

export class GrantsGovApiService {
  private baseUrl = 'https://www.grants.gov/api/opportunities';
  private apiKey: string;
  private useMock: boolean;

  constructor() {
    this.apiKey = process.env.GRANTS_GOV_API_KEY || '';
    this.useMock = !this.apiKey || process.env.NODE_ENV === 'development';
  }

  async searchOpportunities(params: GrantsGovSearchParams): Promise<GrantsGovSearchResponse> {
    // Use mock service if no API key or in development
    if (this.useMock) {
      return grantsGovMock.searchOpportunities(params);
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Add search parameters
      if (params.keyword) queryParams.append('keyword', params.keyword);
      if (params.opportunityStatus) queryParams.append('opportunityStatus', params.opportunityStatus);
      if (params.fundingInstrumentType) queryParams.append('fundingInstrumentType', params.fundingInstrumentType.join(','));
      if (params.categoryOfFundingActivity) queryParams.append('categoryOfFundingActivity', params.categoryOfFundingActivity.join(','));
      if (params.eligibility) queryParams.append('eligibility', params.eligibility.join(','));
      if (params.agencyCode) queryParams.append('agencyCode', params.agencyCode.join(','));
      if (params.postedFrom) queryParams.append('postedFrom', params.postedFrom);
      if (params.postedTo) queryParams.append('postedTo', params.postedTo);
      if (params.closingFrom) queryParams.append('closingFrom', params.closingFrom);
      if (params.closingTo) queryParams.append('closingTo', params.closingTo);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/search?${queryParams.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformResponse(data);
    } catch (error) {
      console.error('Error searching Grants.gov opportunities:', error);
      // Fallback to mock service on error
      console.log('Falling back to mock service...');
      return grantsGovMock.searchOpportunities(params);
    }
  }

  async getOpportunityDetails(opportunityId: string): Promise<GrantsGovOpportunity> {
    // Use mock service if no API key or in development
    if (this.useMock) {
      return grantsGovMock.getOpportunityDetails(opportunityId);
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${opportunityId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformOpportunity(data);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      // Fallback to mock service on error
      console.log('Falling back to mock service...');
      return grantsGovMock.getOpportunityDetails(opportunityId);
    }
  }

  async getAgencies(): Promise<Array<{ code: string; name: string }>> {
    // Use mock service if no API key or in development
    if (this.useMock) {
      return grantsGovMock.getAgencies();
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/agencies`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.agencies || [];
    } catch (error) {
      console.error('Error fetching agencies:', error);
      // Fallback to mock service on error
      console.log('Falling back to mock service...');
      return grantsGovMock.getAgencies();
    }
  }

  async getFundingCategories(): Promise<Array<{ code: string; name: string }>> {
    // Use mock service if no API key or in development
    if (this.useMock) {
      return grantsGovMock.getFundingCategories();
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/categories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching funding categories:', error);
      // Fallback to mock service on error
      console.log('Falling back to mock service...');
      return grantsGovMock.getFundingCategories();
    }
  }

  private transformResponse(data: any): GrantsGovSearchResponse {
    return {
      totalRecords: data.totalRecords || 0,
      totalPages: data.totalPages || 0,
      pageNumber: data.pageNumber || 1,
      pageSize: data.pageSize || 10,
      opportunities: (data.opportunities || []).map((opp: any) => this.transformOpportunity(opp)),
    };
  }

  private transformOpportunity(data: any): GrantsGovOpportunity {
    return {
      opportunityId: data.opportunityId,
      opportunityTitle: data.opportunityTitle,
      opportunityNumber: data.opportunityNumber,
      opportunityStatus: data.opportunityStatus,
      postedDate: data.postedDate,
      closeDate: data.closeDate,
      archiveDate: data.archiveDate,
      expectedNumberOfAwards: data.expectedNumberOfAwards || 0,
      estimatedTotalProgramFunding: data.estimatedTotalProgramFunding || 0,
      awardCeiling: data.awardCeiling || 0,
      awardFloor: data.awardFloor || 0,
      fundingInstrumentType: data.fundingInstrumentType || [],
      categoryOfFundingActivity: data.categoryOfFundingActivity || [],
      eligibility: data.eligibility || [],
      agencyCode: data.agencyCode,
      agencyName: data.agencyName,
      description: data.description,
      version: data.version,
      lastUpdatedDate: data.lastUpdatedDate,
      opportunityCategory: data.opportunityCategory,
      isForecasted: data.isForecasted || false,
      forecastedPostDate: data.forecastedPostDate,
      forecastedCloseDate: data.forecastedCloseDate,
      forecastedCloseDateExplanation: data.forecastedCloseDateExplanation,
      forecastedAwardDate: data.forecastedAwardDate,
      forecastedProjectStartDate: data.forecastedProjectStartDate,
      fiscalYear: data.fiscalYear,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      contactText: data.contactText,
      additionalInformationText: data.additionalInformationText,
      additionalInformationURL: data.additionalInformationURL,
      opportunityURL: data.opportunityURL,
      cfdaNumbers: data.cfdaNumbers || [],
      costSharingOrMatchingRequirement: data.costSharingOrMatchingRequirement,
      versionComments: data.versionComments,
    };
  }

  // Helper method to convert Grants.gov opportunity to our internal grant format
  convertToInternalGrant(opportunity: GrantsGovOpportunity) {
    return {
      title: opportunity.opportunityTitle,
      description: opportunity.description,
      funder: opportunity.agencyName,
      amount: opportunity.awardCeiling,
      maxAmount: opportunity.awardCeiling,
      deadline: new Date(opportunity.closeDate),
      status: opportunity.opportunityStatus === 'posted' ? 'open' : 'closed',
      eligibilityRequirements: opportunity.eligibility,
      focusAreas: opportunity.categoryOfFundingActivity,
      externalId: opportunity.opportunityId,
      externalUrl: opportunity.opportunityURL,
    };
  }
}

export const grantsGovApi = new GrantsGovApiService(); 