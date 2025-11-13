import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminDepartments from "@/pages/admin-departments";
import EmployeeDashboard from "@/pages/employee-dashboard";

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isEmployee } = useAuth();

  // Show landing page for non-authenticated users or while loading
  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Authenticated routes with sidebar
  const style = {
    "--sidebar-width": "280px",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <LanguageSwitcher />
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <Switch>
              {isAdmin && (
                <>
                  <Route path="/" component={AdminDashboard} />
                  <Route path="/admin" component={AdminDashboard} />
                  <Route path="/admin/departments" component={AdminDepartments} />
                  <Route path="/admin/schedule" component={AdminDashboard} />
                  <Route path="/admin/employees" component={AdminDashboard} />
                </>
              )}
              {isEmployee && (
                <>
                  <Route path="/" component={EmployeeDashboard} />
                  <Route path="/employee" component={EmployeeDashboard} />
                  <Route path="/employee/schedule" component={EmployeeDashboard} />
                </>
              )}
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
