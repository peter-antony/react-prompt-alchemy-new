import { useState, useMemo, useEffect } from "react";
import { Truck, HousePlug, Box,BaggageClaim  } from "lucide-react";

import {
  Plus,
  ChevronDown,
  List,
  LayoutGrid,
  MoreVertical,
  Package,
  AlertTriangle,
  Camera,
  MapPin,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { VerticalStepper } from "../Common/VerticalStepper";
import React from "react";
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig } from '@/types/smartgrid';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { useToast } from '@/hooks/use-toast';


const summaryStats = [
  {
    icon: <Truck  className="w-5 h-5 text-blue-500"/>, // Replace with your SVG or Lucide icon
    value: "12 Nos",
    label: "Wagon Quantity",
    bg: "bg-blue-50",
    iconColor: "text-blue-500"
  },
  {
    icon: <HousePlug  className="w-5 h-5 text-purple-400"/>,
    value: "12 Nos",
    label: "Container Quantity",
    bg: "bg-purple-50",
    iconColor: "text-purple-500"
  },
  {
    icon: <Box  className="w-5 h-5 text-red-400"/>,
    value: "23 Ton",
    label: "Product Weight",
    bg: "bg-red-50",
    iconColor: "text-red-500"
  },
  {
    icon: <BaggageClaim  className="w-5 h-5 text-teal-400"/>,
    value: "10 Nos",
    label: "THU Quantity",
    bg: "bg-teal-50",
    iconColor: "text-teal-500"
  }
];

const plannedData = [
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Habbins",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "A type Wagon",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  }, {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Habbins",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Closed Wagon",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
];
const actualData = [
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
  {
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: "WAG00000001",
    name: "Zaccs",
    warning: true,
    amount: "€ 1395.00",
    location: "Frankfurt Station A - Frankfurt Station B",
    date: "12-Mar-2025 to 12-Mar-2025",
    draftBill: "DB/0000234",
  },
];
interface PlanAndActualsProps {
  view: "grid" | "list";
}

