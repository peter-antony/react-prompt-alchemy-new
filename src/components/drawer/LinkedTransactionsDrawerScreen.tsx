import React, { useMemo, useState } from 'react';
import { Search, Filter, User, FileText, Calendar, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { manageTripStore } from '@/stores/mangeTripStore';

interface LinkedTransaction {
  id: string;
  transactionId: string;
  containerNumber: string;
  companyName: string;
  customerOrderNumber: string;
  amount: number;
  productId: string;
  date: string;
  type: 'buy' | 'sell';
  badge: 'C' | 'S';
  badgeColor: string;
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
    badge: 'S',
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
    badge: 'S',
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
    badge: 'S',
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

  const { QuickOrder, TripPlan } = LinkedTransactions;

  // 🔵 QuickOrder card (handle first element if array exists)
  const quickOrder = Array.isArray(QuickOrder) && QuickOrder.length > 0 ? QuickOrder[0] : null;
  const quickOrderItem = {
    id: 'quickorder',
    badge: 'Q',
    badgeColor: 'bg-blue-100 text-blue-600',
    type: quickOrder ? quickOrder.QuickOrderStatus || '-' : 'Not Available',
    transactionId: quickOrder?.QuickOrderNo || '-',
    companyName: quickOrder?.ResourcesGroupID || '-',
    containerNumber: '-',
    customerOrderNumber: '-',
    amount: quickOrder?.AmountWithCurrency?.trim() || '0.00 EUR',
    productId: '-',
    date: quickOrder?.FromDate
      ? new Date(quickOrder.FromDate).toLocaleDateString('en-GB')
      : '-',
  };

  // 🟠 TripPlan card (handle first element if array exists)
  const tripPlan = Array.isArray(TripPlan) && TripPlan.length > 0 ? TripPlan[0] : null;
  const tripPlanItem = {
    id: 'tripplan',
    badge: 'T',
    badgeColor: 'bg-orange-100 text-orange-600',
    type: tripPlan ? tripPlan.PlanTripStatus || '-' : 'Not Available',
    transactionId: tripPlan?.TripNo || '-',
    companyName: tripPlan?.TransportSupplier || '-',
    containerNumber: '-',
    customerOrderNumber: '-',
    amount: 0,
    productId: '-',
    date: tripPlan?.TripDate
      ? new Date(tripPlan.TripDate).toLocaleDateString('en-GB')
      : '-',
  };

  return [quickOrderItem, tripPlanItem];
}, [LinkedTransactions]);




  // const customerTotal = transactions
  //   .filter(t => t.badge === 'C')
  //   .reduce((sum, t) => sum + t.amount, 0);
  
  // const supplierTotal = transactions
  //   .filter(t => t.badge === 'S')
  //   .reduce((sum, t) => sum + t.amount, 0);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.containerNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Section */}
      <div className="px-6 py-4 border-b bg-card space-y-4">
        {/* Total Net Amount */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Total Net Amount</span>
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">
            {/* Customer € {customerTotal.toFixed(2)} */}
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-50">
            {/* Supplier € {supplierTotal.toFixed(2)} */}
          </Badge>
        </div>

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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="flex-1 overflow-y-auto p-6">
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
                <Badge variant={transaction.type === 'buy' ? 'default' : 'secondary'} className="text-xs">
                  {transaction.type}
                </Badge>
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

              {/* Amount */}
              <div className="flex items-center gap-2 text-sm font-medium">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">€ {transaction.amount}</span>
              </div>

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
      </div>
    </div>
  );
};