import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: sales, isLoading, refetch } = trpc.sales.list.useQuery({
    limit: 50,
    offset: 0,
    status: (statusFilter as 'pending' | 'completed' | 'cancelled' | undefined) || undefined,
  });

  const deleteMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      toast.success("Sale deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete sale");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (value: any) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales</h1>
            <p className="text-slate-600 mt-1">Manage and track all sales orders</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
                <DialogDescription>
                  Add a new sale order to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-600">Sale creation form coming soon</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-slate-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search by order number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === '' ? '' : value)}>
                <SelectTrigger className="w-40 border-slate-300">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        <Card className="border-slate-200/50">
          <CardHeader>
            <CardTitle>All Sales</CardTitle>
            <CardDescription>
              {sales?.length || 0} sales found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Order #</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale: any) => (
                      <tr key={sale.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{sale.orderNumber}</td>
                        <td className="py-3 px-4 text-slate-600">Customer {sale.customerId}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(sale.status)}>
                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/invoice/${sale.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sale.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500">No sales found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
