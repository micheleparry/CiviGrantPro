import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, FileText, Zap, Users, Award } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-20 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              CiviGrantAI
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              An AI-powered grant writing platform that leverages advanced intelligence to help organizations strategically identify, analyze, and apply for funding opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-3 text-lg font-semibold"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Intelligent Grant Writing Made Simple
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your grant acquisition process with AI-powered document processing and strategic alignment technologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">AlignIQ Blueprint</CardTitle>
                <CardDescription className="text-gray-600">
                  Maps funding organization goals, metrics, and priorities to strategically align your project with their objectives.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Smart Narrative Builder</CardTitle>
                <CardDescription className="text-gray-600">
                  AI-powered narrative generation that creates compelling, funder-aligned proposals with strategic recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Grant Discovery</CardTitle>
                <CardDescription className="text-gray-600">
                  Intelligent matching system that identifies funding opportunities aligned with your organization's mission.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Real-time Collaboration</CardTitle>
                <CardDescription className="text-gray-600">
                  Seamless team collaboration tools with version control and progress tracking for efficient grant writing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Document Analysis</CardTitle>
                <CardDescription className="text-gray-600">
                  Advanced parsing of grant documents to extract requirements, deadlines, and evaluation criteria automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Success Tracking</CardTitle>
                <CardDescription className="text-gray-600">
                  Comprehensive analytics and progress monitoring to optimize your grant application strategy over time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Transform Your Grant Writing?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join organizations that have streamlined their funding acquisition process with AI-powered intelligence.
              </p>
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
              >
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="py-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            © 2025 CiviGrantAI. Empowering organizations through intelligent grant writing.
          </p>
        </div>
      </div>
    </div>
  );
}