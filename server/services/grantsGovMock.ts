// Mock data for testing when Grants.gov API is not available
const mockOpportunities = [
  {
    opportunityId: "MOCK-001",
    opportunityTitle: "Community Health Innovation Grant",
    opportunityNumber: "HHS-2024-001",
    opportunityStatus: "posted",
    postedDate: "2024-01-15",
    closeDate: "2024-06-30",
    expectedNumberOfAwards: 25,
    estimatedTotalProgramFunding: 5000000,
    awardCeiling: 200000,
    awardFloor: 50000,
    fundingInstrumentType: ["Cooperative Agreement", "Grant"],
    categoryOfFundingActivity: ["Health", "Community Development"],
    eligibility: ["State governments", "Nonprofits", "Higher education"],
    agencyCode: "HHS",
    agencyName: "Department of Health and Human Services",
    description: "This funding opportunity supports innovative approaches to community health challenges, focusing on preventive care and health education in underserved areas.",
    opportunityURL: "https://www.grants.gov/web/grants/view-opportunity.html?oppId=123456",
  },
  {
    opportunityId: "MOCK-002",
    opportunityTitle: "Environmental Justice Small Grants Program",
    opportunityNumber: "EPA-2024-002",
    opportunityStatus: "posted",
    postedDate: "2024-02-01",
    closeDate: "2024-05-15",
    expectedNumberOfAwards: 50,
    estimatedTotalProgramFunding: 3000000,
    awardCeiling: 75000,
    awardFloor: 25000,
    fundingInstrumentType: ["Grant"],
    categoryOfFundingActivity: ["Environment", "Justice"],
    eligibility: ["Nonprofits", "Tribal governments", "Local governments"],
    agencyCode: "EPA",
    agencyName: "Environmental Protection Agency",
    description: "Supporting community-based projects that address environmental justice issues and empower communities to take action on environmental and public health concerns.",
    opportunityURL: "https://www.grants.gov/web/grants/view-opportunity.html?oppId=123457",
  },
  {
    opportunityId: "MOCK-003",
    opportunityTitle: "Rural Business Development Grant",
    opportunityNumber: "USDA-2024-003",
    opportunityStatus: "posted",
    postedDate: "2024-01-20",
    closeDate: "2024-07-31",
    expectedNumberOfAwards: 100,
    estimatedTotalProgramFunding: 8000000,
    awardCeiling: 100000,
    awardFloor: 10000,
    fundingInstrumentType: ["Grant"],
    categoryOfFundingActivity: ["Business and Commerce", "Rural Development"],
    eligibility: ["Rural businesses", "Nonprofits", "Public bodies"],
    agencyCode: "USDA",
    agencyName: "Department of Agriculture",
    description: "Funding for rural small businesses and entrepreneurs to create jobs and stimulate economic growth in rural communities.",
    opportunityURL: "https://www.grants.gov/web/grants/view-opportunity.html?oppId=123458",
  },
  {
    opportunityId: "MOCK-004",
    opportunityTitle: "Education Innovation and Research Program",
    opportunityNumber: "ED-2024-004",
    opportunityStatus: "forecasted",
    postedDate: "2024-03-01",
    closeDate: "2024-08-15",
    expectedNumberOfAwards: 30,
    estimatedTotalProgramFunding: 15000000,
    awardCeiling: 500000,
    awardFloor: 100000,
    fundingInstrumentType: ["Grant"],
    categoryOfFundingActivity: ["Education", "Research"],
    eligibility: ["Higher education", "Nonprofits", "State governments"],
    agencyCode: "ED",
    agencyName: "Department of Education",
    description: "Supporting innovative approaches to improve student achievement and teacher effectiveness through research-based interventions.",
    opportunityURL: "https://www.grants.gov/web/grants/view-opportunity.html?oppId=123459",
  },
  {
    opportunityId: "MOCK-005",
    opportunityTitle: "Community Development Block Grant",
    opportunityNumber: "HUD-2024-005",
    opportunityStatus: "posted",
    postedDate: "2024-02-15",
    closeDate: "2024-09-30",
    expectedNumberOfAwards: 200,
    estimatedTotalProgramFunding: 25000000,
    awardCeiling: 150000,
    awardFloor: 25000,
    fundingInstrumentType: ["Grant"],
    categoryOfFundingActivity: ["Community Development", "Housing"],
    eligibility: ["Local governments", "State governments", "Nonprofits"],
    agencyCode: "HUD",
    agencyName: "Department of Housing and Urban Development",
    description: "Providing communities with resources to address a wide range of community development needs, including affordable housing and economic development.",
    opportunityURL: "https://www.grants.gov/web/grants/view-opportunity.html?oppId=123460",
  },
];

const mockAgencies = [
  { code: "HHS", name: "Department of Health and Human Services" },
  { code: "EPA", name: "Environmental Protection Agency" },
  { code: "USDA", name: "Department of Agriculture" },
  { code: "ED", name: "Department of Education" },
  { code: "HUD", name: "Department of Housing and Urban Development" },
  { code: "DOT", name: "Department of Transportation" },
  { code: "DOJ", name: "Department of Justice" },
  { code: "NSF", name: "National Science Foundation" },
  { code: "NIH", name: "National Institutes of Health" },
  { code: "DOD", name: "Department of Defense" },
];

const mockCategories = [
  { code: "Health", name: "Health" },
  { code: "Education", name: "Education" },
  { code: "Environment", name: "Environment" },
  { code: "Community Development", name: "Community Development" },
  { code: "Business and Commerce", name: "Business and Commerce" },
  { code: "Housing", name: "Housing" },
  { code: "Transportation", name: "Transportation" },
  { code: "Justice", name: "Justice" },
  { code: "Research", name: "Research" },
  { code: "Technology", name: "Technology" },
  { code: "Arts", name: "Arts" },
  { code: "Agriculture", name: "Agriculture" },
];

export class GrantsGovMockService {
  async searchOpportunities(params: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredOpportunities = [...mockOpportunities];

    // Apply filters
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.opportunityTitle.toLowerCase().includes(keyword) ||
        opp.description.toLowerCase().includes(keyword) ||
        opp.agencyName.toLowerCase().includes(keyword)
      );
    }

    if (params.opportunityStatus) {
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.opportunityStatus === params.opportunityStatus
      );
    }

    if (params.agencyCode) {
      const agencies = params.agencyCode.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        agencies.includes(opp.agencyCode)
      );
    }

    if (params.categoryOfFundingActivity) {
      const categories = params.categoryOfFundingActivity.split(',');
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.categoryOfFundingActivity.some(cat => categories.includes(cat))
      );
    }

    // Apply sorting
    if (params.sortBy === 'closeDate') {
      filteredOpportunities.sort((a, b) => {
        const dateA = new Date(a.closeDate).getTime();
        const dateB = new Date(b.closeDate).getTime();
        return params.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Apply pagination
    const pageSize = params.pageSize || 10;
    const pageNumber = params.pageNumber || 1;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOpportunities = filteredOpportunities.slice(startIndex, endIndex);

    return {
      totalRecords: filteredOpportunities.length,
      totalPages: Math.ceil(filteredOpportunities.length / pageSize),
      pageNumber,
      pageSize,
      opportunities: paginatedOpportunities,
    };
  }

  async getOpportunityDetails(opportunityId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const opportunity = mockOpportunities.find(opp => opp.opportunityId === opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }
    
    return opportunity;
  }

  async getAgencies() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockAgencies;
  }

  async getFundingCategories() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategories;
  }

  convertToInternalGrant(opportunity: any) {
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

export const grantsGovMock = new GrantsGovMockService(); 