const PlanAndActuals: React.FC<PlanAndActualsProps> = ({ view }) => {
  const [tab, setTab] = useState<"planned" | "actuals">("planned");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const steps = [
    {
      label: "Resource Group Creation",
      subLabel: "R01 - Wagon Rentals",
      count: 1,
      completed: true,
    },
    {
      label: "Plan and Actuals",
      subLabel: "Total Items : 0",
      count: 2,
      completed: false,
    },
  ];

  const gridState = useSmartGridState();

  // Initialize columns and data in the grid state
  useEffect(() => {
    console.log('Initializing columns in QuickOrderManagement');
    gridState.setColumns(initialColumns);
    gridState.setGridData(processedData);
  }, []);

  // Log when columns change
  useEffect(() => {
    console.log('Columns changed in QuickOrderManagement:', gridState.columns);
    console.log('Sub-row columns:', gridState.columns.filter(col => col.subRow).map(col => col.key));
  }, [gridState.columns, gridState.forceUpdate]);

  const initialColumns: GridColumnConfig[] = [
    {
      key: 'id',
      label: 'Wagon Id Type',
      type: 'LinkWithText',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'containerID',
      label: 'Container Id Type',
      type: 'TextWithTwoRow',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'hazardousGoods',
      label: 'Hazardous Goods',
      type: 'Badge',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'departureAndArrival',
      label: 'Departure and Arrival',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },    
    {
      key: 'planFromToDate',
      label: 'Plan From & To Date',
      type: 'Text',
      // type: 'TextWithTooltip',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'price',
      label: 'Price',
      type: 'Text',
      sortable: true,
      editable: false,
      // infoTextField: 'arrivalPointDetails',
      subRow: false
    },
    {
      key: 'draftBill',
      label: 'Draft Bill',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },    
  ];

  interface PlanAndActualListData {
    id: string;
    containerID: string;
    departureAndArrival: string;
    hazardousGoods: string;
    planFromToDate: string;
    price: string;
    draftBill: string;    
  }

  const planAndActualListData: PlanAndActualListData[] = [
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
    {
      id: 'WAG00000001 Habbins',
      containerID: 'CONT10001 Container-A',
      hazardousGoods: '-',
      departureAndArrival: 'Frankfurt Station A - Frankfurt Station B',
      planFromToDate: '12-Mar-2025 to 12-Mar-2025',
      price: '$ 1395.00',
      draftBill: 'DB/0000234',
    },
  ];

  const handleLinkClick = (value: any, row: any) => {
    console.log('Link clicked:', value, row);
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log('Updating row:', updatedRow);
    // Update the grid data
    gridState.setGridData(prev => 
      prev.map((row, index) => 
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast({
      title: "Success",
      description: "Trip plan updated successfully"
    });
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    console.log('Selected rows changed:', selectedRowIndices);
    setSelectedRows(selectedRowIndices);
  };

  const processedData = useMemo(() => {
      return planAndActualListData.map(row => ({
        ...row,
        status: {
          value: row.hazardousGoods,
          // variant: getStatusColor(row.status)
        }
      }));
    }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Tabs and Stats */}
        <div className="">
          <div className="flex gap-2 mb-4">
            <div className="flex bg-gray-200 rounded-lg w-fit p-1">
              <button
                className={`px-3 py-1 rounded-lg flex font-medium text-sm transition-colors duration-200 ${tab === "planned"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500"
                  }`}
                onClick={() => setTab("planned")}
              >
                Planned <div className={`ml-1 rounded-full w-5 h-5 ${tab === "planned" ? "bg-blue-600 text-white" : ""}`}>1</div>
              </button>
              <button
                className={`px-3 py-1 rounded-lg flex font-medium text-sm transition-colors duration-200 ${tab === "actuals"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500"
                  }`}
                onClick={() => setTab("actuals")}
              >
                Actuals <div className={`ml-1 rounded-full w-5 h-5 ${tab === "actuals" ? "text-white bg-blue-600" : ""}`}>0</div>
              </button>
            </div>
          </div>
          <div className="">
            <div className="bg-white rounded-xl shadow-sm flex items-center px-4  py-4 mb-2 border border-gray-100">
              {summaryStats.map((stat, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center w-1/4 gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${stat.bg}`}>
                      <span className={stat.iconColor}>{stat.icon}</span>
                  </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-bold text-gray-900 text-base leading-tight">{stat.value}</div>
                      <div className="text-xs text-gray-400 leading-tight">{stat.label}</div>
                  </div>
                  </div>
                  {i !== summaryStats.length - 1 && (
                    <div className="h-12 w-px bg-gray-200 mx-8" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Card/List Content */}
        <div className="mt-4 mb-16">
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plannedData.map((card, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-md">
                  <div className="flex items-center mb-4 justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">{card.icon}</div>
                      <div className="ml-4">
                        <div className="font-bold text-gray-900 text-base">{card.code}</div>
                        <div className="text-xs text-gray-400 font-medium mt-0.5">{card.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {card.warning && (
                        <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
                      )}
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <Camera className="w-5 h-5 text-gray-400 mr-2" />
                    {card.amount}
                  </div>
                  <div className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                    {card.location}
                  </div>
                  <div className="flex items-center text-gray-700 text-sm font-medium mb-2">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    {card.date}
                  </div>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <LinkIcon className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="underline cursor-pointer">Draft Bill : {card.draftBill}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-0 py-3 w-full">
                <div className="overflow-x-auto w-full">
                  <div className="min-w-[900px]"> {/* Adjust min-width as needed for your columns */}
                    <SmartGrid
                      key={`grid-${gridState.forceUpdate}`}
                      columns={gridState.columns}
                      data={gridState.gridData.length > 0 ? gridState.gridData : processedData}
                      editableColumns={['customerSub']}
                      paginationMode="pagination"
                      onLinkClick={handleLinkClick}
                      onUpdate={handleUpdate}
                      onSubRowToggle={gridState.handleSubRowToggle}
                      selectedRows={selectedRows}
                      onSelectionChange={handleRowSelection}
                      rowClassName={(row: any, index: number) =>
                        selectedRows.has(index) ? 'smart-grid-row-selected' : ''
                      }
                      showDefaultConfigurableButton={false}
                      gridTitle="Plan List"
                      recordCount={gridState.gridData.length > 0 ? gridState.gridData.length : processedData.length}
                      showCreateButton={true}
                      searchPlaceholder="Search"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
} 

export default PlanAndActuals;