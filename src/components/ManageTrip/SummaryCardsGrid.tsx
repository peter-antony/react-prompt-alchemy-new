import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Wrench, 
  AlertTriangle, Briefcase, CreditCard, 
  PackageCheck, UserRoundCheck, Settings, CarFront,HandCoins, TicketPercent } from 'lucide-react';
import { useDrawerStore } from '@/stores/drawerStore';
import { manageTripStore } from '@/stores/mangeTripStore';
import { tripService } from '@/api/services';

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
  const [vasData, setVasData] = useState<any[]>([]);
  const [vasLoading, setVasLoading] = useState(false);
  const [incidentsData, setIncidentsData] = useState<any[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  
  console.log('SummaryCardsGrid tripData:', tripData);
  const tripId: any = tripData?.Header?.TripNo;

  // const fetchVASForTrip = async (tripId: any) => {
  //   try {
  //     const res = await tripService.getVASTrip(tripId);

  //     // Assuming API response: { data: { VAS: [...] } }
  //     const vasList = res?.data?.VAS || [];
  //   } catch (error) {
  //     console.error("Error fetching VAS:", error);
  //   }
  // }

 // 🔹 Fetch VAS data once tripId changes
  useEffect(() => {
    if (!tripId) return;

    const fetchVas = async () => {
      try {
        setVasLoading(true);
        const response = await tripService.getVASTrip(tripId);

        // Assuming response format like:
        // { message: "Success", data: { VAS: [...] } }
        let vasapi: any = JSON.parse(response?.data?.ResponseData);
        const vasList =
          vasapi.VAS ||
          response?.data ||
          response?.VAS ||
          []; // normalize structure
          console.log('VAS List:', vasList);

        setVasData(vasList);
      } catch (error) {
        console.error("Error fetching VAS:", error);
        setVasData([]);
      } finally {
        setVasLoading(false);
      }
    };

    fetchVas();
  }, [tripId]);

  // 🔹 Fetch Incidents data once tripId changes
  useEffect(() => {
    if (!tripId) return;

    const fetchIncidents = async () => {
      try {
        setIncidentsLoading(true);
        const response = await tripService.getIncidentTrip(tripId);

        // Assuming response format like:
        // { message: "Success", data: { Incidents: [...] } }
        let incidentsapi: any = JSON.parse(response?.data?.ResponseData);
        const incidentsList =
          incidentsapi.Incident || []; // normalize structure
          console.log('Incidents List:', incidentsList);

        setIncidentsData(incidentsList);
      } catch (error) {
        console.error("Error fetching Incidents:", error);
        setIncidentsData([]);
      } finally {
        setIncidentsLoading(false);
      }
    };

    fetchIncidents();
  }, [tripId]);

   const handleCardClick = (cardTitle: string) => {
    if (cardTitle === 'Resources') {
      openDrawer('resources');
    } else if (cardTitle === 'VAS') {
      openDrawer('vas');
    } else if (cardTitle === 'Incidents') {
      openDrawer('incidents');
    } else if (cardTitle === 'Customer Orders') {
      openDrawer('customer-orders');
    } else if (cardTitle === 'Supplier Billing') {
      openDrawer('supplier-billing');
    } else if (cardTitle === 'Transport Route') {
      openDrawer('transport-route');
    }
  };
  const summaryCardsData = useMemo(() => {
    const customerOrders:any = tripData?.CustomerOrders || [];
    const resources:any = tripData?.ResourceDetails || {};
    const vas:any = tripData?.VAS || [];
    const incidents:any = tripData?.Incidents || [];

    const totalWeight = customerOrders
      .map((order) => order?.TotalProductWeight)
      .filter(Boolean)
      .reduce((sum, val) => sum + Number(val), 0);

    const totalVolume = customerOrders
      .map((order) => order?.TotalContainer || 0)
      .reduce((sum, val) => sum + Number(val), 0);

    return [
      {
        title: 'Customer Orders',
        icon: PackageCheck,
        values: [
          { label: 'Total Customer Order', value: customerOrders.length || 0 },
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
        values: [
          {
            label: 'No. of Resource',
            value:
              (resources?.Equipments?.length || 0) +
              (resources?.Vehicle?.length || 0) +
              (resources?.Drivers?.length || 0),
          },
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
        values: [
          { label: 'Total VAS', value: vasLoading ? "..." : (vasData?.length ?? 0), },
          // { label: 'Total Consumables', value: vas.length || 0 },
        ],
        iconColor: 'brown',
        bgColor: '#a52a2a17',
      },
      {
        title: 'Incidents',
        icon: CarFront,
        values: [
          { label: 'Total Incident', value: incidentsData.length || 0 },
          {
            label: 'Closed Incident',
            value: incidentsData?.filter((i) => i.IncidentStatus === 'CLSD' || i.IncidentStatus === 'CLOSED').length || 0,
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
      {
        title: 'Transport Route',
        icon: TicketPercent,
        values: [
          {
            label: 'Transport Route',
            value: 0,
          }
        ],
        iconColor: '#9774de',
        bgColor: '#9774de12',
      },
    ];
  }, [tripData, vasData, incidentsData]);

  // return (
  //   <div className="grid grid-cols-2 gap-6">
  //     {summaryCardsData.map((card, index) => {
  //       const Icon = card.icon;
  //       const isClickable = card.title === 'Resources' || card.title === 'VAS' || card.title === 'Incidents' || card.title === 'Customer Orders' || card.title === 'Supplier Billing';
  //       return (
  //         <Card key={index} 
  //           className={`h-fit border-[#EAECF0] rounded-sm shadow-none ${
  //             isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
  //           }`}
  //           onClick={() => isClickable && handleCardClick(card.title)}
  //         >
  //           <CardHeader className="p-4">
  //             <CardTitle className="text-md font-medium flex items-center gap-2">
  //               {/* <Icon className={`h-4 w-4 ${card.iconColor}`} /> */}
  //               {card.title == 'Customer Orders' &&
  //                 <span className='p-3 rounded-xl bg-[#F0F3FE] mr-2'> <PackageCheck size={16} color="#1036C0" strokeWidth={1.2} /></span>
  //               }
  //               {card.title == 'Resources' &&
  //                 <span className='p-3 rounded-xl bg-[#FFF1F3] mr-2'> <UserRoundCheck size={16} color="#C01048" strokeWidth={1.2} /></span>
  //               }
  //               {card.title == 'VAS' &&
  //                 <span className='p-3 rounded-xl bg-[#a52a2a17] mr-2'> <Settings size={16} color="brown" strokeWidth={1.2} /></span>
  //               }
  //               {card.title == 'Incidents' &&
  //                 <span className='p-3 rounded-xl bg-[#ff980012] mr-2'> <CarFront size={16} color="#cd5c5c" strokeWidth={1.25} /></span>
  //               }
  //               {card.title == 'Supplier Billing' &&
  //                 <span className='p-3 rounded-xl bg-[#9774de12] mr-2'> <TicketPercent size={16} color="#9774de" strokeWidth={1.2} /></span>
  //               }
  //               <span className='text-md'>{card.title}</span>
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent className="grid grid-cols-2 gap-y-2 text-sm p-4 pt-0">
  //             {card.values.map((value, valueIndex) => (
  //               <div key={valueIndex} className="flex justify-between text-sm flex-col gap-1">
  //                 <span className="text-muted-foreground">{value.label}</span>
  //                 <span className="font-medium">{value.value}</span>
  //               </div>
  //             ))}
  //           </CardContent>
  //         </Card>
  //       );
  //     })}
  //   </div>
  // );
  return (
    <div className="grid grid-cols-3 gap-4">
      {summaryCardsData.map((card, index) => {
        const Icon = card.icon;
        const isClickable =
          ['Resources', 'VAS', 'Incidents', 'Customer Orders', 'Supplier Billing', 'Transport Route'].includes(card.title);

        // Build compact label/value text
        let displayValue = '';
        let displayLabel = '';

        if (card.title === 'Incidents') {
          const total = card.values[0]?.value ?? 0;
          const closed = card.values[1]?.value ?? 0;
          displayValue = `${total} / ${closed}`;
          displayLabel = 'Total / Closed Incident';
        } else if (card.title === 'Supplier Billing') {
          displayValue = `${card.values[0]?.value || ''}`;
          displayLabel = 'Supplier Billing';
        } else {
          displayValue = `${card.values[0]?.value || 0}`;
          displayLabel = card.values[0]?.label || '';
        }

        return (
          <Card
            key={index}
            onClick={() => isClickable && handleCardClick(card.title)}
            className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
              isClickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${card.bgColor}`, color: `${card.iconColor}` }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{displayValue}</p>
                  <p className="text-sm text-muted-foreground font-medium">{displayLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

};