import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";

// Public pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";

// Buyer pages
import BuyerDashboard from "@/pages/BuyerDashboard";
import BuyerOffers from "@/pages/BuyerOffers";
import BuyerFavorites from "@/pages/BuyerFavorites";
import Marketplace from "@/pages/Marketplace";
import PropertyDetail from "@/pages/PropertyDetail";
import CompareListings from "@/pages/CompareListings";
import Alerts from "@/pages/Alerts";
import InvestorTools from "@/pages/InvestorTools";
import BuyerPropertyAnalysis from "@/pages/BuyerPropertyAnalysis";

// Seller pages
import SellerDashboard from "@/pages/SellerDashboard";
import SellerListings from "@/pages/SellerListings";
import SellerOffers from "@/pages/SellerOffers";
import SellerAnalytics from "@/pages/SellerAnalytics";
import CreateProperty from "@/pages/CreateProperty";
import AgentCRM from "@/pages/AgentCRM";

// Developer pages
import DeveloperDashboard from "@/pages/DeveloperDashboard";
import LandInputForm from "@/pages/LandInputForm";
import PlanResults from "@/pages/PlanResults";
import DeveloperPlans from "@/pages/DeveloperPlans";
import OpportunityFeed from "@/pages/OpportunityFeed";
import CreateOpportunity from "@/pages/CreateOpportunity";
import OpportunityWorkspace from "@/pages/OpportunityWorkspace";
import PortfolioInsights from "@/pages/PortfolioInsights";

// Shared pages
import Messaging from "@/pages/Messaging";
import AdminDashboard from "@/pages/AdminDashboard";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes (no layout) */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected routes with layout */}
          <Route
            path="/buyer/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<BuyerDashboard />} />
                  <Route path="/discover" element={<Marketplace />} />
                  <Route path="/compare" element={<CompareListings />} />
                  <Route path="/favorites" element={<BuyerFavorites />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/offers" element={<BuyerOffers />} />
                  <Route path="/messages" element={<Messaging />} />
                  <Route path="/investor" element={<InvestorTools />} />
                  <Route path="/analysis/:id" element={<BuyerPropertyAnalysis />} />
                </Routes>
              </Layout>
            }
          />

          <Route path="/property/:id" element={<Layout><PropertyDetail /></Layout>} />

          <Route
            path="/seller/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<SellerDashboard />} />
                  <Route path="/listings" element={<SellerListings />} />
                  <Route path="/create" element={<CreateProperty />} />
                  <Route path="/offers" element={<SellerOffers />} />
                  <Route path="/crm" element={<AgentCRM />} />
                  <Route path="/messages" element={<Messaging />} />
                  <Route path="/analytics" element={<SellerAnalytics />} />
                  <Route path="/ai-assistant" element={<CreateProperty />} />
                  <Route path="/investor" element={<InvestorTools />} />
                </Routes>
              </Layout>
            }
          />

          <Route
            path="/developer/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<DeveloperDashboard />} />
                  <Route path="/analyze" element={<LandInputForm />} />
                  <Route path="/plans" element={<DeveloperPlans />} />
                  <Route path="/plan/:id" element={<PlanResults />} />
                  <Route path="/opportunities" element={<OpportunityFeed />} />
                  <Route path="/opportunities/create" element={<CreateOpportunity />} />
                  <Route path="/opportunities/:id" element={<OpportunityWorkspace />} />
                  <Route path="/portfolio" element={<PortfolioInsights />} />
                  <Route path="/messages" element={<Messaging />} />
                </Routes>
              </Layout>
            }
          />

          <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/pricing" element={<Layout><Pricing /></Layout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
