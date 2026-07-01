import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BarChart3, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-200/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">ALW Sales</span>
          </div>
          <a href={getLoginUrl()}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Elegant Sales Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              A sophisticated, fully-featured sales management system designed for professionals who demand elegance and precision in every detail.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-slate-300">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Dashboard</h3>
              <p className="text-sm text-slate-600">Real-time insights and analytics</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Sales Mgmt</h3>
              <p className="text-sm text-slate-600">Complete order management</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Customers</h3>
              <p className="text-sm text-slate-600">Manage client relationships</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Analytics</h3>
              <p className="text-sm text-slate-600">Track performance metrics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-slate-200/50 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">
            Powerful Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Complete Sales Tracking
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create, manage, and track sales with detailed status updates. Monitor pending, completed, and cancelled orders in real-time.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Customer Profiles
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Maintain comprehensive customer information with contact details, purchase history, and notes for personalized service.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Product Catalog
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Manage your product inventory with pricing, stock levels, and categories. Keep everything organized and accessible.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Professional Invoices
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Generate elegant, printable invoices automatically. Perfect for professional documentation and customer records.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Advanced Search
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Quickly find sales, customers, and products with powerful search and filter capabilities across all modules.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Admin Dashboard
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive admin panel for user management, data oversight, and report generation with role-based access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Join professionals who trust ALW Sales for elegant, efficient sales management.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50">
              Start Free Today
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-slate-50/50 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center text-slate-600">
          <p>&copy; 2026 ALW Sales. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
