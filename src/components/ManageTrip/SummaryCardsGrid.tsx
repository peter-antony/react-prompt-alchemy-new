import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Wrench, 
  AlertTriangle, Briefcase, CreditCard, 
  PackageCheck, UserRoundCheck, Settings, CarFront,HandCoins, TicketPercent } from 'lucide-react';
import { useDrawerStore } from '@/stores/drawerStore';
import { manageTripStore } from '@/stores/mangeTripStore';

// const summaryCardsData = [
//   {
//     title: 'Customer Orders',
//     icon: Package,
//     values: [
//       { label: 'Total Customer Order', value: '100' },
//       { label: 'Total Weight / Volume', value: '100 TON / 100 CBM' }
//     ],
//     iconColor: 'text-blue-600'
//   },
//   {
//     title: 'Resources',
//     icon: Users,
//     values: [
//       { label: 'No. of Resource', value: '4' },
//       { label: 'Total Cost', value: 'USD 400' }
//     ],
//     iconColor: 'text-pink-600'
//   },
//   {
//     title: 'VAS',
//     icon: Wrench,
//     values: [
//       { label: 'Total VAS', value: '5' },
//       { label: 'Total Consumables', value: '5' }
//     ],
//     iconColor: 'text-amber-600'
//   },
//   {
//     title: 'Incidents',
//     icon: AlertTriangle,
//     values: [
//       { label: 'Total Incident', value: '3' },
//       { label: 'Closed Incident', value: '3' }
//     ],
//     iconColor: 'text-orange-600'
//   },
//   // {
//   //   title: 'Jobs',
//   //   icon: Briefcase,
//   //   values: [
//   //     { label: 'Total Jobs', value: '5' },
//   //     { label: 'Completed Jobs', value: '3' }
//   //   ],
//   //   iconColor: 'text-blue-600'
//   // },
//   {
//     title: 'Supplier Billing',
//     icon: CreditCard,
//     values: [
//       { label: 'Total Requested', value: 'USD 400' },
//       { label: 'Total Approved', value: 'USD 100' }
//     ],
//     iconColor: 'text-purple-600'
//   }
// ];

export const SummaryCardsGrid = () => {
  const { openDrawer } = useDrawerStore();
  const { tripData } = manageTripStore();
  console.log('SummaryCardsGrid tripData:', tripData);

  const handleCardClick = (cardTitle: string) => {
    if (cardTitle === 'Resources') openDrawer('resources');
    else if (cardTitle === 'VAS') openDrawer('vas');
    else if (cardTitle === 'Incidents') openDrawer('incidents');
    else if (cardTitle === 'Customer Orders') openDrawer('customer-orders');
    else if (cardTitle === 'Supplier Billing') openDrawer('supplier-billing');
  };

  const summaryCardsData = useMemo(() => {
    const customerOrders: any = tripData?.CustomerOrders || [];
    const resources: any = tripData?.ResourceDetails || {};
    const vas: any = tripData?.VAS || [];
    const incidents: any = tripData?.Incidents || [];

    const totalWeight = customerOrders
      .map((order) => order?.TotalProductWeight)
      .filter(Boolean)
      .reduce((sum, val) => sum + Number(val), 0);

    const totalVolume = customerOrders
      .map((order) => order?.TotalContainer || 0)
      .reduce((sum, val) => sum + Number(val), 0);

    const totalResources =
      (resources?.Equipments?.length || 0) +
      (resources?.Vehicle?.length || 0) +
      (resources?.Drivers?.length || 0);

    return [
      {
        title: 'Customer Orders',
        icon: PackageCheck,
        value: customerOrders.length || 0, // move value next to title
        values: [
          // { label: 'Total Customer Order', value: customerOrders.length || 0 },
          // {
          //   label: 'Total Weight / Volume',
          //   value: `${totalWeight} KG / ${totalVolume} Units`,
          // },
        ],
        iconColor: '#1036C0',
        bgColor: '#F0F3FE',
      },
      {
        title: 'Resources',
        icon: UserRoundCheck,
        value: totalResources, // move value next to title
        values: [
          // {
          //   label: 'No. of Resource',
          //   value: totalResources,
          // },
          // {
          //   label: 'Total Cost',
          //   value: `USD ${resources?.Supplier?.[0]?.Cost || 0}`,
          // },
        ],
        iconColor: '#C01048',
        bgColor: '#FFF1F3',
      },
      {
        title: 'VAS',
        icon: Settings,
        value: vas.length || 0, // move value next to title
        values: [
          // { label: 'Total VAS', value: vas.length || 0 },
          // { label: 'Total Consumables', value: vas.length || 0 },
        ],
        iconColor: 'brown',
        bgColor: '#a52a2a17',
      },
      {
        title: 'Incidents',
        icon: CarFront,
        values: [
          { label: 'Total Incident', value: incidents.length || 0 },
          {
            label: 'Closed Incident',
            value: incidents.filter((i) => i.Status === 'Closed').length || 0,
          },
        ],
        iconColor: '#cd5c5c',
        bgColor: '#ff980012',
      },
      {
        title: 'Supplier Billing',
        icon: TicketPercent,
        values: [
          {
            label: 'Total Requested',
            value: tripData?.Header?.BillingValueWithCurrency || 'USD 0',
          },
          {
            label: 'Total Approved',
            value: tripData?.Header?.UpdatedBillingValue || 'USD 0',
          },
        ],
        iconColor: '#9774de',
        bgColor: '#9774de12',
      },
    ];
  }, [tripData]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {summaryCardsData.map((card, index) => {
        const isClickable = ['Resources', 'VAS', 'Incidents', 'Customer Orders', 'Supplier Billing'].includes(
          card.title
        );
        return (
          <Card
            key={index}
            className={`h-[140px] border-[#EAECF0] rounded-sm shadow-none ${
              isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={() => isClickable && handleCardClick(card.title)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-md font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {card.title === 'Customer Orders' && (
                    <span className="p-3 rounded-xl bg-[#F0F3FE] mr-2">
                      <PackageCheck size={16} color="#1036C0" strokeWidth={1.2} />
                    </span>
                  )}
                  {card.title === 'Resources' && (
                    <span className="p-3 rounded-xl bg-[#FFF1F3] mr-2">
                      <UserRoundCheck size={16} color="#C01048" strokeWidth={1.2} />
                    </span>
                  )}
                  {card.title === 'VAS' && (
                    <span className="p-3 rounded-xl bg-[#a52a2a17] mr-2">
                      <Settings size={16} color="brown" strokeWidth={1.2} />
                    </span>
                  )}
                  {card.title === 'Incidents' && (
                    <span className="p-3 rounded-xl bg-[#ff980012] mr-2">
                      <CarFront size={16} color="#cd5c5c" strokeWidth={1.25} />
                    </span>
                  )}
                  {card.title === 'Supplier Billing' && (
                    <span className="p-3 rounded-xl bg-[#9774de12] mr-2">
                      <TicketPercent size={16} color="#9774de" strokeWidth={1.2} />
                    </span>
                  )}
                  <span>{card.title}</span>
                </div>
                {/* display main value next to title if defined */}
                {card.value !== undefined && <span className="text-lg font-semibold">{card.value}</span>}
              </CardTitle>
            </CardHeader>
            {card.values.length > 0 && (
              <CardContent className="grid grid-cols-2 gap-y-2 text-sm p-4 pt-0">
                {card.values.map((value, valueIndex) => (
                  <div key={valueIndex} className="flex justify-between text-sm flex-col gap-1">
                    <span className="text-muted-foreground">{value.label}</span>
                    <span className="font-medium">{value.value}</span>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
