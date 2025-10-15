import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, ChevronDown, ChevronUp, Plus, User, FileText, MapPin, Truck, Package, Calendar, Info, Trash2, RefreshCw, Send, AlertCircle, Download, Filter, CheckSquare, MoreVertical, Container, Box, Boxes, Search, Clock, PackageCheck, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '../ui/card';
import { useTripExecutionDrawerStore } from '@/stores/tripExecutionDrawerStore';
import { SmartGridWithGrouping } from '../SmartGrid/SmartGridWithGrouping';
import { useFilterStore } from '@/stores/filterStore';
import { useToast } from '../ui/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { GridColumnConfig } from '@/types/smartgrid';


export const ConsignmentTrip = ({ legId }) => {
  const gridPlanId = 'ConsignmentTripPlanGrid';
  const gridActualId = 'ConsignmentTripActualGrid';
  const { activeFilters, setActiveFilters } = useFilterStore();
  // const filtersForThisGrid = activeFilters[gridId] || {};
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [searchData, setSearchData] = useState<Record<string, any>>({});
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { toast } = useToast();
  const [expandedPlanned, setExpandedPlanned] = useState(true);
  const [expandedActuals, setExpandedActuals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pickupComplete, setPickupComplete] = useState(false);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState('0');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  const [plannedData, setPlannedData] = useState<any[]>([]);
  const [actualData, setActualData] = useState<any[]>([]);
  const [currentLeg, setCurrentLeg] = useState<string | null>(null);

  const plannedColumns: GridColumnConfig[] = [
    {
      key: 'WagonId',
      label: 'Wagon ID',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'WagonType',
      label: 'Wagon Type',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'WagonQty',
      label: 'Wagon Quantity',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'ContainerType',
      label: 'Container Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ContainerId',
      label: 'Container ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'Product',
      label: 'Product',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ProductWeightUOM',
      label: 'Product Weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'WagonAvgLoadWeight',
      label: 'Wagon Avg Load weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonAvgTareWeight',
      label: 'Wagon Avg Tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonWeightUOM',
      label: 'Wagon weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonAvgLength',
      label: 'Wagon avg length',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonAvgLengthUOM',
      label: 'Wagon avg length UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerAvgTareWeight',
      label: 'Container Avg tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerAvgLoadWeight',
      label: 'Container Avg load weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerWeightUOM',
      label: 'Container weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerWeightUOM',
      label: 'Container weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuId',
      label: 'Thu ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuSerialNo',
      label: 'THU Serial no',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuQty',
      label: 'THU Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuWeight',
      label: 'THU Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuWeightUOM',
      label: 'THU weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks1',
      label: 'Remarks1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks2',
      label: 'Remarks2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks3',
      label: 'Remarks3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonTareWeight',
      label: 'Wagon Tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonTareWeightUOM',
      label: 'Wagon Tare weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'GrossWeight',
      label: 'Gross weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'GrossWeightUOM',
      label: 'Gross weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonLength',
      label: 'Wagon length',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported1',
      label: 'Last Commodity Transported 1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported2',
      label: 'Last Commodity Transported 2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported3',
      label: 'Last Commodity Transported 3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    }
  ];

  const actualColumns: GridColumnConfig[] = [
    {
      key: 'Wagon',
      label: 'Wagon ID',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'WagonType',
      label: 'Wagon Type',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'WagonQty',
      label: 'Wagon Quantity',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false
    },
    {
      key: 'ContainerType',
      label: 'Container Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ContainerDescription',
      label: 'Container ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'Product',
      label: 'Product',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'ProductWeightUOM',
      label: 'Product Weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false
    },
    {
      key: 'WagonPosition',
      label: 'Wagon Position',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: true
    },
    {
      key: 'WagonQtyUOM',
      label: 'Wagon Qty UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: true
    },
    {
      key: 'ContainerQtyUOM',
      label: 'Container Qty UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: true
    },
    {
      key: 'Thu',
      label: 'THU',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuSerialNo',
      label: 'THU Serial No',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuQty',
      label: 'THU Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuWeight',
      label: 'THU Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ThuWeightUOM',
      label: 'THU Weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntingOption',
      label: 'Shunting Option',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ReplacedWagon',
      label: 'Replaced Wagon',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntingReasonCode',
      label: 'Shunting Reason Code',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks',
      label: 'Remarks',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntInLocationDescription',
      label: 'Shunt In Location',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntOutLocationDescription',
      label: 'Shunt Out Location',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntInDate',
      label: 'Shunt In Date',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntInTime',
      label: 'Shunt In Time',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntOutDate',
      label: 'Shunt Out Time',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ShuntOutTime',
      label: 'Shunt Out Time',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ClassOfStores',
      label: 'Class Of Stores',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'NHMDescription',
      label: 'NHM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'UNCodeDescription',
      label: 'UN Code',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'DGClass',
      label: 'DG Class',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainsHazardousGoods',
      label: 'Contains Hazardous Goods',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonSealNo',
      label: 'Wagon Seal No.',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerSealNo',
      label: 'Container Seal No.',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerTareWeight',
      label: 'Container Tare Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'ContainerTareWeightUOM',
      label: 'Container Tare Weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported1',
      label: 'Last Commodity Transported 1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported2',
      label: 'Last Commodity Transported 2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'LastCommodityTransported3',
      label: 'Last Commodity Transported 3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonTareWeight',
      label: 'Wagon Tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonTareWeightUOM',
      label: 'Wagon Tare weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonLength',
      label: 'Wagon Length',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'WagonLengthUOM',
      label: 'Wagon length UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCode1',
      label: 'Quick code 1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCode2',
      label: 'Quick code 2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCode3',
      label: 'Quick code 3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCodeValue1',
      label: 'Quick code Value 1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCodeValue2',
      label: 'Quick code Value 2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'QuickCodeValue3',
      label: 'Quick code Value 3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks1',
      label: 'Remarks1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks2',
      label: 'Remarks2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
    {
      key: 'Remarks3',
      label: 'Remarks3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true
    },
  ];

  const { getConsignments } = useTripExecutionDrawerStore();
  const consignments = getConsignments(legId) || [];

  // Step 1: Build Customer Order dropdown list
  const buildCustomerOrderList = (consignments: any[] = []) => {
    return consignments.map((item, index) => ({
      label: `${item.CustomerID || '-'} — ${item.CustomerName || "-"}`,
      value: index.toString(),
      departureFrom: item.DepartureFrom,
      departureTo: item.DepartureTo,
      loadType: item.LoadType,
      serviceDesc: item.ServiceDescription,
      subServiceDesc: item.SubServiceDescription,
      customerRefNo: item.CustomerReferenceNo,
      SourceBRId: item.SourceBRId,
      ReturnBRId: item.ReturnBRId,

      // Totals
      WagonQuantity: item.TotalWagons,
      ContainerQuantity: item.TotalContainer,
      ProductWeight: item.TotalProductWeight,
      TotalTHU: item.TotalTHU,
      // HazardousGoods: item.HazardousGoods,
    }));
  };

  // Step 2: Load fresh data whenever legId changes
  useEffect(() => {
    if (!legId) return;

    // detect leg change
    if (legId !== currentLeg) {
      setCurrentLeg(legId);

      const cons = getConsignments(legId) || [];
      if (cons.length > 0) {
        const list = buildCustomerOrderList(cons);
        setCustomerList(list);

        // ✅ reset selection to 0 for new leg
        setSelectedCustomerIndex('0');
        const selected = cons[0];
        setSelectedCustomerData(selected);
        setPlannedData(selected?.Planned ?? []);
        setActualData(selected?.Actual ?? []);
        console.log('Planned legid', plannedData, actualData);
      } else {
        // reset everything if no consignment for new leg
        setCustomerList([]);
        setSelectedCustomerIndex('');
        setSelectedCustomerData(null);
        setPlannedData([]);
        setActualData([]);
        console.log('Planned No', plannedData, actualData);
      }
    }
  }, [legId]); // only on leg change

  // Step 3: Keep selection stable if same leg data updates
  useEffect(() => {
    if (currentLeg && consignments.length > 0) {
      const list = buildCustomerOrderList(consignments);
      setCustomerList(list);

      const selectedIndex = parseInt(selectedCustomerIndex || '0', 10);
      const selected = consignments[selectedIndex];
      if (selected) {
        setSelectedCustomerData(selected);
        const plannedConsignments = selected?.Planned ?? [];
        const actualConsignments = selected?.Actual ?? [];

        // Update component state with the data
        setPlannedData(plannedConsignments);
        setActualData(actualConsignments);

        // Set the columns once
        // setColumns(initialColumns());
      }
    }
  }, [consignments, selectedCustomerIndex, plannedData, actualData]); // re-sync when consignments or selection changes

  // Step 4: Handle dropdown change
  const handleCustomerChange = (idx: string) => {
    setSelectedCustomerIndex(idx);
    // Let the useEffect hook handle the data updates
  };

  return (
    <TabsContent value="consignment" className="flex-1 flex flex-col m-0">
      {/* Warning Alert */}
      {/* <Alert className="mx-6 mt-4 mb-2 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
          Kindly take note that the Actual {'<<'} weight/length/wagon quantity {'>>'} is higher than the allowed limit. Please check path constraints for more details.
        </AlertDescription>
      </Alert> */}

      {/* Consignment Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Consignment Details</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              Add Actuals
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </Button>
          </div>
        </div>

        {/* CO Selection */}
        {/* <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <Select defaultValue="CO000000001">
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Select CO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CO000000001">CO000000001</SelectItem>
              <SelectItem value="CO000000002">CO000000002</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pickup-complete-consignment"
              checked={pickupComplete}
              onCheckedChange={(checked) => setPickupComplete(checked as boolean)}
            />
            <Label htmlFor="pickup-complete-consignment" className="text-sm font-normal cursor-pointer">
              Pickup Complete for this CO
            </Label>
          </div>
        </div> */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <Select value={selectedCustomerIndex} onValueChange={handleCustomerChange}>
            <SelectTrigger className="w-[240px] h-9">
              <SelectValue placeholder="Select Customer Order" />
            </SelectTrigger>
            <SelectContent>
              {customerList.map((cust) => (
                <SelectItem key={cust.value} value={cust.value}>
                  {cust.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pickup-complete-consignment"
              checked={pickupComplete}
              onCheckedChange={(checked) => setPickupComplete(checked as boolean)}
            />
            <Label htmlFor="pickup-complete-consignment" className="text-sm font-normal cursor-pointer">
              Pickup Complete for this CO
            </Label>
          </div>
        </div>
        <div className='space-y-2 p-4 bg-muted/30 rounded-lg'>
          {/* 🔹 CO Info Section */}
          {selectedCustomerData && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="font-medium text-gray-700">Departure: </span>
                {selectedCustomerData?.DepartureFrom || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Arrival: </span>
                {selectedCustomerData?.DepartureTo || "-"}
              </div>
              {/* <div>
                <span className="font-medium text-gray-700">Customer Order No: </span>
                {selectedCustomerData?.CustomerOrderNo || "-"}
              </div> */}
              <div>
                <span className="font-medium text-gray-700">Load Type: </span>
                {selectedCustomerData?.LoadType || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Service: </span>
                {selectedCustomerData?.serviceDesc || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Sub Service: </span>
                {selectedCustomerData?.subServiceDesc || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer Ref No: </span>
                {selectedCustomerData?.CustomerRefNo || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Source BR ID: </span>
                {selectedCustomerData?.SourceBRID || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Return BR ID: </span>
                {selectedCustomerData?.ReturnBRID || "-"}
              </div>
            </div>
          )}
        </div>


        {/* Planned Section */}
        <div className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
            onClick={() => setExpandedPlanned(!expandedPlanned)}
          >
            <h4 className="font-semibold flex items-center gap-2">
              Planned
              <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                {plannedData.length}
              </Badge>
            </h4>
            {expandedPlanned ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <AnimatePresence>
            {expandedPlanned && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.WagonQuantity ? selectedCustomerData.WagonQuantity : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">Wagon Quantity</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Container className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.ContainerQuantity ? selectedCustomerData?.ContainerQuantity : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">Container Quantity</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                        <Box className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.ProductWeight ? selectedCustomerData?.ProductWeight : '-'} Ton</div>
                        <div className="text-xs text-muted-foreground">Product Weight</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <PackageCheck className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalTHU ? selectedCustomerData?.TotalTHU : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">THU Quantity</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Plan List */}
                <div className="space-y-4">
                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden pt-2">
                    {/* Planned Grid */}
                    {plannedData && (
                      <SmartGridWithGrouping
                        columns={plannedColumns}
                        data={plannedData}
                        groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
                        showGroupingDropdown={true}
                        editableColumns={['plannedStartEndDateTime']}
                        paginationMode="pagination"
                        selectedRows={selectedRows}
                        rowClassName={(row: any, index: number) => {
                          return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                        }}
                        showDefaultConfigurableButton={false}
                        gridTitle="Planned"
                        recordCount={plannedData.length}
                        searchPlaceholder="Search"
                        clientSideSearch={true}
                        showSubHeaders={false}
                        hideAdvancedFilter={true}
                        gridId={gridPlanId}
                        userId="current-user"
                      />
                    )}

                    {/* Actual Grid */}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actuals Section */}
        <div className="space-y-4">
          <div
            className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
            onClick={() => setExpandedActuals(!expandedActuals)}
          >
            <h4 className="font-semibold flex items-center gap-2">
              Actuals
              <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                {actualData.length}
              </Badge>
            </h4>
            {expandedActuals ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <AnimatePresence>
            {expandedActuals && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.WagonQuantity ? selectedCustomerData?.WagonQuantity : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">Wagon Quantity</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Container className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.ContainerQuantity ? selectedCustomerData?.ContainerQuantity : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">Container Quantity</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                        <Box className="h-5 w-5 text-pink-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.ProductWeight ? selectedCustomerData?.ProductWeight : '-'} Ton</div>
                        <div className="text-xs text-muted-foreground">Product Weight</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <PackageCheck className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalTHU ? selectedCustomerData?.TotalTHU : '-'} Nos</div>
                        <div className="text-xs text-muted-foreground">THU Quantity</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Actual List */}
                <div className="space-y-4">
                  {/* Table */}
                  <div className="border rounded-lg overflow-hidden pt-2">
                    {actualData && (
                      <SmartGridWithGrouping
                        columns={actualColumns}
                        data={actualData}
                        groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
                        showGroupingDropdown={true}
                        paginationMode="pagination"
                        selectedRows={selectedRows}
                        rowClassName={(row: any, index: number) => {
                          return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                        }}
                        showDefaultConfigurableButton={false}
                        gridTitle="Actuals"
                        recordCount={actualData.length}
                        showCreateButton={false}
                        searchPlaceholder="Search"
                        clientSideSearch={true}
                        showSubHeaders={false}
                        hideAdvancedFilter={true}
                        hideCheckboxToggle={true}
                        gridId={gridActualId}
                        userId="current-user"
                        editableColumns={['plannedStartEndDateTime']}

                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TabsContent>
  );
};