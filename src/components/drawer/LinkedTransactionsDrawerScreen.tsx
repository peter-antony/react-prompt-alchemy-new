import React, { useMemo, useState } from 'react';
import { Search, Filter, User, FileText, Calendar, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { manageTripStore } from '@/stores/mangeTripStore';

// Helper function to format date with time (e.g., "12-Dec-2025 12:23")
const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
};

// Helper function to get status badge class based on status value
const getStatusBadgeClass = (status: string): string => {
  const normalizedStatus = status?.toLowerCase?.() || '';

  // Blue for initiated, claim initiated
  if (normalizedStatus.includes('initiated')) {
    return 'badge-blue rounded-2xl';
  }
  // Green for confirmed, approved
  if (normalizedStatus === 'confirmed' || normalizedStatus === 'approved') {
    return 'badge-green rounded-2xl';
  }
  // Gray for draft
  if (normalizedStatus === 'draft') {
    return 'badge-gray rounded-2xl';
  }
  // Orange for processed
  if (normalizedStatus === 'processed') {
    return 'badge-orange rounded-2xl';
  }
  // Default: gray
  return 'badge-gray rounded-2xl';
};

// Helper function to get order type badge class (buy/sell)
const getOrderTypeBadgeClass = (orderType: string): string => {
  const normalizedType = orderType?.toLowerCase?.() || '';
  if (normalizedType === 'buy') {
    return 'badge-fresh-green rounded-2xl';
  }
  if (normalizedType === 'sell') {
    return 'badge-red rounded-2xl';
  }
  return 'badge-gray rounded-2xl';
};

interface LinkedTransaction {
  id: string;
  transactionId: string;
  containerNumber: string;
  companyName: string;
  customerOrderNumber: string;
  amount?: number | string;
  productId: string;
  date: string;
  type: string;
  badge: 'C' | 'Q' | 'T';
  badgeColor: string;
  InternalOrderNo?: any;
  orderType?: string; // For QuickOrder buy/sell
}

interface LinkedTransactionsDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
}

// Mock data
const mockTransactions: LinkedTransaction[] = [
  {
    id: '1',
    transactionId: 'IO/0000000042',
    containerNumber: 'CON000000439',
    companyName: 'XYZ Manufacturer Pvt. Ltd.',
    customerOrderNumber: 'CUS4343200/01',
    amount: 45595.00,
    productId: 'QO0382000/32',
    date: '12-Mar-2025',
    type: 'sell',
    badge: 'C',
    badgeColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: '2',
    transactionId: 'IO/0000000042',
    containerNumber: 'CON000000439',
    companyName: 'XYZ Manufacturer Pvt. Ltd.',
    customerOrderNumber: 'CUS4343200/01',
    amount: 45595.00,
    productId: 'QO0382000/32',
    date: '12-Mar-2025',
    type: 'buy',
    badge: 'Q',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    id: '3',
    transactionId: 'IO/0000000042',
    containerNumber: 'CON000000439',
    companyName: 'XYZ Manufacturer Pvt. Ltd.',
    customerOrderNumber: 'CUS4343200/01',
    amount: 45595.00,
    productId: 'QO0382000/32',
    date: '12-Mar-2025',
    type: 'buy',
    badge: 'Q',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    id: '4',
    transactionId: 'IO/0000000042',
    containerNumber: 'CON000000439',
    companyName: 'XYZ Manufacturer Pvt. Ltd.',
    customerOrderNumber: 'CUS4343200/01',
    amount: 45595.00,
    productId: 'QO0382000/32',
    date: '12-Mar-2025',
    type: 'buy',
    badge: 'T',
    badgeColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: '5',
    transactionId: 'IO/0000000042',
    containerNumber: 'CON000000439',
    companyName: 'XYZ Manufacturer Pvt. Ltd.',
    customerOrderNumber: 'CUS4343200/01',
    amount: 45595.00,
    productId: 'QO0382000/32',
    date: '12-Mar-2025',
    type: 'sell',
    badge: 'C',
    badgeColor: 'bg-blue-100 text-blue-600',
  },
];

