import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Truck, Container as ContainerIcon, Package, Box, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SimpleDynamicPanel } from '@/components/DynamicPanel/SimpleDynamicPanel';
import { PanelFieldConfig } from '@/types/dynamicPanel';
import { usePlanActualStore, ActualsData } from '@/stores/planActualStore';
import { a } from 'node_modules/framer-motion/dist/types.d-Bq-Qm38R';
import { useTripExecutionDrawerStore } from '@/stores/tripExecutionDrawerStore';
import { manageTripStore } from '@/stores/mangeTripStore';
import { tripService } from '@/api/services/tripService';
import { useToast } from '@/hooks/use-toast';

import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { InputDropdown, InputDropdownValue } from '@/components/ui/input-dropdown';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MoreVertical, Edit, Copy, Plus, CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { quickOrderService } from '@/api/services/quickOrderService';

interface PlanActualDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  legId?: any;
  consignmentIndex?: any;
}

interface WagonItem {
  id: string;
  name: string;
  description: string;
  price: string;
  checked: boolean;
}

export const PlanActualDetailsDrawer: React.FC<PlanActualDetailsDrawerProps> = ({
  isOpen,
  onClose,
  legId,
  consignmentIndex,
}) => {
  const { getConsignmentByIndex } = useTripExecutionDrawerStore();
  const getFullConsignment = getConsignmentByIndex(legId, consignmentIndex);
  // console.log('consignment Index from store:', getFullConsignment);
  const { wagonItems, activeWagonId, setActiveWagon, updateActualsData, getWagonData } = usePlanActualStore();
  const { getLegDetails, tripData, setTrip } = manageTripStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'planned' | 'actuals'>('planned');

   // Generic fetch function for master common data using quickOrderService.getMasterCommonData
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
                label: `${item.id} || ${item.name}`,
                value: `${item.id} || ${item.name}`,
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
  const fetchWagonTypes = fetchMasterData("Wagon type Init");
  const fetchContainerTypes = fetchMasterData("Container Type Init");
  const fetchWagonIds = fetchMasterData("Wagon id Init");
  const fetchContainerIds = fetchMasterData("Container ID Init");
  const fetchProductIds = fetchMasterData("Product ID Init");
  const fetchUnCodes = fetchMasterData("UN Code Init");
  const fetchDgClasses = fetchMasterData("DG Class Init");
  const fetchThuTypes = fetchMasterData("THU Init");
  const fetchDepartures = fetchMasterData("Departure Init");
  const fetchArrivals = fetchMasterData("Arrival Init");
  const fetchLocations = fetchMasterData("Location Init");
  const fetchActivities = fetchMasterData("Activity Init");
  const fetchNhmTypes = fetchMasterData("NHM Init");
  const fetchClassOfStore = fetchMasterData("Class Of Stores Init");

  const [expandedSections, setExpandedSections] = useState({
    wagon: true,
    container: true,
    product: true,
    thu: true,
    journey: true,
    other: false,
  });
  const [plannedList, setPlannedList] = useState<any[]>([]);
  const [actualList, setActualList] = useState<any[]>([]);
  const [currentWagon, setCurrentWagon] = useState<any>(null);
  const [selectedWagonId, setSelectedWagonId] = useState<string | null>(null);
  const [plannedWagonQuantity, setPlannedWagonQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });

  const [selecteditem, setSelecteditem] = useState<any>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [wagonDetailsType, setWagonDetailsType] = useState<string | undefined>();
  const [wagonDetailsId, setWagonDetailsId] = useState<string | undefined>();
  const [wagonDetailsQuantity, setWagonDetailsQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [wagonDetailsTareWeight, setWagonDetailsTareWeight] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [wagonDetailsGrossWeight, setWagonDetailsGrossWeight] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [wagonDetailsLength, setWagonDetailsLength] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [wagonDetailsSequence, setWagonDetailsSequence] = useState<string | undefined>();
  
  const [containerDetailsType, setContainerDetailsType] = useState<string | undefined>();
  const [containerDetailsId, setContainerDetailsId] = useState<string | undefined>();
  const [containerDetailsQuantity, setContainerDetailsQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [containerDetailsTareWeight, setContainerDetailsTareWeight] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [containerDetailsLoadWeight, setContainerDetailsLoadWeight] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });

  const [productNHM, setProductNHM] = useState<string | undefined>();
  const [productId, setProductId] = useState<string | undefined>();
  const [productQuantity, setProductQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [classOfStores, setClassOfStores] = useState<string | undefined>();
  const [unCode, setUnCode] = useState<string | undefined>();
  const [dgClass, setDgClass] = useState<string | undefined>();

  const [thuDetailsId, setThuDetailsId] = useState<string | undefined>();
  const [thuDetailsSerialNo, setThuDetailsSerialNo] = useState<string | undefined>();
  const [thuDetailsQuantity, setThuDetailsQuantity] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });
  const [thuDetailsWeight, setThuDetailsWeight] = useState<InputDropdownValue>({ dropdown: 'KG', input: '' });

  const [otherDetailsQcUserdefined1, setOtherDetailsQcUserdefined1] = useState<InputDropdownValue>({ dropdown: '', input: '' });
  const [otherDetailsQcUserdefined2, setOtherDetailsQcUserdefined2] = useState<InputDropdownValue>({ dropdown: '', input: '' });
  const [otherDetailsQcUserdefined3, setOtherDetailsQcUserdefined3] = useState<InputDropdownValue>({ dropdown: '', input: '' });
  const [otherDetailsRemarks1, setOtherDetailsRemarks1] = useState<string | undefined>();
  const [otherDetailsRemarks2, setOtherDetailsRemarks2] = useState<string | undefined>();
  const [otherDetailsRemarks3, setOtherDetailsRemarks3] = useState<string | undefined>();
  const [otherDetailsFromDateTime, setOtherDetailsFromDateTime] = useState<Date>();
  const [otherDetailsToDateTime, setOtherDetailsToDateTime] = useState<Date>();
  const [otherDetailsFromTime, setOtherDetailsFromTime] = useState<string | undefined>();
  const [otherDetailsToTime, setOtherDetailsToTime] = useState<string | undefined>();

  const [globalIndex, setGlobalIndex] = useState<number>(-1);
  const [localIndex, setLocalIndex] = useState<number>(0);

  const quantityUnitOptions = [
    { label: 'KG', value: 'KG' },
    { label: 'TON', value: 'TON' },
    { label: 'LBS', value: 'LBS' },
    { label: 'MT', value: 'MT' },
  ];

  // 🧩 STEP 1: Load Planned or Actual wagon list based on activeTab
  // 🔹 Load both lists when consignment changes
  // useEffect(() => {
  //   if (!getFullConsignment) return;
  //   setPlannedList(getFullConsignment?.Planned || []);
  //   setActualList(getFullConsignment?.Actual || []);
  //   setCurrentWagon(null);
  //   setSelectedWagonId(null);
  // }, [getFullConsignment, legId]);

  useEffect(() => {
    if (!getFullConsignment) return;
    setPlannedList(getFullConsignment?.Planned || []);
    setActualList(getFullConsignment?.Actual || []);
   
    // Auto-select first item based on active tab
    const activeList = activeTab === "actuals" ?
      getFullConsignment?.Actual || [] :
      getFullConsignment?.Planned || [];
     
    if (activeList.length > 0) {
      setSelecteditem(activeList[0]);
      console.log("activeList[0]", activeList[0]);
      setActiveWagon('0');
      setWagonDetailsId(activeList[0]?.Wagon);
      setWagonDetailsType(activeList[0]?.WagonType);
      setWagonDetailsQuantity({
        dropdown: activeList[0]?.WagonQtyUOM,
        input: activeList[0]?.WagonQty
      });
      setWagonDetailsTareWeight({
        dropdown: activeList[0]?.WagonTareWeightUOM,
        input: activeList[0]?.WagonTareWeight
      });
      setWagonDetailsGrossWeight({
        dropdown: activeList[0]?.WagonGrossWeightUOM,
        input: activeList[0]?.WagonGrossWeight
      });
      setWagonDetailsLength({
        dropdown: activeList[0]?.WagonLengthUOM,
        input: activeList[0]?.WagonLength
      });
      setWagonDetailsSequence(activeList?.[0]?.WagonSealNo);

      setContainerDetailsType(activeList?.[0]?.ContainerType);
      setContainerDetailsId(activeList?.[0]?.ContainerId);
      setContainerDetailsQuantity({
        dropdown: activeList?.[0]?.ContainerQtyUOM,
        input: activeList?.[0]?.ContainerQty
      });
      setContainerDetailsTareWeight({
        dropdown: activeList?.[0]?.ContainerTareWeightUOM,
        input: activeList?.[0]?.ContainerTareWeight
      });
      setContainerDetailsLoadWeight({
        dropdown: activeList?.[0]?.ContainerLoadWeightUOM,
        input: activeList?.[0]?.ContainerLoadWeight
      });

      setProductNHM(activeList?.[0]?.NHM);
      setProductId(activeList?.[0]?.ProductID);
      setProductQuantity({
        dropdown: activeList?.[0]?.ProductQuantityUOM,
        input: activeList?.[0]?.ProductQuantity
      });
      setClassOfStores(activeList?.[0]?.ClassofStores);
      setUnCode(activeList?.[0]?.UNCode);
      setDgClass(activeList?.[0]?.DGClass);

      setThuDetailsId(activeList?.[0]?.ThuId);
      setThuDetailsSerialNo(activeList?.[0]?.ThuSerialNo);
      setThuDetailsQuantity({
        dropdown: activeList?.[0]?.ThuQtyUOM,
        input: activeList?.[0]?.ThuQty
      });
      setThuDetailsWeight({
        dropdown: activeList?.[0]?.ThuWeightUOM,
        input: activeList?.[0]?.ThuWeight
      });
    } else {
      setCurrentWagon(null);
      setSelectedWagonId(null);
      setSelecteditem(null);
    }
  }, [getFullConsignment, legId, activeTab]);

  // ✅ Compute active list dynamically based on tab
  const activeList = activeTab === "actuals" ? actualList : plannedList;

  const [selectedItems, setSelectedItems] = useState<WagonItem[]>([
    // { id: 'WAG00000001', name: 'WAG00000001', description: 'Habbins', price: '€ 1395.00', checked: true },
    // { id: 'WAG00000002', name: 'WAG00000002', description: 'Zaccs', price: '€ 1395.00', checked: false },
    // { id: 'WAG00000003', name: 'WAG00000003', description: 'A Type Wagon', price: '€ 1395.00', checked: false },
    // { id: 'WAG00000004', name: 'WAG00000004', description: 'Closed Wagon', price: '€ 1395.00', checked: false },
  ]);

  // const [selectAll, setSelectAll] = useState(false);
  // const [selecteditem, setSelecteditem] =  useState(null);

  useEffect(() => {
    if (activeList.length > 0 && !selecteditem) {
      setSelecteditem(activeList[0]);
      setActiveWagon('0');
      if (activeTab === 'actuals') {
        setLocalIndex(0);
        console.log('Auto-selected first actual item with localIndex: 0');
      } else {
        console.log('Auto-selected first planned item - localIndex not updated');
      }
    }
  }, [activeList, selecteditem, activeTab]);

  const handleItemClick = (item: WagonItem, index: number) => {
    setActiveWagon(index.toString());
    console.log("=====", index);
    console.log("=====", actualList);
    setSelecteditem(activeList[index]);
    if (activeTab === 'actuals') {
      setLocalIndex(index);
      console.log('localIndex updated to:', index, 'for actuals tab');
    } else {
      console.log('Planned tab - localIndex not updated');
    }
 
    console.log('selected item: ', item);
    // setWagonDetailsId(item.Wagon);
    console.log("selecteditem", selecteditem);
    setWagonDetailsId(selecteditem?.Wagon);
    setWagonDetailsType(selecteditem?.WagonType);
  };

  useEffect(() => {
    if (selecteditem) {
      console.log('selecteditem updated:', selecteditem);
      setWagonDetailsId(selecteditem?.Wagon);
      setWagonDetailsType(selecteditem?.WagonType);
      setWagonDetailsQuantity({
        dropdown: selecteditem?.WagonQtyUOM,
        input: selecteditem?.WagonQty
      });
      setWagonDetailsTareWeight({
        dropdown: selecteditem?.WagonTareWeightUOM,
        input: selecteditem?.WagonTareWeight
      });
      setWagonDetailsGrossWeight({
        dropdown: selecteditem?.WagonGrossWeightUOM,
        input: selecteditem?.WagonGrossWeight
      });
      setWagonDetailsLength({
        dropdown: selecteditem?.WagonLengthUOM,
        input: selecteditem?.WagonLength
      });
      setWagonDetailsSequence(selecteditem?.WagonSealNo);

      setContainerDetailsType(selecteditem?.ContainerType);
      setContainerDetailsId(selecteditem?.ContainerId);
      setContainerDetailsQuantity({
        dropdown: selecteditem?.ContainerQtyUOM,
        input: selecteditem?.ContainerQty
      });
      setContainerDetailsTareWeight({
        dropdown: selecteditem?.ContainerTareWeightUOM,
        input: selecteditem?.ContainerTareWeight
      });
      setContainerDetailsLoadWeight({
        dropdown: selecteditem?.ContainerLoadWeightUOM,
        input: selecteditem?.ContainerLoadWeight
      });

      setProductNHM(selecteditem?.NHM);
      setProductId(selecteditem?.ProductID);
      setProductQuantity({
        dropdown: selecteditem?.ProductQuantityUOM,
        input: selecteditem?.ProductQuantity
      });
      setClassOfStores(selecteditem?.ClassofStores);
      setUnCode(selecteditem?.UNCode);
      setDgClass(selecteditem?.DGClass);

      setThuDetailsId(selecteditem?.ThuId);
      setThuDetailsSerialNo(selecteditem?.ThuSerialNo);
      setThuDetailsQuantity({
        dropdown: selecteditem?.ThuQtyUOM,
        input: selecteditem?.ThuQty
      });
      setThuDetailsWeight({
        dropdown: selecteditem?.ThuWeightUOM,
        input: selecteditem?.ThuWeight
      });
      // Do any operations that depend on selecteditem here
      // setWagonDetailsId(selecteditem.Wagon);
    }
  }, [selecteditem]);

  // Get current wagon's actuals data
 
  const currentWagonData = activeWagonId ? getWagonData(activeWagonId) : null;
  const actualsData = currentWagonData?.actuals || {};
  const plannedData = currentWagonData?.planned || {};

  const messageTypes = [
      "Quick Order Header Quick Code1 Init",
      "Quick Order Header Quick Code2 Init",
      "Quick Order Header Quick Code3 Init",
      "Weight UOM Init",
      "Wagon Length UOM Init",
      "Wagon Qty UOM Init",
      "Container Qty UOM Init",
      "Product Qty UOM Init",
      "THU Qty UOM Init",
    ];
    const [qcList1, setqcList1] = useState<any>([]);
    const [qcList2, setqcList2] = useState<any>([]);
    const [qcList3, setqcList3] = useState<any>([]);
    const [weightList, setWeightList] = useState<any>([]);
    const [wagonQty, setWagonQty] = useState<any>([]);
    const [weightLength, setWeightLength] = useState<any>([]);
    const [containerQty, setContainerQty] = useState<any>([]);
    const [productQty, setProductQty] = useState<any>([]);
    const [thuQty, setThuQty] = useState<any>([]);
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Iterate through all messageTypes
    const fetchAll = async () => {
      setLoading(false);
      for (const type of messageTypes) {
        await fetchData(type);
      }
    };
  
    useEffect(() => {
      fetchAll();
  
    }, []);
  
    //API Call for dropdown data
    const fetchData = async (messageType) => {
      console.log("fetch data");
      setLoading(false);
      setError(null);
      try {
        console.log("fetch try");
        const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType});
        setApiData(data);
        console.log("load inside try", data);
        if (messageType == "Quick Order Header Quick Code1 Init") {
          // setqcList1(JSON.parse(data?.data?.ResponseData) || []);
          console.log('Quick Order Header Quick Code1 Init', JSON.parse(data?.data?.ResponseData));
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setqcList1(formattedData);
        }
        if (messageType == "Quick Order Header Quick Code2 Init") {
          // setqcList2(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setqcList2(formattedData);
        }
        if (messageType == "Quick Order Header Quick Code3 Init") {
          // setqcList3(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setqcList3(formattedData);
        }
        if (messageType == "Weight UOM Init") {
          // setWeightList(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));

          setWeightList(formattedData);
        }
        if (messageType == "Wagon Qty UOM Init") {
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setWagonQty(formattedData);
        }
        if (messageType == "Wagon Length UOM Init") {
          // setWeightLength(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setWeightLength(formattedData);
        }
        if (messageType == "Container Qty UOM Init") {
          // setContainerQty(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setContainerQty(formattedData);
        }
        if (messageType == "Product Qty UOM Init") {
          // setProductQty(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setProductQty(formattedData);
        }
        if (messageType == "THU Qty UOM Init") {
          // setThuQty(JSON.parse(data?.data?.ResponseData) || []);
          let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
          setThuQty(formattedData);
        }
      } catch (err) {
        setError(`Error fetching API data for ${messageType}`);
        // setApiData(data);
      }
      finally {
        setLoading(true);
      }
    };

  // Helper to update actuals for the current wagon
  const updateCurrentActuals = (data: Partial<ActualsData>) => {
    if (activeWagonId) {
      updateActualsData(activeWagonId, data);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleItemCheck = (id: string) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setSelectedItems(prev => prev.map(item => ({ ...item, checked: newValue })));
  };

  if (!isOpen) return null;

  const handleSaveActualDetails = async () => {
    // if (!selecteditem) {
    //   console.log('No item selected');
    //   toast({
    //     title: "⚠️ No Item Selected",
    //     description: "Please select an item to save.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    try {
      console.log("Saving actual details for item:", selecteditem);
      
      // Get the full trip data from the store
      let legID = legId;
      let consignmentsIndex = consignmentIndex;
      let actualCurrentIndex = localIndex;
      console.log("legID ====", legID + consignmentsIndex + actualCurrentIndex)
      const currentTripData = tripData;
      if (!currentTripData) {
        console.warn("No trip data available in store");
        toast({
          title: "⚠️ No Trip Data",
          description: "No trip data available to update.",
          variant: "destructive",
        });
        return;
      }

      console.log("Current trip data:", currentTripData);
      console.log("setSelecteditem index:", selecteditem);
      
      // Get the leg details from the store
      const fullLegDetails = getLegDetails();
      
      
      // Create updated item with form data
      const updatedItem = {
        ...selecteditem, // Keep all existing data
        // Update with new form data
        ModeFlag: "Update",
        WagonType: wagonDetailsType || selecteditem.WagonType,
        Wagon: wagonDetailsId || selecteditem.Wagon,
        WagonQty: wagonDetailsQuantity.input ? parseFloat(wagonDetailsQuantity.input) : selecteditem.WagonQty,
        WagonQtyUOM: wagonDetailsQuantity.dropdown || selecteditem.WagonQtyUOM,
        WagonTareWeight: wagonDetailsTareWeight.input ? parseFloat(wagonDetailsTareWeight.input) : selecteditem.WagonTareWeight,
        WagonTareWeightUOM: wagonDetailsTareWeight.dropdown || selecteditem.WagonTareWeightUOM,
        WagonGrossWeight: wagonDetailsGrossWeight.input ? parseFloat(wagonDetailsGrossWeight.input) : selecteditem.WagonGrossWeight,
        WagonGrossWeightUOM: wagonDetailsGrossWeight.dropdown || selecteditem.WagonGrossWeightUOM,
        WagonLength: wagonDetailsLength.input ? parseFloat(wagonDetailsLength.input) : selecteditem.WagonLength,
        WagonLengthUOM: wagonDetailsLength.dropdown || selecteditem.WagonLengthUOM,
        WagonSealNo: wagonDetailsSequence || selecteditem.WagonSealNo,

        ContainerId: containerDetailsId || selecteditem.ContainerId,
        ContainerType: containerDetailsType || selecteditem.ContainerType,
        ContainerQty: containerDetailsQuantity.input ? parseFloat(containerDetailsQuantity.input) : selecteditem.ContainerQty,
        ContainerTareWeight: containerDetailsTareWeight.input ? parseFloat(containerDetailsTareWeight.input) : selecteditem.ContainerTareWeight,
        ContainerTareWeightUOM: containerDetailsTareWeight.dropdown || selecteditem.ContainerTareWeightUOM,
        ContainerLoadWeight: containerDetailsLoadWeight.input ? parseFloat(containerDetailsLoadWeight.input) : selecteditem.ContainerLoadWeight,
        ContainerLoadWeightUOM: containerDetailsLoadWeight.dropdown || selecteditem.ContainerLoadWeightUOM,

        ThuId: thuDetailsId || selecteditem.ThuId,
        ThuSerialNo: thuDetailsSerialNo || selecteditem.ThuSerialNo,
        ThuQty: thuDetailsQuantity.input ? parseFloat(thuDetailsQuantity.input) : selecteditem.ThuQuantity,
        ThuQtyUOM: thuDetailsQuantity.dropdown || selecteditem.ThuQuantityUOM,
        ThuWeight: thuDetailsWeight.input ? parseFloat(thuDetailsWeight.input) : selecteditem.ThuWeight,
        ThuWeightUOM: thuDetailsWeight.dropdown || selecteditem.ThuWeightUOM,

        NHM: productNHM || selecteditem.NHM,
        Product: productId || selecteditem.ProductID,
        productQuantity: productQuantity.input ? parseFloat(productQuantity.input) : selecteditem.ProductQuantity,
        productQuantityUOM: productQuantity.dropdown || selecteditem.ProductQuantityUOM,
        ClassOfStores: classOfStores || selecteditem.ClassofStores,
        UNCode: unCode || selecteditem.UNCode,
        DGClass: dgClass || selecteditem.DGClass,
      };

      console.log('Updated item with form data:', updatedItem);
      
      // Create a deep copy of the trip data to avoid mutation
      const updatedTripData = JSON.parse(JSON.stringify(currentTripData));
      
      // Find and update the specific nested object
      try {
        // Validate the path exists
        if (!updatedTripData.LegDetails || !Array.isArray(updatedTripData.LegDetails)) {
          throw new Error("LegDetails not found or not an array");
        }
        
        // Find the leg by matching LegSequence with legID
        const legIndex = updatedTripData.LegDetails.findIndex(leg => leg.LegSequence === legID);
        if (legIndex === -1) {
          throw new Error(`Leg with LegSequence ${legID} not found`);
        }
        
        console.log(`Found leg at index ${legIndex} with LegSequence ${legID}`);
        
        if (!updatedTripData.LegDetails[legIndex].Consignment) {
          throw new Error(`Leg at index ${legIndex} has no Consignment`);
        }
        
        if (!Array.isArray(updatedTripData.LegDetails[legIndex].Consignment)) {
          throw new Error("Consignment is not an array");
        }
        
        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex] || 
            !updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex].Actual) {
          throw new Error(`Consignment at index ${consignmentsIndex} or its Actual not found`);
        }
        
        if (!Array.isArray(updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex].Actual)) {
          throw new Error("Actual is not an array");
        }
        
        if (!updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex].Actual[actualCurrentIndex]) {
          throw new Error(`Actual item at index ${actualCurrentIndex} not found`);
        }
        
        // Update the specific object
        updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex].Actual[actualCurrentIndex] = updatedItem;
        
        console.log("Successfully updated the nested object:");
        console.log("Updated LegDetails:", updatedTripData.LegDetails[legIndex]);
        console.log("Updated Consignment:", updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex]);
        console.log("Updated Actual item:", updatedTripData.LegDetails[legIndex].Consignment[consignmentsIndex].Actual[actualCurrentIndex]);
        
        // Save to API
        try {
          const response = await tripService.saveTrip(updatedTripData);
          console.log("Trip saved response:", response);
          
          const resourceStatus = (response as any)?.data?.IsSuccess;
          console.log("resourceStatus ===", resourceStatus);
          
          if (resourceStatus) {
            // Update the store with the new trip data
            if (setTrip) {
              setTrip(updatedTripData);
              console.log("Trip data updated in store");
            }
            
            // Update local state
            setSelecteditem(updatedItem);
            
            toast({
              title: "✅ Actual Details Saved Successfully",
              description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
              variant: "default",
            });
          } else {
            console.log("error as any ===", (response as any)?.data?.Message);
            toast({
              title: "⚠️ Save Failed",
              description: (response as any)?.data?.Message || "Failed to save changes.",
              variant: "destructive",
            });
          }
        } catch (apiError) {
          console.error("API Error:", apiError);
          toast({
            title: "⚠️ Save Failed",
            description: "Failed to save changes. Please try again.",
            variant: "destructive",
          });
        }
        
      } catch (updateError) {
        console.error("Error updating nested data:", updateError);
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
  };
  
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-6">
        <h2 className="text-lg font-semibold">Plan and Actual Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-56px)] overflow-y-auto">
        {/* Left Sidebar - Items List */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          {/* Select All */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              {/* <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
              /> */}
              <Label htmlFor="select-all" className="font-medium cursor-pointer">
                All Item
              </Label>
              <div className="flex-1" />
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M9 3v18M15 3v18" />
                </svg>
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </Button>
              {/* <Button size="icon" variant="default" className="h-8 w-8">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Button> */}
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {plannedList && activeTab == 'planned' && plannedList.map((item, index: any) => (
              <div
                key={item.wagonId + '-' + index}
                onClick={() => handleItemClick(item, index)}
                className={cn(
                  "p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                  item.checked && "border-primary bg-accent",
                  activeWagonId === index.toString() && "ring-1 ring-primary border-primary bg-primary/5 shadow-md"
                )}
              >
                <div className="flex items-start gap-2">
                  {/* <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItemCheck(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  /> */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-blue-600">{item.WagonId}</div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{item.WagonType}</div>
                    <div className="text-sm font-medium text-blue-600">{item.price}</div>
                  </div>
                </div>
              </div>
            ))}
            {actualList && activeTab == 'actuals' && actualList.map((item,index: any) => (
              <div
                key={item.wagon+'-'+index}
                onClick={() => handleItemClick(item,index)}
                className={cn(
                  "p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                  item.checked && "border-primary bg-accent",
                  activeWagonId === index && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start gap-2">
                  {/* <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItemCheck(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  /> */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-blue-600">{item.Wagon}</div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="12" cy="19" r="2" />
                        </svg>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{item.WagonType}</div>
                    <div className="text-sm font-medium text-blue-600">{item.Seqno}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add More Button */}
            <Button variant="outline" className="w-full h-12 border-dashed">
              --
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <Tabs
            defaultValue="planned"
            className="flex-1 flex flex-col"
            onValueChange={(value: string) => {
              setActiveTab(value as 'planned' | 'actuals');
            }}
          >
            <div className="border-b px-6 pt-4">
              <TabsList>
                <TabsTrigger value="planned">
                  <span className="relative">
                    Planned
                    {currentWagonData?.planned && Object.keys(currentWagonData.planned).length > 0 && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="actuals">
                  <span className="relative">
                    Actuals
                    {currentWagonData?.actuals && Object.keys(currentWagonData.actuals).length > 0 && (
                      <span className="absolute -top-1 -right-2 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="planned"
              className={cn(
                "flex-1 m-0 overflow-y-auto p-6 space-y-4",
                activeTab === 'planned' ? 'block' : 'hidden'
              )}
              forceMount>
              {/* Wagon Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('wagon')}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Wagon Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      Wagon {selecteditem?.WagonQty ? selecteditem?.WagonQty : '-'}
                    </Badge>
                    {expandedSections.wagon ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.wagon && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Type</div>
                            <div className="text-sm font-medium">{selecteditem?.WagonType ? selecteditem?.WagonType : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon ID</div>
                            <div className="text-sm font-medium">{selecteditem?.WagonId ? selecteditem?.WagonId : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Quantity</div>
                            <div className="text-sm font-medium">{selecteditem?.WagonQty ? selecteditem?.WagonQty : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Tare Weight</div>
                            <div className="text-sm font-medium">{selecteditem?.WagonTareWeight ? selecteditem?.WagonTareWeight : '-'} {selecteditem?.WagonTareWeightUOM ? selecteditem?.WagonTareWeightUOM : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Gross Weight</div>
                            <div className="text-sm font-medium">{selecteditem?.GrossWeight ? selecteditem?.GrossWeight : '-'} {selecteditem?.GrossWeightUOM ? selecteditem?.GrossWeightUOM : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Length</div>
                            <div className="text-sm font-medium">{selecteditem?.WagonLength ? selecteditem?.WagonLength : '-'} {selecteditem?.WagonLengthUOM ? selecteditem?.WagonLengthUOM : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Sequence</div>
                            <div className="text-sm font-medium">{selecteditem?.Seqno ? selecteditem?.Seqno : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Container Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('container')}
                >
                  <div className="flex items-center gap-2">
                    <ContainerIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Container Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200">
                      Container {selecteditem?.ContainerQty ? selecteditem?.ContainerQty : '-'}
                    </Badge>
                    {expandedSections.container ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.container && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Type</div>
                            <div className="text-sm font-medium">{selecteditem?.ContainerType ? selecteditem?.ContainerType : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container ID</div>
                            <div className="text-sm font-medium">{selecteditem?.ContainerId ? selecteditem?.ContainerId : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Quantity</div>
                            <div className="text-sm font-medium">{selecteditem?.ContainerQty ? selecteditem?.ContainerQty : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Tare Weight</div>
                            <div className="text-sm font-medium">{selecteditem?.ContainerAvgTareWeight ? selecteditem?.ContainerAvgTareWeight : '-'} {selecteditem?.ContainerWeightUOM ? selecteditem?.ContainerWeightUOM : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Load Weight</div>
                            <div className="text-sm font-medium">{selecteditem?.ContainerAvgLoadWeight ? selecteditem?.ContainerAvgLoadWeight : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Product Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('product')}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-pink-600" />
                    <h3 className="font-semibold">Product Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                      {selecteditem?.Product ? selecteditem?.Product : '-'}
                    </Badge>
                    {expandedSections.product ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.product && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Hazardous Goods</div>
                            <div className="text-sm font-medium">-</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">NHM</div>
                            <div className="text-sm font-medium">-</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product ID</div>
                            <div className="text-sm font-medium">{selecteditem?.Product ? selecteditem?.Product : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product Quantity</div>
                            <div className="text-sm font-medium">{selecteditem?.ProductWeight ? selecteditem?.ProductWeight : '-'} {selecteditem?.ProductWeightUOM ? selecteditem?.ProductWeightUOM : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Class of Stores</div>
                            <div className="text-sm font-medium">-</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">UN Code</div>
                            <div className="text-sm font-medium">-</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">DG Class</div>
                            <div className="text-sm font-medium">-</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* THU Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('thu')}
                >
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-cyan-600" />
                    <h3 className="font-semibold">THU Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200">
                      {selecteditem?.ThuId ? selecteditem?.ThuId : '-'}
                    </Badge>
                    {expandedSections.thu ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.thu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU ID</div>
                            <div className="text-sm font-medium">{selecteditem?.ThuId ? selecteditem?.ThuId : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Serial No.</div>
                            <div className="text-sm font-medium">{selecteditem?.ThuSerialNo ? selecteditem?.ThuSerialNo : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Quantity</div>
                            <div className="text-sm font-medium">{selecteditem?.ThuQty ? selecteditem?.ThuQty : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Weight</div>
                            <div className="text-sm font-medium">{selecteditem?.ThuWeight ? selecteditem?.ThuWeight : '-'} {selecteditem?.ThuWeightUOM ? selecteditem?.ThuWeightUOM : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('other')}
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Other Details</h3>
                  </div>
                  {expandedSections.other ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedSections.other && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">From Date and Time</div>
                            <div className="text-sm font-medium">--</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">To Date and Time</div>
                            <div className="text-sm font-medium">--</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 1</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 2</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 3</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 1</div>
                            <div className="text-sm font-medium">{selecteditem?.Remarks1 ? selecteditem?.Remarks1 : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 2</div>
                            <div className="text-sm font-medium">{selecteditem?.Remarks2 ? selecteditem?.Remarks2 : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 3</div>
                            <div className="text-sm font-medium">{selecteditem?.Remarks3 ? selecteditem?.Remarks3 : '-'}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent
              value="actuals"
              className={cn(
                "flex-1 m-0 overflow-y-auto p-6 space-y-4",
                activeTab === 'actuals' ? 'block' : 'hidden'
              )}
              forceMount>
              
              {/* Wagon Details - Actual */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('wagon')}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Wagon Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      Wagon {selecteditem?.WagonQty ? selecteditem?.WagonQty : '-'}
                    </Badge>
                    {expandedSections.wagon ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.wagon && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Type</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchWagonTypes}
                                value={wagonDetailsType}
                                onChange={(value) => setWagonDetailsType(value as string)}
                                placeholder="Select Type"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon ID</div>
                            <div className="text-sm font-medium">
                              {/* <Input type='text' 
                              value={wagonDetailsId}
                              onChange={(e) => {setWagonDetailsId(e.target.value)}}
                              /> */}
                              <DynamicLazySelect
                                fetchOptions={fetchWagonIds}
                                value={wagonDetailsId}
                                onChange={(value) => setWagonDetailsId(value as string)}
                                placeholder="Select Wagon ID"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Quantity</div>
                            <div className="text-sm font-medium">
                              {/* {selecteditem?.WagonQty ? selecteditem?.WagonQty : '-'} */}
                              <InputDropdown
                                value={wagonDetailsQuantity}
                                onChange={setWagonDetailsQuantity}
                                options={wagonQty}
                                placeholder="Enter Quantity"
                              />
                              </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Tare Weight</div>
                            <div className="text-sm font-medium">
                              {/* {selecteditem?.WagonTareWeight ? selecteditem?.WagonTareWeight : '-'} {selecteditem?.WagonTareWeightUOM ? selecteditem?.WagonTareWeightUOM : '-'} */}
                              <InputDropdown
                                value={wagonDetailsTareWeight}
                                onChange={setWagonDetailsTareWeight}
                                options={weightList}
                                placeholder="Enter Quantity"
                              />
                              {/* </div> */}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Gross Weight</div>
                            <div className="text-sm font-medium">
                              {/* {selecteditem?.GrossWeight ? selecteditem?.GrossWeight : '-'} {selecteditem?.GrossWeightUOM ? selecteditem?.GrossWeightUOM : '-'} */}
                              <InputDropdown
                                value={wagonDetailsGrossWeight}
                                onChange={setWagonDetailsGrossWeight}
                                options={weightList}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Length</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={wagonDetailsLength}
                                onChange={setWagonDetailsLength}
                                options={weightLength}
                                placeholder="Enter Quantity"
                              />
                              {/* {selecteditem?.WagonLength ? selecteditem?.WagonLength : '-'} {selecteditem?.WagonLengthUOM ? selecteditem?.WagonLengthUOM : '-'} */}
                              </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Sequence</div>
                            <div className="text-sm font-medium">
                              <Input type='text' 
                              value={wagonDetailsSequence}
                              onChange={(e) => {setWagonDetailsSequence(e.target.value)}}
                              />
                              {/* {selecteditem?.Seqno ? selecteditem?.Seqno : '-'} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Container Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('container')}
                >
                  <div className="flex items-center gap-2">
                    <ContainerIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Container Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200">
                      Container {selecteditem?.ContainerQty ? selecteditem?.ContainerQty : '-'}
                    </Badge>
                    {expandedSections.container ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.container && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Type</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchContainerTypes}
                                value={containerDetailsType}
                                onChange={(value) => setContainerDetailsType(value as string)}
                                placeholder="Select Type"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container ID</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchContainerIds}
                                value={containerDetailsId}
                                onChange={(value) => setContainerDetailsId(value as string)}
                                placeholder="Select ID"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Quantity</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={containerDetailsQuantity}
                                onChange={setContainerDetailsQuantity}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Tare Weight</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={containerDetailsTareWeight}
                                onChange={setContainerDetailsTareWeight}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Load Weight</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={containerDetailsLoadWeight}
                                onChange={setContainerDetailsLoadWeight}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Product Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('product')}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-pink-600" />
                    <h3 className="font-semibold">Product Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                      {selecteditem?.Product ? selecteditem?.Product : '-'}
                    </Badge>
                    {expandedSections.product ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.product && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          {/* <div>
                            <div className="text-xs text-muted-foreground mb-1">Hazardous Goods</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchWagonTypes}
                                value={hazardousGoods}
                                onChange={(value) => setHazardousGoods(value as string)}
                                placeholder="Select Hazardous Goods"
                              />
                            </div>  
                          </div> */}
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">NHM</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchNhmTypes}
                                value={productNHM}
                                onChange={(value) => setProductNHM(value as string)}
                                placeholder="Select NHM"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product ID</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchProductIds}
                                value={productId}
                                onChange={(value) => setProductId(value as string)}
                                placeholder="Select Product ID"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product Quantity</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={productQuantity}
                                onChange={setProductQuantity}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Class of Stores</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchClassOfStore}
                                value={classOfStores}
                                onChange={(value) => setClassOfStores(value as string)}
                                placeholder="Select Class of Stores"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">UN Code</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchUnCodes}
                                value={unCode}
                                onChange={(value) => setUnCode(value as string)}
                                placeholder="Select UN Code"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">DG Class</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchDgClasses}
                                value={dgClass}
                                onChange={(value) => setDgClass(value as string)}
                                placeholder="Select DG Class"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* THU Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('thu')}
                >
                  <div className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-cyan-600" />
                    <h3 className="font-semibold">THU Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-600 border-cyan-200">
                      {selecteditem?.ThuId ? selecteditem?.ThuId : '-'}
                    </Badge>
                    {expandedSections.thu ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.thu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU ID</div>
                            <div className="text-sm font-medium">
                              <DynamicLazySelect
                                fetchOptions={fetchThuTypes}
                                value={thuDetailsId}
                                onChange={(value) => setThuDetailsId(value as string)}
                                placeholder="Select THU ID"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Serial No.</div>
                            <div className="text-sm font-medium">
                            {/* <DynamicLazySelect
                                fetchOptions={fetchWagonTypes}
                                value={thuDetailsSerialNo}
                                onChange={(value) => setThuDetailsSerialNo(value as string)}
                                placeholder="Select THU Serial No."
                              /> */}
                              <Input
                                value={thuDetailsSerialNo}
                                onChange={(e) => setThuDetailsSerialNo(e.target.value)}
                                // placeholder="Enter THU Serial No."
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Quantity</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={thuDetailsQuantity}
                                onChange={setThuDetailsQuantity}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Weight</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={thuDetailsWeight}
                                onChange={setThuDetailsWeight}
                                options={quantityUnitOptions}
                                placeholder="Enter Quantity"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('other')}
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold">Other Details</h3>
                  </div>
                  {expandedSections.other ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedSections.other && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <Separator />
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-x-6 gap-y-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 1</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={otherDetailsQcUserdefined1 as InputDropdownValue}
                                onChange={setOtherDetailsQcUserdefined1}
                                options={qcList1}
                                placeholder="Select QC Userdefined 1"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 2</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={otherDetailsQcUserdefined2}
                                onChange={setOtherDetailsQcUserdefined2}
                                options={qcList2}
                                placeholder="Select QC Userdefined 2"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">QC Userdefined 3</div>
                            <div className="text-sm font-medium">
                              <InputDropdown
                                value={otherDetailsQcUserdefined3}
                                onChange={setOtherDetailsQcUserdefined3}
                                options={qcList3}
                                placeholder="Select QC Userdefined 3"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 1</div>
                            <div className="text-sm font-medium">
                              <Input
                                value={otherDetailsRemarks1}
                                onChange={(e) => setOtherDetailsRemarks1(e.target.value)}
                                placeholder="Enter Remarks 1"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 2</div>
                            <div className="text-sm font-medium">
                              <Input
                                value={otherDetailsRemarks2}
                                onChange={(e) => setOtherDetailsRemarks2(e.target.value)}
                                placeholder="Enter Remarks 1"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 3</div>
                            <div className="text-sm font-medium">
                              <Input
                                value={otherDetailsRemarks3}
                                onChange={(e) => setOtherDetailsRemarks3(e.target.value)}
                                placeholder="Enter Remarks 1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="border-t p-4 flex items-center justify-end gap-2">
            <Button variant="outline" disabled={activeTab === 'planned'}>Move to Transshipment</Button>
            <Button onClick={handleSaveActualDetails} disabled={activeTab === 'planned'}>Save Actual Details</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
