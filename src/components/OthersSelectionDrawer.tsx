import React, { useState, useEffect } from 'react';
// import { SideDrawer } from '@/components/SideDrawer';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { SimpleDropDown } from './Common/SimpleDropDown'
import { Calendar, Clock } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { SmartGrid, SmartGridWithGrouping } from '@/components/SmartGrid';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { GridColumnConfig, GridColumnType } from '@/types/smartgrid';
import { quickOrderService } from '@/api/services/quickOrderService';
import { InputDropdown, InputDropdownValue } from '@/components/ui/input-dropdown';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { tripPlanningService } from '@/api/services/tripPlanningService';
import { manageTripStore } from '@/stores/mangeTripStore';

interface OthersSelectionDrawerProps {
  tripNo?: any;
  tripStatus?: any;
  otherInfoData: any;
  isOpen: boolean;
  onClose: () => void;
  // onAddResource: (formattedData?: { ResourceID: string; ResourceType: string }[]) => void;
  resourceType: 'Others' | 'Equipment' | 'Supplier' | 'Driver' | 'Handler' | 'Vehicle' | 'Schedule';
  // resourceData?: any[];
  // selectedResourcesRq?: any;
  isLoading?: boolean;
  onSubmit?: any
}
const wagonGroups = [
  { id: 1, name: "Load1", seqNo: 1, default: "Y", description: "Load1" },
  { id: 2, name: "Load2", seqNo: 2, default: "N", description: "Load1" },
];
// Resource type configurations
const resourceConfigs = {
  Others: {
    messageType: 'GetEquipment-CreateTripPlan',
    title: 'Others',
    buttonText: 'Update',
    gridTitle: 'Equipment',
    idField: 'EquipmentID', // Primary ID field for this resource type
    columns: [
      {
        key: 'EquipmentType',
        label: 'Equipment Type',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentID',
        label: 'Equipment ID',
        type: 'Text' as GridColumnType,
        width: 200,
        editable: false
      },
      {
        key: 'OwnerID',
        label: 'Owner ID',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'EquipmentCategory',
        label: 'Wagon/Container',
        type: 'Text' as GridColumnType,
        width: 150,
        editable: false
      },
      {
        key: 'Ownership',
        label: 'Ownership',
        type: 'Badge' as GridColumnType,
        width: 120,
        editable: false
      },
      {
        key: 'Keeper',
        label: 'Keeper',
        type: 'Text' as GridColumnType,
        width: 120,
        editable: false
      }
    ]
  },

};


