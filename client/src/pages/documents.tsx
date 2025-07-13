import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FolderOpen, FileText, Download, Upload, Search, 
  Plus, Eye, Edit, Trash2, Copy, Share2,
  FileType, Calendar, User, Filter, Archive,
  LayoutTemplate, FileCheck2, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Document, Application } from "@shared/schema";

const CURRENT_ORG_ID = 1;

const documentTypes = [
  { value: "narrative", label: "Narrative", icon: FileText },
  { value: "budget", label: "Budget", icon: FileCheck2 },
  { value: "timeline", label: "Timeline", icon: Calendar },
  { value: "template", label: "LayoutTemplate", icon: LayoutTemplate },
  { value: "supporting", label: "Supporting Document", icon: Archive },
];

const sampleDocuments = [
  {
    id: 1,
    name: "Community Health Grant Narrative",
    type: "narrative",
    applicationId: 1,
    size: "45 KB",
    lastModified: "2 hours ago",
    status: "final",
  },
  {
    id: 2,
    name: "Project Budget Spreadsheet",
    type: "budget",
    applicationId: 1,
    size: "128 KB",
    lastModified: "1 day ago",
    status: "draft",
  },
  {
    id: 3,
    name: "Impact Evaluation LayoutTemplate",
    type: "template",
    applicationId: null,
    size: "32 KB",
    lastModified: "3 days ago",
    status: "template",
  },
];

const exportFormats = [
  { value: "pdf", label: "PDF Document", icon: FileText },
  { value: "docx", label: "Word Document", icon: FileText },
  { value: "xlsx", label: "Excel Spreadsheet", icon: FileText },
  { value: "txt", label: "Plain Text", icon: FileText },
];

