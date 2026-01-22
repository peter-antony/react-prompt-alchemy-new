import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { manageTripStore } from '@/stores/mangeTripStore';
import { quickOrderService, tripService } from '@/api/services';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  CustomerOrderNo: string;
  VASID: string;
  VASIDDescription: string;
  IsApplicableToCustomer: boolean;
  IsApplicableToSupplier: boolean;
  CustomerID: string;
  CustomerDescription: string;
  SupplierContract: string;
  SupplierContractDescription: string;
  SupplierID: string;
  SupplierDescription: any;
  StartDate: string;
  StartTime: string;
  EndDate: string;
  EndTime: string;
  Remarks: string;
  QuickCode1: string | null;
  QuickCodeValue1: string | null;
  NoOfTHUServed: any;
  ModeFlag: string;
  SeqNo: any;
}

interface VASItem {
  id: string;
  name: string;
  quantity: number;
  formData: FormData;
}

const initialFormData: FormData = {
  SeqNo: '',
  CustomerOrderNo: '',
  IsApplicableToCustomer: true,
  IsApplicableToSupplier: false,
  VASID: '',
  CustomerID: '',
  SupplierContract: '',
  SupplierID: '',
  StartDate: '',
  StartTime: '',
  EndDate: '',
  EndTime: '',
  Remarks: '',
  VASIDDescription: '',
  CustomerDescription: '',
  SupplierContractDescription: '',
  SupplierDescription: '',
  QuickCode1: '',
  QuickCodeValue1: '',
  NoOfTHUServed: '',
  ModeFlag: ''
};

// const initialVASItems: VASItem[] = [
//   {
//     id: '1',
//     name: 'Bubble Wrap',
//     quantity: 2,
//   },
//   {
//     id: '1',
//     name: 'Unloading',
//     quantity: 2,
//     formData: {
//       customerOrderNo: 'CO000000001',
//       applicableToCustomer: true,
//       applicableToSupplier: true,
//       vasId: 'vas1',
//       customer: 'customer1',
//       supplierContract: 'contract1',
//       supplier: 'Supplier E',
//       thuServed: '2',
//       startDate: '2025-01-19',
//       startTime: '11:00',
//       endDate: '2025-01-19',
//       endTime: '19:00',
//       remarks: 'Careful unloading',
//     }
//   },
// ];