export const OthersSelectionDrawer: React.FC<OthersSelectionDrawerProps> = ({
  tripNo,
  tripStatus,
  otherInfoData,
  isOpen,
  onClose,
  // onAddResource,
  resourceType,
  // selectedResourcesRq,
  // resourceData: propResourceData,
  onSubmit,
  isLoading = false
}) => {
  const { toast } = useToast();
  const bindQC = (): InputDropdownValue => ({
    dropdown: otherInfoData?.QuickCode1 ?? "",
    input: otherInfoData?.QuickCodeValue1 ?? "", // use `input`, not `value`
  });
  const { tripData, fetchTrip,setTrip } = manageTripStore();
  const [serviceType, setServiceType] = useState<string>();
  const [subServiceType, setSubServiceType] = useState<string>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [selectedRowObjects, setSelectedRowObjects] = useState<any[]>([]);
  const [rowTripId, setRowTripId] = useState<any>([]);
  const [QCUserDefined, setQCUserDefined] = useState<InputDropdownValue>(bindQC());
  const [QC, setQC] = useState<any>([]);
  const [remark, setRemark] = useState(otherInfoData.Remarks);
  const [supplierRefNo, setSupplierRefNo] = useState(otherInfoData.SupplierRefNo);
  const [planType, setPlanType] = useState(otherInfoData?.IsRoundTrip === "1" ? "roundTrip" : "oneWay");
  const [loadType, setLoadType] = useState(otherInfoData.LoadType);
  const [passNo, setPassNo] = useState(otherInfoData.PassNoFromSchedule);

  const [tripStartDate, setTripStartDate] = useState(otherInfoData.PlanStartDate);
  const [tripStartTime, setTripStartTime] = useState(otherInfoData.PlanStartTime);
  const [tripEndDate, setTripEndDate] = useState(otherInfoData.PlanEndDate);
  const [tripEndTime, setTripEndTime] = useState(otherInfoData.PlanEndTime);

  const isEmpty = (v: any) => {
    if (v === null || v === undefined) return true;
    if (typeof v === "string") return v.trim() === "";
    if (typeof v === "number") return false;          // numbers are not empty
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") return Object.keys(v).length === 0;
    return !v; // fallback for booleans, etc.
  };
  const [apiData, setApiData] = useState(null);
  const messageTypes = [
    "QCUserDefined Init"
  ];

  const config = resourceConfigs[resourceType];
  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoading(false);
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };

  useEffect(() => {
    console.log("<> Useeffect")
    fetchAll();

  }, [otherInfoData]);

  useEffect(() => {
  })
  //API Call for dropdown data
  const fetchData = async (messageType) => {
    console.log("fetch data");
    console.log("OTHER INFO : ",otherInfoData)
    setLoading(false);
    // setError(null);
    try {
      console.log("fetch try");
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("load inside try", data);

      if (messageType == "QCUserDefined Init") {
        console.log("JSON.parse(data?.data?.ResponseData = ",JSON.parse(data?.data?.ResponseData))
        let responseData = JSON.parse(data?.data?.ResponseData) || [];
          const formattedData = responseData
            .filter((qc: any) => qc.id)
            .map((qc: any) => ({
              label: qc.name,
              value: qc.id,
            }));
        setQC(formattedData || []);
      }
      // if (messageType == "Load type Init") {
      //   setLoadType(JSON.parse(data?.data?.ResponseData) || []);
      // }

    } catch (err) {
      // setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    }
    finally {
      setLoading(true);
    }
  };
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
  // Get configuration for current resource type
  const fetchLoadType = fetchMasterData("Load type Init");
  const fetchQC = fetchMasterData("QC Userdefined");

 
  // Service Type options fetch function (real API)
  const fetchServiceTypeOptions = async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType: "Service type Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data;
      const parsedData = JSON.parse(rr.ResponseData) || [];

      return parsedData
        .filter((item: any) => item.id && item.name)
        .map((item: any) => ({
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }));
    } catch (error) {
      console.error("Error fetching service type options:", error);
      return [];
    }
  };

  // Sub Service Type options fetch function
  // const fetchSubServiceTypeOptions = async (params: { searchTerm: string; offset: number; limit: number }) => {
  //   // Mock API call - replace with actual API
  //   const mockOptions = [
  //     { label: 'Subservice Type 1', value: 'Subservice Type 1' },
  //     { label: 'Subservice Type 2', value: 'Subservice Type 2' },
  //     { label: 'Subservice Type 3', value: 'Subservice Type 3' }
  //   ];

  //   return mockOptions.filter(option => 
  //     option.label.toLowerCase().includes(params.searchTerm.toLowerCase())
  //   );
  // };

  // Sub Service Type options fetch function (real API)
  const fetchSubServiceTypeOptions = async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      const response = await quickOrderService.getMasterCommonData({
        messageType: "Sub Service type Init",
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data;
      const parsedData = JSON.parse(rr.ResponseData) || [];

      return parsedData
        .filter((item: any) => item.id && item.name)
        .map((item: any) => ({
          label: `${item.id} || ${item.name}`,
          value: `${item.id} || ${item.name}`,
        }));
    } catch (error) {
      console.error("Error fetching sub service type options:", error);
      return [];
    }
  };

 
  const handleQcChange = (dropdownValue: string, inputValue: string) => {
    // setQc3Dropdown(dropdownValue);
    // setQc3Input(inputValue);
    // setFormData(prev => ({
    //   ...prev,
    //   qcValue: `${dropdownValue}-${inputValue}`
    // }));
  };

  const handleAddOthers = () => {
    // list only fields you want validated (except tripNo, tripStatus, remark)
    const requiredFields = {
      planType,
      loadType,
      passNo,
      tripStartDate,
      tripStartTime,
      tripEndDate,
      tripEndTime,
      QCUserDefined,
      supplierRefNo
    };
  
    // find which required fields are empty
    const emptyFields = Object.entries(requiredFields)
      .filter(([_, value]) => isEmpty(value))
      .map(([key]) => key);
  
    // if (emptyFields.length > 0) {
    //   const pretty = emptyFields
    //     .map((f) =>
    //       f
    //         .replace(/([A-Z])/g, " $1")    // camelCase -> words
    //         .replace(/^./, (s) => s.toUpperCase())
    //     )
    //     .join(", ");
  
    //   // you can use toast instead of alert
    //   toast({
    //     title: "⚠️ Save Failed",
    //     description: `Please fill the following required fields: ${pretty}`,
    //     variant: "destructive",
    //   });
    //   return;
    // }
  
    // build payload after validation
    const payload = {
      tripNo,
      tripStatus,
      planType,
      loadType,
      passNo,
      tripStartDate,
      tripStartTime,
      tripEndDate,
      tripEndTime,
      QCUserDefined,
      remark,
      supplierRefNo
    };
  
    console.log("✅ Valid payload:", payload);
    console.log("STORE DATA - tripData - ",tripData)

    if (onSubmit) onSubmit(payload);
    onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="40%"
      title="Trip Details"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      badgeContent={tripNo}
      // badgeContent='BR/2025/0286'
      isBadgeRequired={true}
      statusBadgeContent={tripStatus}
      isStatusBadgeRquired={true}>
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="space-y-4 px-2 m-4">

          {/* <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1">Trip From</label>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>PAR565, Paris</span>
                <i className="fa fa-info-circle text-gray-400 text-xs"></i>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 font-medium mb-1">Trip To</label>
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>BER323, Berlin</span>
                <i className="fa fa-info-circle text-gray-400 text-xs"></i>
              </div>
            </div>
          </div> */}
          {/* Radio Buttons */}
          <div className="flex items-center justify-between gap-6 items-center">
            <div>
              <RadioGroup
                value={planType}
                onValueChange={setPlanType}
                className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="oneWay" id="plan" />
                  <label htmlFor="plan" className="cursor-pointer text-sm font-medium text-gray-700">
                    One Way
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="roundTrip" id="actual" />
                  <label htmlFor="actual" className="cursor-pointer text-sm font-medium text-gray-700">
                    Round Trip
                  </label>
                </div>
              </RadioGroup>
            </div>
            {/* Search */}
            {/* <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pass No"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pr-10"
              />
            </div> */}
            {/* </div> */}
          </div>


          <div className="grid grid-cols-1 gap-4" >
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Load Type</label>

              <DynamicLazySelect
                fetchOptions={fetchLoadType}
                value={loadType}
                onChange={(value) => setLoadType(value as string)}
                hideSearch={true}
                disableLazyLoading={true}
                placeholder="Select"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pass No.</label>

              {/* <DynamicLazySelect
                fetchOptions={fetchActivityName}
                value={wagonGroup}
                onChange={(value) => setWagonGroup(value as string)}
                placeholder="Select"
              /> */}
              <Input
                type="text"
                value={passNo}
                onChange={(e) => setPassNo(e.target.value)}
                placeholder="Enter Pass No"
              />
            </div>
            {/* Trip Start Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trip Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip Start Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tripStartDate}
                    onChange={(e) => setTripStartDate(e.target.value)}
                    placeholder="DD-MMM-YYYY"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Trip Start Time */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip Start Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    id="incidentTime"
                    value={tripStartTime}
                    onChange={(e) => setTripStartTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Trip End Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Trip Start Date */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip End Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={tripEndDate}
                    onChange={(e) => setTripEndDate(e.target.value)}
                    placeholder="DD-MMM-YYYY"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Trip Start Time */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Trip End Time</label>
                <div className="relative">
                  <Input
                    type="time"
                    id="endTime"
                    value={tripEndTime}
                    onChange={(e) => setTripEndTime(e.target.value)}
                    placeholder="HH:MM"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">QC UserDefined</label>
              <InputDropdown
                value={QCUserDefined}
                onChange={setQCUserDefined}
                options={QC}
                placeholder="Enter Value"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="Remark">Remarks</label>
              <Input
                id="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter Remark" />
            </div>

            <div className="space-y-2">
              <label htmlFor="supplierRefNo">Supplier Ref No.</label>
              <Input
                id="supplierRefNo"
                value={supplierRefNo}
                onChange={(e) => setSupplierRefNo(e.target.value)}
                placeholder="Enter supplier Referenc No." />
            </div>
          </div>
        </div>

      </div>
      <div className="absolute bottom-0 right-0 w-full bg-white border-t border-gray-200 flex justify-end px-6 py-3">
        <button
          onClick={handleAddOthers} // define this function as needed
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-6 py-2 shadow-sm"
        >
          Update
        </button>
      </div>

    </SideDrawer>

  );
};