export default function Documents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications/organization", CURRENT_ORG_ID],
  });

  const filteredDocuments = sampleDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || doc.type === typeFilter;
    const matchesApplication = !selectedApplication || doc.applicationId === parseInt(selectedApplication);
    return matchesSearch && matchesType && matchesApplication;
  });

  const handleDownload = (document: any) => {
    toast({
      title: "Download Started! 📥",
      description: `Downloading ${document.name}...`,
    });
  };

  const handleUpload = () => {
    toast({
      title: "Upload Feature",
      description: "File upload functionality coming soon!",
    });
    setUploadDialogOpen(false);
  };

  const handleExport = (format: string) => {
    if (selectedDocument) {
      toast({
        title: "Export Started! 📄",
        description: `Exporting ${selectedDocument.name} as ${format.toUpperCase()}...`,
      });
    }
    setExportDialogOpen(false);
  };

  const handleDelete = (documentId: number) => {
    toast({
      title: "Delete Document",
      description: "Are you sure you want to delete this document?",
      variant: "destructive",
    });
  };

  const handleDuplicate = (document: any) => {
    toast({
      title: "Document Duplicated! 📋",
      description: `Created a copy of ${document.name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return "bg-energetic-green/20 text-energetic-green";
      case "draft":
        return "bg-warm-orange/20 text-warm-orange";
      case "template":
        return "bg-vibrant-blue/20 text-vibrant-blue";
      case "archived":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getTypeIcon = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.icon : FileText;
  };

  const documentStats = {
    total: filteredDocuments.length,
    narratives: filteredDocuments.filter(d => d.type === "narrative").length,
    budgets: filteredDocuments.filter(d => d.type === "budget").length,
    templates: filteredDocuments.filter(d => d.type === "template").length,
    supporting: filteredDocuments.filter(d => d.type === "supporting").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <FolderOpen className="mr-3 text-vibrant-blue" size={32} />
            Document Library
          </h1>
          <p className="text-slate-600 mt-2">
            Organize, manage, and export all your grant-related documents
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-energetic-green text-energetic-green">
                <Upload className="mr-2" size={16} />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-slate-600">Drag and drop files here or click to browse</p>
                  <Button className="mt-4" onClick={handleUpload}>
                    Choose Files
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button className="bg-vibrant-blue hover:bg-deep-blue text-white">
            <Plus className="mr-2" size={16} />
            New Document
          </Button>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-sm border-l-4 border-vibrant-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold text-slate-800">{documentStats.total}</p>
              </div>
              <FolderOpen className="text-vibrant-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-energetic-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Narratives</p>
                <p className="text-2xl font-bold text-slate-800">{documentStats.narratives}</p>
              </div>
              <FileText className="text-energetic-green" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-warm-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Budgets</p>
                <p className="text-2xl font-bold text-slate-800">{documentStats.budgets}</p>
              </div>
              <FileCheck2 className="text-warm-orange" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-deep-blue">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Templates</p>
                <p className="text-2xl font-bold text-slate-800">{documentStats.templates}</p>
              </div>
              <LayoutTemplate className="text-deep-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-forest-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Supporting</p>
                <p className="text-2xl font-bold text-slate-800">{documentStats.supporting}</p>
              </div>
              <Archive className="text-forest-green" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm border-t-4 border-vibrant-blue">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <Search className="mr-2" size={20} />
            Search & Filter Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedApplication} onValueChange={setSelectedApplication}>
              <SelectTrigger>
                <SelectValue placeholder="Application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Applications</SelectItem>
                {applications?.map(app => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    {app.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="shadow-sm border-t-4 border-forest-green">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <FileType className="mr-2" size={20} />
            Your Documents
            <Badge variant="outline" className="ml-3 border-forest-green text-forest-green">
              {filteredDocuments.length} documents
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="narratives">Narratives</TabsTrigger>
              <TabsTrigger value="budgets">Budgets</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="supporting">Supporting</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600">No documents found</h3>
                  <p className="text-slate-500 mt-2">Try adjusting your search terms or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocuments.map((document) => {
                    const TypeIcon = getTypeIcon(document.type);
                    return (
                      <Card key={document.id} className="border border-slate-200 hover:border-vibrant-blue transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-vibrant-blue/10 rounded-lg flex items-center justify-center">
                                <TypeIcon className="text-vibrant-blue" size={20} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">
                                  {document.name}
                                </h4>
                                <p className="text-xs text-slate-500">{document.size}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                              {document.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                            <span>Modified {document.lastModified}</span>
                            <Badge variant="outline" className="text-xs">
                              {documentTypes.find(t => t.value === document.type)?.label}
                            </Badge>
                          </div>

                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(document)}
                              className="flex-1 text-xs"
                            >
                              <Eye size={12} className="mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document);
                                setExportDialogOpen(true);
                              }}
                              className="flex-1 text-xs"
                            >
                              <Download size={12} className="mr-1" />
                              Export
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDuplicate(document)}
                              className="text-xs"
                            >
                              <Copy size={12} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              Export "{selectedDocument?.name}" in your preferred format:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <Button
                    key={format.value}
                    variant="outline"
                    onClick={() => handleExport(format.value)}
                    className="flex items-center justify-center p-6 h-auto"
                  >
                    <div className="text-center">
                      <Icon className="mx-auto mb-2" size={24} />
                      <span className="text-sm">{format.label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Templates */}
      <Card className="shadow-sm border-t-4 border-energetic-green">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center">
            <LayoutTemplate className="mr-2" size={20} />
            Document Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Grant Narrative LayoutTemplate", type: "narrative", description: "Standard narrative structure for grant applications" },
              { name: "Budget LayoutTemplate", type: "budget", description: "Comprehensive budget breakdown format" },
              { name: "Impact Evaluation LayoutTemplate", type: "evaluation", description: "Framework for measuring project impact" },
              { name: "Letter of Support LayoutTemplate", type: "supporting", description: "LayoutTemplate for partner support letters" },
            ].map((template, index) => (
              <Card key={index} className="border border-slate-200 hover:border-energetic-green transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <LayoutTemplate className="text-energetic-green" size={20} />
                    <Badge variant="outline" className="text-xs">LayoutTemplate</Badge>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">{template.name}</h4>
                  <p className="text-xs text-slate-600 mb-4">{template.description}</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 text-xs text-energetic-green border-energetic-green"
                    >
                      <Plus size={12} className="mr-1" />
                      Use LayoutTemplate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      <Eye size={12} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
