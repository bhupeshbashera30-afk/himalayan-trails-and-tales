import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import TrekDetails from "./pages/TrekDetails";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Bookings from "./pages/admin/Bookings";
import Enquiries from "./pages/admin/Enquiries";
import Treks from "./pages/admin/Treks";
import TrekRegistrations from "./pages/admin/TrekRegistrations";
import Categories from "./pages/admin/Categories";
import UsersAdmin from "./pages/admin/Users";
import SiteSettings from "./pages/admin/SiteSettings";
import PackagesAdmin from "./pages/admin/Packages";
import TestimonialsAdmin from "./pages/admin/Testimonials";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/trek/:id" element={<TrekDetails />} />

            {/* Admin login - hidden from main nav, access via /admin */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* Admin dashboard - all sub-pages wrapped in Admin layout */}
            <Route path="/admin" element={<Admin />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="treks" element={<Treks />} />
              <Route path="trek-registrations" element={<TrekRegistrations />} />
              <Route path="categories" element={<Categories />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="site-settings" element={<SiteSettings />} />
              <Route path="packages" element={<PackagesAdmin />} />
              <Route path="testimonials" element={<TestimonialsAdmin />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
