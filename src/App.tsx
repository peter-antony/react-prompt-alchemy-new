
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/grid-demo" element={<GridDemo />} />
          <Route path="/trip-plans-search-hub" element={<TripPlansSearchHub />} />
          <Route path="/trip-plans-search-hub-api" element={<TripPlansSearchHubAPI />} />
          <Route path="/dynamic-panel-demo" element={<DynamicPanelDemo />} />
          <Route path="/dynamic-panel-demo-clone" element={<DynamicPanelDemoClone />} />
          <Route path="/flex-grid-demo" element={<FlexGridDemo />} />
          <Route path="/flex-grid-layout-page" element={<FlexGridLayoutPage />} />
          <Route path="/trip-execution" element={<TripExecution />} />
          <Route path="/side-drawer-demo" element={<SideDrawerDemo />} />
          <Route path="/smart-grid-plus-demo" element={<SmartGridPlusDemo />} />
          <Route path="/billing-demo" element={<BillingDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
