import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Printer } from "lucide-react";
import { useLocation } from "wouter";

export default function InvoicePage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const saleId = params?.id ? parseInt(params.id) : 0;

  const { data: sale, isLoading } = trpc.sales.get.useQuery(
    { id: saleId },
    { enabled: !!saleId }
  );

  const { data: customer } = trpc.customers.get.useQuery(
    { id: sale?.customerId || 0 },
    { enabled: !!sale?.customerId }
  );

  const formatCurrency = (value: any) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setLocation('/sales')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
          <Card className="border-slate-200/50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">Sale not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* No-Print Header */}
        <div className="print:hidden mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation('/sales')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        {/* Invoice */}
        <Card className="border-slate-200/50 print:border-0 print:shadow-none">
          <CardContent className="p-8 print:p-0">
            {/* Header */}
            <div className="mb-12 pb-8 border-b border-slate-200 print:border-slate-300">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">INVOICE</h1>
                  <p className="text-slate-600 mt-1">Order #{sale.orderNumber}</p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-2">
                    <span className="text-white font-bold">ALW</span>
                  </div>
                  <p className="font-semibold text-slate-900">ALW Sales</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Invoice Date</p>
                  <p className="text-slate-900">
                    {new Date(sale.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Invoice #</p>
                  <p className="text-slate-900">{sale.orderNumber}</p>
                </div>
              </div>
            </div>

            {/* Customer & Company Info */}
            <div className="grid grid-cols-2 gap-12 mb-12 pb-8 border-b border-slate-200 print:border-slate-300">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-3">Bill To</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{customer?.name || 'Customer'}</p>
                  {customer?.email && <p className="text-slate-600">{customer.email}</p>}
                  {customer?.phone && <p className="text-slate-600">{customer.phone}</p>}
                  {customer?.address && <p className="text-slate-600">{customer.address}</p>}
                  {(customer?.city || customer?.state) && (
                    <p className="text-slate-600">
                      {customer?.city}{customer?.city && customer?.state ? ', ' : ''}{customer?.state}
                      {customer?.zipCode ? ' ' + customer.zipCode : ''}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-3">From</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">ALW Sales</p>
                  <p className="text-slate-600">Professional Sales Management</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items && sale.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-200 print:border-slate-300">
                      <td className="py-3 px-4 text-slate-900">Item #{item.productId}</td>
                      <td className="text-right py-3 px-4 text-slate-900">{item.quantity}</td>
                      <td className="text-right py-3 px-4 text-slate-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-80">
                <div className="flex justify-between py-2 border-b border-slate-200 print:border-slate-300">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{formatCurrency(sale.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200 print:border-slate-300">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">{formatCurrency(sale.tax)}</span>
                </div>
                <div className="flex justify-between py-3 bg-slate-100 print:bg-slate-50 px-4 rounded-lg font-bold text-lg">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{formatCurrency(sale.total)}</span>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 print:border-slate-300">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Status</p>
                <p className={`font-semibold ${
                  sale.status === 'completed' ? 'text-green-600' :
                  sale.status === 'pending' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </p>
              </div>
              {sale.notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Notes</p>
                  <p className="text-slate-900">{sale.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 print:border-slate-300 text-center text-sm text-slate-500">
              <p>Thank you for your business!</p>
              <p className="mt-2">This is an automatically generated invoice from ALW Sales Management System</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
