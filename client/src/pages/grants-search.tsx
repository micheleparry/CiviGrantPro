import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Building, 
  Download,
  ExternalLink,
  Eye,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GrantsGovOpportunity {
  opportunityId: string;
  opportunityTitle: string;
  opportunityNumber: string;
  opportunityStatus: string;
  postedDate: string;
  closeDate: string;
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
  opportunityURL?: string;
}

interface SearchResponse {
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  opportunities: GrantsGovOpportunity[];
}

export default function GrantsSearch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search state
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    opportunityStatus: "posted",
    pageNumber: 1,
    pageSize: 10,
    sortBy: "closeDate" as const,
    sortOrder: "asc" as const,
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    closingFrom: "",
    closingTo: "",
  });

  // Fetch agencies and categories for filters
  const { data: agencies } = useQuery({
    queryKey: ["/api/grants-gov/agencies"],
    queryFn: async () => {
      const response = await fetch("/api/grants-gov/agencies");
      if (!response.ok) throw new Error("Failed to fetch agencies");
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/grants-gov/categories"],
    queryFn: async () => {
      const response = await fetch("/api/grants-gov/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  // Search opportunities
  const { data: searchResults, isLoading, error } = useQuery<SearchResponse>({
    queryKey: ["/api/grants-gov/search", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      if (selectedAgencies.length > 0) params.append('agencyCode', selectedAgencies.join(','));
      if (selectedCategories.length > 0) params.append('categoryOfFundingActivity', selectedCategories.join(','));
      if (selectedEligibility.length > 0) params.append('eligibility', selectedEligibility.join(','));
      if (dateRange.closingFrom) params.append('closingFrom', dateRange.closingFrom);
      if (dateRange.closingTo) params.append('closingTo', dateRange.closingTo);
      
      const response = await fetch(`/api/grants-gov/search?${params.toString()}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: !!searchParams.keyword || searchParams.opportunityStatus === "posted",
  });

  // Import grant mutation
  const importGrantMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await fetch("/api/grants-gov/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Grant Imported! 🎉",
        description: `${data.title} has been added to your grants library.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grants"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, pageNumber: page }));
  };

  const handleImportGrant = (opportunityId: string) => {
    importGrantMutation.mutate(opportunityId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'forecasted': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grant Search</h1>
          <p className="text-gray-600 mt-1">Search real grant opportunities from Grants.gov</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide" : "Show"} Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search grants by keyword, title, or description..."
                value={searchParams.keyword}
                onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
            </div>
            <Select
              value={searchParams.opportunityStatus}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, opportunityStatus: value }))}
            >
              <SelectTrigger className="w-48 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Currently Open</SelectItem>
                <SelectItem value="forecasted">Forecasted</SelectItem>
                <SelectItem value="closed">Recently Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="h-12 px-6">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Closing Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={dateRange.closingFrom}
                    onChange={(e) => setDateRange(prev => ({ ...prev, closingFrom: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={dateRange.closingTo}
                    onChange={(e) => setDateRange(prev => ({ ...prev, closingTo: e.target.value }))}
                  />
                </div>
              </div>

              {/* Agencies */}
              <div className="space-y-2">
                <Label>Funding Agencies</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {agencies?.map((agency: any) => (
                    <div key={agency.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`agency-${agency.code}`}
                        checked={selectedAgencies.includes(agency.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAgencies(prev => [...prev, agency.code]);
                          } else {
                            setSelectedAgencies(prev => prev.filter(a => a !== agency.code));
                          }
                        }}
                      />
                      <Label htmlFor={`agency-${agency.code}`} className="text-sm">
                        {agency.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Funding Categories</Label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {categories?.map((category: any) => (
                    <div key={category.code} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.code}`}
                        checked={selectedCategories.includes(category.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories(prev => [...prev, category.code]);
                          } else {
                            setSelectedCategories(prev => prev.filter(c => c !== category.code));
                          }
                        }}
                      />
                      <Label htmlFor={`category-${category.code}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAgencies([]);
                  setSelectedCategories([]);
                  setSelectedEligibility([]);
                  setDateRange({ closingFrom: "", closingTo: "" });
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error loading search results. Please try again.
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found {searchResults.totalRecords} opportunities
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <Select
                value={searchParams.sortBy}
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, sortBy: value as any }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="closeDate">Closing Date</SelectItem>
                  <SelectItem value="openDate">Posted Date</SelectItem>
                  <SelectItem value="opportunityTitle">Title</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchParams(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                {searchParams.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {searchResults.opportunities.map((opportunity) => (
              <Card key={opportunity.opportunityId} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {opportunity.opportunityTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {opportunity.agencyName} • {opportunity.opportunityNumber}
                          </p>
                          <p className="text-gray-700 line-clamp-2">
                            {opportunity.description}
                          </p>
                        </div>
                        <Badge className={getStatusColor(opportunity.opportunityStatus)}>
                          {opportunity.opportunityStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Up to {formatCurrency(opportunity.awardCeiling)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Closes {formatDate(opportunity.closeDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          <span>{opportunity.expectedNumberOfAwards} awards</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {opportunity.categoryOfFundingActivity.slice(0, 3).map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {opportunity.categoryOfFundingActivity.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.categoryOfFundingActivity.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleImportGrant(opportunity.opportunityId)}
                        disabled={importGrantMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Import
                      </Button>
                      {opportunity.opportunityURL && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(opportunity.opportunityURL, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {searchResults.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.pageNumber - 1)}
                disabled={searchParams.pageNumber <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {searchParams.pageNumber} of {searchResults.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(searchParams.pageNumber + 1)}
                disabled={searchParams.pageNumber >= searchResults.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 