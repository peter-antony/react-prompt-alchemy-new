import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, ChevronDown, ChevronUp, Plus, User, FileText, MapPin, Truck, Package, Calendar, Info, Trash2, RefreshCw, Send, AlertCircle, Download, Filter, CheckSquare, MoreVertical, Container, Box, Boxes, Search, Clock, PackageCheck, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState, useRef, useMemo, act } from 'react';
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
import CustomBulkUpload from '@/components/DynamicFileUpload/CustomBulkUpload';
import { exportToCSV, exportToExcel } from '@/utils/gridExport';
import * as XLSX from 'xlsx';
import { Switch } from '@/components/ui/switch';

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
  const [expandedPlanned, setExpandedPlanned] = useState(false);
  const [expandedCOInfo, setExpandedCOInfo] = useState(false);
  const [expandedActuals, setExpandedActuals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pickupComplete, setPickupComplete] = useState(false);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState('0');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>({});
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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deletedDataFromImport, setDeletedDataFromImport] = useState<any[]>([]);

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
      width: 150
    },
    {
      key: 'WagonType',
      label: 'Wagon Type',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 200
    },
    {
      key: 'WagonQty',
      label: 'Wagon Quantity',
      type: 'Text',
      sortable: true,
      editable: false,
      mandatory: true,
      subRow: false,
      width: 200
    },
    {
      key: 'ContainerType',
      label: 'Container Type',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'ContainerId',
      label: 'Container ID',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: true,
      width: 200
    },
    {
      key: 'Product',
      label: 'Product',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 250
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Text',
      sortable: true,
      editable: false,
      subRow: false,
      width: 160
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
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0; // Default to 0 if undefined

          // Handle new row case (rowIndex = -1)
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonType: value,
            }));
            return;
          }

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
      key: 'Wagon',
      label: 'Wagon ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 150,
      allowNewEntry: true,
      minSearchLength: 4,
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
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;

          // Handle new row case (rowIndex = -1)
          if (actualRowIndex === -1 && setNewRowValues) {
            // Handle clear/undefined values for new row
            if (!value || value === undefined || value === null) {
              setNewRowValues((prev: any) => ({
                ...prev,
                Wagon: '',
                WagonDescription: '',
                WagonType: '',
                WagonQty: '',
                WagonQtyUOM: '',
                WagonTareWeight: '',
                WagonLength: '',
              }));
              return;
            }

            // Fetch wagon details for new row
            const response = await quickOrderService.getDynamicSearchData({
              messageType: "Wagon ID On select",
              searchCriteria: {
                WagonID: value,
              },
            });
            const rr: any = response.data;
            const payload = JSON.parse(rr.ResponseData);

            if (payload && payload.ResponsePayload) {
              // API returned data - update the new row values
              const wagonData = payload.ResponsePayload;
              setNewRowValues((prev: any) => ({
                ...prev,
                ...(wagonData.WagonID && { Wagon: wagonData.WagonID }),
                ...(wagonData.WagonIDDescription && { WagonDescription: wagonData.WagonIDDescription }),
                ...(wagonData.WagonTypeDescription && { WagonType: wagonData.WagonTypeDescription }),
                ...(wagonData.WagonQty && { WagonQty: wagonData.WagonQty }),
                ...(wagonData.WagonUOM && { WagonQtyUOM: wagonData.WagonUOM }),
                ...(wagonData.TareWeight && { WagonTareWeight: wagonData.TareWeight }),
                ...(wagonData.WagonLength && { WagonLength: wagonData.WagonLength }),
              }));
            } else {
              // API returned empty response or this is a new entry
              setNewRowValues((prev: any) => ({
                ...prev,
                Wagon: value,
                WagonDescription: value, 
                WagonType: 'Unknown Type', 
                WagonQty: '',
                WagonQtyUOM: '',
                WagonTareWeight: '',
                WagonLength: '',
              }));
            }
            return;
          }

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
                  WagonDescription: value,
                  WagonType: 'Unknown Type', 
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
      key: 'LastCommodityTransported1',
      label: 'Last Commodity Transported 1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320
    },
    {
      key: 'LastCommodityTransported2',
      label: 'Last Commodity Transported 2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320
    },
    {
      key: 'LastCommodityTransported3',
      label: 'Last Commodity Transported 3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320
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

  // Calculate consistent grid width based on planned columns only (not subrow columns)
  const gridTotalWidth = useMemo(() => {
    // Get main columns from planned grid only (ignore subrow columns)
    const plannedMainColumns = plannedColumns.filter(col => !col.subRow);

    // Calculate width based on planned columns only
    const plannedWidth = plannedMainColumns.reduce((total, col) => total + (col.width || 150), 0);

    // Use planned width as the fixed width for both grids to ensure consistency
    const fixedContentWidth = plannedWidth;

    // Add extra space for checkboxes, actions, and padding
    const totalWidth = fixedContentWidth + 150; // Extra space for UI elements

    return totalWidth;
  }, [plannedColumns]);

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
      toast({
        title: "⚠️ Edit failed",
        description: "An error occurred while updating the row.",
        variant: "destructive",
      });
    }
  };
  const handleAddRow = async (newRow: any) => {
    try {

      const newRowWithInsertFlag = {
        ...newRow,
        ModeFlag: 'Insert',
      };
      // Add the new row to actualEditableData state
      setActualEditableData(prevData => [...prevData, newRowWithInsertFlag]);

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

  // Handle import dialog open/close
  const handleImportData = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportComplete = (summary: any) => {

    if (summary.validRows && summary.validRows.length > 0) {
      // Store existing data as deleted (to be sent with Delete mode flag)
      const existingDataWithDeleteFlag = actualEditableData.map(row => ({
        ...row,
        ModeFlag: 'Delete'
      }));

      // Set the deleted data for later use in save
      setDeletedDataFromImport(existingDataWithDeleteFlag);

      // Process imported data with Insert mode flag, and also normalize column headers
      const importedDataWithInsertFlag = summary.validRows.map((row: any, index: number) => {
        // Create a normalized version of the row with trimmed keys
        const normalizedRow: any = {};
        Object.keys(row).forEach(key => {
          const trimmedKey = key.trim();
          normalizedRow[trimmedKey] = row[key];
          // Also create alternative keys without spaces and special characters
          const normalizedKey = trimmedKey.replace(/[^\w]/g, '').toLowerCase();
          normalizedRow[normalizedKey] = row[key];
        });

        // Convert Excel column names to grid field names
        const gridMappedRow = {
          // Map Excel columns to grid field names
          Wagon: normalizedRow['Wagon ID'] || normalizedRow.wagonid || "",
          WagonDescription: normalizedRow['Wagon ID'] || normalizedRow.wagonid || "",
          WagonType: normalizedRow['Wagon Type'] || normalizedRow.wagontype || "",
          WagonPosition: normalizedRow['Wagon Position'] || normalizedRow.wagonposition || "",
          WagonQty: normalizedRow['Wagon Qty'] || normalizedRow.wagonqty || 1,
          WagonQtyUOM: normalizedRow['Wagon Qty UOM'] || normalizedRow.wagonqtyuom || "",
          WagonLength: normalizedRow['Wagon length'] || normalizedRow.wagonlength || "",
          WagonTareWeight: normalizedRow['Tare Weight'] || normalizedRow.tareweight || "",
          GrossWeight: normalizedRow['Gross Weight'] || normalizedRow.grossweight || 0,

          ContainerId: normalizedRow['Container ID'] || normalizedRow.containerid || "",
          ContainerDescription: normalizedRow['Container ID'] || normalizedRow.containerid || "",
          ContainerType: normalizedRow['Container Type'] || normalizedRow.containertype || "",
          ContainerQty: normalizedRow['Container Qty'] || normalizedRow.containerqty || "",
          ContainerQtyUOM: normalizedRow['Container Qty UOM'] || normalizedRow.containerqtyuom || "",
          ContainerSealNo: normalizedRow['Container Seal No.'] || normalizedRow.containersealn || normalizedRow.containerseal || "",

          Product: normalizedRow['Commodity ID'] || normalizedRow.commodityid || "",
          ProductDescription: normalizedRow['Commodity Description'] || normalizedRow.commoditydescription || "",
          ProductWeight: normalizedRow['Commodity Actual Qty'] || normalizedRow.commodityactualqty || "",
          ProductWeightUOM: normalizedRow['Commodity Qty UOM'] || normalizedRow.commodityqtyuom || "",
          CommodityDamagedQty: normalizedRow['Commodity Damaged Qty'] || normalizedRow.commoditydamagedqty || "",

          Thu: normalizedRow['THU ID'] || normalizedRow.thuid || "",
          ThuDescription: normalizedRow['THU ID'] || normalizedRow.thuid || "",
          ThuSerialNo: normalizedRow['THU Serial No'] || normalizedRow.thuserialno || "",
          ThuQty: normalizedRow['THU Qty'] || normalizedRow.thuqty || "",
          ThuWeight: normalizedRow['THU Weight'] || normalizedRow.thuweight || "",
          ThuWeightUOM: normalizedRow['THU Weight UOM'] || normalizedRow.thuweightuom || "",

          ShuntingOption: normalizedRow['Shunting Option'] || normalizedRow.shuntingoption || "",
          ReplacedWagon: normalizedRow['Replaced Wagon ID'] || normalizedRow.replacedwagonid || "",
          ShuntingReasonCode: normalizedRow['Reason Code'] || normalizedRow.reasoncode || "",
          Remarks: normalizedRow['Remarks'] || normalizedRow.remarks || "",
          ShuntInLocation: normalizedRow['Shunt In Location'] || normalizedRow.shuntinlocation || "",
          ShuntOutLocation: normalizedRow['Shunt Out Location'] || normalizedRow.shuntoutlocation || "",
          ShuntInDate: normalizedRow['Shunt In Date & Time'] ? normalizedRow['Shunt In Date & Time'].split(' ')[0] : (normalizedRow.shuntindatetime ? normalizedRow.shuntindatetime.split(' ')[0] : ""),
          ShuntInTime: normalizedRow['Shunt In Date & Time'] ? normalizedRow['Shunt In Date & Time'].split(' ')[1] : (normalizedRow.shuntindatetime ? normalizedRow.shuntindatetime.split(' ')[1] : ""),
          ShuntOutDate: normalizedRow['Shunt Out Date & Time'] ? normalizedRow['Shunt Out Date & Time'].split(' ')[0] : (normalizedRow.shuntoutdatetime ? normalizedRow.shuntoutdatetime.split(' ')[0] : ""),
          ShuntOutTime: normalizedRow['Shunt Out Date & Time'] ? normalizedRow['Shunt Out Date & Time'].split(' ')[1] : (normalizedRow.shuntoutdatetime ? normalizedRow.shuntoutdatetime.split(' ')[1] : ""),

          ClassOfStores: normalizedRow['Class Of Stores'] || normalizedRow.classofstores || "",
          NHM: normalizedRow['NHM'] || normalizedRow.nhm || "",
          NHMDescription: normalizedRow['NHM'] || normalizedRow.nhm || "",
          UNCode: normalizedRow['UN Code'] || normalizedRow.uncode || "",
          UNCodeDescription: normalizedRow['UN Code'] || normalizedRow.uncode || "",
          DGClass: normalizedRow['DG Class'] || normalizedRow.dgclass || "",
          DGClassDescription: normalizedRow['DG Class'] || normalizedRow.dgclass || "",
          ContainsHazardousGoods: normalizedRow['Contains Hazardous Goods'] || normalizedRow.containshazardousgoods || "",
          WagonSealNo: normalizedRow['Wagon Seal No.'] || normalizedRow.wagonsealn || normalizedRow.wagonseal || "",

          Remarks1: normalizedRow['Remarks1'] || normalizedRow.remarks1 || "",
          Remarks2: normalizedRow['Remarks2'] || normalizedRow.remarks2 || "",
          Remarks3: normalizedRow['Remarks3'] || normalizedRow.remarks3 || "",

          // Add required system fields
          ModeFlag: 'Insert',
          // isNewRow: true,
          Seqno: '',
          ActualLineUniqueID: -1
        };

        return gridMappedRow;
      });

      // Replace existing data with imported data (not append)
      setActualEditableData(importedDataWithInsertFlag);

      hasUserEditsRef.current = true;

      // Show success toast with actual count
      toast({
        title: "Import Successful",
        description: `Successfully imported ${summary.validRows.length} records. Previous ${existingDataWithDeleteFlag.length} records will be deleted.`,
      });
    } else {
      // Show warning if no valid rows
      toast({
        title: "Import Warning",
        description: "No valid rows found in the imported file.",
        variant: "destructive",
      });
    }
    setIsImportDialogOpen(false);
  };

  // Handle export functionality
  const handleExportData = (format: 'csv' | 'xlsx') => {
    try {

      // Define custom headers for export
      const customHeaders = [
        'Wagon ID',
        'Tare Weight',
        'Gross Weight',
        'Container ID',
        'Product ID',
        'Product Weight',
        'Product Weight UOM',
        'Wagon Position',
        'Wagon Type',
        'Wagon length',
        'Wagon Qty',
        'Wagon Qty UOM',
        'Container Type',
        'Container Qty',
        'Container Qty UOM',
        'THU ID',
        'THU Serial No',
        'THU Qty',
        'THU Weight',
        'THU Weight UOM',
        'Shunting Option',
        'Replaced Wagon ID',
        'Reason Code',
        'Remarks',
        'Shunt In Location',
        'Shunt Out Location',
        'Class Of Stores',
        'NHM',
        'UN Code',
        'DG Class',
        'Contains Hazardous Goods',
        'Last Commodity Transported 1',
        'Last Commodity Transported 2',
        'Last Commodity Transported 3',
        'Wagon Seal No.',
        'Container Seal No.',
        'Shunt In Date',
        'Shunt In Time',
        'Shunt Out Date',
        'Shunt Out Time',
        'Quick code 1',
        'Quick code 2',
        'Quick code 3',
        'Quick code Value 1',
        'Quick code Value 2',
        'Quick code Value 3',
        'Remarks1',
        'Remarks2',
        'Remarks3'
      ];

      // Map grid column keys to export headers
      const columnKeyMapping = {
        'Wagon': 'Wagon ID',
        'WagonTareWeight': 'Tare Weight',
        'GrossWeight': 'Gross Weight',
        'ContainerDescription': 'Container ID',
        'Product': 'Product ID',
        'ProductWeight': 'Product Weight',
        'ProductWeightUOM': 'Product Weight UOM',
        'WagonPosition': 'Wagon Position',
        'WagonType': 'Wagon Type',
        'WagonLength': 'Wagon length',
        'WagonQty': 'Wagon Qty',
        'WagonQtyUOM': 'Wagon Qty UOM',
        'ContainerType': 'Container Type',
        'ContainerQty': 'Container Qty',
        'ContainerQtyUOM': 'Container Qty UOM',
        'Thu': 'THU ID',
        'ThuSerialNo': 'THU Serial No',
        'ThuQty': 'THU Qty',
        'ThuWeight': 'THU Weight',
        'ThuWeightUOM': 'THU Weight UOM',
        'ShuntingOption': 'Shunting Option',
        'ReplacedWagon': 'Replaced Wagon ID',
        'ShuntingReasonCode': 'Reason Code',
        'Remarks': 'Remarks',
        'ShuntInLocationDescription': 'Shunt In Location',
        'ShuntOutLocationDescription': 'Shunt Out Location',
        'ClassOfStores': 'Class Of Stores',
        'NHM': 'NHM',
        'UNCode': 'UN Code',
        'DGClass': 'DG Class',
        'ContainsHazardousGoods': 'Contains Hazardous Goods',
        'LastCommodityTransported1': 'Last Commodity Transported 1',
        'LastCommodityTransported2': 'Last Commodity Transported 2',
        'LastCommodityTransported3': 'Last Commodity Transported 3',
        'WagonSealNo': 'Wagon Seal No.',
        'ContainerSealNo': 'Container Seal No.',
        'ShuntInDate': 'Shunt In Date',
        'ShuntInTime': 'Shunt In Time',
        'ShuntOutTime': 'Shunt Out Time',
        'ShuntOutDate': 'Shunt Out Date',
        'QuickCode1': 'Quick code 1',
        'QuickCode2': 'Quick code 2',
        'QuickCode3': 'Quick code 3',
        'QuickCodeValue1': 'Quick code Value 1',
        'QuickCodeValue2': 'Quick code Value 2',
        'QuickCodeValue3': 'Quick code Value 3',
        'Remarks1': 'Remarks1',
        'Remarks2': 'Remarks2',
        'Remarks3': 'Remarks3'
      };

      // Create temporary GridColumnConfig array for export
      const exportColumns: GridColumnConfig[] = customHeaders.map((header, index) => ({
        key: `col_${index}`,
        label: header,
        type: 'Text' as any,
        sortable: false,
        filterable: false,
        width: 150
      }));

      // Prepare data for export with custom headers - transform to match export column keys
      const exportData = actualEditableData.map(row => {
        const exportRow: any = {};

        // Map each custom header to the corresponding data
        customHeaders.forEach((header, index) => {
          const columnKey = `col_${index}`;

          // Handle special cases for combined date/time fields
          if (header === 'Shunt In Date & Time') {
            const date = row['ShuntInDate'] || '';
            const time = row['ShuntInTime'] || '';
            exportRow[columnKey] = date && time ? `${date} ${time}` : (date || time || '');
          } else if (header === 'Shunt Out Date & Time') {
            const date = row['ShuntOutDate'] || '';
            const time = row['ShuntOutTime'] || '';
            exportRow[columnKey] = date && time ? `${date} ${time}` : (date || time || '');
          } else {
            // Find the corresponding original column key
            const originalColumnKey = Object.keys(columnKeyMapping).find(key => columnKeyMapping[key] === header);

            if (originalColumnKey && row[originalColumnKey] !== undefined) {
              exportRow[columnKey] = row[originalColumnKey];
            } else {
              // If no mapping found, try to find a similar key in the row data
              const similarKey = Object.keys(row).find(key =>
                key.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                header.toLowerCase().replace(/[^a-z0-9]/g, '')
              );

              exportRow[columnKey] = similarKey ? row[similarKey] : '';
            }
          }
        });

        return exportRow;
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Consignment_Details_${timestamp}`;

      // Export based on format
      if (format === 'csv') {
        exportToCSV(exportData, exportColumns, filename);
      } else if (format === 'xlsx') {
        exportToExcel(exportData, exportColumns, filename);
      }

      // Show success toast
      toast({
        title: "Export Successful",
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Save Plan Actuals - Process array of actual data from grid
  const handleSavePlanActuals = async () => {
    try {

      // Get the full trip data from the store - try prop first, then manageTripStore as fallback
      const currentTripData = tripData || manageTripStore.getState().tripData;
      console.log("currentTripData ++++", currentTripData);
      if (!currentTripData) {
        toast({
          title: "⚠️ No Trip Data",
          description: "No trip data available to update.",
          variant: "destructive",
        });
        return;
      }      // Validate that we have actual editable data
      if (!actualEditableData || actualEditableData.length === 0) {
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

      // Process data for save with proper mode flags based on requirements:
      // 1. Send newly imported data with Insert mode flag
      // 2. Send existing data that was removed during import with Delete mode flag  
      // 3. Send existing data that has been edited with Update mode flag
      // 4. If user has made edits, include all current data

      let currentGridData = [];

      if (hasUserEditsRef.current) {
        // If user has made edits, include all current actual data
        currentGridData = actualEditableData.map((actualRow, index) => {
          try {
            // Safely access row data with null checks
            if (!actualRow || typeof actualRow !== 'object') {
              throw new Error(`Invalid row data at index ${index}`);
            }

            // Determine the appropriate mode flag
            let modeFlag = "Update"; // Default to Update for existing data

            // If row has Insert flag or isNewRow marker, keep it as Insert
            if (actualRow.ModeFlag === 'Insert') {
              modeFlag = "Insert";
            }

            // Helper function to safely get numeric values
            const safeNumeric = (value: any) => {
              if (value === null || value === undefined || value === '') {
                return null;
              }
              const num = Number(value);
              return isNaN(num) ? null : num;
            };

            // Helper function to safely get string values  
            const safeString = (value: any) => {
              if (value === null || value === undefined) {
                return "";
              }
              return String(value);
            };

            // Helper function to safely split date-time fields
            const safeDateTimeSplit = (value: any, part: number) => {
              try {
                if (!value || typeof value !== 'string') return "";
                const parts = value.split(' ');
                return parts[part] || "";
              } catch (e) {
                return "";
              }
            };

            // Map the data to match the expected API format, removing extra parameters
            const mappedRow = {
              Seqno: (index + 1).toString(), // Sequential number starting from 1
              PlanToActualCopy: "",
              WagonPosition: safeString(actualRow['Wagon Position'] || actualRow.WagonPosition || actualRow.wagonposition),
              WagonType: safeString(actualRow['Wagon Type'] || actualRow.WagonType || actualRow.wagontype),
              Wagon: safeString(actualRow['Wagon ID'] || actualRow.WagonId || actualRow.Wagon || actualRow.wagonid),
              WagonDescription: safeString(actualRow['Wagon ID'] || actualRow.WagonId || actualRow.WagonDescription || actualRow.wagonid),
              WagonQty: safeNumeric(actualRow['Wagon Qty'] || actualRow.WagonQty || actualRow.wagonqty),
              WagonQtyUOM: safeString(actualRow['Wagon Qty UOM'] || actualRow.WagonQtyUOM || actualRow.wagonqtyuom),
              ContainerType: safeString(actualRow['Container Type'] || actualRow.ContainerType || actualRow.containertype),
              ContainerId: safeString(actualRow['Container ID'] || actualRow.ContainerId || actualRow.containerid),
              ContainerDescription: safeString(actualRow['Container ID'] || actualRow.ContainerId || actualRow.ContainerDescription || actualRow.containerid),
              ContainerQty: safeNumeric(actualRow['Container Qty'] || actualRow.ContainerQty || actualRow.containerqty),
              ContainerQtyUOM: safeString(actualRow['Container Qty UOM'] || actualRow.ContainerQtyUOM || actualRow.containerqtyuom),
              Product: safeString(actualRow['Commodity ID'] || actualRow.CommodityId || actualRow.Product || actualRow.commodityid),
              ProductDescription: safeString(actualRow['Commodity Description'] || actualRow.CommodityDescription || actualRow.ProductDescription || actualRow.commoditydescription),
              ProductWeight: safeNumeric(actualRow['Commodity Actual Qty'] || actualRow.CommodityActualQty || actualRow.ProductWeight || actualRow.commodityactualqty),
              ProductWeightUOM: safeString(actualRow['Commodity Qty UOM'] || actualRow.CommodityQtyUOM || actualRow.ProductWeightUOM || actualRow.commodityqtyuom),
              CommodityDamagedQty: safeNumeric(actualRow['Commodity Damaged Qty'] || actualRow.CommodityDamagedQty || actualRow.commoditydamagedqty),
              Thu: safeString(actualRow['THU ID'] || actualRow.ThuId || actualRow.Thu || actualRow.thuid),
              ThuDescription: safeString(actualRow['THU ID'] || actualRow.ThuId || actualRow.ThuDescription || actualRow.thuid),
              ThuSerialNo: safeString(actualRow['THU Serial No'] || actualRow.ThuSerialNo || actualRow.thuserialno),
              ThuQty: safeNumeric(actualRow['THU Qty'] || actualRow.ThuQty || actualRow.thuqty),
              ThuWeight: safeNumeric(actualRow['THU Weight'] || actualRow.ThuWeight || actualRow.thuweight),
              ThuWeightUOM: safeString(actualRow['THU Weight UOM'] || actualRow.ThuWeightUOM || actualRow.thuweightuom),
              ShuntingOption: safeString(actualRow['Shunting Option'] || actualRow.ShuntingOption || actualRow.shuntingoption),
              ReplacedWagon: safeString(actualRow['Replaced Wagon ID'] || actualRow.ReplacedWagonId || actualRow.ReplacedWagon || actualRow.replacedwagonid),
              ShuntingReasonCode: safeString(actualRow['Reason Code'] || actualRow.ReasonCode || actualRow.ShuntingReasonCode || actualRow.reasoncode),
              Remarks: safeString(actualRow['Remarks'] || actualRow.Remarks || actualRow.remarks),
              ShuntInLocation: safeString(actualRow['Shunt In Location'] || actualRow.ShuntInLocation || actualRow.shuntinlocation),
              ShuntInLocationDescription: safeString(actualRow['Shunt In Location'] || actualRow.ShuntInLocation || actualRow.shuntinlocation),
              ShuntOutLocation: safeString(actualRow['Shunt Out Location'] || actualRow.ShuntOutLocation || actualRow.shuntoutlocation),
              ShuntOutLocationDescription: safeString(actualRow['Shunt Out Location'] || actualRow.ShuntOutLocation || actualRow.shuntoutlocation),
              ShuntInDate: safeDateTimeSplit(actualRow['Shunt In Date & Time'] || actualRow.shuntindatetime, 0),
              ShuntInTime: safeDateTimeSplit(actualRow['Shunt In Date & Time'] || actualRow.shuntindatetime, 1),
              ShuntOutDate: safeDateTimeSplit(actualRow['Shunt Out Date & Time'] || actualRow.shuntoutdatetime, 0),
              ShuntOutTime: safeDateTimeSplit(actualRow['Shunt Out Date & Time'] || actualRow.shuntoutdatetime, 1),
              ClassOfStores: safeString(actualRow['Class Of Stores'] || actualRow.ClassOfStores || actualRow.classofstores),
              NHM: safeString(actualRow['NHM'] || actualRow.NHM || actualRow.nhm),
              NHMDescription: safeString(actualRow['NHM'] || actualRow.NHM || actualRow.nhm),
              UNCode: safeString(actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode),
              UNCodeDescription: safeString(actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode),
              DGClass: safeString(actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass),
              DGClassDescription: safeString(actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass),
              ContainsHazardousGoods: safeString(actualRow['Contains Hazardous Goods'] || actualRow.ContainsHazardousGoods || actualRow.containshazardousgoods),
              WagonSealNo: safeString(actualRow['Wagon Seal No.'] || actualRow.WagonSealNo || actualRow.wagonsealn || actualRow.wagonseal),
              ContainerSealNo: safeString(actualRow['Container Seal No.'] || actualRow.ContainerSealNo || actualRow.containersealn || actualRow.containerseal),
              ContainerTareWeight: safeNumeric(actualRow['Container Tare Weight'] || actualRow.ContainerTareWeight || actualRow.containertareweight),
              ContainerTareWeightUOM: safeString(actualRow['Container Tare Weight UOM'] || actualRow.ContainerTareWeightUOM || actualRow.containertareweightuom),
              LastCommodityTransported1: safeString(actualRow['Last Commodity Transported1'] || actualRow.LastCommodityTransported1 || actualRow.lastcommoditytransported1),
              LastCommodityTransportedDate1: safeString(actualRow['Last Commodity Transported Date1'] || actualRow.LastCommodityTransportedDate1 || actualRow.lastcommoditytransporteddate1),
              LastCommodityTransported2: safeString(actualRow['Last Commodity Transported2'] || actualRow.LastCommodityTransported2 || actualRow.lastcommoditytransported2),
              LastCommodityTransportedDate2: safeString(actualRow['Last Commodity Transported Date2'] || actualRow.LastCommodityTransportedDate2 || actualRow.lastcommoditytransporteddate2),
              LastCommodityTransported3: safeString(actualRow['Last Commodity Transported3'] || actualRow.LastCommodityTransported3 || actualRow.lastcommoditytransported3),
              LastCommodityTransportedDate3: safeString(actualRow['Last Commodity Transported Date3'] || actualRow.LastCommodityTransportedDate3 || actualRow.lastcommoditytransporteddate3),
              WagonTareWeight: safeNumeric(actualRow['Tare Weight'] || actualRow.TareWeight || actualRow.WagonTareWeight || actualRow.tareweight),
              WagonTareWeightUOM: safeString(actualRow['Tare Weight UOM'] || actualRow.TareWeightUOM || actualRow.WagonTareWeightUOM || actualRow.tareweightuom),
              WagonLength: safeNumeric(actualRow['Wagon length'] || actualRow.WagonLength || actualRow.wagonlength),
              WagonLengthUOM: safeString(actualRow['Wagon length UOM'] || actualRow.WagonLengthUOM || actualRow.wagonlengthuom),
              GrossWeight: safeNumeric(actualRow['Gross Weight'] || actualRow.GrossWeight || actualRow.grossweight),
              GrossWeightUOM: safeString(actualRow['Gross Weight UOM'] || actualRow.GrossWeightUOM || actualRow.grossweightuom),
              QuickCode1: safeString(actualRow['QuickCode1'] || actualRow.QuickCode1 || actualRow.quickcode1),
              QuickCode2: safeString(actualRow['QuickCode2'] || actualRow.QuickCode2 || actualRow.quickcode2),
              QuickCode3: safeString(actualRow['QuickCode3'] || actualRow.QuickCode3 || actualRow.quickcode3),
              QuickCodeValue1: safeString(actualRow['QuickCodeValue1'] || actualRow.QuickCodeValue1 || actualRow.quickcodevalue1),
              QuickCodeValue2: safeString(actualRow['QuickCodeValue2'] || actualRow.QuickCodeValue2 || actualRow.quickcodevalue2),
              QuickCodeValue3: safeString(actualRow['QuickCodeValue3'] || actualRow.QuickCodeValue3 || actualRow.quickcodevalue3),
              Remarks1: safeString(actualRow['Remarks1'] || actualRow.Remarks1 || actualRow.remarks1),
              Remarks2: safeString(actualRow['Remarks2'] || actualRow.Remarks2 || actualRow.remarks2),
              Remarks3: safeString(actualRow['Remarks3'] || actualRow.Remarks3 || actualRow.remarks3),
              ModeFlag: modeFlag // Set appropriate mode flag
            };

            return mappedRow;
          } catch (rowError) {
            throw new Error(`Failed to process row ${index + 1}: ${rowError.message}`);
          }
        });
      } else {
        // If no user edits, only include new/imported data (original logic)
        currentGridData = actualEditableData.filter(row => {
          // Only include rows that are newly imported (have Insert mode flag or isNewRow marker)
          return row.ModeFlag === 'Insert';
        }).map((actualRow, index) => {
          // Map the data to match the expected API format, removing extra parameters
          return {
            Seqno: (index + 1).toString(), // Sequential number starting from 1
            PlanToActualCopy: "",
            WagonPosition: actualRow['Wagon Position'] || actualRow.WagonPosition || actualRow.wagonposition || "",
            WagonType: actualRow['Wagon Type'] || actualRow.WagonType || actualRow.wagontype || "",
            Wagon: actualRow['Wagon ID'] || actualRow.WagonId || actualRow.Wagon || actualRow.wagonid || "",
            WagonDescription: actualRow['Wagon ID'] || actualRow.WagonId || actualRow.WagonDescription || actualRow.wagonid || "",
            WagonQty: actualRow['Wagon Qty'] || actualRow.WagonQty || actualRow.wagonqty || null,
            WagonQtyUOM: actualRow['Wagon Qty UOM'] || actualRow.WagonQtyUOM || actualRow.wagonqtyuom || "",
            ContainerType: actualRow['Container Type'] || actualRow.ContainerType || actualRow.containertype || "",
            ContainerId: actualRow['Container ID'] || actualRow.ContainerId || actualRow.containerid || "",
            ContainerDescription: actualRow['Container ID'] || actualRow.ContainerId || actualRow.ContainerDescription || actualRow.containerid || "",
            ContainerQty: actualRow['Container Qty'] || actualRow.ContainerQty || actualRow.containerqty || null,
            ContainerQtyUOM: actualRow['Container Qty UOM'] || actualRow.ContainerQtyUOM || actualRow.containerqtyuom || "",
            Product: actualRow['Product ID'] || actualRow.CommodityId || actualRow.Product || actualRow.commodityid || "",
            ProductWeight: actualRow['Product Weight'] || actualRow.CommodityActualQty || actualRow.ProductWeight || actualRow.commodityactualqty || null,
            ProductWeightUOM: actualRow['Product Weight UOM'] || actualRow.CommodityQtyUOM || actualRow.ProductWeightUOM || actualRow.commodityqtyuom || "",
            Thu: actualRow['THU ID'] || actualRow.ThuId || actualRow.Thu || actualRow.thuid || "",
            ThuDescription: actualRow['THU ID'] || actualRow.ThuId || actualRow.ThuDescription || actualRow.thuid || "",
            ThuSerialNo: actualRow['THU Serial No'] || actualRow.ThuSerialNo || actualRow.thuserialno || "",
            ThuQty: actualRow['THU Qty'] || actualRow.ThuQty || actualRow.thuqty || null,
            ThuWeight: actualRow['THU Weight'] || actualRow.ThuWeight || actualRow.thuweight || null,
            ThuWeightUOM: actualRow['THU Weight UOM'] || actualRow.ThuWeightUOM || actualRow.thuweightuom || "",
            ShuntingOption: actualRow['Shunting Option'] || actualRow.ShuntingOption || actualRow.shuntingoption || "",
            ReplacedWagon: actualRow['Replaced Wagon ID'] || actualRow.ReplacedWagonId || actualRow.ReplacedWagon || actualRow.replacedwagonid || "",
            ShuntingReasonCode: actualRow['Reason Code'] || actualRow.ReasonCode || actualRow.ShuntingReasonCode || actualRow.reasoncode || "",
            Remarks: actualRow['Remarks'] || actualRow.Remarks || actualRow.remarks || "",
            ShuntInLocation: actualRow['Shunt In Location'] || actualRow.ShuntInLocation || actualRow.shuntinlocation || "",
            ShuntInLocationDescription: actualRow['Shunt In Location'] || actualRow.ShuntInLocation || actualRow.shuntinlocation || "",
            ShuntOutLocation: actualRow['Shunt Out Location'] || actualRow.ShuntOutLocation || actualRow.shuntoutlocation || "",
            ShuntOutLocationDescription: actualRow['Shunt Out Location'] || actualRow.ShuntOutLocation || actualRow.shuntoutlocation || "",
            ShuntInDate: actualRow['Shunt In Date'] ? actualRow['Shunt In Date'].split(' ')[0] : (actualRow.shuntindatetime ? actualRow.shuntindatetime.split(' ')[0] : ""),
            ShuntInTime: actualRow['Shunt In Time'] ? actualRow['Shunt In Time'].split(' ')[1] : (actualRow.shuntindatetime ? actualRow.shuntindatetime.split(' ')[1] : ""),
            ShuntOutDate: actualRow['Shunt Out Date'] ? actualRow['Shunt Out Date'].split(' ')[0] : (actualRow.shuntoutdatetime ? actualRow.shuntoutdatetime.split(' ')[0] : ""),
            ShuntOutTime: actualRow['Shunt Out Time'] ? actualRow['Shunt Out Time'].split(' ')[1] : (actualRow.shuntoutdatetime ? actualRow.shuntoutdatetime.split(' ')[1] : ""),
            ClassOfStores: actualRow['Class Of Stores'] || actualRow.ClassOfStores || actualRow.classofstores || "",
            NHM: actualRow['NHM'] || actualRow.NHM || actualRow.nhm || "",
            NHMDescription: actualRow['NHM'] || actualRow.NHM || actualRow.nhm || "",
            UNCode: actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode || "",
            UNCodeDescription: actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode || "",
            DGClass: actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass || "",
            DGClassDescription: actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass || "",
            ContainsHazardousGoods: actualRow['Contains Hazardous Goods'] || actualRow.ContainsHazardousGoods || actualRow.containshazardousgoods || "",
            WagonSealNo: actualRow['Wagon Seal No.'] || actualRow.WagonSealNo || actualRow.wagonsealn || actualRow.wagonseal || "",
            ContainerSealNo: actualRow['Container Seal No.'] || actualRow.ContainerSealNo || actualRow.containersealn || actualRow.containerseal || "",
            ContainerTareWeight: actualRow['Container Tare Weight'] || actualRow.ContainerTareWeight || actualRow.containertareweight || null,
            ContainerTareWeightUOM: actualRow['Container Tare Weight UOM'] || actualRow.ContainerTareWeightUOM || actualRow.containertareweightuom || "",
            LastCommodityTransported1: actualRow['Last Commodity Transported1'] || actualRow.LastCommodityTransported1 || actualRow.lastcommoditytransported1 || "",
            LastCommodityTransportedDate1: actualRow['Last Commodity Transported Date1'] || actualRow.LastCommodityTransportedDate1 || actualRow.lastcommoditytransporteddate1 || null,
            LastCommodityTransported2: actualRow['Last Commodity Transported2'] || actualRow.LastCommodityTransported2 || actualRow.lastcommoditytransported2 || "",
            LastCommodityTransportedDate2: actualRow['Last Commodity Transported Date2'] || actualRow.LastCommodityTransportedDate2 || actualRow.lastcommoditytransporteddate2 || null,
            LastCommodityTransported3: actualRow['Last Commodity Transported3'] || actualRow.LastCommodityTransported3 || actualRow.lastcommoditytransported3 || "",
            LastCommodityTransportedDate3: actualRow['Last Commodity Transported Date3'] || actualRow.LastCommodityTransportedDate3 || actualRow.lastcommoditytransporteddate3 || null,
            WagonTareWeight: actualRow['Tare Weight'] || actualRow.TareWeight || actualRow.WagonTareWeight || actualRow.tareweight || null,
            WagonTareWeightUOM: actualRow['Tare Weight UOM'] || actualRow.TareWeightUOM || actualRow.WagonTareWeightUOM || actualRow.tareweightuom || "",
            WagonLength: actualRow['Wagon length'] || actualRow.WagonLength || actualRow.wagonlength || null,
            WagonLengthUOM: actualRow['Wagon length UOM'] || actualRow.WagonLengthUOM || actualRow.wagonlengthuom || "",
            GrossWeight: actualRow['Gross Weight'] || actualRow.GrossWeight || actualRow.grossweight || null,
            GrossWeightUOM: actualRow['Gross Weight UOM'] || actualRow.GrossWeightUOM || actualRow.grossweightuom || null,
            QuickCode1: actualRow['Quick Code1'] || actualRow.QuickCode1 || actualRow.quickcode1 || "",
            QuickCode2: actualRow['Quick Code2'] || actualRow.QuickCode2 || actualRow.quickcode2 || "",
            QuickCode3: actualRow['Quick Code3'] || actualRow.QuickCode3 || actualRow.quickcode3 || "",
            QuickCodeValue1: actualRow['Quick Code Value1'] || actualRow.QuickCodeValue1 || actualRow.quickcodevalue1 || "",
            QuickCodeValue2: actualRow['Quick Code Value2'] || actualRow.QuickCodeValue2 || actualRow.quickcodevalue2 || "",
            QuickCodeValue3: actualRow['Quick Code Value3'] || actualRow.QuickCodeValue3 || actualRow.quickcodevalue3 || "",
            Remarks1: actualRow['Remarks1'] || actualRow.Remarks1 || actualRow.remarks1 || "",
            Remarks2: actualRow['Remarks2'] || actualRow.Remarks2 || actualRow.remarks2 || "",
            Remarks3: actualRow['Remarks3'] || actualRow.Remarks3 || actualRow.remarks3 || "",
            ModeFlag: "Insert" // All newly imported data gets Insert mode
          };
        });
      }

      // Include deleted data from import operations (existing data removed during import)
      const deletedDataToInclude = deletedDataFromImport.map((deletedRow, index) => ({
        ...deletedRow,
        ModeFlag: "Delete" // Existing records that were removed during import
      }));

      // Combine only the data that needs to be sent to API
      const allDataToSave = [...currentGridData, ...deletedDataToInclude];

      // If no data to save, return early
      if (allDataToSave.length === 0) {
        // Check if user has edited data but no valid data to save
        if (hasUserEditsRef.current) {
          toast({
            title: "⚠️ Invalid Data",
            description: "Please ensure all required fields are filled correctly.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "⚠️ No Changes",
            description: "No changes to save.",
            variant: "default",
          });
        }
        return;
      }

      console.log("updatedTripData 1111", allDataToSave);
      // Create a deep copy of the trip data to avoid mutation
      const updatedTripData = JSON.parse(JSON.stringify(currentTripData));
      console.log("updatedTripData 1111", updatedTripData);
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
          updatedTripData.LegDetails[legIndex].Consignment = [];
        }

        if (!Array.isArray(updatedTripData.LegDetails[legIndex].Consignment)) {
          updatedTripData.LegDetails[legIndex].Consignment = [];
        }

        const consignmentIndex = 0; 

        // Initialize consignment object if it doesn't exist
        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex]) {
          updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex] = {};
        }

        // Replace the entire Actual array with our updated data
        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual) {
          updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = [];
        }

        updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = allDataToSave;

        console.log("updatedTripData ======1", updatedTripData);
        
        // Save to API
        
        try {
          const response = await tripService.saveTrip(updatedTripData);

          const resourceStatus = (response as any)?.data?.IsSuccess;

          if (resourceStatus) {
            manageTripStore.getState().setTrip(updatedTripData);
            setDeletedDataFromImport([]);

            // Reset the user edits flag after successful save
            hasUserEditsRef.current = false;

            toast({
              title: "✅ Actual Details Saved Successfully",
              description: (response as any)?.data?.ResponseData?.Message || "Your actual details have been saved.",
              variant: "default",
            });

            // After successful save, wait a moment before fetching updated trip data to allow backend processing
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            try {
              // Get tripId from manageTripStore Header.TripNo
              const currentTripData = manageTripStore.getState().tripData;
              const tripId = currentTripData?.Header?.TripNo || updatedTripData.TripId || updatedTripData.TripID;
        

              if (tripId) {
                const refreshResponse = await tripService.getTripById({ id: tripId });

                if ((refreshResponse as any)?.data?.IsSuccess) {
                  const refreshedTripData = JSON.parse((refreshResponse as any).data.ResponseData);

                  // Update the trip store with fresh data
                  manageTripStore.getState().setTrip(refreshedTripData);

                  // Find the current leg and update actual data
                  const legDetails = refreshedTripData.LegDetails;
                  if (legDetails && Array.isArray(legDetails)) {
                    const currentLegData = legDetails.find(leg => leg.LegSequence === legId);
                

                    if (currentLegData?.Consignment?.[0]?.Actual && Array.isArray(currentLegData.Consignment[0].Actual)) {
                      // Update actualEditableData with fresh data from API
                      setActualEditableData(currentLegData.Consignment[0].Actual);

                      toast({
                        title: "🔄 Data Refreshed",
                        description: "Trip data has been refreshed successfully.",
                        variant: "default",
                      });
                    } else {
                     
                      if (currentLegData?.Consignment?.[0]) {
                        currentLegData.Consignment[0].Actual = allDataToSave;

                        manageTripStore.getState().setTrip(refreshedTripData);

                        setActualEditableData([...allDataToSave]);
                      }

                      toast({
                        title: "✅ Data Saved & Refreshed",
                        description: "Data saved successfully and grid has been refreshed with latest data.",
                        variant: "default",
                      });
                    }
                  } else {
                    toast({
                      title: "⚠️ Refresh Warning",
                      description: "Data saved but leg details not found in refreshed trip.",
                      variant: "destructive",
                    });
                  }
                } else {
                  toast({
                    title: "⚠️ Refresh Failed",
                    description: "Data saved successfully but failed to refresh trip data. Please reload the page.",
                    variant: "destructive",
                  });
                }
              } else {
                toast({
                  title: "⚠️ Refresh Failed",
                  description: "Data saved successfully but no trip ID found to refresh data.",
                  variant: "destructive",
                });
              }
            } catch (refreshError) {
              toast({
                title: "⚠️ Refresh Failed",
                description: `Data saved successfully but failed to refresh: ${refreshError.message}`,
                variant: "destructive",
              });
            }

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

        setSelectedCustomerIndex('0');
        const selected = cons[0];
        setSelectedCustomerData(selected); // Use raw consignment data
        setPlannedData(selected?.Planned ?? []);
        setActualData(selected?.Actual ?? []);
        setActualEditableData(selected?.Actual ?? []);
      } else {
        // reset everything if no consignment for new leg
        setCustomerList([]);
        setSelectedCustomerIndex('');
        setSelectedCustomerData({});
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
    <>
      <style>{`
        .grid-container-fix {
          pointer-events: auto !important;
          z-index: 1;
        }
        .grid-wrapper {
          pointer-events: auto !important;
          overflow: visible !important;
        }
        .grid-content {
          pointer-events: auto !important;
        }
        .grid-container-fix button {
          pointer-events: auto !important;
          z-index: 10;
        }
        .grid-container-fix .toolbar {
          pointer-events: auto !important;
          z-index: 20;
        }
        
        /* CSS to ensure consistent column widths across headers, filters, and data cells */
        .consignment-grid-container table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        
        .consignment-grid-container table th,
        .consignment-grid-container table td {
          min-width: unset !important;
          max-width: unset !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        /* Override percentage-based widths with fixed pixel widths from column config */
        .consignment-grid-container table th[style*="width"],
        .consignment-grid-container table td[style*="width"] {
          width: auto !important;
          min-width: auto !important;
          max-width: auto !important;
        }
        
        /* Force each column to use its defined width from the column configuration */
        .consignment-grid-container table th:nth-child(1),
        .consignment-grid-container table td:nth-child(1) { width: 120px !important; }
        .consignment-grid-container table th:nth-child(2),
        .consignment-grid-container table td:nth-child(2) { width: 150px !important; }
        .consignment-grid-container table th:nth-child(3),
        .consignment-grid-container table td:nth-child(3) { width: 200px !important; }
        .consignment-grid-container table th:nth-child(4),
        .consignment-grid-container table td:nth-child(4) { width: 200px !important; }
        .consignment-grid-container table th:nth-child(5),
        .consignment-grid-container table td:nth-child(5) { width: 200px !important; }
        .consignment-grid-container table th:nth-child(6),
        .consignment-grid-container table td:nth-child(6) { width: 200px !important; }
        .consignment-grid-container table th:nth-child(7),
        .consignment-grid-container table td:nth-child(7) { width: 200px !important; }
        .consignment-grid-container table th:nth-child(8),
        .consignment-grid-container table td:nth-child(8) { width: 250px !important; }
        .consignment-grid-container table th:nth-child(9),
        .consignment-grid-container table td:nth-child(9) { width: 160px !important; }
        .consignment-grid-container table th:nth-child(10),
        .consignment-grid-container table td:nth-child(10) { width: 180px !important; }
        
        /* Ensure column filter inputs respect the same width */
        .consignment-grid-container .column-filter-input {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>
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
              {/* <Button size="sm" className="h-8" onClick={() => setShowPlanActualDrawer(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Actuals
              </Button> */}
              {/* <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </Button> */}
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
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg relative">
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
            <div className="flex items-center gap-2">
              <Switch id="pickupComplete" checked={pickupComplete} onCheckedChange={(checked) => setPickupComplete(checked as boolean)} />
              <Label htmlFor="maintenanceRequired" className="cursor-pointer">Pickup Complete for this CO</Label>
            </div>

            <Button
              variant="outline"
              className="border border-blue-500 text-blue-500 hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3 absolute right-0"
            >
              <Plus className="h-4 w-4" />
              Add Via Point
            </Button>

          </div>
          <Collapsible open={expandedCOInfo} onOpenChange={setExpandedCOInfo} className='space-y-2 rounded-lg'>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between py-2 hover:bg-muted/50 bg-muted/50 transition-colors rounded-t-lg">
                {/* <span className="font-semibold text-sm">Customer Order Info</span> */}
                <h4 className="font-semibold flex items-center gap-2">Customer Order Info</h4>
                {expandedCOInfo ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='px-4 pb-4'>
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
                      {/* <Button
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
                </Button> */}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Planned Section */}
          <div className="space-y-4 bg-muted/50 rounded-lg">
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
                    <div className="border rounded-lg overflow-x-auto overflow-y-hidden pt-2 w-full consignment-grid-container" style={{ minWidth: '800px' }}>
                      {/* Planned Grid */}
                      {plannedData && (
                        <div style={{ width: `${gridTotalWidth}px`, minWidth: `${gridTotalWidth}px` }}>
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
                        </div>
                      )}

                      {/* Actual Grid */}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actuals Section */}
          <div className="space-y-4 mb-8">
            <div
              className="flex items-center justify-between cursor-pointer p-2 -mx-2 bg-muted/50 rounded-lg hover:bg-muted/50 mb-12"
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
                    {/* Table - Fixed width container with horizontal scroll for many columns */}
                    <div className="border rounded-lg overflow-x-auto overflow-y-hidden pt-2 w-full consignment-grid-container" style={{ minWidth: '800px' }}>
                      {actualEditableData && (
                        <div style={{ width: `${gridTotalWidth}px`, minWidth: `${gridTotalWidth}px` }}>
                          <ActualSmartGridPlus
                            key={`actual-grid-${legId}-${selectedCustomerIndex}`}
                            columns={actualEditableColumns}
                            data={[...actualEditableData]}
                            gridTitle="Actuals"
                            inlineRowAddition={true}
                            inlineRowEditing={true}
                            onAddRow={handleAddRow}
                            onEditRow={handleEditRow}
                            onDeleteRow={handleDeleteRow}
                            onImport={handleImportData}
                            onExport={handleExportData}
                            onImportData={(importedData) => {
                              setActualEditableData(prev => {
                                const newData = [...prev, ...importedData];
                                return newData;
                              });
                              // Set flag to indicate user has made edits
                              hasUserEditsRef.current = true;
                            }}
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
                            hideAdvancedFilter={false}
                            hideCheckboxToggle={true}
                            gridId={gridActualId}
                            userId="current-user"
                            editableColumns={['plannedStartEndDateTime']}
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
              <div className='flex justify-end fixed bottom-0 right-[40px] bg-white w-full'>
                <Button
                  className="h-8 my-2 bg-blue-600 rounded hover:bg-blue-700"
                  onClick={handleSavePlanActuals}
                >
                  Save Consignment
                </Button>
              </div>

              {/* Debug button for testing - can be removed in production */}
              {/* {process.env.NODE_ENV === 'development' && (
                <Button
                  className="h-8 my-2 ml-2 bg-orange-600 rounded hover:bg-orange-700"
                  onClick={() => {
                    console.log("Force save - setting hasUserEdits to true");
                    hasUserEditsRef.current = true;
                    handleSavePlanActuals();
                  }}
                >
                  Force Save (Debug)
                </Button>
              )} */}
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

        {/* Import Dialog */}
        <CustomBulkUpload
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          acceptedFileTypes={['.csv', '.xlsx', '.xls']}
          maxFileSizeMB={2}
          columnsConfig={[]}
          onUpload={async (file: File) => {

            // Process Excel/CSV file and return the data
            return new Promise((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = (e) => {
                try {
                  const data = e.target?.result;
                  let jsonData: any[] = [];

                  if (file.name.endsWith('.csv')) {
                    // Parse CSV
                    const text = data as string;
                    const lines = text.split('\n').filter(line => line.trim());
                    const headers = lines[0].split(',').map(h => h.trim());
                    const rows = lines.slice(1).map(line => {
                      const values = line.split(',').map(v => v.trim());
                      const row: any = {};
                      headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                      });
                      return row;
                    });
                    jsonData = rows;
                  } else {
                    // Parse Excel using XLSX
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json(worksheet);
                  }

                  resolve(jsonData);
                } catch (error) {
                  reject(error);
                }
              };

              reader.onerror = () => {
                reject(new Error('Failed to read file'));
              };

              if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
              } else {
                reader.readAsBinaryString(file);
              }
            });
          }}
          onValidate={(data: any[], columnsConfig: any[]) => ({
            isValid: true,
            errors: [],
            validRows: data,
            invalidRows: []
          })}
          onImportComplete={handleImportComplete}
          allowMultipleFiles={false}
        />
      </TabsContent>
    </>
  );
};