
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<Index />} /> */}
          <Route path="" element={<JsonCreater />} />
          <Route path={ROUTES.HOME} element={<QuickOrderManagement />} />
          <Route path="/quick-order" element={<QuickOrderManagement />} />
          <Route path="/trip-plans-search-hub" element={<TripPlansSearchHub />} />
          <Route path="/trip-search-api" element={<TripPlansSearchHubAPI />} />
          <Route path="/create-quick-order" element={<CreateQuickOrder />} />
          <Route path="/json-creater" element={<JsonCreater />} />
          <Route path="/dynamic-panel-demo-clone" element={<DynamicPanelDemoClone />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
