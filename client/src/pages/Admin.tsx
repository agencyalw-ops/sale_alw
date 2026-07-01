import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-1">Manage users and system settings</p>
        </div>

        {/* User Management */}
        <Card className="border-slate-200/50">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-slate-500">User management interface coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
