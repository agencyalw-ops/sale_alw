import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/Sales";
import CustomersPage from "./pages/Customers";
import ProductsPage from "./pages/Products";
import AdminPage from "./pages/Admin";
import InvoicePage from "./pages/Invoice";
import WhatsAppPage from "./pages/WhatsApp";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Public routes
  if (!user) {
    return (
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Protected routes for authenticated users
  return (
    <Switch>
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/sales"} component={SalesPage} />
      <Route path={"/customers"} component={CustomersPage} />
      <Route path={"/products"} component={ProductsPage} />
      <Route path={"/whatsapp"} component={WhatsAppPage} />
      <Route path={"/invoice/:id"} component={InvoicePage} />
      {user.role === 'admin' && <Route path={"/admin"} component={AdminPage} />}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
