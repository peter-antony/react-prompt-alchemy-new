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
import { useEffect, useState, useRef, useMemo, useCallback, act } from 'react';
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
import { set } from 'date-fns';

// Helper function to safely split values from LazySelect
const safeSplit = (value: string | undefined, delimiter: string, index: number, fallback: string = ''): string => {
  if (!value || typeof value !== 'string') return fallback;
  const parts = value.split(delimiter);
  return parts[index] || fallback;
};

export const ConsignmentTrip = ({ legId, tripData, onClose }: { legId: string, tripData?: any, onClose?: () => void }) => {
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
  const [pickupComplete, setPickupComplete] = useState();
  const [pickupCompleteDisabled, setPickupCompleteDisabled] = useState(false);
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
  const [productChangeTracker, setProductChangeTracker] = useState<{ rowIndex: number, productId: string } | null>(null);
  const [unCodeChangeTracker, setUnCodeChangeTracker] = useState<{ rowIndex: number, unCode: string } | null>(null);
  const [cachedUnCodeOptions, setCachedUnCodeOptions] = useState<any[]>([]);
  const [lastProductIdForUnCode, setLastProductIdForUnCode] = useState<string>('');
  const [cachedProductOptions, setCachedProductOptions] = useState<any[]>([]);
  const [lastUnCodeForProduct, setLastUnCodeForProduct] = useState<string>('');
  const [forceUnCodeRefresh, setForceUnCodeRefresh] = useState<boolean>(false);
  const [forceProductRefresh, setForceProductRefresh] = useState<boolean>(false);
  const [gridRefreshKey, setGridRefreshKey] = useState<number>(0);

  // Track when fields are being programmatically set vs user-initiated changes
  const [isProductBeingSet, setIsProductBeingSet] = useState<boolean>(false);
  const [isUnCodeBeingSet, setIsUnCodeBeingSet] = useState<boolean>(false);
  const [userInitiatedProductChange, setUserInitiatedProductChange] = useState<boolean>(false);
  const [userInitiatedUnCodeChange, setUserInitiatedUnCodeChange] = useState<boolean>(false);

  // Track field selection priority for new rows - which field was selected first has priority
  const [newRowFieldPriority, setNewRowFieldPriority] = useState<'product' | 'uncode' | null>(null);

  // Function to force grid refresh with new data
  // Helper function to safely update a row while preserving important flags
  const safeUpdateRow = useCallback((currentRow: any, updates: any) => {
    if (!currentRow) {
      console.warn('safeUpdateRow: currentRow is null or undefined');
      return updates;
    }

    // Always preserve critical ModeFlags (Delete, Insert) - these should NEVER be overwritten
    let preservedModeFlag;
    if (currentRow.ModeFlag === 'Delete') {
      preservedModeFlag = 'Delete';
      console.log('safeUpdateRow: Preserving Delete ModeFlag');
    } else if (currentRow.ModeFlag === 'Insert') {
      preservedModeFlag = 'Insert';
      console.log('safeUpdateRow: Preserving Insert ModeFlag');
    } else {
      // For other ModeFlags, allow updates or use existing
      preservedModeFlag = updates.ModeFlag || currentRow.ModeFlag || 'Update';
    }

    // Prevent ModeFlag from being overwritten in updates if it's critical
    const safeUpdates = { ...updates };
    if (currentRow.ModeFlag === 'Delete' || currentRow.ModeFlag === 'Insert') {
      delete safeUpdates.ModeFlag; // Remove any ModeFlag changes from updates
    }

    return {
      ...currentRow,
      ...safeUpdates,
      ModeFlag: preservedModeFlag
    };
  }, []);

  const forceGridRefresh = useCallback((newData: any[], description: string) => {
    console.log(`Forcing grid refresh: ${description}`);

    // Clear data first to force unmount/remount of rows
    setActualEditableData([]);

    // Set new data in next tick with key update
    setTimeout(() => {
      setActualEditableData([...newData]);
      setGridRefreshKey(prev => prev + 1);
      console.log(`Grid refreshed: ${description}, total rows:`, newData.length);
    }, 50);
  }, []);

  // Initialize dropdown state variables when selectedCustomerData changes
  useEffect(() => {
    if (selectedCustomerData) {
      if (selectedCustomerData?.SourceBRId) {
        setSourceBRId(selectedCustomerData?.SourceBRId || "");
      }
      if (selectedCustomerData?.ReturnBRId) {
        setReturnBRId(selectedCustomerData?.ReturnBRId || "");
      }
      // Bind Pickup Complete switch from API and set disabled state
      const apiPickup = selectedCustomerData?.PickupCompleteForThisCustomerOrder;
      if (apiPickup !== undefined && apiPickup !== null) {
        const isComplete = apiPickup === '1' || apiPickup === 1 || apiPickup === true;
        setPickupComplete(isComplete);
        setPickupCompleteDisabled(!isComplete);
      }
    }
  }, [selectedCustomerData]);

  useEffect(() => {
    if (productChangeTracker && userInitiatedProductChange && !isUnCodeBeingSet) {
      console.log('Product change triggered by user selection, loading UN Code options');
      productOnSelectUncodeLoad();
      setProductChangeTracker(null);
      setUserInitiatedProductChange(false);
    } else if (productChangeTracker && !userInitiatedProductChange) {
      console.log('Product change not user-initiated (programmatic), skipping UN Code reload');
      setProductChangeTracker(null);
    }
  }, [productChangeTracker, userInitiatedProductChange, isUnCodeBeingSet]);

  useEffect(() => {
    if (unCodeChangeTracker && userInitiatedUnCodeChange && !isProductBeingSet) {
      console.log('UN Code change triggered by user selection, loading Product options');
      unCodeOnSelectProductLoad();
      setUnCodeChangeTracker(null);
      setUserInitiatedUnCodeChange(false);
    } else if (unCodeChangeTracker && !userInitiatedUnCodeChange) {
      console.log('UN Code change not user-initiated (programmatic), skipping Product reload');
      setUnCodeChangeTracker(null);
    }
  }, [unCodeChangeTracker, userInitiatedUnCodeChange, isProductBeingSet]);

  // Clear cached options only when switching between different existing rows (not when setting to -1 for new rows)
  const prevEditingRowIndex = useRef(currentEditingRowIndex);
  useEffect(() => {
    const prev = prevEditingRowIndex.current;
    const current = currentEditingRowIndex;

    // Only clear cache if we're switching from one existing row (>=0) to another existing row (>=0)
    // Don't clear when involving -1 (new rows) or null
    const shouldClearCache = (prev !== null && prev >= 0) && (current !== null && current >= 0) && prev !== current;

    if (shouldClearCache) {
      console.log('Clearing cache due to existing row change from', prev, 'to', current);
      setCachedUnCodeOptions([]);
      setLastProductIdForUnCode('');
      setCachedProductOptions([]);
      setLastUnCodeForProduct('');
    } else {
      console.log('Preserving cache - row change from', prev, 'to', current, '(involves new row or same row)');
    }

    prevEditingRowIndex.current = currentEditingRowIndex;
  }, [currentEditingRowIndex]);

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
      key: 'ProductDescription',
      label: 'Product Description',
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
      label: 'Wagon Length',
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
  const createProductFetchOptions = useMemo(() => {
    // Reset the refresh flag when function is recreated
    if (forceProductRefresh) {
      setForceProductRefresh(false);
    }

    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      let unCodeValue = '';

      // Try multiple sources to get the UN Code in order of preference:
      // 1. From unCodeChangeTracker (if active UN Code selection is happening)
      if (unCodeChangeTracker && unCodeChangeTracker.unCode) {
        unCodeValue = unCodeChangeTracker.unCode;
      }
      // 2. From current editing row data
      else if (currentEditingRowIndex !== null && currentEditingRowIndex >= 0 && actualEditableData[currentEditingRowIndex]) {
        unCodeValue = actualEditableData[currentEditingRowIndex].UNCode || '';
      }
      // 3. If we have cached data, use the lastUnCodeForProduct as a fallback
      else if (cachedProductOptions.length > 0 && lastUnCodeForProduct) {
        unCodeValue = lastUnCodeForProduct;
        console.log('createProductFetchOptions: Using cached unCode as fallback:', unCodeValue);
      }

      console.log('createProductFetchOptions: Determined unCode:', unCodeValue, 'from sources - tracker:', !!unCodeChangeTracker, 'editingRowIndex:', currentEditingRowIndex, 'cachedFallback:', !!(cachedProductOptions.length > 0 && lastUnCodeForProduct));

      // Check if there's an active unCodeChangeTracker (indicates UN Code was just selected)
      // If so, don't make API call as unCodeOnSelectProductLoad will handle it
      if (unCodeChangeTracker && unCodeChangeTracker.unCode === unCodeValue) {
        console.log('createProductFetchOptions: UN Code selection in progress, waiting for unCodeOnSelectProductLoad to complete');

        // Return cached data if available, otherwise empty (will be populated soon by unCodeOnSelectProductLoad)
        if (cachedProductOptions.length > 0 && lastUnCodeForProduct === unCodeValue) {
          console.log('Using cached data while UN Code selection is active');
          if (searchTerm) {
            const filtered = cachedProductOptions.filter(option =>
              option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              option.value?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return filtered.slice(offset, offset + limit);
          }
          return cachedProductOptions.slice(offset, offset + limit);
        } else {
          console.log('No cached data yet, returning empty while waiting for unCodeOnSelectProductLoad');
          return [];
        }
      }

      // Check if we have cached results for the same unCodeValue
      console.log('createProductFetchOptions: Checking cache for unCode:', unCodeValue, 'Cached unCode:', lastUnCodeForProduct, 'Cache size:', cachedProductOptions.length);

      if (cachedProductOptions.length > 0 && lastUnCodeForProduct === unCodeValue) {
        console.log('Using cached Product options, avoiding duplicate API call');
        // Apply search term filtering if provided
        if (searchTerm) {
          const filtered = cachedProductOptions.filter(option =>
            option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return filtered.slice(offset, offset + limit);
        }
        return cachedProductOptions.slice(offset, offset + limit);
      }

      // Only make API call if we don't have cached data and no active UN Code selection
      console.log('Making Product API call as no cached data available and no active UN Code selection');
      const response = await quickOrderService.getDynamicSearchData({
        messageType: "Product ID Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
        searchCriteria: {
          id: searchTerm,
          name: searchTerm
      },
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
  }, [cachedProductOptions, lastUnCodeForProduct, unCodeChangeTracker, currentEditingRowIndex, actualEditableData, forceProductRefresh]);
  const productOnSelectUncodeLoad = async () => {
    let productIDValue = '';
    // Use productChangeTracker.productId if available, otherwise get from existing row data
    if (productChangeTracker && productChangeTracker.productId) {
      productIDValue = productChangeTracker.productId;
    } else if (currentEditingRowIndex !== null && currentEditingRowIndex >= 0 && actualEditableData[currentEditingRowIndex]) {
      productIDValue = actualEditableData[currentEditingRowIndex].Product || '';
    }
    // Now productIDValue will have the correct value for both new rows (-1) and existing rows
    const response = await quickOrderService.getDynamicSearchData({
      messageType: "UN Code Init",
      searchTerm: '',
      additionalFilter: [
        {
          FilterName: "ProductId",
          FilterValue: productIDValue
        }
      ]
    });
    const rr: any = response.data
    const unCodeOptions = (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
      ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
        ? {
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }
        : {})
    }));

    // Cache the results and the product ID they were fetched for
    setCachedUnCodeOptions(unCodeOptions);
    setLastProductIdForUnCode(productIDValue);

    // Clear the productChangeTracker to indicate that caching is complete
    setProductChangeTracker(null);

    // Trigger refresh flag to force UN Code dropdown refresh
    setForceUnCodeRefresh(true);

    console.log('productOnSelectUncodeLoad: Cached UN Code options for productId:', productIDValue, 'Options count:', unCodeOptions.length, 'cleared productChangeTracker, and set refresh flag'); return unCodeOptions;
  };
  const unCodeOnSelectProductLoad = async () => {
    let unCodeValue = '';
    // Use unCodeChangeTracker.unCode if available, otherwise get from existing row data
    if (unCodeChangeTracker && unCodeChangeTracker.unCode) {
      unCodeValue = unCodeChangeTracker.unCode;
    } else if (currentEditingRowIndex !== null && currentEditingRowIndex >= 0 && actualEditableData[currentEditingRowIndex]) {
      unCodeValue = actualEditableData[currentEditingRowIndex].UNCode || '';
    }
    // Now unCodeValue will have the correct value for both new rows (-1) and existing rows
    const response = await quickOrderService.getDynamicSearchData({
      messageType: "Product ID Init",
      searchTerm: '',
      additionalFilter: [
        {
          FilterName: "Uncode",
          FilterValue: unCodeValue
        }
      ]
    });
    const rr: any = response.data
    const productOptions = (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
      ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
        ? {
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }
        : {})
    }));

    // Cache the results and the UN Code they were fetched for
    setCachedProductOptions(productOptions);
    setLastUnCodeForProduct(unCodeValue);

    // Clear the unCodeChangeTracker to indicate that caching is complete
    setUnCodeChangeTracker(null);

    // Trigger refresh flag to force Product dropdown refresh
    setForceProductRefresh(true);

    console.log('unCodeOnSelectProductLoad: Cached Product options for unCode:', unCodeValue, 'Options count:', productOptions.length, 'cleared unCodeChangeTracker, and set refresh flag');

    return productOptions;
  };
  const createUnCodeFetchOptions = useMemo(() => {
    // Reset the refresh flag when function is recreated
    if (forceUnCodeRefresh) {
      setForceUnCodeRefresh(false);
    }

    return async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
      let productIDValue = '';

      // Try multiple sources to get the product ID in order of preference:
      // 1. From productChangeTracker (if active product selection is happening)
      if (productChangeTracker && productChangeTracker.productId) {
        productIDValue = productChangeTracker.productId;
      }
      // 2. From current editing row data
      else if (currentEditingRowIndex !== null && currentEditingRowIndex >= 0 && actualEditableData[currentEditingRowIndex]) {
        productIDValue = actualEditableData[currentEditingRowIndex].Product || '';
      }
      // 3. If we have cached data, use the lastProductIdForUnCode as a fallback
      else if (cachedUnCodeOptions.length > 0 && lastProductIdForUnCode) {
        productIDValue = lastProductIdForUnCode;
        console.log('createUnCodeFetchOptions: Using cached productId as fallback:', productIDValue);
      }

      console.log('createUnCodeFetchOptions: Determined productId:', productIDValue, 'from sources - tracker:', !!productChangeTracker, 'editingRowIndex:', currentEditingRowIndex, 'cachedFallback:', !!(cachedUnCodeOptions.length > 0 && lastProductIdForUnCode));

      // Check if there's an active productChangeTracker (indicates product was just selected)
      // If so, don't make API call as productOnSelectUncodeLoad will handle it
      if (productChangeTracker && productChangeTracker.productId === productIDValue) {
        console.log('createUnCodeFetchOptions: Product selection in progress, waiting for productOnSelectUncodeLoad to complete');

        // Return cached data if available, otherwise empty (will be populated soon by productOnSelectUncodeLoad)
        if (cachedUnCodeOptions.length > 0 && lastProductIdForUnCode === productIDValue) {
          console.log('Using cached data while product selection is active');
          if (searchTerm) {
            const filtered = cachedUnCodeOptions.filter(option =>
              option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              option.value?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return filtered.slice(offset, offset + limit);
          }
          return cachedUnCodeOptions.slice(offset, offset + limit);
        } else {
          console.log('No cached data yet, returning empty while waiting for productOnSelectUncodeLoad');
          return [];
        }
      }

      // Check if we have cached results for the same productIDValue
      console.log('createUnCodeFetchOptions: Checking cache for productId:', productIDValue, 'Cached productId:', lastProductIdForUnCode, 'Cache size:', cachedUnCodeOptions.length);

      if (cachedUnCodeOptions.length > 0 && lastProductIdForUnCode === productIDValue) {
        console.log('Using cached UN Code options, avoiding duplicate API call');
        // Apply search term filtering if provided
        if (searchTerm) {
          const filtered = cachedUnCodeOptions.filter(option =>
            option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.value?.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return filtered.slice(offset, offset + limit);
        }
        return cachedUnCodeOptions.slice(offset, offset + limit);
      }

      // Only make API call if we don't have cached data and no active product selection
      console.log('Making UN Code API call as no cached data available and no active product selection');
      const response = await quickOrderService.getDynamicSearchData({
        messageType: "UN Code Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
        searchCriteria: {
            id: searchTerm,
            name: searchTerm
          },
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
  }, [cachedUnCodeOptions, lastProductIdForUnCode, productChangeTracker, currentEditingRowIndex, actualEditableData, forceUnCodeRefresh]);
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
      key: 'WagonTypeDescription',
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
              WagonTypeDescription: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              const updatedRow = {
                ...newData[rowIndex],
                WagonTypeDescription: value,
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
                WagonTypeDescription: '',
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
                ...(wagonData.WagonType && { WagonType: wagonData.WagonType }),
                ...(wagonData.WagonTypeDescription && { WagonTypeDescription: wagonData.WagonTypeDescription }),
                ...(wagonData.WagonQty && { WagonQty: wagonData.WagonQty }),
                ...(wagonData.WagonUOM && { WagonQtyUOM: wagonData.WagonUOM }),
                ...(wagonData.WagonLengthUOM && { WagonLengthUOM: wagonData.WagonLengthUOM }),
                ...(wagonData.TareWeightUOM && { WagonTareWeightUOM: wagonData.TareWeightUOM }),
                ...(wagonData.TareWeight && { WagonTareWeight: wagonData.TareWeight }),
                ...(wagonData.WagonLength && { WagonLength: wagonData.WagonLength }),
              }));
            } else {
              // API returned empty response or this is a new entry
              setNewRowValues((prev: any) => ({
                ...prev,
                Wagon: value,
                WagonDescription: value,
                WagonType: 'UT',
                WagonTypeDescription: 'Unknown Type',
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
                  WagonTypeDescription: '',
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
                  ...(wagonData.WagonTypeDescription && { WagonTypeDescription: wagonData.WagonTypeDescription }),
                  ...(wagonData.WagonType && { WagonType: wagonData.WagonType }),
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
                  WagonTypeDescription: 'Unknown Type',
                  WagonType: 'UT',
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonQtyUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              // Skip updating if row is marked for deletion
              if (newData[rowIndex].ModeFlag === 'Delete') {
                console.warn('Attempting to update deleted row, skipping update');
                return newData;
              }
              // Use safe update to preserve critical ModeFlags like Delete/Insert
              newData[rowIndex] = safeUpdateRow(newData[rowIndex], { WagonQtyUOM: value });
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon qty UOM:', error);
        }
      },
    },
    {
      key: 'WagonQty',
      label: 'Wagon Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonQty: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonQty: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon qty:', error);
        }
      },
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            NHM: safeSplit(value, ' || ', 0),
            NHMDescription: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              NHM: safeSplit(value, ' || ', 0),
              NHMDescription: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'Product',
      label: 'Product ID',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      fetchOptions: createProductFetchOptions,
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;

          // Check if this is a manual clear operation (empty value)
          const isManualClear = !value || value === '' || value === null || value === undefined;

          // Mark this as a user-initiated change
          setUserInitiatedProductChange(true);
          setIsProductBeingSet(true);

          // If user manually cleared the field, don't trigger UN Code loading
          if (isManualClear) {
            console.log('Product field manually cleared by user, not triggering UN Code reload');
            setUserInitiatedProductChange(false);

            // Clear the Product field and related UN Code data
            if (actualRowIndex === -1 && setNewRowValues) {
              setIsUnCodeBeingSet(true);
              setNewRowValues((prev: any) => ({
                ...prev,
                Product: '',
                ProductDescription: '',
                UNCode: '',
                UNCodeDescription: '',
                DGClass: '',
                DGClassDescription: '',
              }));
              setTimeout(() => setIsUnCodeBeingSet(false), 100);

              // Reset field priority when manually cleared in new row
              setNewRowFieldPriority(null);
              console.log('Reset field priority due to manual Product clear in new row');
            } else {
              setActualEditableData(prevData => {
                const newData = [...prevData];
                if (newData[rowIndex]) {
                  setIsUnCodeBeingSet(true);
                  newData[rowIndex] = {
                    ...newData[rowIndex],
                    Product: '',
                    ProductDescription: '',
                    UNCode: '',
                    UNCodeDescription: '',
                    DGClass: '',
                    DGClassDescription: '',
                  };
                  setTimeout(() => setIsUnCodeBeingSet(false), 100);
                }
                hasUserEditsRef.current = true;
                return newData;
              });
            }

            setIsProductBeingSet(false);
            return;
          }

          // Handle new row case (rowIndex = -1)
          if (actualRowIndex === -1 && setNewRowValues) {
            // Check if UN Code was selected first and has priority
            if (newRowFieldPriority === 'uncode') {
              console.log('Product ID selected from loaded data after UN Code selection - not triggering UN Code API');
              // Just update the Product ID fields without calling UN Code API
              setNewRowValues((prev: any) => ({
                ...prev,
                Product: safeSplit(value, ' || ', 0),
                ProductDescription: safeSplit(value, ' || ', 1),
              }));

              // Reset Product being set flag
              setIsProductBeingSet(false);
              return;
            }

            // If no priority set or Product has priority, proceed with API call
            // Fetch product data for new row
            const response = await quickOrderService.getDynamicSearchData({
              messageType: "ProductID On Select",
              searchCriteria: {
                ProductID: safeSplit(value, ' || ', 0),
              },
            });
            const rr: any = response.data;
            const payload = JSON.parse(rr.ResponseData);

            if (payload && payload.ResponsePayload) {
              const productfetchData = payload.ResponsePayload;

              // Mark UN Code as being programmatically set
              setIsUnCodeBeingSet(true);

              setNewRowValues((prev: any) => ({
                ...prev,
                Product: safeSplit(value, ' || ', 0),
                ProductDescription: safeSplit(value, ' || ', 1),
                UNCode: productfetchData[0].UNCode || '',
                UNCodeDescription: productfetchData[0].UNDescription || '',
                DGClass: productfetchData[0].DGClass && productfetchData[0].DGClassDescription
                  ? `${productfetchData[0].DGClass}`
                  : (productfetchData[0].DGClass || ''),
                DGClassDescription: productfetchData[0].DGClassDescription || '',
              }));

              // Reset the UN Code being set flag after a short delay
              setTimeout(() => setIsUnCodeBeingSet(false), 100);

              // Set priority to Product since it was selected first
              if (newRowFieldPriority === null) {
                setNewRowFieldPriority('product');
                console.log('Setting Product ID priority for new row');
              }

              // Set currentEditingRowIndex to -1 for new rows
              setCurrentEditingRowIndex(-1);
              setProductChangeTracker({
                rowIndex: -1,
                productId: safeSplit(value, ' || ', 0)
              });
            } else {
              // Mark UN Code as being programmatically set (cleared)
              setIsUnCodeBeingSet(true);

              setNewRowValues((prev: any) => ({
                ...prev,
                Product: safeSplit(value, ' || ', 0),
                ProductDescription: safeSplit(value, ' || ', 1),
                UNCode: '',
                UNCodeDescription: '',
                DGClass: '',
                DGClassDescription: '',
              }));

              // Reset the UN Code being set flag after a short delay
              setTimeout(() => setIsUnCodeBeingSet(false), 100);

              // Set priority to Product since it was selected first
              if (newRowFieldPriority === null) {
                setNewRowFieldPriority('product');
                console.log('Setting Product ID priority for new row (empty response)');
              }

              // Also set tracker when API returns empty response
              setCurrentEditingRowIndex(-1);
              setProductChangeTracker({
                rowIndex: -1,
                productId: safeSplit(value, ' || ', 0)
              });
            }

            // Reset Product being set flag
            setIsProductBeingSet(false);
            return;
          }

          // createUnCodeFetchOptions();
          setCurrentEditingRowIndex(rowIndex);
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

                // Mark UN Code as being programmatically set
                setIsUnCodeBeingSet(true);

                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Product: safeSplit(value, ' || ', 0),
                  ProductDescription: safeSplit(value, ' || ', 1),
                  UNCode: productfetchData[0].UNCode || '',
                  UNCodeDescription: productfetchData[0].UNDescription || '',
                  DGClass: productfetchData[0].DGClass && productfetchData[0].DGClassDescription
                    ? `${productfetchData[0].DGClass}`
                    : (productfetchData[0].DGClass || ''),
                  DGClassDescription: productfetchData[0].DGClassDescription || '',
                  // NHM: productfetchData.NHMCode || '',
                  // NHMDescription: productfetchData.NHMDescription || '', // Stand Alone
                  //...(productfetchData.Hazardous && { ContainsHazardousGoods: productfetchData.Hazardous === "YES" ? "Yes" : "No" }),
                };

                // Reset the UN Code being set flag after a short delay
                setTimeout(() => setIsUnCodeBeingSet(false), 100);
              } else {
                // API returned empty response - clear related fields
                // Mark UN Code as being programmatically set (cleared)
                setIsUnCodeBeingSet(true);

                newData[rowIndex] = {
                  ...newData[rowIndex],
                  Product: safeSplit(value, ' || ', 0),
                  ProductDescription: safeSplit(value, ' || ', 1),
                  UNCode: '',
                  UNCodeDescription: '',
                  // NHM: '',
                  // NHMDescription: '',
                  // ContainsHazardousGoods: '',
                  DGClass: '',
                  DGClassDescription: '',
                };

                // Reset the UN Code being set flag after a short delay
                setTimeout(() => setIsUnCodeBeingSet(false), 100);
              }

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });

          setProductChangeTracker({
            rowIndex: rowIndex,
            productId: safeSplit(value, ' || ', 0)
          });

          // Reset Product being set flag
          setIsProductBeingSet(false);

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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ProductWeightUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ProductWeightUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating product weight UOM:', error);
        }
      },
    },
    {
      key: 'ProductWeight',
      label: 'Product Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ProductWeight: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ProductWeight: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating product weight:', error);
        }
      },
    },
    {
      key: 'UNCode',
      label: 'UN Code',
      type: 'LazySelect',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      fetchOptions: createUnCodeFetchOptions,
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;

          // Check if this is a manual clear operation (empty value)
          const isManualClear = !value || value === '' || value === null || value === undefined;

          // Mark this as a user-initiated change
          setUserInitiatedUnCodeChange(true);
          setIsUnCodeBeingSet(true);

          // If user manually cleared the field, don't trigger Product loading
          if (isManualClear) {
            console.log('UN Code field manually cleared by user, not triggering Product reload');
            setUserInitiatedUnCodeChange(false);

            // Clear the UN Code field and related Product data
            if (actualRowIndex === -1 && setNewRowValues) {
              setIsProductBeingSet(true);
              setNewRowValues((prev: any) => ({
                ...prev,
                Product: '',
                ProductDescription: '',
                UNCode: '',
                UNCodeDescription: '',
                NHM: '',
                NHMDescription: '',
                ContainsHazardousGoods: '',
                DGClass: '',
                DGClassDescription: '',
              }));
              setTimeout(() => setIsProductBeingSet(false), 100);

              // Reset field priority when manually cleared in new row
              setNewRowFieldPriority(null);
              console.log('Reset field priority due to manual UN Code clear in new row');
            } else {
              setActualEditableData(prevData => {
                const newData = [...prevData];
                if (newData[rowIndex]) {
                  setIsProductBeingSet(true);
                  newData[rowIndex] = {
                    ...newData[rowIndex],
                    Product: '',
                    ProductDescription: '',
                    UNCode: '',
                    UNCodeDescription: '',
                    NHM: '',
                    NHMDescription: '',
                    ContainsHazardousGoods: '',
                    DGClass: '',
                    DGClassDescription: '',
                  };
                  setTimeout(() => setIsProductBeingSet(false), 100);
                }
                hasUserEditsRef.current = true;
                return newData;
              });
            }

            setIsUnCodeBeingSet(false);
            return;
          }

          // Handle new row case (rowIndex = -1)
          if (actualRowIndex === -1 && setNewRowValues) {
            // Check if Product ID was selected first and has priority
            if (newRowFieldPriority === 'product') {
              console.log('UN Code selected from loaded data after Product ID selection - not triggering Product API');
              // Just update the UN Code fields without calling Product API
              setNewRowValues((prev: any) => ({
                ...prev,
                UNCode: safeSplit(value, ' || ', 0),
                UNCodeDescription: safeSplit(value, ' || ', 1),
              }));

              // Reset UN Code being set flag
              setIsUnCodeBeingSet(false);
              return;
            }

            // If no priority set or UN Code has priority, proceed with API call
            const response = await quickOrderService.getDynamicSearchData({
              messageType: "UnCode On Select",
              searchCriteria: {
                UNCode: safeSplit(value, ' || ', 0),
              },
            });
            const rr: any = response.data;
            const payload = JSON.parse(rr.ResponseData);

            if (payload && payload.ResponsePayload) {
              const unCodefetchData = payload.ResponsePayload;

              // Mark Product as being programmatically set
              setIsProductBeingSet(true);

              setNewRowValues((prev: any) => ({
                ...prev,
                UNCode: safeSplit(value, ' || ', 0),
                UNCodeDescription: safeSplit(value, ' || ', 1),
                Product: unCodefetchData.ProductID || '',
                ProductDescription: unCodefetchData.ProductDescription || '',
                DGClass: unCodefetchData.DGClass && unCodefetchData.DGClassDescription
                  ? `${unCodefetchData.DGClass}`
                  : (unCodefetchData.DGClass || ''),
                DGClassDescription: unCodefetchData.DGClassDescription || '',
              }));

              // Reset the Product being set flag after a short delay
              setTimeout(() => setIsProductBeingSet(false), 100);

              // Set priority to UN Code since it was selected first
              if (newRowFieldPriority === null) {
                setNewRowFieldPriority('uncode');
                console.log('Setting UN Code priority for new row');
              }

              // Set currentEditingRowIndex to -1 for new rows
              setCurrentEditingRowIndex(-1);
              setUnCodeChangeTracker({
                rowIndex: -1,
                unCode: safeSplit(value, ' || ', 0)
              });
            } else {
              // API returned empty response - clear related fields for new row
              // Mark Product as being programmatically set (cleared)
              setIsProductBeingSet(true);

              setNewRowValues((prev: any) => ({
                ...prev,
                Product: '',
                ProductDescription: '',
                UNCode: safeSplit(value, ' || ', 0),
                UNCodeDescription: safeSplit(value, ' || ', 1),
                NHM: '',
                NHMDescription: '',
                ContainsHazardousGoods: '',
                DGClass: '',
                DGClassDescription: '',
              }));

              // Reset the Product being set flag after a short delay
              setTimeout(() => setIsProductBeingSet(false), 100);

              // Set priority to UN Code since it was selected first
              if (newRowFieldPriority === null) {
                setNewRowFieldPriority('uncode');
                console.log('Setting UN Code priority for new row (empty response)');
              }

              // Also set tracker when API returns empty response
              setCurrentEditingRowIndex(-1);
              setUnCodeChangeTracker({
                rowIndex: -1,
                unCode: safeSplit(value, ' || ', 0)
              });
            }

            // Reset UN Code being set flag
            setIsUnCodeBeingSet(false);
            return;
          }

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

                // Mark Product as being programmatically set
                setIsProductBeingSet(true);

                newData[rowIndex] = {
                  ...newData[rowIndex],
                  UNCode: safeSplit(value, ' || ', 0),
                  UNCodeDescription: safeSplit(value, ' || ', 1),
                  Product: unCodefetchData.ProductID || '',
                  ProductDescription: unCodefetchData.ProductDescription || '',
                  DGClass: unCodefetchData.DGClass && unCodefetchData.DGClassDescription
                    ? `${unCodefetchData.DGClass}`
                    : (unCodefetchData.DGClass || ''),
                  DGClassDescription: unCodefetchData.DGClassDescription || '',
                  // NHM: unCodefetchData.NHMCode || '',
                  // NHMDescription: unCodefetchData.NHMDescription || '',
                  //...(unCodefetchData.Hazardous && { ContainsHazardousGoods: unCodefetchData.Hazardous === "YES" ? "Yes" : "No" }),
                };

                // Reset the Product being set flag after a short delay
                setTimeout(() => setIsProductBeingSet(false), 100);
              } else {
                // API returned empty response - clear related fields
                // Mark Product as being programmatically set (cleared)
                setIsProductBeingSet(true);

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

                // Reset the Product being set flag after a short delay
                setTimeout(() => setIsProductBeingSet(false), 100);
              }

            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });

          setUnCodeChangeTracker({
            rowIndex: rowIndex,
            unCode: safeSplit(value, ' || ', 0)
          });

          // Reset UN Code being set flag
          setIsUnCodeBeingSet(false);
        } catch (error) {
          console.error('Failed to fetch wagon details:', error);
        }

      },
    },
    {
      key: 'DGClass',
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
          searchCriteria: {
            id: searchTerm,
            name: searchTerm
          },
          additionalFilter: [
            // {
            //   FilterName: "Uncode",
            //   FilterValue: unCodeValue
            // }
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
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;

          // Handle new row case (rowIndex = -1)
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              DGClass: safeSplit(value, ' || ', 0),
              DGClassDescription: safeSplit(value, ' || ', 1),
              // Auto-set ContainsHazardousGoods to "Yes" if DGClass is selected
              ContainsHazardousGoods: safeSplit(value, ' || ', 0) ? 'Yes' : 'No'
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              const updatedRow = {
                ...newData[rowIndex],
                DGClass: safeSplit(value, ' || ', 0),
                DGClassDescription: safeSplit(value, ' || ', 1),
                // Auto-set ContainsHazardousGoods to "Yes" if DGClass is selected
                ContainsHazardousGoods: safeSplit(value, ' || ', 0) ? 'Yes' : 'No'
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainsHazardousGoods: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainsHazardousGoods: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating contains hazardous goods:', error);
        }
      },
    },
    {
      key: 'WagonTareWeightUOM',
      label: 'Wagon Tare Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      options: weightList,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonTareWeightUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonTareWeightUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'WagonTareWeight',
      label: 'Wagon Tare Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonTareWeight: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];

            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonTareWeight: value,
              };
            } else {
              console.log('Row does not exist at index:', rowIndex, 'Data length:', newData.length);
            }

            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon tare weight:', error);
        }
      },
    },
    {
      key: 'GrossWeightUOM',
      label: 'Wagon Gross Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      options: weightList,
      width: 200,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              GrossWeightUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                GrossWeightUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'GrossWeight',
      label: 'Wagon Gross Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              GrossWeight: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                GrossWeight: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon gross weight:', error);
        }
      },
    },
    {
      key: 'WagonLengthUOM',
      label: 'Wagon Length UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      options: wagonlengthUOMOptions,
      width: 200,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonLengthUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonLengthUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon length UOM:', error);
        }
      },
    },
    {
      key: 'WagonLength',
      label: 'Wagon Length',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonLength: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonLength: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon length:', error);
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ShuntingOption: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntingOption: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'ReplacedWagon',
      label: 'Replaced Wagon ID',
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ReplacedWagon: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ReplacedWagon: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ShuntingReasonCode: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntingReasonCode: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ShuntInLocationDescription: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntInLocationDescription: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ShuntOutLocationDescription: safeSplit(value, ' || ', 1, value)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ShuntOutLocationDescription: safeSplit(value, ' || ', 1, value)
            };
            hasUserEditsRef.current = true;
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
      width: 180,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ShuntInDate: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ShuntInDate: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'ShuntInTime',
      label: 'Shunt In Time',
      type: 'Time',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ShuntInTime: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ShuntInTime: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'ShuntOutDate',
      label: 'Shunt Out Date',
      type: 'Date',
      sortable: true,
      editable: true,
      subRow: false,
      width: 180,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ShuntOutDate: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ShuntOutDate: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'ShuntOutTime',
      label: 'Shunt Out Time',
      type: 'Time',
      sortable: true,
      editable: true,
      subRow: false,
      width: 160,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ShuntOutTime: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ShuntOutTime: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'WagonPosition',
      label: 'Wagon Position',
      type: 'Integer',
      sortable: true,
      editable: true,
      mandatory: true,
      subRow: false,
      width: 120,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonPosition: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonPosition: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon position:', error);
        }
      },
    },
    {
      key: 'WagonSealNo',
      label: 'Wagon Seal No.',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              WagonSealNo: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                WagonSealNo: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating wagon seal no:', error);
        }
      },
    },
    {
      key: 'ContainerId',
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
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        const rowIndex = actualRowIndex ?? 0;

        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ContainerId: safeSplit(value, ' || ', 0),
            ContainerDescription: safeSplit(value, ' || ', 1),
          }));
          return;
        }

        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              ContainerId: safeSplit(value, ' || ', 0), // Store ID part
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
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        const rowIndex = actualRowIndex ?? 0;

        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ContainerType: safeSplit(value, ' || ', 0),
          }));
          return;
        }

        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              ContainerType: safeSplit(value, ' || ', 0), // Store ID part
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainerQtyUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainerQtyUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating container qty UOM:', error);
        }
      },
    },
    {
      key: 'ContainerQty',
      label: 'Container Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainerQty: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainerQty: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating container qty:', error);
        }
      },
    },
    {
      key: 'ContainerWeightUOM',
      label: 'Container Tare Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 220,
      options: weightList,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainerWeightUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainerWeightUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'ContainerAvgTareWeight',
      label: 'Container Tare Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainerAvgTareWeight: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainerAvgTareWeight: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating container tare weight:', error);
        }
      },
    },
    {
      key: 'ContainerSealNo',
      label: 'Container Seal No.',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ContainerSealNo: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ContainerSealNo: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating container seal no:', error);
        }
      },
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
      onChange: async (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        const rowIndex = actualRowIndex ?? 0;

        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            Thu: safeSplit(value, ' || ', 0),
          }));
          return;
        }

        setActualEditableData(prevData => {
          const newData = [...prevData];
          if (newData[rowIndex]) {
            newData[rowIndex] = {
              ...newData[rowIndex],
              Thu: safeSplit(value, ' || ', 0), // Store ID part
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
      width: 200,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ThuSerialNo: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ThuSerialNo: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating THU serial no:', error);
        }
      },
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ThuQtyUOM: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ThuQtyUOM: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating THU qty UOM:', error);
        }
      },
    },
    {
      key: 'ThuQty',
      label: 'THU Qty',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ThuQty: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ThuQty: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating THU qty:', error);
        }
      },
    },
    {
      key: 'ThuWeightUOM',
      label: 'THU Weight UOM',
      type: 'Select',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      options: weightList,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              LastCommodityTransported3: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                LastCommodityTransported3: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'ThuWeight',
      label: 'THU Weight',
      type: 'Integer',
      sortable: true,
      editable: true,
      subRow: false,
      width: 200,
      onChange: (value: string | number, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              ThuWeight: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                ThuWeight: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating THU weight:', error);
        }
      },
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
          searchCriteria: {
            id: searchTerm,
            name: searchTerm
          },
          additionalFilter: [
            // {
            //   FilterName: "Uncode",
            //   FilterValue: unCodeValue
            // }
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
      },
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            ClassOfStores: safeSplit(value, ' || ', 0),
            ClassOfStoresDescription: safeSplit(value, ' || ', 1)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              ClassOfStores: safeSplit(value, ' || ', 0) // Store ID part
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'LastProductTransported1',
      label: 'Last Product Transported 1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              LastCommodityTransported1: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                LastCommodityTransported1: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'LastProductTransported2',
      label: 'Last Product Transported 2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              LastCommodityTransported2: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                LastCommodityTransported2: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'LastProductTransported3',
      label: 'Last Product Transported 3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 320,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              LastCommodityTransported3: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                LastCommodityTransported3: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'QuickCode1',
      label: 'Quick Code 1',
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            QuickCode1: safeSplit(value, ' || ', 0),
            QuickCode1Description: safeSplit(value, ' || ', 1)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode1: safeSplit(value, ' || ', 0) // Store ID part
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCode2',
      label: 'Quick Code 2',
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            QuickCode2: safeSplit(value, ' || ', 0),
            QuickCode2Description: safeSplit(value, ' || ', 1)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode2: safeSplit(value, ' || ', 0) // Store ID part
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCode3',
      label: 'Quick Code 3',
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
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        // Handle new row case (rowIndex = -1)
        if (actualRowIndex === -1 && setNewRowValues) {
          setNewRowValues((prev: any) => ({
            ...prev,
            QuickCode3: safeSplit(value, ' || ', 0),
            QuickCode3Description: safeSplit(value, ' || ', 1)
          }));
          return;
        }

        if (actualRowIndex !== undefined) {
          setActualEditableData(prev => {
            const newData = [...prev];
            newData[actualRowIndex] = {
              ...newData[actualRowIndex],
              QuickCode3: safeSplit(value, ' || ', 0) // Store ID part
            };
            hasUserEditsRef.current = true;
            return newData;
          });
        }
      },
    },
    {
      key: 'QuickCodeValue1',
      label: 'Quick Code Value 1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              QuickCodeValue1: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                QuickCodeValue1: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'QuickCodeValue2',
      label: 'Quick Code Value 2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              QuickCodeValue2: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                QuickCodeValue2: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'QuickCodeValue3',
      label: 'Quick Code Value 3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              QuickCodeValue3: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                QuickCodeValue3: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'Remarks1',
      label: 'Remarks1',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              Remarks1: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                Remarks1: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks1:', error);
        }
      },
    },
    {
      key: 'Remarks2',
      label: 'Remarks2',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              Remarks2: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                Remarks2: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks2:', error);
        }
      },
    },
    {
      key: 'Remarks3',
      label: 'Remarks3',
      type: 'String',
      sortable: true,
      editable: true,
      subRow: false,
      width: 250,
      onChange: (value: string, rowData: any, actualRowIndex?: number, setNewRowValues?: Function) => {
        try {
          const rowIndex = actualRowIndex ?? 0;
          if (actualRowIndex === -1 && setNewRowValues) {
            setNewRowValues((prev: any) => ({
              ...prev,
              Remarks3: value,
            }));
            return;
          }

          setActualEditableData(prevData => {
            const newData = [...prevData];
            if (newData[rowIndex]) {
              newData[rowIndex] = {
                ...newData[rowIndex],
                Remarks3: value,
              };
            }
            hasUserEditsRef.current = true;
            return newData;
          });
        } catch (error) {
          console.error('Error updating remarks3:', error);
        }
      },
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

  // Filter out deleted rows for display purposes while keeping them in actualEditableData for API calls
  const visibleActualEditableData = useMemo(() => {
    return actualEditableData.filter(row => row?.ModeFlag !== 'Delete');
  }, [actualEditableData]);

  const { getConsignments } = useTripExecutionDrawerStore();
  const consignments = getConsignments(legId) || [];

  const handleEditRow = async (editedRow: any, rowIndex: number) => {
    try {
      // Update the actualEditableData state with the edited row
      setActualEditableData(prevData => {
        const newData = [...prevData];

        // Find the actual row index in the full data
        // The rowIndex comes from the visible filtered data, so we need to map it back
        const visibleRow = visibleActualEditableData[rowIndex];
        const actualRowIndex = newData.findIndex(dataRow => {
          // Compare by reference first, then by key fields if available
          if (dataRow === visibleRow) return true;

          // Fallback comparison using unique identifiers
          const hasSeqno = visibleRow?.Seqno && dataRow?.Seqno;
          const hasWagon = visibleRow?.Wagon && dataRow?.Wagon;
          const hasPosition = visibleRow?.WagonPosition && dataRow?.WagonPosition;

          if (hasSeqno) return visibleRow.Seqno === dataRow.Seqno;
          if (hasWagon && hasPosition) return visibleRow.Wagon === dataRow.Wagon && visibleRow.WagonPosition === dataRow.WagonPosition;
          if (hasWagon) return visibleRow.Wagon === dataRow.Wagon;

          return false;
        });

        if (actualRowIndex !== -1) {
          newData[actualRowIndex] = { ...newData[actualRowIndex], ...editedRow };
        }

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
      // Process dropdown fields that contain "code || description" format
      const processedRow = { ...newRow };

      // Process WagonType field
      if (processedRow.WagonTypeDescription && processedRow.WagonTypeDescription.includes(' || ')) {
        processedRow.WagonType = safeSplit(processedRow.WagonTypeDescription, ' || ', 0);
        processedRow.WagonTypeDescription = safeSplit(newRow.WagonTypeDescription, ' || ', 1);
      }

      // Process Wagon field
      if (processedRow.Wagon && processedRow.Wagon.includes(' || ')) {
        processedRow.Wagon = safeSplit(processedRow.Wagon, ' || ', 0);
        processedRow.WagonDescription = safeSplit(newRow.Wagon, ' || ', 1);
      }

      // Process NHMDescription field
      if (processedRow.NHMDescription && processedRow.NHMDescription.includes(' || ')) {
        processedRow.NHMCode = safeSplit(processedRow.NHMDescription, ' || ', 0);
        processedRow.NHMDescription = safeSplit(newRow.NHMDescription, ' || ', 1);
      }

      // Process Product field
      if (processedRow.Product && processedRow.Product.includes(' || ')) {
        processedRow.Product = safeSplit(processedRow.Product, ' || ', 0);
        processedRow.ProductDescription = safeSplit(newRow.Product, ' || ', 1);
      }

      // Process UNCode field
      if (processedRow.UNCode && processedRow.UNCode.includes(' || ')) {
        processedRow.UNCode = safeSplit(processedRow.UNCode, ' || ', 0);
        processedRow.UNCodeDescription = safeSplit(newRow.UNCode, ' || ', 1);
      }

      // Process DGClass field
      if (processedRow.DGClass && processedRow.DGClass.includes(' || ')) {
        processedRow.DGClass = safeSplit(processedRow.DGClass, ' || ', 0);
        processedRow.DGClassDescription = safeSplit(newRow.DGClass, ' || ', 1);
      }

      // Process ShuntingOption field
      if (processedRow.ShuntingOption && processedRow.ShuntingOption.includes(' || ')) {
        processedRow.ShuntingOption = safeSplit(processedRow.ShuntingOption, ' || ', 1, processedRow.ShuntingOption);
      }

      // Process ReplacedWagon field
      if (processedRow.ReplacedWagon && processedRow.ReplacedWagon.includes(' || ')) {
        processedRow.ReplacedWagon = safeSplit(processedRow.ReplacedWagon, ' || ', 1, processedRow.ReplacedWagon);
      }

      // Process ShuntingReasonCode field
      if (processedRow.ShuntingReasonCode && processedRow.ShuntingReasonCode.includes(' || ')) {
        processedRow.ShuntingReasonCode = safeSplit(processedRow.ShuntingReasonCode, ' || ', 1, processedRow.ShuntingReasonCode);
      }

      // Process ShuntInLocationDescription field
      if (processedRow.ShuntInLocationDescription && processedRow.ShuntInLocationDescription.includes(' || ')) {
        processedRow.ShuntInLocationDescription = safeSplit(processedRow.ShuntInLocationDescription, ' || ', 1, processedRow.ShuntInLocationDescription);
      }

      // Process ShuntOutLocationDescription field
      if (processedRow.ShuntOutLocationDescription && processedRow.ShuntOutLocationDescription.includes(' || ')) {
        processedRow.ShuntOutLocationDescription = safeSplit(processedRow.ShuntOutLocationDescription, ' || ', 1, processedRow.ShuntOutLocationDescription);
      }

      // Process ContainerId field
      if (processedRow.ContainerId && processedRow.ContainerId.includes(' || ')) {
        processedRow.ContainerId = safeSplit(processedRow.ContainerId, ' || ', 0);
        processedRow.ContainerIdDescription = safeSplit(newRow.ContainerId, ' || ', 1);
      }

      // Process ContainerType field
      if (processedRow.ContainerType && processedRow.ContainerType.includes(' || ')) {
        processedRow.ContainerType = safeSplit(processedRow.ContainerType, ' || ', 0);
        // processedRow.ContainerTypeD = safeSplit(newRow.ContainerType, ' || ', 0);
      }

      // Process Thu field
      if (processedRow.Thu && processedRow.Thu.includes(' || ')) {
        processedRow.Thu = safeSplit(processedRow.Thu, ' || ', 0);
        processedRow.ThuDescription = safeSplit(newRow.Thu, ' || ', 1);
      }

      // Process ClassOfStores field
      if (processedRow.ClassOfStores && processedRow.ClassOfStores.includes(' || ')) {
        processedRow.ClassOfStores = safeSplit(processedRow.ClassOfStores, ' || ', 0);
        processedRow.ClassOfStoresDescription = safeSplit(newRow.ClassOfStores, ' || ', 1);
      }

      // Process QuickCode fields
      if (processedRow.QuickCode1 && processedRow.QuickCode1.includes(' || ')) {
        processedRow.QuickCode1 = safeSplit(processedRow.QuickCode1, ' || ', 0);
        processedRow.QuickCode1Description = safeSplit(newRow.QuickCode1, ' || ', 1);
      }

      if (processedRow.QuickCode2 && processedRow.QuickCode2.includes(' || ')) {
        processedRow.QuickCode2 = safeSplit(processedRow.QuickCode2, ' || ', 0);
        processedRow.QuickCode2Description = safeSplit(newRow.QuickCode2, ' || ', 1);
      }

      if (processedRow.QuickCode3 && processedRow.QuickCode3.includes(' || ')) {
        processedRow.QuickCode3 = safeSplit(processedRow.QuickCode3, ' || ', 0);
        processedRow.QuickCode3Description = safeSplit(newRow.QuickCode3, ' || ', 1);
      }

      // Mark the new row with Insert mode flag for proper save handling
      const newRowWithInsertFlag = {
        ...processedRow,
        ModeFlag: 'Insert',
      };

      // Add the new row to actualEditableData state
      setActualEditableData(prevData => [...prevData, newRowWithInsertFlag]);

      // Set flag to indicate user has made edits
      hasUserEditsRef.current = true;

      // Reset field priority for next new row
      setNewRowFieldPriority(null);
      console.log('Reset field priority after adding new row');

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
      setActualEditableData(prevData => {
        const newData = [...prevData];

        // Find the actual row in the full data by comparing with the row object passed from grid
        // Since the grid now shows filtered data, rowIndex might not match the actualEditableData index
        const actualRowIndex = newData.findIndex(dataRow => {
          // Compare by reference first, then by key fields if available
          if (dataRow === row) return true;

          // Fallback comparison using unique identifiers if available
          const hasSeqno = row?.Seqno && dataRow?.Seqno;
          const hasWagon = row?.Wagon && dataRow?.Wagon;
          const hasPosition = row?.WagonPosition && dataRow?.WagonPosition;

          if (hasSeqno) return row.Seqno === dataRow.Seqno;
          if (hasWagon && hasPosition) return row.Wagon === dataRow.Wagon && row.WagonPosition === dataRow.WagonPosition;
          if (hasWagon) return row.Wagon === dataRow.Wagon;

          return false;
        });

        if (actualRowIndex === -1) {
          console.warn('Row not found in actualEditableData:', row);
          return prevData;
        }

        const rowToDelete = newData[actualRowIndex];

        // Check if this is newly added data (has Insert ModeFlag) or existing data
        // Only newly added rows have ModeFlag: 'Insert'. All others (undefined, 'Update', 'NoChange', etc.) are existing data
        if (rowToDelete.ModeFlag === 'Insert') {
          // This is newly added data - remove it completely from cache
          console.log('Deleting newly added row - removing from cache completely');
          newData.splice(actualRowIndex, 1);
        } else {
          // This is existing data from API - mark as Delete but keep in array for API call
          console.log('Deleting existing row - marking as Delete for API');
          newData[actualRowIndex] = {
            ...rowToDelete,
            ModeFlag: 'Delete'
          };
        } return newData;
      });      // Set flag to indicate user has made edits
      hasUserEditsRef.current = true;

      // Show appropriate success message
      const isNewRow = row?.ModeFlag === 'Insert';
      toast({
        title: "✅ Row Deleted",
        description: isNewRow
          ? "Newly added row has been removed from the grid."
          : "Existing row has been marked for deletion and will be removed when you save.",
        variant: "default",
      });

    } catch (error) {
      console.error('Error in handleDeleteRow:', error);
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
          WagonDescription: normalizedRow['Wagon Description'] || normalizedRow.wagondescription || normalizedRow['Wagon ID'] || normalizedRow.wagonid || "",
          WagonType: normalizedRow['Wagon Type'] || normalizedRow.wagontype || "",
          WagonTypeDescription: normalizedRow['Wagon Type Description'] || normalizedRow.wagontypedescription || "",
          WagonPosition: normalizedRow['Wagon Position'] || normalizedRow.wagonposition || "",
          WagonQty: normalizedRow['Wagon Qty'] || normalizedRow.wagonqty || 1,
          WagonQtyUOM: normalizedRow['Wagon Qty UOM'] || normalizedRow.wagonqtyuom || "",
          WagonLength: normalizedRow['Wagon Length'] || normalizedRow.wagonlength || "",
          WagonLengthUOM: normalizedRow['Wagon Length UOM'] || normalizedRow.wagonlengthuom || "",
          WagonTareWeight: normalizedRow['Tare Weight'] || normalizedRow.tareweight || "",
          GrossWeight: normalizedRow['Gross Weight'] || normalizedRow.grossweight || 0,

          ContainerId: normalizedRow['Container ID'] || normalizedRow.containerid || "",
          ContainerDescription: normalizedRow['Container Description'] || normalizedRow.containerdescription || normalizedRow['Container ID'] || normalizedRow.containerid || "",
          ContainerType: normalizedRow['Container Type'] || normalizedRow.containertype || "",
          ContainerQty: normalizedRow['Container Qty'] || normalizedRow.containerqty || "",
          ContainerQtyUOM: normalizedRow['Container Qty UOM'] || normalizedRow.containerqtyuom || "",
          ContainerSealNo: normalizedRow['Container Seal No.'] || normalizedRow.containersealn || normalizedRow.containerseal || "",

          Product: normalizedRow['Product ID'] || normalizedRow.productid || "",
          ProductDescription: normalizedRow['Product Description'] || normalizedRow.productdescription || "",
          ProductWeight: normalizedRow['Product Weight Qty'] || normalizedRow.productweightqty || "",
          ProductWeightUOM: normalizedRow['Product Weight Qty UOM'] || normalizedRow.productweightqtyuom || "",

          Thu: normalizedRow['THU ID'] || normalizedRow.thuid || "",
          ThuDescription: normalizedRow['THU Description'] || normalizedRow.thudescription || normalizedRow['THU ID'] || normalizedRow.thuid || "",
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
          LastProductTransported1: normalizedRow['Last Product Transported 1'] || normalizedRow.lastproducttransported1 || "",
          LastProductTransported2: normalizedRow['Last Product Transported 2'] || normalizedRow.lastproducttransported2 || "",
          LastProductTransported3: normalizedRow['Last Product Transported 3'] || normalizedRow.lastproducttransported3 || "",

          QuickCode1: normalizedRow['Quick Code 1'] || normalizedRow.quickcode1 || "",
          QuickCode2: normalizedRow['Quick Code 2'] || normalizedRow.quickcode2 || "",
          QuickCode3: normalizedRow['Quick Code 3'] || normalizedRow.quickcode3 || "",
          QuickCodeValue1: normalizedRow['Quick Code Value 1'] || normalizedRow.quickcodevalue1 || "",
          QuickCodeValue2: normalizedRow['Quick Code Value 2'] || normalizedRow.quickcodevalue2 || "",
          QuickCodeValue3: normalizedRow['Quick Code Value 3'] || normalizedRow.quickcodevalue3 || "",
          ClassOfStores: normalizedRow['Class Of Stores'] || normalizedRow.classofstores || "",
          NHM: normalizedRow['NHM'] || normalizedRow.nhm || "",
          NHMDescription: normalizedRow['NHM Description'] || normalizedRow.nhmdescription || normalizedRow['NHM'] || normalizedRow.nhm || "",
          UNCode: normalizedRow['UN Code'] || normalizedRow.uncode || "",
          UNCodeDescription: normalizedRow['UN Code Description'] || normalizedRow.uncodedescription || normalizedRow['UN Code'] || normalizedRow.uncode || "",
          DGClass: normalizedRow['DG Class'] || normalizedRow.dgclass || "",
          DGClassDescription: normalizedRow['DG Class Description'] || normalizedRow.dgclassdescription || normalizedRow['DG Class'] || normalizedRow.dgclass || "",
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

      // Use the dedicated refresh function for import
      forceGridRefresh(importedDataWithInsertFlag, 'data import completed');

      hasUserEditsRef.current = true;      // Show success toast with actual count
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
        'Wagon Type',
        'Wagon ID',
        'Wagon Qty UOM',
        'Wagon Qty',
        'NHM',
        'Product ID',
        'Product Weight UOM',
        'Product Weight',
        'UN Code',
        'DG Class',
        'Contains Hazardous Goods',
        'Wagon Tare Weight UOM',
        'Wagon Tare Weight',
        'Wagon Gross Weight UOM',
        'Wagon Gross Weight',
        'Wagon Length UOM',
        'Wagon Length',
        'Shunting Option',
        'Replaced Wagon',
        'Shunting Reason Code',
        'Shunt In Location',
        'Shunt Out Location',
        'Shunt In Date',
        'Shunt In Time',
        'Shunt Out Date',
        'Shunt Out Time',
        'Wagon Position',
        'Wagon Seal No.',
        'Container ID',
        'Container Type',
        'Container Qty UOM',
        'Container Qty',
        'Container Tare Weight UOM',
        'Container Tare Weight',
        'Container Seal No.',
        'THU ID',
        'THU Serial No',
        'THU Qty UOM',
        'THU Qty',
        'THU Weight UOM',
        'THU Weight',
        'Class Of Stores',
        'Last Product Transported 1',
        'Last Product Transported 2',
        'Last Product Transported 3',
        'Quick Code 1',
        'Quick Code 2',
        'Quick Code 3',
        'Quick Code Value 1',
        'Quick Code Value 2',
        'Quick Code Value 3',
        'Remarks1',
        'Remarks2',
        'Remarks3'
      ];

      // Map grid column keys to export headers
      const columnKeyMapping = {
        'WagonTypeDescription': 'Wagon Type',
        'Wagon': 'Wagon ID',
        'WagonQtyUOM': 'Wagon Qty UOM',
        'WagonQty': 'Wagon Qty',
        'NHM': 'NHM',
        'Product': 'Product ID',
        'ProductWeightUOM': 'Product Weight UOM',
        'ProductWeight': 'Product Weight',
        'UNCode': 'UN Code',
        'DGClass': 'DG Class',
        'ContainsHazardousGoods': 'Contains Hazardous Goods',
        'WagonTareWeightUOM': 'Wagon Tare Weight UOM',
        'WagonTareWeight': 'Wagon Tare Weight',
        'GrossWeightUOM': 'Wagon Gross Weight UOM',
        'GrossWeight': 'Wagon Gross Weight',
        'WagonLengthUOM': 'Wagon Length UOM',
        'WagonLength': 'Wagon Length',
        'ShuntingOption': 'Shunting Option',
        'ReplacedWagon': 'Replaced Wagon ID',
        'ShuntingReasonCode': 'Reason Code',
        'ShuntInLocationDescription': 'Shunt In Location',
        'ShuntOutLocationDescription': 'Shunt Out Location',
        'ShuntInDate': 'Shunt In Date',
        'ShuntInTime': 'Shunt In Time',
        'ShuntOutTime': 'Shunt Out Time',
        'ShuntOutDate': 'Shunt Out Date',
        'WagonPosition': 'Wagon Position',
        'WagonSealNo': 'Wagon Seal No.',
        'ContainerId': 'Container ID',
        'ContainerType': 'Container Type',
        'ContainerQtyUOM': 'Container Qty UOM',
        'ContainerQty': 'Container Qty',
        'ContainerWeightUOM': 'Container Tare Weight UOM',
        'ContainerAvgTareWeight': 'Container Tare Weight',
        'ContainerSealNo': 'Container Seal No.',
        'Thu': 'THU ID',
        'ThuSerialNo': 'THU Serial No',
        'ThuQtyUOM': 'THU Qty UOM',
        'ThuQty': 'THU Qty',
        'ThuWeightUOM': 'THU Weight UOM',
        'ThuWeight': 'THU Weight',
        'ClassOfStores': 'Class Of Stores',
        'LastProductTransported1': 'Last Product Transported 1',
        'LastProductTransported2': 'Last Product Transported 2',
        'LastProductTransported3': 'Last Product Transported 3',
        'QuickCode1': 'Quick Code 1',
        'QuickCode2': 'Quick Code 2',
        'QuickCode3': 'Quick Code 3',
        'QuickCodeValue1': 'Quick Code Value 1',
        'QuickCodeValue2': 'Quick Code Value 2',
        'QuickCodeValue3': 'Quick Code Value 3',
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

      let currentGridData = [];

      if (hasUserEditsRef.current) {
        // Debug: Log all ModeFlags before processing
        console.log('=== SAVE DEBUG: Processing actualEditableData ===');
        actualEditableData.forEach((row, idx) => {
          console.log(`Row ${idx}: ModeFlag = ${row?.ModeFlag}, WagonPosition = ${row?.WagonPosition || row?.['Wagon Position']}`);
        });

        // If user has made edits, include all current actual data
        currentGridData = actualEditableData.map((actualRow, index) => {
          try {
            // Safely access row data with null checks
            if (!actualRow || typeof actualRow !== 'object') {
              throw new Error(`Invalid row data at index ${index}`);
            }
            let modeFlag = "Update";

            // Preserve the original ModeFlag for Insert and Delete operations
            if (actualRow.ModeFlag === 'Insert') {
              modeFlag = "Insert";
            } else if (actualRow.ModeFlag === 'Delete') {
              modeFlag = "Delete";
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
              WagonTypeDescription: safeString(actualRow['Wagon Type'] || actualRow.WagonTypeDescription || actualRow.wagontypedescription),
              Wagon: safeString(actualRow['Wagon ID'] || actualRow.WagonId || actualRow.Wagon || actualRow.wagonid),
              WagonDescription: safeString(actualRow['Wagon ID'] || actualRow.WagonId || actualRow.WagonDescription || actualRow.wagonid),
              WagonQty: safeNumeric(actualRow['Wagon Qty'] || actualRow.WagonQty || actualRow.wagonqty),
              WagonQtyUOM: safeString(actualRow['Wagon Qty UOM'] || actualRow.WagonQtyUOM || actualRow.wagonqtyuom),
              ContainerType: safeString(actualRow['Container Type'] || actualRow.ContainerType || actualRow.containertype),
              ContainerId: safeString(actualRow['Container ID'] || actualRow.ContainerId || actualRow.containerid),
              ContainerDescription: safeString(actualRow['Container Description'] || actualRow.ContainerDescription || actualRow.containerdescription),
              ContainerQty: safeNumeric(actualRow['Container Qty'] || actualRow.ContainerQty || actualRow.containerqty),
              ContainerQtyUOM: safeString(actualRow['Container Qty UOM'] || actualRow.ContainerQtyUOM || actualRow.containerqtyuom),
              Product: safeString(actualRow['Product ID'] || actualRow.Product || actualRow.Product || actualRow.product),
              ProductDescription: safeString(actualRow['Product Description'] || actualRow.ProductDescription || actualRow.ProductDescription || actualRow.productdescription),
              ProductWeight: safeNumeric(actualRow['Product Weight'] || actualRow.ProductWeight || actualRow.ProductWeight || actualRow.productweight),
              ProductWeightUOM: safeString(actualRow['Product Weight UOM'] || actualRow.ProductWeightUOM || actualRow.ProductWeightUOM || actualRow.productweightuom),
              Thu: safeString(actualRow['THU ID'] || actualRow.ThuId || actualRow.Thu || actualRow.thuid),
              ThuDescription: safeString(actualRow['THU Description'] || actualRow.ThuDescription || actualRow.thudescription),
              ThuSerialNo: safeString(actualRow['THU Serial No'] || actualRow.ThuSerialNo || actualRow.thuserialno),
              ThuQty: safeNumeric(actualRow['THU Qty'] || actualRow.ThuQty || actualRow.thuqty),
              ThuWeight: safeNumeric(actualRow['THU Weight'] || actualRow.ThuWeight || actualRow.thuweight),
              ThuWeightUOM: safeString(actualRow['THU Weight UOM'] || actualRow.ThuWeightUOM || actualRow.thuweightuom),
              ShuntingOption: safeString(actualRow['Shunting Option'] || actualRow.ShuntingOption || actualRow.shuntingoption),
              ReplacedWagon: safeString(actualRow['Replaced Wagon ID'] || actualRow.ReplacedWagonId || actualRow.ReplacedWagon || actualRow.replacedwagonid),
              ShuntingReasonCode: safeString(actualRow['Shunting Reason Code'] || actualRow.ReasonCode || actualRow.ShuntingReasonCode || actualRow.reasoncode),
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
              NHMDescription: safeString(actualRow['NHM Description'] || actualRow.NHMDescription || actualRow.nhmdescription),
              UNCode: safeString(actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode),
              UNCodeDescription: safeString(actualRow['UN Code Description'] || actualRow.UNCodeDescription || actualRow.uncodedescription),
              DGClass: safeString(actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass),
              DGClassDescription: safeString(actualRow['DG Class Description'] || actualRow.DGClassDescription || actualRow.dgclassdescription),
              ContainsHazardousGoods: safeString(actualRow['Contains Hazardous Goods'] || actualRow.ContainsHazardousGoods || actualRow.containshazardousgoods),
              WagonSealNo: safeString(actualRow['Wagon Seal No.'] || actualRow.WagonSealNo || actualRow.wagonsealn || actualRow.wagonseal),
              ContainerSealNo: safeString(actualRow['Container Seal No.'] || actualRow.ContainerSealNo || actualRow.containersealn || actualRow.containerseal),
              ContainerAvgTareWeight: safeNumeric(actualRow['Container Tare Weight'] || actualRow.ContainerAvgTareWeight || actualRow.containeravgtareweight),
              ContainerWeightUOM: safeString(actualRow['Container Tare Weight UOM'] || actualRow.ContainerWeightUOM || actualRow.containerweightuom),
              LastProductTransported1: safeString(actualRow['Last Product Transported1'] || actualRow.LastProductTransported1 || actualRow.lastproducttransported1),
              LastProductTransportedDate1: safeString(actualRow['Last Product Transported Date1'] || actualRow.LastProductTransportedDate1 || actualRow.lastproducttransporteddate1),
              LastProductTransported2: safeString(actualRow['Last Product Transported2'] || actualRow.LastProductTransported2 || actualRow.lastproducttransported2),
              LastProductTransportedDate2: safeString(actualRow['Last Product Transported Date2'] || actualRow.LastProductTransportedDate2 || actualRow.lastproducttransporteddate2),
              LastProductTransported3: safeString(actualRow['Last Product Transported3'] || actualRow.LastProductTransported3 || actualRow.lastproducttransported3),
              LastProductTransportedDate3: safeString(actualRow['Last Product Transported Date3'] || actualRow.LastProductTransportedDate3 || actualRow.lastproducttransporteddate3),
              WagonTareWeight: safeNumeric(actualRow['Wagon Tare Weight'] || actualRow.TareWeight || actualRow.WagonTareWeight || actualRow.tareweight),
              WagonTareWeightUOM: safeString(actualRow['Wagon Tare Weight UOM'] || actualRow.TareWeightUOM || actualRow.WagonTareWeightUOM || actualRow.tareweightuom),
              WagonLength: safeNumeric(actualRow['Wagon Length'] || actualRow.WagonLength || actualRow.wagonlength),
              WagonLengthUOM: safeString(actualRow['Wagon Length UOM'] || actualRow.WagonLengthUOM || actualRow.wagonlengthuom),
              GrossWeight: safeNumeric(actualRow['Gross Weight'] || actualRow.GrossWeight || actualRow.grossweight),
              GrossWeightUOM: safeString(actualRow['Gross Weight UOM'] || actualRow.GrossWeightUOM || actualRow.grossweightuom),
              QuickCode1: safeString(actualRow['Quick Code1'] || actualRow.QuickCode1 || actualRow.quickcode1),
              QuickCode2: safeString(actualRow['Quick Code2'] || actualRow.QuickCode2 || actualRow.quickcode2),
              QuickCode3: safeString(actualRow['Quick Code3'] || actualRow.QuickCode3 || actualRow.quickcode3),
              QuickCodeValue1: safeString(actualRow['Quick Code Value 1'] || actualRow.QuickCodeValue1 || actualRow.quickcodevalue1),
              QuickCodeValue2: safeString(actualRow['Quick Code Value 2'] || actualRow.QuickCodeValue2 || actualRow.quickcodevalue2),
              QuickCodeValue3: safeString(actualRow['Quick Code Value 3'] || actualRow.QuickCodeValue3 || actualRow.quickcodevalue3),
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
          // Only include rows that are newly imported (have Insert mode flag or isNewRow marker) || row.isNewRow === true
          return row.ModeFlag === 'Insert';
        }).map((actualRow, index) => {
          // Map the data to match the expected API format, removing extra parameters
          return {
            Seqno: (index + 1).toString(), // Sequential number starting from 1
            PlanToActualCopy: "",
            WagonPosition: actualRow['Wagon Position'] || actualRow.WagonPosition || actualRow.wagonposition || "",
            WagonType: actualRow['Wagon Type'] || actualRow.WagonTypeDescription || actualRow.wagontype || "",
            WagonTypeDescription: actualRow['Wagon Type'] || actualRow.WagonTypeDescription || actualRow.wagontypedescription || "",
            Wagon: actualRow['Wagon ID'] || actualRow.WagonId || actualRow.Wagon || actualRow.wagonid || "",
            WagonDescription: actualRow['Wagon ID'] || actualRow.WagonId || actualRow.WagonDescription || actualRow.wagonid || "",
            WagonQty: actualRow['Wagon Qty'] || actualRow.WagonQty || actualRow.wagonqty || null,
            WagonQtyUOM: actualRow['Wagon Qty UOM'] || actualRow.WagonQtyUOM || actualRow.wagonqtyuom || "",
            ContainerType: actualRow['Container Type'] || actualRow.ContainerType || actualRow.containertype || "",
            ContainerId: actualRow['Container ID'] || actualRow.ContainerId || actualRow.containerid || "",
            ContainerDescription: actualRow['Container Description'] || actualRow.ContainerDescription || actualRow.containerdescription || "",
            ContainerQty: actualRow['Container Qty'] || actualRow.ContainerQty || actualRow.containerqty || null,
            ContainerQtyUOM: actualRow['Container Qty UOM'] || actualRow.ContainerQtyUOM || actualRow.containerqtyuom || "",
            Product: actualRow['Product ID'] || actualRow.CommodityId || actualRow.Product || actualRow.commodityid || "",
            ProductWeight: actualRow['Product Weight'] || actualRow.ProductWeight || actualRow.ProductWeight || actualRow.commodityactualqty || null,
            ProductWeightUOM: actualRow['Product Weight UOM'] || actualRow.ProductWeightUOM || actualRow.ProductWeightUOM || actualRow.commodityqtyuom || "",
            Thu: actualRow['THU ID'] || actualRow.ThuId || actualRow.Thu || actualRow.thuid || "",
            ThuDescription: actualRow['THU Description'] || actualRow.ThuDescription || actualRow.thudescription || "",
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
            NHMDescription: actualRow['NHM Description'] || actualRow.NHMDescription || actualRow.nhmdescription || "",
            UNCode: actualRow['UN Code'] || actualRow.UNCode || actualRow.uncode || "",
            UNCodeDescription: actualRow['UN Code Description'] || actualRow.UNCodeDescription || actualRow.uncodedescription || "",
            DGClass: actualRow['DG Class'] || actualRow.DGClass || actualRow.dgclass || "",
            DGClassDescription: actualRow['DG Class Description'] || actualRow.DGClassDescription || actualRow.dgclassdescription || "",
            ContainsHazardousGoods: actualRow['Contains Hazardous Goods'] || actualRow.ContainsHazardousGoods || actualRow.containshazardousgoods || "",
            WagonSealNo: actualRow['Wagon Seal No.'] || actualRow.WagonSealNo || actualRow.wagonsealn || actualRow.wagonseal || "",
            ContainerSealNo: actualRow['Container Seal No.'] || actualRow.ContainerSealNo || actualRow.containersealn || actualRow.containerseal || "",
            ContainerAvgTareWeight: actualRow['Container Tare Weight'] || actualRow.ContainerAvgTareWeight || actualRow.containeravgtareweight || null,
            ContainerWeightUOM: actualRow['Container Tare Weight UOM'] || actualRow.ContainerWeightUOM || actualRow.containerweightuom || "",
            LastProductTransported1: actualRow['Last Product Transported1'] || actualRow.LastProductTransported1 || actualRow.lastproducttransported1 || "",
            LastProductTransportedDate1: actualRow['Last Product Transported Date1'] || actualRow.LastProductTransportedDate1 || actualRow.lastproducttransporteddate1 || null,
            LastProductTransported2: actualRow['Last Product Transported2'] || actualRow.LastProductTransported2 || actualRow.lastproducttransported2 || "",
            LastProductTransportedDate2: actualRow['Last Product Transported Date2'] || actualRow.LastProductTransportedDate2 || actualRow.lastproducttransporteddate2 || null,
            LastProductTransported3: actualRow['Last Product Transported3'] || actualRow.LastProductTransported3 || actualRow.lastproducttransported3 || "",
            LastProductTransportedDate3: actualRow['Last Product Transported Date3'] || actualRow.LastProductTransportedDate3 || actualRow.lastproducttransporteddate3 || null,
            WagonTareWeight: actualRow['Wagon Tare Weight'] || actualRow.TareWeight || actualRow.WagonTareWeight || actualRow.tareweight || null,
            WagonTareWeightUOM: actualRow['Wagon Tare Weight UOM'] || actualRow.TareWeightUOM || actualRow.WagonTareWeightUOM || actualRow.tareweightuom || "",
            WagonLength: actualRow['Wagon Length'] || actualRow.WagonLength || actualRow.wagonlength || null,
            WagonLengthUOM: actualRow['Wagon Length UOM'] || actualRow.WagonLengthUOM || actualRow.wagonlengthuom || "",
            GrossWeight: actualRow['Gross Weight'] || actualRow.GrossWeight || actualRow.grossweight || null,
            GrossWeightUOM: actualRow['Gross Weight UOM'] || actualRow.GrossWeightUOM || actualRow.grossweightuom || null,
            QuickCode1: actualRow['Quick Code1'] || actualRow.QuickCode1 || actualRow.quickcode1 || "",
            QuickCode2: actualRow['Quick Code2'] || actualRow.QuickCode2 || actualRow.quickcode2 || "",
            QuickCode3: actualRow['Quick Code3'] || actualRow.QuickCode3 || actualRow.quickcode3 || "",
            QuickCodeValue1: actualRow['Quick Code Value 1'] || actualRow.QuickCodeValue1 || actualRow.quickcodevalue1 || "",
            QuickCodeValue2: actualRow['Quick Code Value 2'] || actualRow.QuickCodeValue2 || actualRow.quickcodevalue2 || "",
            QuickCodeValue3: actualRow['Quick Code Value 3'] || actualRow.QuickCodeValue3 || actualRow.quickcodevalue3 || "",
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
        ModeFlag: "Delete"
      }));

      // Combine only the data that needs to be sent to API
      const allDataToSave = [...currentGridData, ...deletedDataToInclude];

      // Debug: Log what's being sent to API
      console.log('=== SAVE DEBUG: Final API Data ===');
      console.log(`Total rows to save: ${allDataToSave.length}`);
      allDataToSave.forEach((row, idx) => {
        console.log(`API Row ${idx}: ModeFlag = ${row.ModeFlag}, WagonPosition = ${row.WagonPosition}`);
      });

      const deletedRows = allDataToSave.filter(row => row.ModeFlag === 'Delete');
      const insertedRows = allDataToSave.filter(row => row.ModeFlag === 'Insert');
      const updatedRows = allDataToSave.filter(row => row.ModeFlag === 'Update');

      console.log(`Deleted rows: ${deletedRows.length}, Inserted rows: ${insertedRows.length}, Updated rows: ${updatedRows.length}`);

      // // If no data to save, return early
      // if (allDataToSave.length === 0) {
      //   // Check if user has edited data but no valid data to save
      //   if (hasUserEditsRef.current) {
      //     toast({
      //       title: "⚠️ Invalid Data",
      //       description: "Please ensure all required fields are filled correctly.",
      //       variant: "destructive",
      //     });
      //   } 
      //   // else {
      //   //   toast({
      //   //     title: "⚠️ No Changes",
      //   //     description: "No changes to save.",
      //   //     variant: "default",
      //   //   });
      //   // }
      //   return;
      // }

      // Create a deep copy of the trip data to avoid mutation
      const updatedTripData = JSON.parse(JSON.stringify(currentTripData));

      try {
        if (!updatedTripData.LegDetails || !Array.isArray(updatedTripData.LegDetails)) {
          throw new Error("LegDetails not found or not an array");
        }

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

        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex]) {
          updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex] = {};
        }

        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual) {
          updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = [];
        }

        // Bind pickup complete flag to consignment and mark as Update
        updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].PickupCompleteForThisCustomerOrder = pickupComplete ? '1' : '0';
        updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].ModeFlag = 'Update';
        updatedTripData.LegDetails[legIndex].Consignment[consignmentIndex].Actual = allDataToSave;

        // Save to API
        try {
          const response = await tripService.saveTrip(updatedTripData);

          const resourceStatus = (response as any)?.data?.IsSuccess;

          if (resourceStatus) {
            manageTripStore.getState().setTrip(updatedTripData);
            setDeletedDataFromImport([]);
            hasUserEditsRef.current = false;

            toast({
              title: "✅ Actual Details Saved Successfully",
              description: (response as any)?.data?.ResponseData?.Message || "Your actual details have been saved.",
              variant: "default",
            });
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
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
                      // Use the dedicated refresh function
                      const freshData = currentLegData.Consignment[0].Actual;
                      forceGridRefresh(freshData, 'API response after save');

                      // Update related state
                      setTimeout(() => {
                        const cons = getConsignments(legId) || [];
                        if (cons.length > 0) {
                          const selectedIndex = parseInt(selectedCustomerIndex || '0', 10);
                          const selected = cons[selectedIndex];
                          if (selected) {
                            setSelectedCustomerData(selected);
                            setActualData([...freshData]);
                          }
                        }
                        
                        // Close the drawer after successful save and data refresh
                        if (onClose) {
                          setTimeout(() => {
                            onClose();
                          }, 500); // Small delay to ensure data is fully updated
                        }
                      }, 100);                      // toast({
                      //   title: "🔄 Data Refreshed",
                      //   description: "Trip data has been refreshed successfully.",
                      //   variant: "default",
                      // });
                    } else {

                      if (currentLegData?.Consignment?.[0]) {
                        currentLegData.Consignment[0].Actual = allDataToSave;

                        manageTripStore.getState().setTrip(refreshedTripData);

                        // Use the dedicated refresh function
                        forceGridRefresh(allDataToSave, 'saved data fallback');
                        
                        // Close the drawer after successful save and data refresh
                        if (onClose) {
                          setTimeout(() => {
                            onClose();
                          }, 500); // Small delay to ensure data is fully updated
                        }
                      }                      // toast({
                      //   title: "✅ Data Saved & Refreshed",
                      //   description: "Data saved successfully and grid has been refreshed with latest data.",
                      //   variant: "default",
                      // });
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
      // If user has made edits and we have existing data, preserve it completely
      // This prevents reinitializing data and losing Delete/Insert flags
      if (hasUserEditsRef.current && prevData.length > 0) {
        // console.log('Preserving existing edited data, not reinitializing from API');
        return prevData;
      }

      // Only initialize from API when there are no user edits
      // console.log('Initializing actualEditableData from API data');
      // Initialize existing data from API with proper ModeFlag for identification
      return actualConsignments.map(row => {
        // Check if this row exists in previous data and has Delete/Insert ModeFlag
        const existingRow = prevData.find(prevRow => {
          // Try to match by unique identifiers
          const hasSeqno = row?.Seqno && prevRow?.Seqno;
          const hasWagon = row?.Wagon && prevRow?.Wagon;
          const hasPosition = row?.WagonPosition && prevRow?.WagonPosition;

          if (hasSeqno) return row.Seqno === prevRow.Seqno;
          if (hasWagon && hasPosition) return row.Wagon === prevRow.Wagon && row.WagonPosition === prevRow.WagonPosition;
          if (hasWagon) return row.Wagon === prevRow.Wagon;

          return false;
        });

        // If existing row has critical ModeFlags (Delete/Insert), preserve them
        if (existingRow && (existingRow.ModeFlag === 'Delete' || existingRow.ModeFlag === 'Insert')) {
          return {
            ...row,
            ModeFlag: existingRow.ModeFlag // Preserve Delete/Insert flags
          };
        }

        // Otherwise, use row's ModeFlag or default to NoChange
        return {
          ...row,
          ModeFlag: row.ModeFlag || 'NoChange'
        };
      });
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
              <Switch id="pickupComplete" checked={pickupComplete} onCheckedChange={(checked) => setPickupComplete(checked as boolean)}  />
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
                            key={`actual-grid-${legId}-${selectedCustomerIndex}-${gridRefreshKey}`}
                            columns={actualEditableColumns}
                            data={[...visibleActualEditableData]}
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