import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Brain, FileText, Target, TrendingUp, Users, Award } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to CiviGrantAI
        </h1>
        <p className="text-xl text-gray-600">
          {user?.email ? `Welcome back, ${user.email}!` : "Welcome back!"} Ready to create winning grant proposals?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/grants">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-blue-800">Find Grants</CardTitle>
              <CardDescription className="text-blue-600">
                Discover funding opportunities aligned with your mission
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/ai-intelligence">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-800">AlignIQ Blueprint</CardTitle>
              <CardDescription className="text-purple-600">
                Map funder goals and strategic priorities
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/ai-assistant">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-green-800">Smart Narrative Builder</CardTitle>
              <CardDescription className="text-green-600">
                AI-powered writing assistance for proposals
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/applications">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-orange-800">Applications</CardTitle>
              <CardDescription className="text-orange-600">
                Manage your grant applications and progress
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">12</CardTitle>
                <CardDescription className="text-gray-600">Active Applications</CardDescription>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">78%</CardTitle>
                <CardDescription className="text-gray-600">Success Rate</CardDescription>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">$2.4M</CardTitle>
                <CardDescription className="text-gray-600">Funding Secured</CardDescription>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
          <CardDescription className="text-gray-600">
            Your latest grant writing activities and AI insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">AlignIQ Blueprint Analysis Complete</p>
                <p className="text-sm text-gray-600">National Science Foundation - CISE Research Grants</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Smart Narrative Generated</p>
                <p className="text-sm text-gray-600">Executive Summary for Environmental Research Project</p>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Document Analysis Complete</p>
                <p className="text-sm text-gray-600">Requirements extracted from EPA Grant Guidelines</p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
              <p className="text-blue-100 mb-4">
                Use our AI-powered tools to create winning grant proposals that align with funder priorities.
              </p>
              <div className="flex gap-4">
                <Link href="/grants">
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Find Grants
                  </Button>
                </Link>
                <Link href="/ai-intelligence">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Try AlignIQ Blueprint
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}