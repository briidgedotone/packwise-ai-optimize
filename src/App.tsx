import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardProtectedRoute } from "@/components/DashboardProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import SuiteAnalysisResults from "./pages/SuiteAnalysisResults";
import SuiteAnalysisLoading from "./pages/SuiteAnalysisLoading";
import StreamingAnalysisResults from "./pages/StreamingAnalysisResults";
import PDPAnalysisResults from "./pages/PDPAnalysisResults";
import NotFound from "./pages/NotFound";
import SuiteAnalyzer from "./pages/products/SuiteAnalyzer";
import DemandPlanner from "./pages/products/DemandPlanner";
import SpecGenerator from "./pages/products/SpecGenerator";
import DesignAnalyzer from "./pages/products/DesignAnalyzer";
import PackagingAiChatbot from "./pages/products/PackagingAiChatbot";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ClientSuiteAnalyzer from "./pages/ClientSuiteAnalyzer";
import ClientSideAnalysisResults from "./pages/ClientSideAnalysisResults";

const App = () => (
  <ErrorBoundary>
    <ConvexClerkProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in/*" element={<SignIn />} />
            <Route path="/sign-up/*" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <DashboardProtectedRoute>
                  <Dashboard />
                </DashboardProtectedRoute>
              } 
            />
            <Route 
              path="/suite-analysis/:analysisId" 
              element={
                <DashboardProtectedRoute>
                  <SuiteAnalysisResults />
                </DashboardProtectedRoute>
              } 
            />
            <Route 
              path="/suite-analysis/:analysisId/loading" 
              element={
                <DashboardProtectedRoute>
                  <SuiteAnalysisLoading />
                </DashboardProtectedRoute>
              } 
            />
            <Route
              path="/suite-analysis/:analysisId/streaming"
              element={
                <DashboardProtectedRoute>
                  <StreamingAnalysisResults />
                </DashboardProtectedRoute>
              }
            />
            <Route
              path="/suite-analysis/:analysisId/client-results"
              element={
                <DashboardProtectedRoute>
                  <ClientSideAnalysisResults />
                </DashboardProtectedRoute>
              }
            />
            <Route 
              path="/pdp-analysis/results" 
              element={
                <DashboardProtectedRoute>
                  <PDPAnalysisResults />
                </DashboardProtectedRoute>
              } 
            />
            {/* Product Pages */}
            <Route path="/product/suite-analyzer" element={<SuiteAnalyzer />} />
            <Route path="/product/demand-planner" element={<DemandPlanner />} />
            <Route path="/product/spec-generator" element={<SpecGenerator />} />
            <Route path="/product/design-analyzer" element={<DesignAnalyzer />} />
            <Route path="/product/packaging-ai-chatbot" element={<PackagingAiChatbot />} />
            <Route path="/client-suite-analyzer" element={<ClientSuiteAnalyzer />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConvexClerkProvider>
  </ErrorBoundary>
);

export default App;