export const VASDrawerScreen = ({ tripUniqueNo }) => {
  const [vasItems, setVasItems] = useState<VASItem[]>([]);
  const [selectedVAS, setSelectedVAS] = useState<string | null>(null);
  const [selectedVASForCopy, setSelectedVASForCopy] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { tripData } = manageTripStore();
   const [customerError, setCustomerError] = useState(false);
  const tripId: any = tripData?.Header?.TripNo || tripUniqueNo;
  const { toast } = useToast();

  // Filter VAS items based on selected CustomerOrderNo
  const filteredVasItems = formData.CustomerOrderNo
    ? vasItems.filter(item => item.formData.CustomerOrderNo === formData.CustomerOrderNo)
    : vasItems;
  console.log("filteredVasItems = ",filteredVasItems)
  // Temporary placeholder until real implementation is connected
  const fetchMasterData = (messageType: string, extraParams?: Record<string, any>) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
        ...(extraParams || {}),
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


  const fetchVASID = fetchMasterData("VAS Code Desc Init");
  const fetchCustomers = fetchMasterData("Customer Init");
  const fetchSupplierContract = fetchMasterData("Contract Init", { OrderType: 'BUY' });
  const fetchSupplier = fetchMasterData("Supplier Init");
  const [customerValue, setCustomerValue] = useState<string | undefined>();



  // Refactored VAS fetch function
  const fetchVASForTrip = async () => {
    if (!tripId) return;
    
    try {
      const response = await tripService.getVASTrip(tripId);

      // Same normalization logic as in SummaryCardsGrid
      let vasapi: any = JSON.parse(response?.data?.ResponseData);
      const vasList =
        vasapi?.VAS ||
        response?.data ||
        response?.VAS ||
        [];

      console.log("VAS List (Drawer):", vasList);

      // Map API data into your local VASItem structure
      let formattedVasItems: VASItem[] = vasList?.map((vas: any, index: number) => ({
        id: `${vas.CustomerOrderNo}_${vas.SeqNo || index}_${Date.now()}_${index}`,
        name: vas.VASIDDescription || `VAS ${index + 1}`,
        quantity: vas.NoOfTHUServed || 1,
        formData: {
          SeqNo: vas.SeqNo,
          CustomerOrderNo: vas.CustomerOrderNo,
          VASID: vas.VASID || '',
          VASIDDescription: vas.VASIDDescription,
          IsApplicableToCustomer: vas.IsApplicableToCustomer === '1',
          IsApplicableToSupplier: vas.IsApplicableToSupplier === '1',
          CustomerID: vas.CustomerID || '',
          CustomerDescription: vas.CustomerDescription,
          SupplierContract: vas.SupplierContract || '',
          SupplierContractDescription: vas.SupplierContractDescription || '',
          SupplierID: vas.SupplierID || '',
          SupplierDescription: vas.SupplierDescription || '',

          StartDate: vas.StartDate || '',
          StartTime: vas.StartTime || '',
          EndDate: vas.EndDate || '',
          EndTime: vas.EndTime || '',
          Remarks: vas.Remarks || '',
          QuickCode1: vas.QuickCode1,
          QuickCodeValue1: vas.QuickCodeValue1,
          NoOfTHUServed: vas.NoOfTHUServed || '',
          ModeFlag: vas.ModeFlag
        }
      }));

      // If no VAS items from API, create a default item with ModeFlag 'Insert'
      if (formattedVasItems.length === 0) {
        const defaultItem: VASItem = {
          id: Date.now().toString(),
          name: 'New VAS',
          quantity: 1,
          formData: {
            ...initialFormData,
            SeqNo: vasList.length + 1,
            ModeFlag: 'Insert'
          }
        };
        formattedVasItems = [defaultItem];
      }

      setVasItems(formattedVasItems);

      // Auto-select first VAS if available
      if (formattedVasItems.length > 0) {
        const firstVAS = formattedVasItems[0];
        setSelectedVAS(firstVAS.id);
        setFormData(firstVAS.formData);
      }
    } catch (error) {
      console.error("Error fetching VAS:", error);
    }
  };

  // VAS API Fetch on mount
  useEffect(() => {
    fetchVASForTrip();
  }, [tripId]);



  // Auto-select first VAS on mount
  // useEffect(() => {
  //   if (vasItems.length > 0 && !selectedVAS) {
  //     const firstVAS = vasItems[0];
  //     setSelectedVAS(firstVAS.id);
  //     setFormData(firstVAS.formData);
  //   }
  // }, []);

  // Save current formData before switching or saving
const saveCurrentFormData = () => {
  if (selectedVAS) {
    setVasItems(prevItems =>
      prevItems.map(item =>
        item.id === selectedVAS
          ? {
              ...item,
              formData: {
                ...formData,
                // Only change ModeFlag if it was NoChanges
                ModeFlag: formData.ModeFlag === "NoChanges" || !formData.ModeFlag ? "Update" : formData.ModeFlag
              }
            }
          : item
      )
    );
  }
};

  const handleVASClick = async (vas: VASItem) => {
    console.log(vas);
    setSelectedVAS(vas.id);
    setFormData(vas.formData);
  };

  const handleAddNew = () => {
    setSelectedVAS(null);
    setFormData((prev) => ({
      ...initialFormData,
      CustomerOrderNo: prev.CustomerOrderNo,
      CustomerID: prev.CustomerID,
      CustomerDescription: prev.CustomerDescription,
    }));
  };

  const handleDeleteItem = async (id: string) => {
  const vasToDelete = vasItems.find((item) => item.id === id);
  if (!vasToDelete) return;

  // Mark this one as Delete
  const updatedVasItems = vasItems.map((item) =>
    item.id === id
      ? {
          ...item,
          formData: {
            ...item.formData,
            ModeFlag: "Delete",
          },
        }
      : item
  );

  // Header info same as save
  const HeaderInfo = {
    TripNo: tripData?.Header?.TripNo,
    TripOU: tripData?.Header?.TripOU,
    TripStatus: tripData?.Header?.TripStatus,
    TripStatusDescription: tripData?.Header?.TripStatusDescription,
  };

  const vasList = prepareVasPayload(updatedVasItems);

  try {
    const response = await tripService.saveVASTrip(HeaderInfo, vasList);
    console.log("Delete VAS response", response);

    const apiMessage = response?.data?.Message || "Deleted Successfully";
    const isSuccess = response?.data?.IsSuccess !== false;

    toast({
      title: isSuccess ? "✅ VAS Deleted Successfully" : "❌ Delete Failed",
      description: apiMessage,
      variant: isSuccess ? "default" : "destructive",
    });

    // Refresh list after delete
    if (isSuccess) {
      await fetchVASForTrip();
    }
  } catch (error) {
    console.error("Error deleting VAS:", error);
    const errorMessage =
      error?.data?.Message || error?.message || "Failed to delete VAS";

    toast({
      title: "❌ Delete Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }
};


  const prepareVasPayload = (vasItems) => {
    const splitPiped = (value: any): { id: string; name: string } => {
      const str = (value ?? '').toString();
      if (!str.includes('||')) return { id: str.trim(), name: '' };
      const [id, name] = str.split('||');
      return { id: (id ?? '').trim(), name: (name ?? '').trim() };
    };

    return vasItems
      .filter(item => item.formData && Object.keys(item.formData).length > 0)
      .map(item => {
        const fd = item.formData;

        const vas = splitPiped(fd.VASID);
        const cust = splitPiped(fd.CustomerID);
        const sup = splitPiped(fd.SupplierID);
        const contract = splitPiped(fd.SupplierContract);

        return {
          ...fd,
          // IDs: send only the left side
          VASID: vas.id,
          CustomerID: cust.id,
          SupplierID: sup.id,
          SupplierContract: contract.id,
          // Descriptions: if empty, use right side
          VASIDDescription: fd.VASIDDescription || vas.name,
          CustomerDescription: fd.CustomerDescription || cust.name,
          SupplierDescription: fd.SupplierDescription || sup.name,
          SupplierContractDescription: fd.SupplierContractDescription || contract.name,
        };
      });
  };

  // const handleSave = async () => {
  //   if (selectedVAS) {
  //     // Update existing VAS
  //     setVasItems(vasItems.map(item =>
  //       item.id === selectedVAS
  //         ? { ...item, formData }
  //         : item
  //     ));
  //   } else {
  //     // Create new VAS
  //     const newVAS: VASItem = {
  //       id: Date.now().toString(),
  //       name: formData.VASID || 'New VAS',
  //       quantity: parseInt(formData.NoOfTHUServed) || 1,
  //       formData,
  //     };
  //     setVasItems([...vasItems, newVAS]);
  //     setSelectedVAS(newVAS.id);
  //   }
  //   const HeaderInfo = {
  //     TripNo: tripData?.Header?.TripNo,
  //     TripOU: tripData?.Header?.TripOU,
  //     TripStatus: tripData?.Header?.TripStatus,
  //     TripStatusDescription: tripData?.Header?.TripStatusDescription
  //   }
  //   const vasList = prepareVasPayload(vasItems);
  //   const response = await tripService.saveVASTrip(HeaderInfo, vasList);
  //   console.log('Save VAS response', response);
  // };

  const handleSave = async () => {
  // Check if CustomerOrderNo is empty when creating new VAS
  // Show error when there is no Customer Order No selected && Customer is checked
   const customerVal = (formData.CustomerID ?? "").toString().trim();

if (!customerVal) {
  setCustomerError(true);          // 🔴 show red border
  // missingFields.push("Customer");
}

  if (!selectedVAS && formData.IsApplicableToCustomer && !formData.CustomerOrderNo) {
    toast({
      title: "❌ Validation Error",
      description: "Please select a Customer Order No before saving",
      variant: "destructive",
    });
    return;
  }

  // Check if VASID is empty when creating new VAS
  // Show error when there is no VAS selected
  if (!selectedVAS && !formData.VASID) {
    toast({
      title: "❌ Validation Error",
      description: "Please select a VAS before saving",
      variant: "destructive",
    });
    return;
  }

  let updatedVasItems = [...vasItems];

  if (selectedVAS) {
    // Update existing VAS → only the edited one gets ModeFlag updated
    updatedVasItems = updatedVasItems.map(item => {
      if (item.id === selectedVAS) {
        return {
          ...item,
          formData: {
            ...formData,
            ModeFlag: formData.ModeFlag === "NoChanges" || !formData.ModeFlag ? "Update" : formData.ModeFlag
          }
        };
      }
      return item;
    });
  } else {
    // New VAS → mark as New
    const newVAS: VASItem = {
      id: Date.now().toString(),
      name: formData.VASID || 'New VAS',
      quantity: parseInt(formData.NoOfTHUServed) || 1,
      formData: {
        ...formData,
        ModeFlag: "Insert"
      }
    };
    updatedVasItems.push(newVAS);
    setSelectedVAS(newVAS.id);
  }

  const HeaderInfo = {
    TripNo: tripData?.Header?.TripNo,
    TripOU: tripData?.Header?.TripOU,
    TripStatus: tripData?.Header?.TripStatus,
    TripStatusDescription: tripData?.Header?.TripStatusDescription
  };

  const vasList = prepareVasPayload(updatedVasItems);

  try {
    const response = await tripService.saveVASTrip(HeaderInfo, vasList);
    console.log("Save VAS response", response);
    
    // Extract message and success status from API response
    const apiMessage = response?.data?.Message || "Success";
    const isSuccess = response?.data?.IsSuccess !== false; // Default to true if not explicitly false
    
    // Toast notification with variant based on IsSuccess
    toast({
      title: isSuccess ? "✅ VAS Saved Successfully" : "❌ Save Failed",
      description: apiMessage,
      variant: isSuccess ? "default" : "destructive",
    });

    // Re-fetch VAS data after successful save only if API call was successful
    if (isSuccess) {
      await fetchVASForTrip();
    }
  } catch (error) {
    console.error("Error saving VAS:", error);
    
    // Extract error message from API response if available
    const errorMessage = error?.data?.Message || error?.message || "Failed to save Value Added Services";
    
    // Error toast notification
    toast({
      title: "❌ Save Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

  const handleCopyToSupplier = async () => {
  if (selectedVASForCopy.length === 0) return;

  // Step 1: Update only selected items for supplier copy
  const updatedVasItems = vasItems.map((item) => {
    if (selectedVASForCopy.includes(item.id)) {
      return {
        ...item,
        formData: {
          ...item.formData,
          IsApplicableToSupplier: true,
          ModeFlag:
            item.formData.ModeFlag === "NoChanges" ||
            !item.formData.ModeFlag
              ? "Update"
              : item.formData.ModeFlag,
        },
      };
    }
    return item; // keep unchanged for non-selected items
  });

  // Step 2: Prepare header info (same as handleSave)
  const HeaderInfo = {
    TripNo: tripData?.Header?.TripNo,
    TripOU: tripData?.Header?.TripOU,
    TripStatus: tripData?.Header?.TripStatus,
    TripStatusDescription: tripData?.Header?.TripStatusDescription,
  };

  // Step 3: Prepare VAS list (same as handleSave)
  const vasList = prepareVasPayload(updatedVasItems);

  try {
    // Step 4: Call same API as handleSave
    const response = await tripService.saveVASTrip(HeaderInfo, vasList);
    console.log("Copy to Supplier save response", response);

    const apiMessage = response?.data?.Message || "Success";
    const isSuccess = response?.data?.IsSuccess !== false;

    toast({
      title: isSuccess
        ? "✅ Copied to Supplier Successfully"
        : "❌ Copy Failed",
      description: apiMessage,
      variant: isSuccess ? "default" : "destructive",
    });

    if (isSuccess) {
      // Step 5: Refresh data and reset checkboxes
      await fetchVASForTrip();
      setSelectedVASForCopy([]);
    }
  } catch (error) {
    console.error("Error copying VAS to supplier:", error);
    const errorMessage =
      error?.data?.Message ||
      error?.message ||
      "Failed to copy VAS to supplier";

    toast({
      title: "❌ Copy Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }
};




  const handleClear = () => {
    setFormData(initialFormData);
    setSelectedVAS(null);
  };
  console.log("VASDrawerScreen CustomerOrderNo:", tripData.CustomerOrders);
  const checkCustomerSupplier = (item:any) =>{
    console.log("ITEM- ",item)
    if(item.formData.IsApplicableToCustomer && !item.formData.IsApplicableToSupplier)
    {
      return 'C' // Only for Customer
    }else if(item.formData.IsApplicableToCustomer && item.formData.IsApplicableToSupplier){
      return 'C/S' // For both Customer and Supplier
    }else{
      return 'S' // Only for Supplier
    }
 

  }

  // Max character length validation for text fields - will include special characters and whitespace
  const MAX_LENGTH_Remarks = 500;

  return (
    <div className="flex h-full">
      {/* Left Sidebar - VAS Items List */}
      <div className="w-72 border-r border-border bg-muted/30 p-4 flex flex-col">
        {/* Customer Order No */}
        {/* <div className="space-y-2 mb-4">
          <Label>Customer Order No.</Label>
          <Select value={formData.CustomerOrderNo} onValueChange={(value) => setFormData({ ...formData, CustomerOrderNo: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CO000000001">CO000000001</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
        <div className="space-y-2 mb-4">
  <Label>Customer Order No.</Label>
  <Select
    value={formData.CustomerOrderNo}
    onValueChange={(value) => {
      const selectedOrder = tripData?.CustomerOrders?.find((o: any) => o.CustomerOrderNo === value);
      setFormData({
        ...formData,
        CustomerOrderNo: value,
        CustomerID: selectedOrder?.CustomerID || '',
        CustomerDescription: selectedOrder?.CustomerName || '',
      });
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Customer Order No" />
    </SelectTrigger>
    <SelectContent>
      {tripData?.CustomerOrders?.length > 0 ? (
        tripData.CustomerOrders.map((order: any, idx: number) => (
          <SelectItem key={idx} value={order.CustomerOrderNo}>
            {order.CustomerOrderNo}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="none" disabled>
          No Orders Available
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>


        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">All VAS</h3>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {filteredVasItems.map((item) => (
  <Card
    key={item.id}
    className={`cursor-pointer transition-colors hover:bg-accent ${selectedVAS === item.id ? 'bg-accent border-primary' : ''}`}
    onClick={() => handleVASClick(item)}
  >
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {/* ✅ Checkbox for Copy Selection */}
          <Checkbox
            checked={selectedVASForCopy.includes(item.id)}
            onCheckedChange={(checked) => {
              setSelectedVASForCopy((prev) =>
                checked
                  ? [...prev, item.id]
                  : prev.filter((id) => id !== item.id)
              );
            }}
            onClick={(e) => e.stopPropagation()} // prevent card click
          />

          <div className='w-full' >
            <div className="font-medium px-1 text-sm flex justify-between">
              <span>{item.name}</span> 
              <span>{" "}{checkCustomerSupplier(item)}</span>
              </div>
            {/* <div>{checkCustomerSupplier(item)}</div> */}
            <div className="flex items-center gap-2 mt-1 ml-1">
              <span className="text-xs">{formData.CustomerDescription}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 ml-1">
              <span className="text-xs">{item.quantity}</span>
            </div>
            {/* <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.quantity}
              </Badge>
            </div> */}
          </div>
        </div>

        {/* Delete button */}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteItem(item.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
))}

        </div>
        {selectedVASForCopy.length > 0 && (
  <div className="pt-3 border-t mt-3">
    <Button
      variant="default"
      className="w-full"
      onClick={() => handleCopyToSupplier()}
    >
      Copy to Supplier ({selectedVASForCopy.length})
    </Button>
  </div>
)}

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Applicable To Checkboxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Applicable to</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer"
                  checked={formData.IsApplicableToCustomer}
                  onCheckedChange={(checked) => setFormData({ ...formData, IsApplicableToCustomer: checked as boolean })}
                />
                <label htmlFor="customer" className="text-sm cursor-pointer">
                  Customer
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-7">
              <Checkbox
                id="supplier"
                checked={formData.IsApplicableToSupplier}
                onCheckedChange={(checked) => setFormData({ ...formData, IsApplicableToSupplier: checked as boolean })}
              />
              <label htmlFor="supplier" className="text-sm cursor-pointer">
                Supplier
              </label>
            </div>
          </div>

          {/* VAS and Customer Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>VAS</Label>
              {/* <Select value={formData.vasId} onValueChange={(value) => setFormData({ ...formData, vasId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select VAS ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vas1">VAS 1</SelectItem>
                  <SelectItem value="vas2">VAS 2</SelectItem>
                </SelectContent>
              </Select> */}
              <DynamicLazySelect
                fetchOptions={fetchVASID}
                value={formData.VASID && formData.VASIDDescription
                  ? `${formData.VASID} || ${formData.VASIDDescription}`
                  : (formData.VASID || formData.VASIDDescription || '')}
                onChange={(value) => setFormData({ ...formData, VASID: value as string })}
                placeholder="Select VAS ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Customer <span className="text-destructive">*</span></Label>
              {/* <Select value={formData.customer} onValueChange={(value) => setFormData({ ...formData, customer: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer1">Customer 1</SelectItem>
                  <SelectItem value="customer2">Customer 2</SelectItem>
                </SelectContent>
              </Select> */}
              <DynamicLazySelect
                fetchOptions={fetchCustomers}
                value={formData.CustomerID && formData.CustomerDescription
                  ? `${formData.CustomerID} || ${formData.CustomerDescription}`
                  : (formData.CustomerID || formData.CustomerDescription || '')}
                // onChange={(value) => setFormData({ ...formData, CustomerID: value as string })}
                 onChange={(value) => {
    const val = (value ?? "").toString().trim();

    setFormData({
      ...formData,
      CustomerID: value as string,
      CustomerDescription: val.includes("||")
        ? val.split("||")[1]?.trim()
        : formData.CustomerDescription,
    });

    if (val) {
      setCustomerError(false); // ✅ clear red border
    }
  }}
  error={customerError}
                placeholder="Select Customer"
              />
            </div>
          </div>

          {/* Supplier and Contract */}
          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label>Supplier Contract <span className="text-destructive"></span></Label>
              {/* <Select value={formData.supplierContract} onValueChange={(value) => setFormData({ ...formData, supplierContract: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier Contract" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract1">Contract 1</SelectItem>
                  <SelectItem value="contract2">Contract 2</SelectItem>
                </SelectContent>
              </Select> */}
              <DynamicLazySelect
                fetchOptions={fetchSupplierContract}
                value={formData.SupplierContract && formData.SupplierContractDescription
                  ? `${formData.SupplierContract} || ${formData.SupplierContractDescription}`
                  : (formData.SupplierContract || formData.SupplierContractDescription || '')}
                onChange={(value) => setFormData({ ...formData, SupplierContract: value as string })}
                placeholder="Select Supplier Contract"
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              {/* <Input
                placeholder="Enter Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              /> */}
              <DynamicLazySelect
                fetchOptions={fetchSupplier}
                value={formData.SupplierID && formData.SupplierDescription
                  ? `${formData.SupplierID} || ${formData.SupplierDescription}`
                  : (formData.SupplierID || formData.SupplierDescription || '')}
                onChange={(value) => setFormData({ ...formData, SupplierID: value as string })}
                placeholder="Select Supplier Contract"
              />
            </div>
          </div>

          {/* No of THU Served */}
          <div className="space-y-2">
            <Label>VAS Qty</Label>
            <Input
              type="number"
              value={formData.NoOfTHUServed}
              onChange={(e) => setFormData({ ...formData, NoOfTHUServed: e.target.value })}
            />
          </div>

          {/* Start Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.StartDate}
                  onChange={(e) => setFormData({ ...formData, StartDate: e.target.value })}
                  placeholder="DD-MMM-YYYY"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.StartTime}
                  onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
                  placeholder="HH:MM"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* End Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.EndDate}
                  onChange={(e) => setFormData({ ...formData, EndDate: e.target.value })}
                  placeholder="DD-MMM-YYYY"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={formData.EndTime}
                  onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
                  placeholder="HH:MM"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Enter remarks"
              value={formData.Remarks}
              onChange={(e) => setFormData({ ...formData, Remarks: e.target.value })}
              rows={3}
              className={`${formData.Remarks && formData.Remarks.length > MAX_LENGTH_Remarks ? "border-red-600 focus-visible:ring-red-600" : ""}`}
            />
            <p className='text-xs text-red-500'>
              {formData.Remarks && formData.Remarks.length > MAX_LENGTH_Remarks ? `Maximum character limit is ${MAX_LENGTH_Remarks}. [${formData.Remarks.length}/${MAX_LENGTH_Remarks}]` : ""}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={handleSave}>
              Save VAS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
