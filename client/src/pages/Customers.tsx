import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: customers, isLoading, refetch } = trpc.customers.list.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
  });

  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete customer");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
            <p className="text-slate-600 mt-1">Manage customer profiles and information</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-600">Customer form coming soon</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="border-slate-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search customers by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card className="border-slate-200/50">
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              {customers?.length || 0} customers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : customers && customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">City</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Joined</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer: any) => (
                      <tr key={customer.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{customer.name}</td>
                        <td className="py-3 px-4 text-slate-600">{customer.email || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{customer.phone || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{customer.city || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
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
                <p className="text-slate-500">No customers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
