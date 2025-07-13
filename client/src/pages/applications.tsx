import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/dashboard/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Calendar, DollarSign, TrendingUp, 
  Plus, Edit, Eye, Trash2, Clock, CheckCircle,
  AlertCircle, XCircle
} from "lucide-react";
import { Application, Grant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const CURRENT_ORG_ID = 1;

export default function Applications() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications/organization", CURRENT_ORG_ID],
  });

  const handleCreateApplication = () => {
    toast({
      title: "New Application 🎉",
      description: "Starting application wizard...",
    });
  };

  const handleEditApplication = (id: number) => {
    toast({
      title: "Edit Application",
      description: "Opening application editor...",
    });
  };

  const handleViewApplication = (id: number) => {
    toast({
      title: "View Application",
      description: "Opening application details...",
    });
  };

  const handleDeleteApplication = (id: number) => {
    toast({
      title: "Delete Application",
      description: "Are you sure you want to delete this application?",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "in_progress":
        return "bg-warm-orange/20 text-warm-orange";
      case "submitted":
        return "bg-vibrant-blue/20 text-vibrant-blue";
      case "under_review":
        return "bg-deep-blue/20 text-deep-blue";
      case "approved":
        return "bg-energetic-green/20 text-energetic-green";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit size={16} />;
      case "in_progress":
        return <Clock size={16} />;
      case "submitted":
        return <CheckCircle size={16} />;
      case "under_review":
        return <AlertCircle size={16} />;
      case "approved":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const filterApplications = (applications: Application[], status: string) => {
    if (status === "all") return applications;
    return applications.filter(app => app.status === status);
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const stats = applications ? {
    total: applications.length,
    draft: applications.filter(app => app.status === "draft").length,
    submitted: applications.filter(app => app.status === "submitted").length,
    approved: applications.filter(app => app.status === "approved").length,
    inProgress: applications.filter(app => app.status === "in_progress").length,
  } : { total: 0, draft: 0, submitted: 0, approved: 0, inProgress: 0 };

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
            <FileText className="mr-3 text-vibrant-blue" size={32} />
            Grant Applications
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your grant applications and track progress
          </p>
        </div>
        <Button 
          onClick={handleCreateApplication}
          className="bg-energetic-green hover:bg-forest-green text-white"
        >
          <Plus className="mr-2" size={16} />
          New Application
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm border-l-4 border-vibrant-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <FileText className="text-vibrant-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Draft</p>
                <p className="text-2xl font-bold text-slate-800">{stats.draft}</p>
              </div>
              <Edit className="text-slate-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-warm-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-slate-800">{stats.inProgress}</p>
              </div>
              <Clock className="text-warm-orange" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-deep-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Submitted</p>
                <p className="text-2xl font-bold text-slate-800">{stats.submitted}</p>
              </div>
              <CheckCircle className="text-deep-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-energetic-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-slate-800">{stats.approved}</p>
              </div>
              <CheckCircle className="text-energetic-green" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card className="shadow-sm border-t-4 border-forest-green">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Your Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {applications && filterApplications(applications, selectedTab).map((application) => (
                  <Card key={application.id} className="border border-slate-200 hover:border-vibrant-blue transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {application.title}
                            </h3>
                            <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                              {getStatusIcon(application.status)}
                              <span className="capitalize">{application.status.replace("_", " ")}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <Calendar size={16} />
                              <span>Created: {formatDate(application.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <Clock size={16} />
                              <span>Updated: {formatDate(application.updatedAt)}</span>
                            </div>
                            {application.submittedAt && (
                              <div className="flex items-center space-x-2 text-sm text-slate-600">
                                <CheckCircle size={16} />
                                <span>Submitted: {formatDate(application.submittedAt)}</span>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-600">Progress</span>
                              <span className="font-semibold text-slate-800">{application.progress}%</span>
                            </div>
                            <ProgressBar 
                              label="Progress" 
                              value={application.progress} 
                              total={100} 
                              color="var(--vibrant-blue)" 
                              className="h-2" 
                            />
                          </div>

                          {application.narrative && (
                            <p className="text-slate-600 text-sm line-clamp-2">
                              {application.narrative.substring(0, 200)}...
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplication(application.id)}
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditApplication(application.id)}
                            disabled={application.status === "submitted"}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteApplication(application.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {applications && filterApplications(applications, selectedTab).length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600">No applications found</h3>
                    <p className="text-slate-500 mt-2">
                      {selectedTab === "all" ? "Create your first application to get started" : `No ${selectedTab} applications yet`}
                    </p>
                    {selectedTab === "all" && (
                      <Button 
                        onClick={handleCreateApplication}
                        className="mt-4 bg-energetic-green hover:bg-forest-green text-white"
                      >
                        <Plus className="mr-2" size={16} />
                        Create Application
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
