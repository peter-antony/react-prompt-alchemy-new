import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Wrench, AlertTriangle, Briefcase, CreditCard } from 'lucide-react';

const summaryCardsData = [
  {
    title: 'Customer Orders',
    icon: Package,
    values: [
      { label: 'Total Customer Order', value: '100' },
      { label: 'Total Weight / Volume', value: '100 TON / 100 CBM' }
    ],
    iconColor: 'text-blue-600'
  },
  {
    title: 'Resources',
    icon: Users,
    values: [
      { label: 'No. of Resource', value: '4' },
      { label: 'Total Cost', value: 'USD 400' }
    ],
    iconColor: 'text-pink-600'
  },
  {
    title: 'VAS',
    icon: Wrench,
    values: [
      { label: 'Total VAS', value: '5' },
      { label: 'Total Consumables', value: '5' }
    ],
    iconColor: 'text-amber-600'
  },
  {
    title: 'Incidents',
    icon: AlertTriangle,
    values: [
      { label: 'Total Incident', value: '3' },
      { label: 'Closed Incident', value: '3' }
    ],
    iconColor: 'text-orange-600'
  },
  {
    title: 'Jobs',
    icon: Briefcase,
    values: [
      { label: 'Total Jobs', value: '5' },
      { label: 'Completed Jobs', value: '3' }
    ],
    iconColor: 'text-blue-600'
  },
  {
    title: 'Supplier Billing',
    icon: CreditCard,
    values: [
      { label: 'Total Requested', value: 'USD 400' },
      { label: 'Total Approved', value: 'USD 100' }
    ],
    iconColor: 'text-purple-600'
  }
];

export const SummaryCardsGrid = () => (
  <div className="grid grid-cols-2 gap-4">
    {summaryCardsData.map((card, index) => {
      const Icon = card.icon;
      return (
        <Card key={index} className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {card.values.map((value, valueIndex) => (
              <div key={valueIndex} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{value.label}</span>
                <span className="font-medium">{value.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    })}
  </div>
);