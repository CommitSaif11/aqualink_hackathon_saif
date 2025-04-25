import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import ResidentDashboard from "@/pages/resident-dashboard";
import DriverDashboard from "@/pages/driver-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { AuthProvider, useAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Check if the current location is the auth page
  const isAuthPage = location === '/auth' || location === '/';
  
  // If no user is logged in and not on auth page, redirect to auth
  if (!user && !isAuthPage) {
    return <AuthPage />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {user && !isAuthPage && <Navbar />}
      
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* Protected routes */}
          <Route path="/resident" component={ResidentDashboard} />
          <Route path="/driver" component={DriverDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
