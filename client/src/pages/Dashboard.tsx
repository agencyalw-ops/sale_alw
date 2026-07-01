import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShoppingCart, Users, Package } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: topProducts, isLoading: productsLoading } = trpc.dashboard.topProducts.useQuery();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your sales overview.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">From completed sales</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Completed transactions</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Product */}
          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Top Product</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900 truncate">
                    {topProducts?.[0]?.name || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {topProducts?.[0]?.totalQuantitySold || 0} units sold
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Recent Sales</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats?.recentSales?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Last 10 transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales Chart */}
          <Card className="border-slate-200/50">
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Last 10 sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : stats?.recentSales && stats.recentSales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.recentSales.map((sale: any) => ({
                    date: new Date(sale.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    amount: typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-slate-200/50">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products by quantity</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProducts.map((product: any) => ({
                        name: product.name,
                        value: product.totalQuantitySold,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topProducts.map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      formatter={(value: any) => `${value} units`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  No product data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="border-slate-200/50">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest sales in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentSales && stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/50">
                    <div>
                      <p className="font-medium text-slate-900">Order #{sale.orderNumber}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(sale.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(typeof sale.total === 'string' ? parseFloat(sale.total) : sale.total)}
                      </p>
                      <p className={`text-xs font-medium ${
                        sale.status === 'completed' ? 'text-green-600' :
                        sale.status === 'pending' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No transactions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
