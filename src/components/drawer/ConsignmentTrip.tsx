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
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '../ui/card';
import { useTripExecutionDrawerStore } from '@/stores/tripExecutionDrawerStore';
import { SmartGridWithGrouping } from '../SmartGrid/SmartGridWithGrouping';
// import { quickOrderService } from "@/api/services/quickOrderService";
import { tripService } from "@/api/services/tripService";
import { ActualSmartGridPlus } from '../SmartGrid/ActualSmartGridPlus';
import jsonStore from '@/stores/jsonStore';
import { useFilterStore } from '@/stores/filterStore';
import { useToast } from '../ui/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';
import { GridColumnConfig } from '@/types/smartgrid';
import { PlanActualDetailsDrawer } from './PlanActualsConsignments';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { quickOrderService } from '@/api/services/quickOrderService';
import { manageTripStore } from '@/stores/mangeTripStore';

// Helper function to safely split values from LazySelect
const safeSplit = (value: string | undefined, delimiter: string, index: number, fallback: string = ''): string => {
  if (!value || typeof value !== 'string') return fallback;
  const parts = value.split(delimiter);
  return parts[index] || fallback;
};

export const ConsignmentTrip = ({ legId, tripData }: { legId: string, tripData?: any }) => {
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
  const [sourceBRId, setSourceBRId] = useState<string>("");
  const [returnBRId, setReturnBRId] = useState<string>("");
  const [plannedData, setPlannedData] = useState<any[]>([]);
  const [actualData, setActualData] = useState<any[]>([]);
  const [actualEditableData, setActualEditableData] = useState<any[]>([]);
  const hasUserEditsRef = useRef(false);
  const [currentLeg, setCurrentLeg] = useState<string | null>(null);
  const [showPlanActualDrawer, setShowPlanActualDrawer] = useState(false);
  const [currentEditingRowIndex, setCurrentEditingRowIndex] = useState<number | null>(null);
  const [wagonQtyUOMOptions, setWagonQtyUOMOptions] = useState<string[]>([]);
  const [weightList, setWeightList] = useState<any>([]);
  const [productQtyUomOptions, setProductQtyUomOptions] = useState<string[]>([]);
  const [thuQtyUOMOptions, setThuQtyUOMOptions] = useState<string[]>([]);
  const [containerQtyUOMOptions, setContainerQtyUOMOptions] = useState<string[]>([]);
  const [wagonlengthUOMOptions, setWagonLengthUOMOptions] = useState<string[]>([]);
  // Initialize dropdown state variables when selectedCustomerData changes
  useEffect(() => {
    if (selectedCustomerData) {
      if (selectedCustomerData?.SourceBRId) {
        setSourceBRId(selectedCustomerData?.SourceBRId || "");
      }
      if (selectedCustomerData?.ReturnBRId) {
        setReturnBRId(selectedCustomerData?.ReturnBRId || "");
      }
    }
  }, [selectedCustomerData]);

  const plannedColumns: GridColumnConfig[] = [
    {
      key: 'WagonId',
      label: 'Wagon ID',
      type: 'Link',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 120
    },
    {
      key: 'WagonType',
      label: 'Wagon Type',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 140
    },
    {
      key: 'WagonQty',
      label: 'Wagon Quantity',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 150
    },
    {
      key: 'ContainerType',
      label: 'Container Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 150
    },
    {
      key: 'ContainerId',
      label: 'Container ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 140
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 140
    },
    {
      key: 'Product',
      label: 'Product',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 120
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 150
    },
    {
      key: 'ProductWeightUOM',
      label: 'Product Weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 180
    },
    {
      key: 'WagonAvgLoadWeight',
      label: 'Wagon Avg Load weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'WagonAvgTareWeight',
      label: 'Wagon Avg Tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'WagonWeightUOM',
      label: 'Wagon weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 180
    },
    {
      key: 'WagonAvgLength',
      label: 'Wagon avg length',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 170
    },
    {
      key: 'WagonAvgLengthUOM',
      label: 'Wagon avg length UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'ContainerAvgTareWeight',
      label: 'Container Avg tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 220
    },
    {
      key: 'ContainerAvgLoadWeight',
      label: 'Container Avg load weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 220
    },
    {
      key: 'ContainerWeightUOM',
      label: 'Container weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'ContainerWeightUOM',
      label: 'Container weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'ThuId',
      label: 'Thu ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 100
    },
    {
      key: 'ThuSerialNo',
      label: 'THU Serial no',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 140
    },
    {
      key: 'ThuQty',
      label: 'THU Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 100
    },
    {
      key: 'ThuWeight',
      label: 'THU Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 120
    },
    {
      key: 'ThuWeightUOM',
      label: 'THU weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 160
    },
    {
      key: 'Remarks1',
      label: 'Remarks1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 120
    },
    {
      key: 'Remarks2',
      label: 'Remarks2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 120
    },
    {
      key: 'Remarks3',
      label: 'Remarks3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 120
    },
    {
      key: 'WagonTareWeight',
      label: 'Wagon Tare weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 180
    },
    {
      key: 'WagonTareWeightUOM',
      label: 'Wagon Tare weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'GrossWeight',
      label: 'Gross weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 130
    },
    {
      key: 'GrossWeightUOM',
      label: 'Gross weight UOM',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 170
    },
    {
      key: 'WagonLength',
      label: 'Wagon length',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 140
    },
    {
      key: 'LastCommodityTransported1',
      label: 'Last Commodity Transported 1',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 250
    },
    {
      key: 'LastCommodityTransported2',
      label: 'Last Commodity Transported 2',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 250
    },
    {
      key: 'LastCommodityTransported3',
      label: 'Last Commodity Transported 3',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 250
    }
  ];

  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} `,
            value: `${item.id} `,
          }
          : {})
      }));

      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };

  // Specific fetch functions for different message types
  const fetchSourceBRIDOptions = fetchMasterData("CustomerOrder Number Init");

  // const actualColumns: GridColumnConfig[] = [
  //   {
  //     key: 'Wagon',
  //     label: 'Wagon ID',
  //     type: 'Link',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: false
  //   },
  //   {
  //     key: 'WagonType',
  //     label: 'Wagon Type',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: false
  //   },
  //   {
  //     key: 'WagonQty',
  //     label: 'Wagon Quantity',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: false
  //   },
  //   {
  //     key: 'ContainerType',
  //     label: 'Container Type',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'ContainerDescription',
  //     label: 'Container ID',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'ContainerQty',
  //     label: 'Container Qty',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'Product',
  //     label: 'Product',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'ProductWeight',
  //     label: 'Product Weight',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'ProductWeightUOM',
  //     label: 'Product Weight UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: false
  //   },
  //   {
  //     key: 'WagonPosition',
  //     label: 'Wagon Position',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonQtyUOM',
  //     label: 'Wagon Qty UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: true
  //   },
  //   {
  //     key: 'ContainerQtyUOM',
  //     label: 'Container Qty UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     mandatory: true,
  //     subRow: true
  //   },
  //   {
  //     key: 'Thu',
  //     label: 'THU',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ThuSerialNo',
  //     label: 'THU Serial No',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ThuQty',
  //     label: 'THU Qty',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ThuWeight',
  //     label: 'THU Weight',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ThuWeightUOM',
  //     label: 'THU Weight UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntingOption',
  //     label: 'Shunting Option',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ReplacedWagon',
  //     label: 'Replaced Wagon',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntingReasonCode',
  //     label: 'Shunting Reason Code',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'Remarks',
  //     label: 'Remarks',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntInLocationDescription',
  //     label: 'Shunt In Location',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntOutLocationDescription',
  //     label: 'Shunt Out Location',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntInDate',
  //     label: 'Shunt In Date',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntInTime',
  //     label: 'Shunt In Time',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntOutDate',
  //     label: 'Shunt Out Time',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ShuntOutTime',
  //     label: 'Shunt Out Time',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ClassOfStores',
  //     label: 'Class Of Stores',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'NHMDescription',
  //     label: 'NHM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'UNCodeDescription',
  //     label: 'UN Code',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'DGClass',
  //     label: 'DG Class',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ContainsHazardousGoods',
  //     label: 'Contains Hazardous Goods',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonSealNo',
  //     label: 'Wagon Seal No.',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ContainerSealNo',
  //     label: 'Container Seal No.',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ContainerTareWeight',
  //     label: 'Container Tare Weight',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'ContainerTareWeightUOM',
  //     label: 'Container Tare Weight UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'LastCommodityTransported1',
  //     label: 'Last Commodity Transported 1',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'LastCommodityTransported2',
  //     label: 'Last Commodity Transported 2',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'LastCommodityTransported3',
  //     label: 'Last Commodity Transported 3',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonTareWeight',
  //     label: 'Wagon Tare weight',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonTareWeightUOM',
  //     label: 'Wagon Tare weight UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonLength',
  //     label: 'Wagon Length',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'WagonLengthUOM',
  //     label: 'Wagon length UOM',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCode1',
  //     label: 'Quick code 1',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCode2',
  //     label: 'Quick code 2',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCode3',
  //     label: 'Quick code 3',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCodeValue1',
  //     label: 'Quick code Value 1',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCodeValue2',
  //     label: 'Quick code Value 2',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'QuickCodeValue3',
  //     label: 'Quick code Value 3',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'Remarks1',
  //     label: 'Remarks1',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'Remarks2',
  //     label: 'Remarks2',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  //   {
  //     key: 'Remarks3',
  //     label: 'Remarks3',
  //     type: 'Text',
  //     sortable: true,
  //     editable: false,
  //     subRow: true
  //   },
  // ];
  const createProductFetchOptions = () => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      let unCodeValue = '';
      if (currentEditingRowIndex !== null && actualEditableData[currentEditingRowIndex]) {
        unCodeValue = actualEditableData[currentEditingRowIndex].UNCode || '';
      }
      const response = await quickOrderService.getDynamicSearchData({
        messageType: "Product ID Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
        additionalFilter: [
          {
            FilterName: "Uncode",
            FilterValue: unCodeValue
          }
        ]
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));
    };
  };
  const createUnCodeFetchOptions = () => {
    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      let productIDValue = '';
      if (currentEditingRowIndex !== null && actualEditableData[currentEditingRowIndex]) {
        productIDValue = actualEditableData[currentEditingRowIndex].Product || '';
      }
      const response = await quickOrderService.getDynamicSearchData({
        messageType: "UN Code Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
        additionalFilter: [
          {
            FilterName: "ProductId",
            FilterValue: productIDValue
          }
        ]
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));
    };
  };
  const actualEditableColumns: GridColumnConfig[] = [
    {
      key: 'actions',
      label: 'Actions',
      type: 'Text',
      sortable: false,
      filterable: false,
      width: 120
    },
    {
      key: 'WagonPosition',
      label: 'Wagon Position',
      type: 'Integer',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 120
    },
    {
      key: 'Wagon',
      label: 'Wagon ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 150,
      allowNewEntry: true, // Enable new entry functionality for Wagon field
      minSearchLength: 4, // Allow creating new entries with just 4 characters
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon id Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data;
        const wagonList = JSON.parse(rr.ResponseData) || [];
        return wagonList
          .filter((item: any) => item.id)
          .map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
      },
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        try {
          const rowIndex = actualRowIndex ?? 0;

          // Handle clear/undefined values
          if (!value || value === undefined || value === null) {
            setActualEditableData(prevData => {
              const newData = [...prevData];
              if (newData[rowIndex]) {
                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Wagon: '',
                  WagonDescription: '',
                  WagonType: '',
                  WagonQty: '',
                  WagonQtyUOM: '',
                  WagonTareWeight: '',
                  WagonLength: '',
                };
                hasUserEditsRef.current = true;
              }
              return newData;
            });
            return;
          }

          const response = await quickOrderService.getDynamicSearchData({
            messageType: "Wagon ID On select",
            searchCriteria: {
              WagonID: value,
            },
          });
          const rr: any = response.data;
          const payload = JSON.parse(rr.ResponseData);

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              if (payload && payload.ResponsePayload) {
                // API returned data - update only the specific fields from API response
                const wagonData = payload.ResponsePayload;

                // Update only the fields that come from the API response
                newData[rowIndex] = {
                  ...newData[rowIndex],
                  ...(wagonData.WagonID && { Wagon: wagonData.WagonID }),
                  ...(wagonData.WagonIDDescription && { WagonDescription: wagonData.WagonIDDescription }),
                  ...(wagonData.WagonTypeDescription && { WagonType: wagonData.WagonTypeDescription }),
                  ...(wagonData.WagonQty && { WagonQty: wagonData.WagonQty }),
                  ...(wagonData.WagonUOM && { WagonQtyUOM: wagonData.WagonUOM }),
                  ...(wagonData.TareWeight && { WagonTareWeight: wagonData.TareWeight }),
                  ...(wagonData.WagonLength && { WagonLength: wagonData.WagonLength }),
                };
              } else {
                // API returned empty response or this is a new entry
                // For new entries, set WagonDescription to the same value as Wagon and WagonType to "Unknown"
                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Wagon: value,
                  WagonDescription: value, // Set description to same value for new entries
                  WagonType: 'Unknown', // Set type to "Unknown" for new entries
                  WagonQty: '',
                  WagonQtyUOM: '',
                  WagonTareWeight: '',
                  WagonLength: '',
                };
              }

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Failed to fetch wagon details:', error);
        }
      },
    },
    {
      key: 'WagonType',
      label: 'Wagon Type',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 200,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon type Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data;
        const wagonTypeList = JSON.parse(rr.ResponseData) || [];
        return wagonTypeList
          .filter((item: any) => item.id && item.name)
          .map((item: any) => ({
            label: String(item.name),
            value: String(item.name),
          }));
      },
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        try {

          const rowIndex = actualRowIndex ?? 0; // Default to 0 if undefined

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              const updatedRow = {
                ...newData[rowIndex],
                WagonType: value,
              };

              newData[rowIndex] = updatedRow;

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon type:', error);
        }
      },
    },
    {
      key: 'WagonQtyUOM',
      label: 'Wagon Qty UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 180,
      options: wagonQtyUOMOptions,
    },
    {
      key: 'WagonQty',
      label: 'Wagon Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 200
    },
    {
      key: 'WagonTareWeightUOM',
      label: 'Wagon Tare weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      options: weightList
    },
    {
      key: 'WagonTareWeight',
      label: 'Wagon Tare weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180
    },
    {
      key: 'GrossWeightUOM',
      label: 'Wagon Gross Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      options: weightList,
      width: 200
    },
    {
      key: 'GrossWeight',
      label: 'Wagon Gross Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'WagonLengthUOM',
      label: 'Wagon length UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      options: wagonlengthUOMOptions,
      width: 200
    },
    {
      key: 'WagonLength',
      label: 'Wagon Length',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'WagonSealNo',
      label: 'Wagon Seal No.',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ContainerDescription',
      label: 'Container ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 200,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Container ID Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        const rowIndex = actualRowIndex ?? 0;
        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              ContainerDescription: safeSplit(value, ' || ', 1, value), // Store description part
            };
            hasUserEditsRef.current = true;
          }
          return newData;
        });
      },
    },
    {
      key: 'ContainerType',
      label: 'Container Type',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Container Type Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        const rowIndex = actualRowIndex ?? 0;
        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              ContainerType: safeSplit(value, ' || ', 1, value), // Store description part
            };
            hasUserEditsRef.current = true;
          }
          return newData;
        });
      },
    },
    {
      key: 'ContainerQtyUOM',
      label: 'Container Qty UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 180,
      options: containerQtyUOMOptions,
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ContainerTareWeightUOM',
      label: 'Container Tare Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220,
      options: weightList
    },
    {
      key: 'ContainerTareWeight',
      label: 'Container Tare Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ContainerSealNo',
      label: 'Container Seal No.',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'Thu',
      label: 'THU ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "THU Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        const rowIndex = actualRowIndex ?? 0;
        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              Thu: safeSplit(value, ' || ', 1, value), // Store description part
            };
            hasUserEditsRef.current = true;
          }
          return newData;
        });
      },
    },
    {
      key: 'ThuSerialNo',
      label: 'THU Serial No',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ThuQtyUOM',
      label: 'THU Qty UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      options: thuQtyUOMOptions,
    },
    {
      key: 'ThuQty',
      label: 'THU Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ThuWeightUOM',
      label: 'THU Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      options: weightList
    },
    {
      key: 'ThuWeight',
      label: 'THU Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ContainsHazardousGoods',
      label: 'Contains Hazardous Goods',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220,
      options: ['Yes', 'No'],
    },
    {
      key: 'NHMDescription',
      label: 'NHM',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "NHM Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        // response.data is already an array, so just return it directly
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              NHMDescription: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ProductDescription',
      label: 'Product ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: createProductFetchOptions(),
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          const response = await quickOrderService.getDynamicSearchData({
            messageType: "ProductID On Select",
            searchCriteria: {
              ProductID: safeSplit(value, ' || ', 0),
            },
          });
          const rr: any = response.data;
          const payload = JSON.parse(rr.ResponseData);

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              if (payload && payload.ResponsePayload) {
                const productfetchData = payload.ResponsePayload;

                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Product: safeSplit(value, ' || ', 0),
                  ProductDescription: safeSplit(value, ' || ', 1),
                  UNCode: productfetchData.UNCode || '',
                  UNCodeDescription: productfetchData.UNDescription || '',
                  DGClass: productfetchData.DGClass || '',
                  DGClassDescription: productfetchData.DGClassDescription || '',
                  NHM: productfetchData.NHMCode || '',
                  NHMDescription: productfetchData.NHMDescription || '',
                  ...(productfetchData.Hazardous && { ContainsHazardousGoods: productfetchData.Hazardous === "YES" ? "Yes" : "No" }),
                };
              } else {
                // API returned empty response - clear related fields
                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Product: safeSplit(value, ' || ', 0),
                  ProductDescription: safeSplit(value, ' || ', 1),
                  UNCode: '',
                  UNCodeDescription: '',
                  NHM: '',
                  NHMDescription: '',
                  ContainsHazardousGoods: '',
                  DGClass: '',
                  DGClassDescription: '',
                };
              }

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Failed to fetch wagon details:', error);
        }
      },
    },
    {
      key: 'ProductWeightUOM',
      label: 'Product Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180,
      options: productQtyUomOptions,
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160
    },
    {
      key: 'ClassOfStores',
      label: 'Class Of Stores',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Class Of Stores Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ClassOfStores: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'UNCodeDescription',
      label: 'UN Code',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      fetchOptions: createUnCodeFetchOptions(),
      onChange: async (value: string, rowData: any, actualRowIndex?: number) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          const response = await quickOrderService.getDynamicSearchData({
            messageType: "UnCode On Select",
            searchCriteria: {
              UNCode: safeSplit(value, ' || ', 0),
            },
          });
          const rr: any = response.data;
          const payload = JSON.parse(rr.ResponseData);

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              if (payload && payload.ResponsePayload) {
                const unCodefetchData = payload.ResponsePayload;

                newData[rowIndex] = {
                  ...newData[rowIndex],
                  UNCode: safeSplit(value, ' || ', 0),
                  UNCodeDescription: safeSplit(value, ' || ', 1),
                  Product: unCodefetchData.ProductID || '',
                  ProductDescription: unCodefetchData.ProductDescription || '',
                  DGClass: unCodefetchData.DGClass || '',
                  DGClassDescription: unCodefetchData.DGClassDescription || '',
                  NHM: unCodefetchData.NHMCode || '',
                  NHMDescription: unCodefetchData.NHMDescription || '',
                  ...(unCodefetchData.Hazardous && { ContainsHazardousGoods: unCodefetchData.Hazardous === "YES" ? "Yes" : "No" }),
                };
              } else {
                // API returned empty response - clear related fields
                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Product: '',
                  ProductDescription: '',
                  UNCode: safeSplit(value, ' || ', 0),
                  UNCodeDescription: safeSplit(value, ' || ', 1),
                  NHM: '',
                  NHMDescription: '',
                  ContainsHazardousGoods: '',
                  DGClass: '',
                  DGClassDescription: '',
                };
              }

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Failed to fetch wagon details:', error);
        }
      },
    },
    {
      key: 'DGClassDescription',
      label: 'DG Class',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "DG Class Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              const updatedRow = {
                ...newData[rowIndex],
                DGClass: safeSplit(value, ' || ', 0),
                DGClassDescription: safeSplit(value, ' || ', 1)
              };

              newData[rowIndex] = updatedRow;
            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Failed to fetch wagon details:', error);
        }
      },
    },
    {
      key: 'ShuntingOption',
      label: 'Shunting Option',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Shunting Option Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntingOption: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ReplacedWagon',
      label: 'Replaced Wagon',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Equipment ID Init",
          EquipmentType: 'Wagon',
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ReplacedWagon: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ShuntingReasonCode',
      label: 'Shunting Reason Code',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Shunting Reason Code Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntingReasonCode: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ShuntInLocationDescription',
      label: 'Shunt In Location',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Location Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntInLocationDescription: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ShuntOutLocationDescription',
      label: 'Shunt Out Location',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Location Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntOutLocationDescription: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'ShuntInDate',
      label: 'Shunt In Date',
      type: 'Date',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180
    },
    {
      key: 'ShuntInTime',
      label: 'Shunt In Time',
      type: 'Time',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160
    },
    {
      key: 'ShuntOutDate',
      label: 'Shunt Out Date',
      type: 'Date',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180
    },
    {
      key: 'ShuntOutTime',
      label: 'Shunt Out Time',
      type: 'Time',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160
    },
    {
      key: 'LastCommodityTransported1',
      label: 'Last Commodity Transported 1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220
    },
    {
      key: 'LastCommodityTransported2',
      label: 'Last Commodity Transported 2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220
    },
    {
      key: 'LastCommodityTransported3',
      label: 'Last Commodity Transported 3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220
    },

    {
      key: 'QuickCode1',
      label: 'Quick code 1',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Actual QC1 Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode1: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCode2',
      label: 'Quick code 2',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Actual QC2 Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode2: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCode3',
      label: 'Quick code 3',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Actual QC3 Init",
          searchTerm: searchTerm || '',
          offset,
          limit,
        });
        const rr: any = response.data
        return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
          ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
            ? {
              label: `${item.id} || ${item.name}`,
              value: `${item.id} || ${item.name}`,
            }
            : {})
        }));
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number) => {
        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode3: safeSplit(value, ' || ', 1, value)
            };
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCodeValue1',
      label: 'Quick code Value 1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },
    {
      key: 'QuickCodeValue2',
      label: 'Quick code Value 2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },
    {
      key: 'QuickCodeValue3',
      label: 'Quick code Value 3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },
    {
      key: 'Remarks1',
      label: 'Remarks1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },
    {
      key: 'Remarks2',
      label: 'Remarks2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },
    {
      key: 'Remarks3',
      label: 'Remarks3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250
    },

  ];
  const { getConsignments } = useTripExecutionDrawerStore();
  const consignments = getConsignments(legId) || [];

  const handleEditRow = async (editedRow: any, rowIndex: number) => {
    try {
      // Update the actualEditableData state with the edited row
      setActualEditableData(prevData => {
        const newData = [...prevData];
        newData[rowIndex] = { ...newData[rowIndex], ...editedRow };
        return newData;
      });

      // Set flag to indicate user has made edits
      hasUserEditsRef.current = true;

      // Simulate API call (you can add real API call here if needed)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error('Error editing row:', error);
      toast({
        title: "⚠️ Edit failed",
        description: "An error occurred while updating the row.",
        variant: "destructive",
      });
    }
  };
  const handleAddRow = async (newRow: any) => {
    try {
      // Add the new row to actualEditableData state
      setActualEditableData(prevData => [...prevData, newRow]);

      // Set flag to indicate user has made edits
      hasUserEditsRef.current = true;

      // Simulate API call (you can add real API call here if needed)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      toast({
        title: "⚠️ Add failed",
        description: "An error occurred while adding the row.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRow = async (row: any, rowIndex: number) => {
    try {
      // Remove the row from actualEditableData state
      setActualEditableData(prevData => {
        const newData = [...prevData];
        newData.splice(rowIndex, 1);
        return newData;
      });

      // Set flag to indicate user has made edits
      hasUserEditsRef.current = true;

      // Simulate API call (you can add real API call here if needed)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      toast({
        title: "⚠️ Delete failed",
        description: "An error occurred while deleting the row.",
        variant: "destructive",
      });
    }
  };

  // Handle Save Plan Actuals - Process array of actual data from grid
  const handleSavePlanActuals = async () => {
    try {

      // Get the full trip data from the store - try prop first, then manageTripStore as fallback
      const currentTripData = tripData || manageTripStore.getState().tripData;
      if (!currentTripData) {
        console.warn("No trip data available in store or props");
        toast({
          title: "⚠️ No Trip Data",
          description: "No trip data available to update.",
          variant: "destructive",
        });
        return;
      }      // Validate that we have actual editable data
      if (!actualEditableData || actualEditableData.length === 0) {
        console.warn("No actual data to save");
        toast({
          title: "⚠️ No Data",
          description: "No actual details to save.",
          variant: "destructive",
        });
        return;
      }


      // We'll create a helper that, if a string contains "||", returns an object with both parts.
      const splitAtPipe = (value: string | null | undefined) => {
        if (typeof value === "string" && value.includes("||")) {
          const [first, ...rest] = value.split("||");
          return {
            value: first.trim(),
            label: rest.join("||").trim()
          };
        }
        return value;
      };

      // Helper to recursively process all dropdown fields in an object, splitting at "||"
      const splitDropdowns = (obj: any) => {
        if (!obj || typeof obj !== "object") return obj;
        const newObj: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (!obj.hasOwnProperty(key)) continue;
          const val = obj[key];
          // If value is an object with a dropdown property, split it
          if (val && typeof val === "object" && "dropdown" in val) {
            newObj[key] = {
              ...val,
              dropdown: splitAtPipe(val.dropdown)
            };
            // If input property exists, keep as is
            if ("input" in val) {
              newObj[key].input = val.input;
            }
          } else if (typeof val === "string") {
            // If value is a string, split if it has a pipe
            newObj[key] = splitAtPipe(val);
          } else if (typeof val === "object" && val !== null) {
            // Recursively process nested objects
            newObj[key] = splitDropdowns(val);
          } else {
            newObj[key] = val;
          }
        }
        return newObj;
      };

      // Process each row in actualEditableData and update with proper ModeFlag
      const updatedActualData = actualEditableData.map((actualRow, index) => {
        // Determine ModeFlag based on whether the row already exists or is newly added
        let modeFlag = "Update"; // Default for existing rows

        // Check if this is a new row added by user (usually indicated by specific properties)
        // New rows typically have no Seqno or have temporary/negative IDs
        const isNewRow = !actualRow.Seqno || actualRow.Seqno === "" || actualRow.Seqno === -1 ||
          actualRow.ActualLineUniqueID === -1 ||
          (actualRow.hasOwnProperty('isNewRow') && actualRow.isNewRow === true);

        if (isNewRow) {
          modeFlag = "Insert"; // New row added to grid
        }

        // Only respect explicit ModeFlag if it's "Delete" - otherwise override with Update for existing rows
        if (actualRow.ModeFlag === "Delete") {
          modeFlag = "Delete"; // Respect Delete flag
        }


        return {
          ...actualRow,
          ModeFlag: modeFlag,
        };
      });

      // Create a deep copy of the trip data to avoid mutation
      const updatedTripData = JSON.parse(JSON.stringify(currentTripData));

      // Find and update the specific nested object in trip data structure
      try {
        // Validate the path exists
        if (!updatedTripData.LegDetails || !Array.isArray(updatedTripData.LegDetails)) {
          throw new Error("LegDetails not found or not an array");
        }

        // Find the leg by matching LegSequence with legId
        const legIndex = updatedTripData.LegDetails.findIndex(leg => leg.LegSequence === legId);
        if (legIndex === -1) {
          throw new Error(`Leg with LegSequence ${legId} not found`);
        }


        if (!updatedTripData.LegDetails[legIndex].Consignment) {
          throw new Error(`Leg at index ${legIndex} has no Consignment`);
        }

        if (!Array.isArray(updatedTripData.LegDetails[legIndex].Consignment)) {
          throw new Error("Consignment is not an array");
        }

        // For ConsignmentTrip, we need to find the right consignment and update its Actual array
        // Since we have consignments array from the store, we can use the first one or find by criteria
        const consignmentIndex = 0; // Assuming we're working with the first consignment or adjust logic as needed

        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex]) {
          throw new Error(`Consignment at index ${consignmentIndex} not found`);
        }

        // Replace the entire Actual array with our updated data
        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual) {
          updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = [];
        }

        updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = updatedActualData;

        // Save to API
        try {
          const response = await tripService.saveTrip(updatedTripData);

          const resourceStatus = (response as any)?.data?.IsSuccess;

          if (resourceStatus) {
            // Update the trip data in the store with the updated data
            manageTripStore.getState().setTrip(updatedTripData);

            // Update local actualEditableData state with the updated data
            setActualEditableData(updatedActualData);

            toast({
              title: "✅ Actual Details Saved Successfully",
              description: (response as any)?.data?.ResponseData?.Message || "Your actual details have been saved.",
              variant: "default",
            });
          } else {
            toast({
              title: "⚠️ Save Failed",
              description: (response as any)?.data?.Message || "Failed to save changes.",
              variant: "destructive",
            });
          }
        } catch (apiError) {
          toast({
            title: "⚠️ Save Failed",
            description: "Failed to save changes. Please try again.",
            variant: "destructive",
          });
        }

      } catch (updateError) {
        toast({
          title: "⚠️ Update Failed",
          description: `Failed to update the data structure: ${updateError.message}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error saving actual details:", error);
      toast({
        title: "⚠️ Save Failed",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
    }
  };  // Step 1: Build Customer Order dropdown list
  const buildCustomerOrderList = (consignments: any[] = []) => {
    return consignments.map((item, index) => ({
      label: `${item.CustomerOrderNo} — ${item.CustomerName || "-"}`,
      value: index.toString(),
      // Map all required fields for display
      DepartureFrom: item.CODepartureDescription,
      DepartureTo: item.COArrivalDescription,
      LoadType: item.LoadType,
      serviceDesc: item.ServiceDescription,
      subServiceDesc: item.SubServiceDescription,
      CustomerRefNo: item.CustomerReferenceNo,
      SourceBRID: item.SourceBRId,
      ReturnBRID: item.ReturnBRId,
      CustomerOrderNo: item.CustomerOrderNo,

      // Totals
      WagonQuantity: item.TotalWagons,
      ContainerQuantity: item.TotalContainer || item.ContainerQuantity || item.TotalContainerQuantity || item.ContainerQty,
      ProductWeight: item.TotalProductWeight,
      TotalTHU: item.TotalTHU,
      // HazardousGoods: item.HazardousGoods,
    }));
  };

  // Fetch wagon quantity UOM options on component mount
  useEffect(() => {
    const fetchWagonQtyUOMOptions = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon Qty UOM Init"
        });
        const rr: any = response.data;
        const wagonQty = JSON.parse(rr.ResponseData) || [];
        const options = wagonQty
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string); 
        const uniqueOptions = [...new Set(options)] as string[];
        setWagonQtyUOMOptions(uniqueOptions);
      } catch (error) {
        console.error('Failed to fetch wagon quantity UOM options:', error);
        setWagonQtyUOMOptions([]);
      }
    };
    const fetchWeightList = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Weight UOM Init"
        });
        const rr: any = response.data;
        const weightData = JSON.parse(rr.ResponseData) || [];
        const options = weightData
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string);
        // Remove duplicates using Set
        const uniqueOptions = [...new Set(options)] as string[];
        setWeightList(uniqueOptions);
      } catch (error) {
        setWeightList([]);
      }
    };
    const fetchWagonLengthUOMOptions = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Wagon Length UOM Init"
        });
        const rr: any = response.data;
        const wagonLengthData = JSON.parse(rr.ResponseData) || [];
        const options = wagonLengthData
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string);
        // Remove duplicates using Set
        const uniqueOptions = [...new Set(options)] as string[];
        setWagonLengthUOMOptions(uniqueOptions);
      } catch (error) {
        setWagonLengthUOMOptions([]);
      }
    };
    const fetchContainerQtyUOMOptions = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Container Qty UOM Init"
        });
        const rr: any = response.data;
        const containerQtyData = JSON.parse(rr.ResponseData) || [];
        const options = containerQtyData
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string);
        // Remove duplicates using Set
        const uniqueOptions = [...new Set(options)] as string[];
        setContainerQtyUOMOptions(uniqueOptions);
      } catch (error) {
        setContainerQtyUOMOptions([]);
      }
    };
    const fetchThuQtyUOMOptions = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "THU Qty UOM Init"
        });
        const rr: any = response.data;
        const thuQtyData = JSON.parse(rr.ResponseData) || [];
        const options = thuQtyData
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string);
        // Remove duplicates using Set
        const uniqueOptions = [...new Set(options)] as string[];
        setThuQtyUOMOptions(uniqueOptions);
      } catch (error) {
        setThuQtyUOMOptions([]);
      }
    };
    const fetchProductQtyUomOptions = async () => {
      try {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Product Qty UOM Init"
        });
        const rr: any = response.data;
        const productQtyData = JSON.parse(rr.ResponseData) || [];
        const options = productQtyData
          .filter((qc: any) => qc.id)
          .map((qc: any) => qc.name as string);
        // Remove duplicates using Set
        const uniqueOptions = [...new Set(options)] as string[];
        setProductQtyUomOptions(uniqueOptions);
      } catch (error) {
        setProductQtyUomOptions([]);
      }
    };

    fetchProductQtyUomOptions();
    fetchWeightList();
    fetchWagonLengthUOMOptions();
    fetchWagonQtyUOMOptions();
    fetchContainerQtyUOMOptions();
    fetchThuQtyUOMOptions();
  }, []);

  // Step 2: Load fresh data whenever legId changes
  useEffect(() => {
    if (!legId) return;

    // detect leg change
    if (legId !== currentLeg) {
      setCurrentLeg(legId);
      hasUserEditsRef.current = false; // Reset user edits flag when leg changes

      const cons = getConsignments(legId) || [];
      if (cons.length > 0) {
        const list = buildCustomerOrderList(cons);
        setCustomerList(list);
        // Built customer list for dropdown

        // ✅ reset selection to 0 for new leg
        setSelectedCustomerIndex('0');
        const selected = cons[0];
        setSelectedCustomerData(selected); // Use raw consignment data
        setPlannedData(selected?.Planned ?? []);
        setActualData(selected?.Actual ?? []);
        setActualEditableData(selected?.Actual ?? []);
        // Initial leg data loaded successfully
      } else {
        // reset everything if no consignment for new leg
        setCustomerList([]);
        setSelectedCustomerIndex('');
        setSelectedCustomerData(null);
        setPlannedData([]);
        setActualData([]);
        setActualEditableData([]);
        // No consignment data available for this leg
      }
    }
  }, [legId]); // only on leg change

  // Step 3: Keep selection stable if same leg data updates
  useEffect(() => {
    // Early return if no current leg or no consignments
    if (!currentLeg || consignments.length === 0) {
      return;
    }

    // Build customer list
    const list = buildCustomerOrderList(consignments);
    setCustomerList(list);

    // Get selected consignment
    const selectedIndex = parseInt(selectedCustomerIndex || '0', 10);
    const selected = consignments[selectedIndex];

    if (!selected) {
      return;
    }

    // Extract data
    const plannedConsignments = selected?.Planned ?? [];
    const actualConsignments = selected?.Actual ?? [];

    // Update all states in a batch
    setSelectedCustomerData(selected);
    setPlannedData(plannedConsignments);
    setActualData(actualConsignments);

    // Handle actualEditableData separately with better logic
    setActualEditableData(prevData => {
      // If user has made edits and we have existing data, preserve it
      if (hasUserEditsRef.current && prevData.length > 0) {
        return prevData;
      }

      return [...actualConsignments]; // Create a new array to avoid reference issues
    });

  }, [currentLeg, consignments, selectedCustomerIndex]);

  // Separate useEffect to handle customer selection changes
  useEffect(() => {
    if (!currentLeg || consignments.length === 0) return;
  }, [selectedCustomerIndex]);

  // Step 4: Handle dropdown change
  const handleCustomerChange = (idx: string) => {
    setSelectedCustomerIndex(idx);
    hasUserEditsRef.current = false;
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
            <Button size="sm" className="h-8" onClick={() => setShowPlanActualDrawer(true)}>
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
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Departure: </span>
                {selectedCustomerData?.CODepartureDescription || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Arrival: </span>
                {selectedCustomerData?.COArrivalDescription || "-"}
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
                {selectedCustomerData?.ServiceDescription || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Sub Service: </span>
                {selectedCustomerData?.SubServiceDescription || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer Ref No: </span>
                {selectedCustomerData?.CustomerReferenceNo || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Source BR ID: </span>
                {/* {selectedCustomerData?.SourceBRId || "-"} */}
                <DynamicLazySelect
                  fetchOptions={fetchSourceBRIDOptions}
                  value={sourceBRId}
                  onChange={(value) => {
                    // Update local state for the dropdown display
                    setSourceBRId(value as string);
                    // Create a new object to ensure React detects the state change
                    const newData = {
                      ...selectedCustomerData,
                      SourceBRId: value as string
                    };
                    // Update the selectedCustomerData with the new SourceBRId
                    setSelectedCustomerData(newData);
                  }}
                  placeholder="Select Source BR ID"
                />
              </div>
              <div>
                <span className="font-medium text-gray-700">Return BR ID: </span>
                {/* {selectedCustomerData?.ReturnBRId || "-"} */}
                <DynamicLazySelect
                  fetchOptions={fetchSourceBRIDOptions}
                  value={returnBRId}
                  onChange={(value) => {
                    // Update local state for the dropdown display
                    setReturnBRId(value as string);
                    // Create a new object to ensure React detects the state change
                    const newData = {
                      ...selectedCustomerData,
                      ReturnBRId: value as string
                    };
                    // Update the selectedCustomerData with the new ReturnBRId
                    setSelectedCustomerData(newData);
                  }}
                  placeholder="Select Return BR ID"
                />
              </div>
              <div className="flex items-end gap-2">
                <span className="font-medium text-gray-700">
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => {
                    if (selectedCustomerData) {
                      setSelectedCustomerData({
                        ...selectedCustomerData,
                        SourceBRId: sourceBRId,
                        ReturnBRId: returnBRId
                      });
                    }
                  }}
                >
                  Save
                </Button>
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
                key="planned-section"
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalWagons ? selectedCustomerData.TotalWagons : '-'} Nos</div>
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalContainer ? selectedCustomerData?.TotalContainer : '-'} Nos</div>
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalProductWeight ? selectedCustomerData?.TotalProductWeight : '-'} Ton</div>
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
                {/* {actualData.length} */}
                {actualEditableData.length}
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
                key="actuals-section"
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalWagons ? selectedCustomerData?.TotalWagons : '-'} Nos</div>
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalContainer ? selectedCustomerData?.TotalContainer : '-'} Nos</div>
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
                        <div className="text-lg font-semibold">{selectedCustomerData?.TotalProductWeight ? selectedCustomerData?.TotalProductWeight : '-'} Ton</div>
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
                  {/* Table - Fixed width container matching planned grid with horizontal scroll */}
                  <div className="border rounded-lg overflow-hidden pt-2">
                    <div className="w-full overflow-x-auto" style={{ maxWidth: '100%' }}>
                      <div style={{ width: '1290px', minWidth: '1290px' }}>
                        {actualEditableData && (
                          <ActualSmartGridPlus
                            columns={actualEditableColumns}
                            data={actualEditableData}
                            gridTitle="Actuals"
                            inlineRowAddition={true}
                            inlineRowEditing={true}
                            onAddRow={handleAddRow}
                            onEditRow={handleEditRow}
                            onDeleteRow={handleDeleteRow}
                            //defaultRowValues={defaultRowValues}
                            // validationRules={validationRules}
                            addRowButtonLabel="Add Actuals"
                            addRowButtonPosition="top-left"
                            groupableColumns={['OrderType', 'CustomerOrVendor', 'Status', 'Contract']}
                            showGroupingDropdown={true}
                            paginationMode="pagination"
                            selectedRows={selectedRows}
                            rowClassName={(row: any, index: number) => {
                              return selectedRowIds.has(row.TripPlanID) ? 'selected' : '';
                            }}
                            showDefaultConfigurableButton={false}
                            recordCount={actualEditableData.length}
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
                  </div>

                </div>
              </motion.div>
            )}
            <Button
              className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={handleSavePlanActuals}
            >
              Save Actual Details
            </Button>
          </AnimatePresence>
        </div>
      </div>
      {/* Plan and Actual Details Drawer */}
      {showPlanActualDrawer && (
        <PlanActualDetailsDrawer
          legId={legId}
          consignmentIndex={selectedCustomerIndex}
          isOpen={showPlanActualDrawer}
          onClose={() => setShowPlanActualDrawer(false)}
        />
      )}
    </TabsContent>
  );
};