export const LinkedTransactionsDrawerScreen: React.FC<LinkedTransactionsDrawerScreenProps> = ({
  onClose,
  tripId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // const [transactions] = useState<LinkedTransaction[]>(mockTransactions);

  const { tripData } = manageTripStore();
  console.log('linked Transactions - tripData', tripData.LinkedTransactions);
  const LinkedTransactions = tripData?.LinkedTransactions;

  const transactions = useMemo(() => {
    if (!LinkedTransactions) return [];

    const { Claims, QuickOrder, TripPlan } = LinkedTransactions;

    const result: any[] = [];

    // 🟣 Map Claims - only add if Claims array has data
    if (Array.isArray(Claims) && Claims.length > 0) {
      Claims.forEach((claim: any, index: number) => {
        result.push({
          id: `claim-${index}`,
          badge: 'C',
          badgeColor: 'bg-purple-100 text-purple-600',
          type: claim.ClaimsStatus || '-',
          transactionId: claim.ClaimsID || '-',
          companyName:
            claim.CustomerIDVendorID || claim.CustomerDescriptionVendorDescription
              ? `${claim.CustomerIDVendorID ?? ''}${claim.CustomerIDVendorID && claim.CustomerDescriptionVendorDescription ? ' - ' : ''}${claim.CustomerDescriptionVendorDescription ?? ''}`
              : '-',
          containerNumber: claim.TripNo || '-',
          customerOrderNumber: '-',
          amount: claim.ClaimsAmountWithCurrency?.trim() || '—',
          productId: claim.ClaimsFor || '-',
          date: claim.ClaimsDate
            ? formatDateTime(claim.ClaimsDate)
            : '-',
        });
      });
    }

    // 🔵 QuickOrder card - only add if QuickOrder array has data
    if (Array.isArray(QuickOrder) && QuickOrder.length > 0) {
      QuickOrder.forEach((quickOrder: any, index: number) => {
        result.push({
          id: `quickorder-${index}`,
          badge: 'Q',
          badgeColor: 'bg-blue-100 text-blue-600',
          type: quickOrder.QuickOrderStatus || '-',
          transactionId: quickOrder.QuickOrderNo || '-',
          companyName:
            quickOrder.CustomerIDVendorID || quickOrder.CustomerDescriptionVendorDescription
              ? `${quickOrder.CustomerIDVendorID ?? ''}${quickOrder.CustomerIDVendorID && quickOrder.CustomerDescriptionVendorDescription ? ' - ' : ''}${quickOrder.CustomerDescriptionVendorDescription ?? ''}`
              : '-',
          containerNumber: quickOrder.TripNo || '-',
          customerOrderNumber: quickOrder.InternalOrderNo || '-',
          amount: quickOrder.AmountWithCurrency?.trim() || '0.00 EUR',
          productId: quickOrder.ResourcesGroupID || '-',
          orderType: quickOrder.QuickOrderType || '', // BUY or SELL
          date: quickOrder.FromDate
            ? formatDateTime(quickOrder.FromDate) +
            ' to ' +
            formatDateTime(quickOrder.ToDate)
            : '-',
        });
      });
    }

    // 🟠 TripPlan card - only add if TripPlan array has data
    if (Array.isArray(TripPlan) && TripPlan.length > 0) {
      TripPlan.forEach((tripPlan: any, index: number) => {
        result.push({
          id: `tripplan-${index}`,
          badge: 'T',
          badgeColor: 'bg-orange-100 text-orange-600',
          type: tripPlan.PlanTripStatus || '-',
          transactionId: tripPlan.TripNo || '-',
          companyName:
            tripPlan.TransportSupplier || tripPlan.TransportSupplierName
              ? `${tripPlan.TransportSupplier ?? ''}${tripPlan.TransportSupplier && tripPlan.TransportSupplierName ? ' - ' : ''}${tripPlan.TransportSupplierName ?? ''}`
              : '-',
          containerNumber: tripPlan.PlanTripID || '-',
          customerOrderNumber: tripPlan.TransportMode || '-',
          productId: '-',
          date: tripPlan.TripDate
            ? formatDateTime(tripPlan.TripDate)
            : '-',
        });
      });
    }

    // ✅ Return the combined list (only items with data)
    return result;
  }, [LinkedTransactions]);





  // const customerTotal = transactions
  //   .filter(t => t.badge === 'C')
  //   .reduce((sum, t) => sum + t.amount, 0);
  
  // const supplierTotal = transactions
  //   .filter(t => t.badge === 'S')
  //   .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(transaction => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    // Search across all fields
    return (
      (transaction.transactionId?.toLowerCase?.() || '').includes(query) ||
      (transaction.companyName?.toLowerCase?.() || '').includes(query) ||
      (transaction.containerNumber?.toLowerCase?.() || '').includes(query) ||
      (transaction.customerOrderNumber?.toLowerCase?.() || '').includes(query) ||
      (String(transaction.amount)?.toLowerCase?.() || '').includes(query) ||
      (transaction.productId?.toLowerCase?.() || '').includes(query) ||
      (transaction.date?.toLowerCase?.() || '').includes(query) ||
      (transaction.type?.toLowerCase?.() || '').includes(query) ||
      (transaction.orderType?.toLowerCase?.() || '').includes(query) ||
      (transaction.badge?.toLowerCase?.() || '').includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Section */}
      <div className="px-6 py-4 border-b bg-card space-y-4">
        {/* Total Net Amount */}
        {/* <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Total Net Amount</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">
            Customer € {customerTotal.toFixed(2)}
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-50">
            Supplier € {supplierTotal.toFixed(2)}
          </Badge>
        </div> */}

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          {/* <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <FileText className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No Linked Transactions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Header with Badge and Transaction ID */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      transaction.badgeColor
                    )}>
                      {transaction.badge}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{transaction.transactionId}</div>
                      <div className="text-xs text-muted-foreground">{transaction.containerNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Order Type Badge (Buy/Sell) - Only for QuickOrder */}
                    {transaction.orderType && (
                      <Badge className={cn("text-xs", getOrderTypeBadgeClass(transaction.orderType))}>
                        {transaction.orderType}
                      </Badge>
                    )}
                    {/* Status Badge */}
                    <Badge className={cn("text-xs", getStatusBadgeClass(transaction.type))}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>

                {/* Company Name */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{transaction.companyName}</span>
                </div>

                {/* Customer Order Number */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{transaction.customerOrderNumber}</span>
                </div>

                {/* Amount - Hide for TripPlan cards */}
                {transaction.amount !== undefined && (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{transaction.amount}</span>
                  </div>
                )}

                {/* Product ID */}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{transaction.productId}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{transaction.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};