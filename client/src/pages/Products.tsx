import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({
    limit: 50,
    offset: 0,
    search: search || undefined,
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-600 mt-1">Manage your product catalog</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product in your catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-slate-600">Product form coming soon</p>
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
                  placeholder="Search products by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-slate-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="border-slate-200/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="secondary" className="mt-2">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    {product.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-800">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-slate-600">{product.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Price</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">Stock</p>
                      <p className="text-lg font-bold text-slate-900">{product.stock}</p>
                    </div>
                  </div>

                  {product.sku && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-semibold">SKU</p>
                      <p className="text-sm text-slate-600">{product.sku}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No products found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
