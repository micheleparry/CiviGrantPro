import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GrantCard from "@/components/dashboard/grant-card";
import { Search, Filter, Target, Calendar, DollarSign } from "lucide-react";
import { Grant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const focusAreaOptions = [
  "Health", "Education", "Environment", "Technology", "Community", 
  "Arts", "Research", "Innovation", "Justice", "Equity"
];

export default function Grants() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [focusAreaFilter, setFocusAreaFilter] = useState<string>("all");

  const { data: grants, isLoading } = useQuery<Grant[]>({
    queryKey: ["/api/grants", statusFilter, focusAreaFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append('status', statusFilter);
      if (focusAreaFilter && focusAreaFilter !== "all") params.append('focusAreas', focusAreaFilter);
      
      const response = await fetch(`/api/grants?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  const handleApplyToGrant = (grantId: number) => {
    toast({
      title: "Application Started! 🎉",
      description: "Redirecting to application form...",
    });
  };

  const filteredGrants = grants?.filter(grant => 
    grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grant.funder.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFunding = filteredGrants?.reduce((sum, grant) => sum + (grant.maxAmount || grant.amount), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vibrant-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Target className="mr-3 text-vibrant-blue" size={32} />
            Grant Opportunities
          </h1>
          <p className="text-slate-600 mt-2">
            Discover funding opportunities perfectly matched to your mission
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-energetic-green text-energetic-green">
            {filteredGrants?.length || 0} opportunities
          </Badge>
          <Badge variant="outline" className="border-warm-orange text-warm-orange">
            ${(totalFunding / 1000000).toFixed(1)}M total funding
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border-t-4 border-vibrant-blue">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <Search className="mr-2" size={20} />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search grants by title, description, or funder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closing_soon">Closing Soon</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={focusAreaFilter} onValueChange={setFocusAreaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {focusAreaOptions.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grant Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-energetic-green">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">High Match Grants</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {filteredGrants?.filter(g => (g.matchPercentage || 0) >= 85).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-energetic-green/10 rounded-lg flex items-center justify-center">
                <Target className="text-energetic-green" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-warm-orange">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Closing Soon</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {filteredGrants?.filter(g => {
                    const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDeadline <= 30;
                  }).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-warm-orange/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-warm-orange" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-deep-blue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Large Grants</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {filteredGrants?.filter(g => g.amount >= 500000).length || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-deep-blue/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-deep-blue" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grant Results */}
      <Card className="shadow-sm border-t-4 border-forest-green">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <Filter className="mr-2" size={20} />
            Grant Opportunities
            <Badge variant="outline" className="ml-3 border-forest-green text-forest-green">
              {filteredGrants?.length || 0} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGrants?.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600">No grants found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGrants?.map((grant) => (
                <GrantCard 
                  key={grant.id} 
                  grant={grant} 
                  onApply={handleApplyToGrant} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
