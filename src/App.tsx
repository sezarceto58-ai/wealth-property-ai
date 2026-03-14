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
import MarketIntelligence from "@/pages/MarketIntelligence";
import SyndicationDeals from "@/pages/SyndicationDeals";
import SyndicationDealDetail from "@/pages/SyndicationDealDetail";

// Seller pages
import SellerDashboard from "@/pages/SellerDashboard";
import SellerListings from "@/pages/SellerListings";
import SellerOffers from "@/pages/SellerOffers";
import SellerAnalytics from "@/pages/SellerAnalytics";
import CreateProperty from "@/pages/CreateProperty";
import AgentCRM from "@/pages/AgentCRM";
import SellerAIAssistant from "@/pages/SellerAIAssistant";
import SellerVerification from "@/pages/SellerVerification";

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
import AdminVerificationReview from "@/pages/AdminVerificationReview";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Pricing from "@/pages/Pricing";
import NotFound from "./pages/NotFound";

import RequireAuth from "@/components/guards/RequireAuth";
import RequireRole from "@/components/guards/RequireRole";

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
              <RequireAuth>
                <RequireRole allow={"buyer"}>
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
                      <Route path="/market-intelligence" element={<MarketIntelligence />} />
                      <Route path="/syndication" element={<SyndicationDeals />} />
                      <Route path="/syndication/:id" element={<SyndicationDealDetail />} />
                    </Routes>
                  </Layout>
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route path="/property/:id" element={<Layout><PropertyDetail /></Layout>} />

          <Route
            path="/seller/*"
            element={
              <RequireAuth>
                <RequireRole allow={"seller"}>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<SellerDashboard />} />
                      <Route path="/listings" element={<SellerListings />} />
                      <Route path="/create" element={<CreateProperty />} />
                      <Route path="/offers" element={<SellerOffers />} />
                      <Route path="/crm" element={<AgentCRM />} />
                      <Route path="/messages" element={<Messaging />} />
                      <Route path="/analytics" element={<SellerAnalytics />} />
                      <Route path="/ai-assistant" element={<SellerAIAssistant />} />
                      <Route path="/verification" element={<SellerVerification />} />
                      <Route path="/investor" element={<InvestorTools />} />
                    </Routes>
                  </Layout>
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route
            path="/developer/*"
            element={
              <RequireAuth>
                <RequireRole allow={"developer"}>
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
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route path="/admin/*" element={
            <RequireAuth>
              <RequireRole allow={"admin"}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/verifications" element={<AdminVerificationReview />} />
                  </Routes>
                </Layout>
              </RequireRole>
            </RequireAuth>
          } />

          <Route path="/settings" element={
            <RequireAuth>
              <Layout><Settings /></Layout>
            </RequireAuth>
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <Layout><Profile /></Layout>
            </RequireAuth>
          } />
          <Route path="/pricing" element={<Layout><Pricing /></Layout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
