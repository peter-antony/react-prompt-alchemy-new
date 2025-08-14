import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./api/config";
import Index from "./pages/Index";
import GridDemo from "./pages/GridDemo";
import TripPlansSearchHub from "./pages/TripPlansSearchHub";
import TripPlansSearchHubAPI from "./pages/TripPlansSearchHubAPI";
import DynamicPanelDemo from "./pages/DynamicPanelDemo";
import DynamicPanelDemoClone from "./pages/DynamicPanelDemoClone";
import FlexGridDemo from "./pages/FlexGridDemo";
import FlexGridLayoutPage from "./pages/FlexGridLayoutPage";
import TripExecution from "./pages/TripExecution";
import SideDrawerDemo from "./pages/SideDrawerDemo";
import SmartGridPlusDemo from "./pages/SmartGridPlusDemo";
import BillingDemo from "./pages/BillingDemo";
import NotFound from "./pages/NotFound";
import QuickOrderManagement from "./pages/QuickOrderManagement";
import CreateQuickOrder from "./pages/createQuickOrder";
import JsonCreater from "./pages/JsonCreater";
import SignIn from "./pages/SignIn";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import SignOut from "./pages/SignOut";
import MockPage from "./pages/MockPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/Forwardis-dev/">
        <Routes>
          {/* <Route path="/" element={<Index />} /> */}
          
          {/* Protected Routes - require token */}
          <Route path={ROUTES.HOME} element={
            <ProtectedRoute>
              <QuickOrderManagement />
            </ProtectedRoute>
          } />
          <Route path="quick-order" element={
            <ProtectedRoute>
              <QuickOrderManagement />
            </ProtectedRoute>
          } />
          <Route path="trip-plans-search-hub" element={
            <ProtectedRoute>
              <TripPlansSearchHub />
            </ProtectedRoute>
          } />
          <Route path="trip-search-api" element={
            <ProtectedRoute>
              <TripPlansSearchHubAPI />
            </ProtectedRoute>
          } />
          <Route path="create-quick-order" element={
            <ProtectedRoute>
              <CreateQuickOrder />
            </ProtectedRoute>
          } />
          <Route path="json-creater" element={
            <ProtectedRoute>
              <JsonCreater />
            </ProtectedRoute>
          } />
          <Route path="dynamic-panel-demo-clone" element={
            <ProtectedRoute>
              <DynamicPanelDemoClone />
            </ProtectedRoute>
          } />
          
          {/* Public Routes - no token required */}
          <Route path={ROUTES.SIGNIN} element={<SignIn />} />
          <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />
          <Route path={ROUTES.SIGNOUT} element={<SignOut />} />
          <Route path="mock-page" element={<MockPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
