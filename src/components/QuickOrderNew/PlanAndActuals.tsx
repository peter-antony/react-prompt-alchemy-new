import { useState, useEffect, useMemo } from "react";
import { Truck, HousePlug, Box, BaggageClaim, Package, AlertTriangle, Camera, MapPin, Calendar, Link as LinkIcon, MoreVertical } from "lucide-react";
import { SmartGrid } from '@/components/SmartGrid';
import { GridColumnConfig } from '@/types/smartgrid';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { useToast } from '@/hooks/use-toast';
import jsonStore from "@/stores/jsonStore";
import { useNavigate } from 'react-router-dom';
import { SideDrawer } from '../Common/SideDrawer';
import { PlanAndActualDetails } from "./PlanAndActualDetails";
const summaryStats = [
  {
    icon: <Truck className="w-5 h-5 text-blue-500" />,
    value: "12 Nos",
    label: "Wagon Quantity",
    bg: "bg-blue-50",
    iconColor: "text-blue-500"
  },
  {
    icon: <HousePlug className="w-5 h-5 text-purple-400" />,
    value: "12 Nos",
    label: "Container Quantity",
    bg: "bg-purple-50",
    iconColor: "text-purple-500"
  },
  {
    icon: <Box className="w-5 h-5 text-red-400" />,
    value: "23 Ton",
    label: "Product Weight",
    bg: "bg-red-50",
    iconColor: "text-red-500"
  },
  {
    icon: <BaggageClaim className="w-5 h-5 text-teal-400" />,
    value: "10 Nos",
    label: "THU Quantity",
    bg: "bg-teal-50",
    iconColor: "text-teal-500"
  }
];

const initialColumns: GridColumnConfig[] = [
  {
    key: 'id',
    label: 'Wagon Id Type',
    type: 'Link',
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
  PlanLineUniqueID?: string;
}

interface PlanAndActualsProps {
  view: string;
  resouceId?: string;
  isEditQuickOrder?: boolean;

}

const PlanAndActuals: React.FC<PlanAndActualsProps> = ({ view, resouceId, isEditQuickOrder }) => {
  const [tab, setTab] = useState<"planned" | "actuals">("planned");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const gridState = useSmartGridState();
  const [planAndActualListData, setPlanAndActualListData] = useState<PlanAndActualListData[]>([]);
  const [isPlanActualsOpen, setIsPlanActualsOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState({
    keyName: null,
    value: null,
    resourceId: null,
  });
  // Fetch and map plan data when resourceId changes
  useEffect(() => {
    const arr = jsonStore.getAllPlanDetailsByResourceUniqueID(resouceId);
    const mapped = arr.map((plan: any) => ({
      id: `${plan.WagonDetails?.WagonID || ''}-${plan.WagonDetails?.WagonType || ''}`.replace(/^[-]+|[-]+$/g, ''),
      containerID: `${plan.ContainerDetails?.ContainerID || ''} ${plan.ContainerDetails?.ContainerType || ''}`.trim(),
      hazardousGoods: plan.ProductDetails?.ContainHazardousGoods || '-',
      departureAndArrival: `${plan.JourneyAndSchedulingDetails?.Departure || ''} - ${plan.JourneyAndSchedulingDetails?.Arrival || ''}`.trim(),
      planFromToDate: '12-Mar-2025 to 12-Mar-2025', // Replace with actual date logic if needed
      price: '$ 1395.00', // Replace with actual price if needed
      draftBill: 'DB/0000234', // Replace with actual draft bill if needed
      PlanLineUniqueID: plan.PlanLineUniqueID || '',
    }));
    setPlanAndActualListData(mapped);
    gridState.setColumns(initialColumns);
    gridState.setGridData(mapped);
  }, [resouceId]);

  // Log when columns change
  useEffect(() => {
    console.log('Columns changed in QuickOrderManagement:', gridState.columns);
    console.log('Sub-row columns:', gridState.columns.filter(col => col.subRow).map(col => col.key));
  }, [gridState.columns, gridState.forceUpdate]);

  const steps = [
    {
      label: "Resource Group Creation",
      subLabel: "R01 - Wagon Rentals",
      count: 1,
      completed: true,
    },
    {
      label: "Plan and Actuals",
      subLabel: `Total Items : ${planAndActualListData.length}`,
      count: 2,
      completed: false,
    },
  ];
  const navigate = useNavigate();
  const handleLinkClick = (row: any, columnKey: any) => {
    console.log('Link clicked:', columnKey, row.PlanLineUniqueID);
    if (columnKey === 'id' && row.PlanLineUniqueID) {
      setPlanInfo({
        keyName: 'PlanLineUniqueID',  
        value: row.PlanLineUniqueID,
        resourceId: resouceId,
      });
      setIsPlanActualsOpen(true);
    }
  };

  const handleUpdate = async (updatedRow: any) => {
    console.log('Updating row:', updatedRow);
    gridState.setGridData(prev =>
      prev.map((row, index) =>
        index === updatedRow.index ? { ...row, ...updatedRow } : row
      )
    );
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Success",
      description: "Trip plan updated successfully"
    });
  };

  const handleRowSelection = (selectedRowIndices: Set<number>) => {
    setSelectedRows(selectedRowIndices);
  };

  // For SmartGrid processed data (add status if needed)
  const processedData = useMemo(() => {
    return planAndActualListData.map(row => ({
      ...row,
      status: {
        value: row.hazardousGoods,
      }
    }));
  }, [planAndActualListData]);

  // Card data for grid view
  const plannedData = useMemo(() => planAndActualListData.map(row => ({
    icon: <Package className="w-7 h-7 text-teal-500" />,
    code: row.id,
    name: "",
    warning: true,
    amount: row.price,
    location: row.departureAndArrival,
    date: row.planFromToDate,
    draftBill: row.draftBill,
  })), [planAndActualListData]);

  return (
    <div className="flex min-h-screen bg-[#f8fafd]">
      <div className="flex-1 flex flex-col">
        {/* Tabs and Stats */}
        <div>
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
          <div>
            <div className="bg-white rounded-xl shadow-sm flex items-center px-4 py-4 mb-2 border border-gray-100">
              {summaryStats.map((stat, i) => (
                <div key={i} className="flex items-center w-1/4 gap-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${stat.bg}`}>
                    <span className={stat.iconColor}>{stat.icon}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-gray-900 text-base leading-tight">{stat.value}</div>
                    <div className="text-xs text-gray-400 leading-tight">{stat.label}</div>
                  </div>
                  {i !== summaryStats.length - 1 && (
                    <div className="h-12 w-px bg-gray-200 mx-8" />
                  )}
                </div>
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
                  <div className="min-w-[900px]">
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
      {/* SideDrawer component */}
      isPlanActualsOpen-{isPlanActualsOpen}
      <SideDrawer isOpen={isPlanActualsOpen} onClose={() => setIsPlanActualsOpen(false)} width='85%' title="Plan and Actual Details" isBack={false}>
        <div>
          {/* <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)}></PlanAndActualDetails> */}
          <PlanAndActualDetails onCloseDrawer={() => setIsPlanActualsOpen(false)} isEditQuickOrder={isEditQuickOrder}  PlanInfo={planInfo}></PlanAndActualDetails>

        </div>
      </SideDrawer>
    </div>
  );
};

export default PlanAndActuals;