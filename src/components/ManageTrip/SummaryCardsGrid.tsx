import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Wrench, 
  AlertTriangle, Briefcase, CreditCard, 
  PackageCheck, UserRoundCheck, Settings, CarFront,HandCoins, TicketPercent } from 'lucide-react';

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
  // {
  //   title: 'Jobs',
  //   icon: Briefcase,
  //   values: [
  //     { label: 'Total Jobs', value: '5' },
  //     { label: 'Completed Jobs', value: '3' }
  //   ],
  //   iconColor: 'text-blue-600'
  // },
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
  <div className="grid grid-cols-2 gap-6">
    {summaryCardsData.map((card, index) => {
      const Icon = card.icon;
      return (
        <Card key={index} className="h-fit border-[#EAECF0] rounded-sm shadow-none">
          <CardHeader className="p-4">
            <CardTitle className="text-md font-medium flex items-center gap-2">
              {/* <Icon className={`h-4 w-4 ${card.iconColor}`} /> */}
              {card.title == 'Customer Orders' &&
                <span className='p-3 rounded-xl bg-[#F0F3FE] mr-2'> <PackageCheck size={16} color="#1036C0" strokeWidth={1.2} /></span>
              }
              {card.title == 'Resources' &&
                <span className='p-3 rounded-xl bg-[#FFF1F3] mr-2'> <UserRoundCheck size={16} color="#C01048" strokeWidth={1.2} /></span>
              }
              {card.title == 'VAS' &&
                <span className='p-3 rounded-xl bg-[#a52a2a17] mr-2'> <Settings size={16} color="brown" strokeWidth={1.2} /></span>
              }
              {card.title == 'Incidents' &&
                <span className='p-3 rounded-xl bg-[#ff980012] mr-2'> <CarFront size={16} color="#cd5c5c" strokeWidth={1.25} /></span>
              }
              {card.title == 'Jobs' &&
                <span className='p-3 rounded-xl bg-[#677b8512] mr-2'> <HandCoins size={16} color="#677b85" strokeWidth={1.2} />
                </span>
              }
              {card.title == 'Supplier Billing' &&
                <span className='p-3 rounded-xl bg-[#9774de12] mr-2'> <TicketPercent size={16} color="#9774de" strokeWidth={1.2} /></span>
              }
              <span className='text-md'>{card.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-y-2 text-sm p-4 pt-0">
            {card.values.map((value, valueIndex) => (
              <div key={valueIndex} className="flex justify-between text-sm flex-col gap-1">
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