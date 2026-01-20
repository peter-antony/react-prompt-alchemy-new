import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Calendar, Clock, Maximize2, Copy, Download, Car, Wrench, FileText, Users, DollarSign } from 'lucide-react';
import { manageTripStore } from '@/stores/mangeTripStore';
import { quickOrderService, tripService } from '@/api/services';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { useToast } from '@/hooks/use-toast';

interface IncidentsDrawerScreenProps {
  onClose?: () => void;
}

interface FormData {
  IncidentId: string;
  IncidentStatus: string;
  IncidentType: string;
  IncidentDate: string;
  IncidentTime: string;
  PlaceOfIncident: string;
  CreatedDate: string;
  WeatherCondition: string;
  ShortDescription: string;
  RoadCondition: string;
  DriverFault: string;
  VehicleFault: string;
  DetailedDescription: string;
  MaintenanceRequired: boolean;
  AccidentType: string;
  CauseCode: string;
  Attachments: string;
  IncidentResolution: string;
  MaintenanceType: string;
  Wagon: string;
  Container: string;
  WorkType: string;
  WorkCategory: string;
  WorkGroup: string;
  MaintenanceDescription: string;
  IncidentCausedBy: string;
  IncidentCauserName: string;
  IncidentReportedBy: string;
  IncidentCloseDate: string;
  RiskInvolved: string;
  DangerousGoods: string;
  LoadTime: string;
  RefDocNo: string;
  MobileRefIncidentId: string;
  Remarks: string;
  WorkOrderNumber: string;
  WorkOrderStatus: string;
  WorkRequestNumber: string;
  WorkRequestStatus: string;
  ErrorMessage: string;
  ClaimRequired: boolean;
  ClaimNumber: string;
  ClaimStatus: string;
  RaiseClaim: string;
  ModeFlag: string;
}

interface Incident {
  IncidentId: string;
  id: string;
  // status: 'Open' | 'In Progress' | 'Closed';
  status: string;
  formData: FormData;
}

const initialFormData: FormData = {
  IncidentId: '',
  IncidentStatus: '',
  IncidentType: '',
  IncidentDate: '',
  IncidentTime: '',
  PlaceOfIncident: '',
  CreatedDate: '',
  WeatherCondition: '',
  ShortDescription: '',
  RoadCondition: '',
  DriverFault: '',
  VehicleFault: '',
  DetailedDescription: '',
  MaintenanceRequired: false,
  AccidentType: '',
  CauseCode: '',
  Attachments: '',
  IncidentResolution: '',
  MaintenanceType: '',
  Wagon: '',
  Container: '',
  WorkType: '',
  WorkCategory: '',
  WorkGroup: '',
  MaintenanceDescription: '',
  IncidentCausedBy: '',
  IncidentCauserName: '',
  IncidentReportedBy: '',
  IncidentCloseDate: '',
  RiskInvolved: '',
  DangerousGoods: '',
  LoadTime: '',
  RefDocNo: '',
  MobileRefIncidentId: '',
  Remarks: '',
  WorkOrderNumber: '',
  WorkOrderStatus: '',
  WorkRequestNumber: '',
  WorkRequestStatus: '',
  ErrorMessage: '',
  ClaimRequired: false,
  ClaimNumber: '',
  ClaimStatus: '',
  RaiseClaim: '',
  ModeFlag: 'NoChanges'
};

const initialIncidents: Incident[] = [
  // {
  //   id: 'INC000001',
  //   status: 'Open',
  //   formData: {
  //     ...initialFormData,
  //     IncidentId: 'INC000001',
  //     IncidentStatus: 'open',
  //     IncidentType: 'accident',
  //     PlaceOfIncident: 'warehouse',
  //     detailedDescription: 'First incident - Open status'
  //   }
  // },
  // {
  //   id: 'INC000002',
  //   status: 'In Progress',
  //   formData: {
  //     ...initialFormData,
  //     IncidentId: 'INC000002',
  //     IncidentStatus: 'in-progress',
  //     IncidentType: 'breakdown',
  //     PlaceOfIncident: 'highway',
  //     detailedDescription: 'Second incident - In Progress status'
  //   }
  // },
  // {
  //   id: 'INC000003',
  //   status: 'Open',
  //   formData: {
  //     ...initialFormData,
  //     IncidentId: 'INC000003',
  //     IncidentStatus: 'open',
  //     IncidentType: 'delay',
  //     PlaceOfIncident: 'city',
  //     detailedDescription: 'Third incident - Open status'
  //   }
  // },
  // {
  //   id: 'INC000004',
  //   status: 'Closed',
  //   formData: {
  //     ...initialFormData,
  //     IncidentId: 'INC000004',
  //     IncidentStatus: 'closed',
  //     IncidentType: 'theft',
  //     PlaceOfIncident: 'warehouse',
  //     detailedDescription: 'Fourth incident - Closed status'
  //   }
  // },
  // {
  //   id: 'INC000005',
  //   status: 'Open',
  //   formData: {
  //     ...initialFormData,
  //     IncidentId: 'INC000005',
  //     IncidentStatus: 'open',
  //     IncidentType: 'accident',
  //     PlaceOfIncident: 'highway',
  //     detailedDescription: 'Fifth incident - Open status'
  //   }
  // },
];

export const IncidentsDrawerScreen: React.FC<IncidentsDrawerScreenProps> = ({ onClose }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  // const [incidentItems, setIncidentItems] = useState<VASItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { tripData } = manageTripStore();
  const tripId: any = tripData?.Header?.TripNo;
  const { toast } = useToast();
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

  const fetchMasterDataForIncidents = (messageType: string, extraParams?: Record<string, any>) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonDataForIncidnts({
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
  const fetchIncidentID = fetchMasterData("Trip Log Incident ID Init", { TripID: tripId });
  const fetchIncidentStatus = fetchMasterData("Incident status Init");

  //Incident Details
  const fetchIncidentType = fetchMasterData("Incident Type Init");
  const fetchIncidentPlace = fetchMasterData("Location Init");
  const fetchIncidentWeather = fetchMasterData("Weather Condition Init");
  const fetchIncidentDriver = fetchMasterData("Driver Fault Init");
  const fetchIncidentVehicle = fetchMasterData("Vehicle Fault Init");

  //Maintanence Details
  const fetchIncidentAccident = fetchMasterData("Accident Type Init");
  const fetchIncidentCause = fetchMasterData("Cause code init");
  const fetchIncidentWagon = fetchMasterDataForIncidents("Equipment ID Init", { IncidentTripId: tripId, EquipmentType: 'Equipment' });
  const fetchIncidentContainer = fetchMasterDataForIncidents("Equipment ID Init", { IncidentTripId: tripId, EquipmentType: 'Container' });
  const fetchMaintenanceType = fetchMasterData("Maintenance Type Init");
  const fetchWorkType = fetchMasterData("Work Type Init");
  const fetchWorkCategory = fetchMasterData("Work Category Init");
  const fetchWorkGroup = fetchMasterData("Work Group Init");
  const fetchIncidentCausedBy = fetchMasterData("Incident Caused By Init");
  const fetchIncidentCauserName = fetchMasterData("Incident Causer Name Init",{ IncidentTripId: tripId, IncidentCausedBy: (formData.IncidentCausedBy || '').split('||')[0]?.trim(), });

  //MoreInfo Details

  const fetchIncidentRisks = fetchMasterData("Hazardous Goods Init");
  const fetchIncidentGoods = fetchMasterData("Hazardous Goods Init");
  const fetchLoadTime = fetchMasterData("Load Type Init");


  const [customerValue, setCustomerValue] = useState<string | undefined>();

  // Refactored Incident fetch function
  const fetchIncidentForTrip = async () => {
    if (!tripId) return;

    try {
      const response = await tripService.getIncidentTrip(tripId);

      // Same normalization logic as in SummaryCardsGrid
      let incidentapi: any = JSON.parse(response?.data?.ResponseData);
      const incidentList =
        incidentapi?.Incident ||
        response?.data ||
        response?.Incident ||
        [];

      console.log("INCIDENT List (Drawer):", incidentList);

      // Map API data into your local VASItem structure
      const formattedIncidentItems: Incident[] = incidentList.map((Incident: any, index: number) => ({
        id: Incident.IncidentId || index.toString(),
        name: Incident.IncidentStatus || `Incident ${index + 1}`,
        // quantity: vas.IncidentId || 1,
        formData: {
          IncidentId: Incident.IncidentId || '',
          IncidentStatus: Incident.IncidentStatus,
          IncidentType: Incident.IncidentType || '',
          IncidentCauserName: Incident.IncidentCauserName || '',
          IncidentCausedBy: Incident.IncidentCausedBy || '',
          IncidentCloseDate: Incident.IncidentCloseDate,
          IncidentDate: Incident.IncidentDate || '',
          IncidentReportedBy: Incident.IncidentReportedBy || '',
          IncidentResolution: Incident.IncidentResolution || '',
          IncidentTime: Incident.IncidentTime || '',
          LoadTime: Incident.LoadTime || '',
          RefDocNo: Incident.RefDocNo || '',
          PlaceOfIncident: Incident.PlaceOfIncident || '',
          WeatherCondition: Incident.WeatherCondition || '',
          RoadCondition: Incident.RoadCondition || '',
          ShortDescription: Incident.ShortDescription || '',
          CauseCode: Incident.CauseCode || '',
          Wagon: Incident.Wagon || '',
          Container: Incident.Container || '',
          ClaimNumber: Incident.ClaimNumber || '',
          ClaimStatus: Incident.ClaimStatus || '',
          RaiseClaim: Incident.RaiseClaim || '',
          ClaimRequired: Incident.ClaimRequired === 'Yes' || Incident.ClaimRequired === true,
          DetailedDescription: Incident.DetailedDescription || '',
          WorkGroup: Incident.WorkGroup || '',
          WorkOrderNumber: Incident.WorkOrderNumber || '',
          WorkOrderStatus: Incident.WorkOrderStatus || '',
          WorkRequestNumber: Incident.WorkRequestNumber,
          WorkRequestStatus: Incident.WorkRequestStatus,
          AccidentType: Incident.AccidentType || '',
          Remarks: Incident.Remarks || '',
          WorkType: Incident.WorkType || '',
          WorkCategory: Incident.WorkCategory || '',
          MaintenanceType: Incident.MaintenanceType || '',
          MaintenanceRequired: Incident.MaintenanceRequired === 'Yes' || Incident.MaintenanceRequired === true,
          MaintenanceDescription: Incident.MaintenanceDescription || '',
          RiskInvolved: Incident.RiskInvolved || '',
          DangerousGoods: Incident.DangerousGoods || '',
          ModeFlag: Incident.ModeFlag
        }
      }));
      setIncidents(formattedIncidentItems)
      // setVasItems(formattedVasItems);
    } catch (error) {
      console.error("Error fetching Incidents:", error);
    }
  };

  // Incident API Fetch on mount
  useEffect(() => {
    fetchIncidentForTrip();
  }, [tripId]);

  const handleIncidentClick = (incident: Incident) => {
    console.log('Incident clicked:', incident);
    setSelectedIncident(incident);
    setFormData(incident.formData);
  };

  const handleAddNew = () => {
    setSelectedIncident(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // const handleSave = () => {
  //   if (selectedIncident) {
  //     const newStatus: 'Open' | 'In Progress' | 'Closed' =
  //       formData.IncidentStatus === 'open' ? 'Open' :
  //         formData.IncidentStatus === 'in-progress' ? 'In Progress' : 'Closed';

  //     const updatedIncident: Incident = {
  //       ...selectedIncident,
  //       formData,
  //       status: newStatus
  //     };
  //     setIncidents(prev =>
  //       prev.map(inc =>
  //         inc.id === selectedIncident.id ? updatedIncident : inc
  //       )
  //     );
  //     setSelectedIncident(updatedIncident);
  //   } else {
  //     const newStatus: 'Open' | 'In Progress' | 'Closed' =
  //       formData.IncidentStatus === 'open' ? 'Open' :
  //         formData.IncidentStatus === 'in-progress' ? 'In Progress' : 'Closed';

  //     const newIncident: Incident = {
  //       id: `INC${String(incidents.length + 1).padStart(6, '0')}`,
  //       status: newStatus,
  //       formData,
  //     };
  //     setIncidents(prev => [...prev, newIncident]);
  //     setSelectedIncident(newIncident);
  //   }
  // };
  const handleSave = async () => {
    let updatedIncidentItems = [...incidents];
    let newIncidentForApi: Incident | null = null;

    const areFormDataEqual = (a: any, b: any) => {
      if (!a || !b) return false;
      const { ModeFlag: _aMode, ...aRest } = a;
      const { ModeFlag: _bMode, ...bRest } = b;
      try {
        return JSON.stringify(aRest) === JSON.stringify(bRest);
      } catch {
        return false;
      }
    };

    if (selectedIncident) {
      // Update existing VAS → only the edited one gets ModeFlag updated
      updatedIncidentItems = updatedIncidentItems.map(item => {
        if (item === selectedIncident) {
          const hasChanges = !areFormDataEqual(item.formData, formData);
          return {
            ...item,
            formData: {
              ...formData,
              ModeFlag: hasChanges ? "Update" : (item.formData?.ModeFlag || "NoChanges")
            }
          };
        }
        return item;
      });
    } else {
      // New Incident → use entered IncidentId and mark as Insert (defer UI update until API success)
      console.log("Inside Else")
      const newIncident: Incident = {
        id: Date.now().toString(),
        IncidentId: (formData.IncidentId || '').toString(),
        status: formData.IncidentStatus || "OPEN",
        // quantity: parseInt(formData.NoOfTHUServed) || 1,
        formData: {
          ...formData,
          ModeFlag: "Insert"
        }
      };
      newIncidentForApi = newIncident;
    }

    const HeaderInfo = {
      TripNo: tripData?.Header?.TripNo,
      TripOU: tripData?.Header?.TripOU,
      TripStatus: tripData?.Header?.TripStatus,
      TripStatusDescription: tripData?.Header?.TripStatusDescription
    };

    const itemsForApi = newIncidentForApi ? [...updatedIncidentItems, newIncidentForApi] : updatedIncidentItems;
    const incidentList = prepareIncidentPayload(itemsForApi);

    try {
      const response = await tripService.saveIncidentTrip(HeaderInfo, incidentList);
      console.log("Save INCIDENT response", response);
      const isSuccess = response?.data?.IsSuccess === true;
      const message = response?.data?.Message || (isSuccess ? "Incident saved successfully" : "Failed to save incident");

      if (isSuccess) {
        // Success toast
        toast({
          title: "✅ Incident Saved Successfully",
          description: message,
          variant: "default",
        });

        // Re-fetch incidents after successful save
        await fetchIncidentForTrip();
      } else {
        // Failure toast
        toast({
          title: "❌ Save Failed",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error saving INCIDENT:", error);
      
      // Error toast for exceptions
      const errorMessage = error?.data?.Message || error?.message || "Failed to save incident";
      toast({
        title: "❌ Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  const prepareIncidentPayload = (incidentItems) => {
    const splitPiped = (value) => {
      const str = (value ?? '').toString();
      if (!str.includes('||')) return { id: str.trim(), name: '' };
      const [id, name] = str.split('||');
      return { id: (id ?? '').trim(), name: (name ?? '').trim() };
    };

    // Fields coming from DynamicLazySelect that can be piped
    const FIELDS_TO_SPLIT = [
      'IncidentStatus',
      'IncidentType',
      'AccidentType',
      'CauseCode',
      'MaintenanceType',
      'WorkType',
      'WorkCategory',
      'WorkGroup',
      'Wagon',
      'Container',
      'IncidentCausedBy',
      'IncidentReportedBy',
      'LoadTime',
      'PlaceOfIncident',
      'DangerousGoods',
      'WeatherCondition',
      'RiskInvolved',
      'DriverFault',
      'VehicleFault'
    ];

    return incidentItems
      .filter(item => item.formData && Object.keys(item.formData).length > 0)
      .map(item => {
        const fd = item.formData || {};
        const cleaned = { ...fd };

        FIELDS_TO_SPLIT.forEach((field) => {
          if (field in cleaned) {
            const { id, name } = splitPiped(cleaned[field]);
            cleaned[field] = id;
            // Optionally populate a Description field if present in schema
            const descKey = `${field}Description`;
            if (cleaned[descKey] == null || cleaned[descKey] === '') {
              cleaned[descKey] = name;
            }
          }
        });

        // Convert MaintenanceRequired boolean to "Yes"/"No" for server
        if ('MaintenanceRequired' in cleaned) {
          cleaned.MaintenanceRequired = cleaned.MaintenanceRequired === true || cleaned.MaintenanceRequired === 'Yes' ? 'Yes' : 'No';
        }

        // Convert ClaimRequired boolean to "Yes"/"No" for server
        if ('ClaimRequired' in cleaned) {
          cleaned.ClaimRequired = cleaned.ClaimRequired === true || cleaned.ClaimRequired === 'Yes' ? 'Yes' : 'No';
        }

        return cleaned;
      });
  };
  const handleClear = () => {
    setFormData(initialFormData);
    setSelectedIncident(null);
  };

  const handleDeleteIncident = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const incidentToDelete = incidents[index];
    setIncidents(prev => prev.filter((_, i) => i !== index));
    if (selectedIncident === incidentToDelete) {
      setSelectedIncident(null);
      setFormData(initialFormData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'In Progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Closed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Max character length validation for text fields - will include special characters and whitespace
  const MAX_LENGTH_IncidentId = 50;
  const MAX_LENGTH_DetailedDescription = 500;
  const MAX_LENGTH_IncidentResolution = 100;
  const MAX_LENGTH_MaintenanceDescription = 500;
  const MAX_LENGTH_IncidentReportedBy = 100;
  const MAX_LENGTH_RefDocNo = 100;
  const MAX_LENGTH_MobileRefIncidentId = 100;
  const MAX_LENGTH_Remarks = 500;

  return (
    <div className="flex flex-col h-full">
      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Incident List */}
        <div className="w-[30%] border-r border-border bg-muted/30 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">All Incidents</h3>
            <div className="flex gap-1">
              {/* <Button size="icon" variant="ghost" className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button> */}
              <Button size="icon" variant="ghost" className="h-8 w-8 border" onClick={handleAddNew}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {incidents.map((incident, index) => {
              const isSelected = selectedIncident ?
                incidents.findIndex(inc => inc === selectedIncident) === index :
                false;

              return (
                <Card
                  key={`${incident.id}-${index}`}
                  className={`cursor-pointer transition-colors hover:bg-accent ${isSelected ? 'bg-accent border-primary' : ''
                    }`}
                  onClick={() => handleIncidentClick(incident)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{incident.id}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(incident.status)} text-xs font-medium`}>
                        {incident.status}
                      </Badge>
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteIncident(index, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Top row with fields and action icons */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="incidentId">Incident ID <span className="text-destructive">*</span></Label>
                {/* <Input
                  id="incidentId"
                  value={formData.incidentId}
                  onChange={(e) => handleInputChange('incidentId', e.target.value)}
                  placeholder="Enter incident ID"
                /> */}
                <Input id="incidentId" 
                value={formData.IncidentId} 
                onChange={(e) => setFormData({ ...formData, IncidentId: e.target.value })} 
                placeholder="Enter Incident ID"
                className={`h-10 ${
                  formData.IncidentId && formData.IncidentId.length > MAX_LENGTH_IncidentId ? "border-red-600 focus-visible:ring-red-600" : ""
                    }`}
                />
                <p className="text-xs min-h-[16px] text-red-500">
                  {formData.IncidentId &&
                    formData.IncidentId.length > MAX_LENGTH_IncidentId &&
                    `Maximum character limit is ${MAX_LENGTH_IncidentId}. [${formData.IncidentId.length}/${MAX_LENGTH_IncidentId}]`}
                </p>
                {/* <DynamicLazySelect
                  fetchOptions={fetchIncidentID}
                  value={formData.IncidentId}
                  onChange={(value) => setFormData({ ...formData, IncidentId: value as string })}
                  placeholder="Select Incident ID"
                /> */}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="incidentStatus">Incident Status <span className="text-destructive">*</span></Label>
                <DynamicLazySelect
                  fetchOptions={fetchIncidentStatus}
                  value={formData.IncidentStatus}
                  onChange={(value) => setFormData({ ...formData, IncidentStatus: value as string })}
                  placeholder="Select Incident Status"
                />
                <div className="min-h-[16px]" />
              </div>
              <div className="flex gap-2 self-center pt-2">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Accordion Sections */}
            <Accordion type="single" collapsible className="w-full space-y-4">
              {/* Incident Details Section */}
              <AccordionItem value="incident-details" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-orange-500" />
                    <span>Incident Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incidentType">Incident Type <span className="text-destructive">*</span></Label>
                      {/* <Select value={formData.IncidentType} onValueChange={(value) => handleInputChange('IncidentType', value)}>
                        <SelectTrigger id="IncidentType">
                          <SelectValue placeholder="Select Incident Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="breakdown">Breakdown</SelectItem>
                          <SelectItem value="delay">Delay</SelectItem>
                          <SelectItem value="theft">Theft</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentType}
                        value={formData.IncidentType}
                        onChange={(value) => setFormData({ ...formData, IncidentType: value as string })}
                        placeholder="Select Incident Type"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentDate">Incident Date <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.IncidentDate}
                          onChange={(e) => setFormData({ ...formData, IncidentDate: e.target.value })}
                          placeholder="DD-MMM-YYYY"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentTime">Incident Time <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        {/* <Input id="IncidentTime" type="time" value={formData.IncidentTime} onChange={(e) => handleInputChange('IncidentTime', e.target.value)} /> */}
                        <Input
                          type="time"
                          id="incidentTime"
                          value={formData.IncidentTime}
                          onChange={(e) => setFormData({ ...formData, IncidentTime: e.target.value })}
                          placeholder="HH:MM"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placeOfIncident">Place of Incident</Label>
                      {/* <Select value={formData.PlaceOfIncident} onValueChange={(value) => handleInputChange('PlaceOfIncident', value)}>
                        <SelectTrigger id="placeOfIncident">
                          <SelectValue placeholder="Select Place of Inc." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="highway">Highway</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentPlace}
                        value={formData.PlaceOfIncident}
                        onChange={(value) => setFormData({ ...formData, PlaceOfIncident: value as string })}
                        placeholder="Select Place of Incident"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createdDate">Created Date</Label>
                      <div className="relative">
                        {/* <Input id="createdDate" type="date" value={formData.createdDate} onChange={(e) => handleInputChange('createdDate', e.target.value)} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" /> */}
                        <Input
                          type="date"
                          value={formData.CreatedDate}
                          onChange={(e) => setFormData({ ...formData, CreatedDate: e.target.value })}
                          placeholder="DD-MMM-YYYY"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weatherCondition">Weather Condition</Label>
                      {/* <Select value={formData.WeatherCondition} onValueChange={(value) => handleInputChange('WeatherCondition', value)}>
                        <SelectTrigger id="WeatherCondition">
                          <SelectValue placeholder="Select Weather Con." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Clear</SelectItem>
                          <SelectItem value="rainy">Rainy</SelectItem>
                          <SelectItem value="foggy">Foggy</SelectItem>
                          <SelectItem value="snowy">Snowy</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentWeather}
                        value={formData.WeatherCondition}
                        onChange={(value) => setFormData({ ...formData, WeatherCondition: value as string })}
                        placeholder="Select Weather Condition"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driverFault">Driver Fault</Label>
                      {/* <Select value={formData.DriverFault} onValueChange={(value) => handleInputChange('DriverFault', value)}>
                        <SelectTrigger id="DriverFault">
                          <SelectValue placeholder="Select Driver Fault" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentDriver}
                        value={formData.DriverFault}
                        onChange={(value) => setFormData({ ...formData, DriverFault: value as string })}
                        placeholder="Select Driver Fault"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleFault">Vehicle Fault</Label>
                      {/* <Select value={formData.VehicleFault} onValueChange={(value) => handleInputChange('VehicleFault', value)}>
                        <SelectTrigger id="VehicleFault">
                          <SelectValue placeholder="Select Vehicle Fault" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentVehicle}
                        value={formData.VehicleFault}
                        onChange={(value) => setFormData({ ...formData, VehicleFault: value as string })}
                        placeholder="Select Vehicle Fault"
                      />
                    </div>

                    <div className="col-span-5 space-y-2">
                      <Label htmlFor="detailedDescription">Detailed Description</Label>
                      <Textarea id="detailedDescription" value={formData.DetailedDescription} onChange={(e) => handleInputChange('DetailedDescription', e.target.value)} placeholder="Enter Description" 
                        className={`min-h-[80px] resize-none ${formData.DetailedDescription && formData.DetailedDescription.length > MAX_LENGTH_DetailedDescription ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`} />
                      <p className="text-xs  text-red-500">
                        {formData.DetailedDescription &&
                          formData.DetailedDescription.length > MAX_LENGTH_DetailedDescription &&
                          `Maximum character limit is ${MAX_LENGTH_DetailedDescription}. [${formData.DetailedDescription.length} / ${MAX_LENGTH_DetailedDescription}]`}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Maintenance Details Section */}
              <AccordionItem value="maintenance-details" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-purple-500" />
                    <span>Maintenance Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch id="maintenanceRequired" checked={formData.MaintenanceRequired} onCheckedChange={(checked) => handleInputChange('MaintenanceRequired', checked)} />
                      <Label htmlFor="maintenanceRequired" className="cursor-pointer">Maintenance Required</Label>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accidentType">Accident Type <span className="text-destructive">*</span></Label>
                        {/* <Select value={formData.accidentType} onValueChange={(value) => handleInputChange('accidentType', value)}>
                          <SelectTrigger id="accidentType">
                            <SelectValue placeholder="Select Accident Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collision">Collision</SelectItem>
                            <SelectItem value="rollover">Rollover</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select> */}
                        <DynamicLazySelect
                          fetchOptions={fetchIncidentAccident}
                          value={formData.AccidentType}
                          onChange={(value) => setFormData({ ...formData, AccidentType: value as string })}
                          placeholder="Select Accident Type"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="causeCode">Cause Code <span className="text-destructive">*</span></Label>
                        {/* <Select value={formData.CauseCode} onValueChange={(value) => handleInputChange('CauseCode', value)}>
                          <SelectTrigger id="CauseCode">
                            <SelectValue placeholder="Select Cause Code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mechanical">Mechanical Failure</SelectItem>
                            <SelectItem value="driver-error">Driver Error</SelectItem>
                            <SelectItem value="weather">Weather Related</SelectItem>
                          </SelectContent>
                        </Select> */}
                        <DynamicLazySelect
                          fetchOptions={fetchIncidentCause}
                          value={formData.CauseCode}
                          onChange={(value) => setFormData({ ...formData, CauseCode: value as string })}
                          placeholder="Select Cause Code"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="incidentResolution">Incident Resolution <span className="text-destructive">*</span></Label>
                        <Input id="incidentResolution" value={formData.IncidentResolution} onChange={(e) => handleInputChange('IncidentResolution', e.target.value)} placeholder="Enter Incident Resolution"
                          className={`h-10 ${formData.IncidentResolution && formData.IncidentResolution.length > MAX_LENGTH_IncidentResolution ? "border-red-600 focus-visible:ring-red-600" : ""}`} />
                        <p className="text-xs  text-red-500">
                          {formData.IncidentResolution &&
                            formData.IncidentResolution.length > MAX_LENGTH_IncidentResolution &&
                            `Maximum character limit is ${MAX_LENGTH_IncidentResolution}. [${formData.IncidentResolution.length} / ${MAX_LENGTH_IncidentResolution}]`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maintenanceType">Maintenance Type</Label>
                        {/* <Select value={formData.MaintenanceType} onValueChange={(value) => handleInputChange('MaintenanceType', value)}>
                          <SelectTrigger id="maintenanceType">
                            <SelectValue placeholder="Select Maint. Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select> */}
                        <DynamicLazySelect
                          fetchOptions={fetchMaintenanceType}
                          value={formData.MaintenanceType}
                          onChange={(value) => setFormData({ ...formData, MaintenanceType: value as string })}
                          placeholder="Select Maintenance Type"
                        />


                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wagon">Wagon <span className="text-destructive">*</span></Label>
                        {/* <Input id="Wagon" value={formData.Wagon} onChange={(e) => handleInputChange('Wagon', e.target.value)} placeholder="Enter Wagon" /> */}
                        <DynamicLazySelect
                          fetchOptions={fetchIncidentWagon}
                          value={formData.Wagon}
                          onChange={(value) => setFormData({ ...formData, Wagon: value as string })}
                          placeholder="Select Wagon"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="container">Container <span className="text-destructive">*</span></Label>
                        {/* <Input id="Container" value={formData.Container} onChange={(e) => handleInputChange('Container', e.target.value)} placeholder="Enter Container" /> */}
                        <DynamicLazySelect
                          fetchOptions={fetchIncidentContainer}
                          value={formData.Container}
                          onChange={(value) => setFormData({ ...formData, Container: value as string })}
                          placeholder="Select Container"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workType">Work Type <span className="text-destructive">*</span></Label>
                        {/* <Select value={formData.WorkType} onValueChange={(value) => handleInputChange('WorkType', value)}>
                          <SelectTrigger id="workType">
                            <SelectValue placeholder="Select Work Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                            <SelectItem value="replacement">Replacement</SelectItem>
                          </SelectContent>
                        </Select> */}
                         <DynamicLazySelect
                          fetchOptions={fetchWorkType}
                          value={formData.WorkType}
                          onChange={(value) => setFormData({ ...formData, WorkType: value as string })}
                          placeholder="Select Work Type"
                        />

                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workCategory">Work Category <span className="text-destructive">*</span></Label>
                        {/* <Select value={formData.WorkCategory} onValueChange={(value) => handleInputChange('WorkCategory', value)}>
                          <SelectTrigger id="workCategory">
                            <SelectValue placeholder="Select Work Categ." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mechanical">Mechanical</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="structural">Structural</SelectItem>
                          </SelectContent>
                        </Select> */}
                        <DynamicLazySelect
                          fetchOptions={fetchWorkCategory}
                          value={formData.WorkCategory}
                          onChange={(value) => setFormData({ ...formData, WorkCategory: value as string })}
                          placeholder="Select Work Category"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workGroup">Work Group <span className="text-destructive">*</span></Label>
                        {/* <Select value={formData.WorkGroup} onValueChange={(value) => handleInputChange('WorkGroup', value)}>
                          <SelectTrigger id="workGroup">
                            <SelectValue placeholder="Select Work Group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                          </SelectContent>
                        </Select> */}
                        <DynamicLazySelect
                          fetchOptions={fetchWorkGroup}
                          value={formData.WorkGroup}
                          onChange={(value) => setFormData({ ...formData, WorkGroup: value as string })}
                          placeholder="Select Work Group"
                        />
                      </div>

                      <div className="col-span-5 space-y-2">
                        <Label htmlFor="maintenanceDescription">Maintenance Description <span className="text-destructive">*</span></Label>
                        <Textarea id="maintenanceDescription" value={formData.MaintenanceDescription} onChange={(e) => handleInputChange('MaintenanceDescription', e.target.value)} placeholder="Enter Maintenance Desc." 
                        className={`min-h-[80px] resize-none ${formData.MaintenanceDescription && formData.MaintenanceDescription.length > MAX_LENGTH_MaintenanceDescription ? "border-red-600 focus-visible:ring-red-600" : ""
                          }`} />
                      <p className="text-xs  text-red-500">
                        {formData.MaintenanceDescription &&
                          formData.MaintenanceDescription.length > MAX_LENGTH_MaintenanceDescription &&
                          `Maximum character limit is ${MAX_LENGTH_MaintenanceDescription}. [${formData.MaintenanceDescription.length} / ${MAX_LENGTH_MaintenanceDescription}]`}
                      </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* More Details Section */}
              <AccordionItem value="more-details" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-pink-500" />
                    <span>More Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incidentCausedBy">Incident Caused By</Label>
                      {/* <Select value={formData.IncidentCausedBy} onValueChange={(value) => handleInputChange('IncidentCausedBy', value)}>
                        <SelectTrigger id="incidentCausedBy">
                          <SelectValue placeholder="Select Inc. Caused" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="external">External Factors</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                          fetchOptions={fetchIncidentCausedBy}
                          value={formData.IncidentCausedBy}
                          onChange={(value) => setFormData({ ...formData, IncidentCausedBy: value as string })}
                          placeholder="Select Incident Caused By"
                        />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentCauserName">Incident Causer Name</Label>
                      {/* <Select value={formData.IncidentCauserName} onValueChange={(value) => handleInputChange('IncidentCauserName', value)}>
                        <SelectTrigger id="incidentCauserName">
                          <SelectValue placeholder="Select Inc. Causer Name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john-doe">John Doe</SelectItem>
                          <SelectItem value="jane-smith">Jane Smith</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                          fetchOptions={fetchIncidentCauserName}
                          value={formData.IncidentCauserName}
                          onChange={(value) => setFormData({ ...formData, IncidentCauserName: value as string })}
                          placeholder="Select Incident Causer Name"
                        />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentReportedBy">Incident Reported By</Label>
                      <Input 
                      id="incidentReportedBy" 
                      value={formData.IncidentReportedBy} 
                      onChange={(e) => handleInputChange('IncidentReportedBy', e.target.value)} 
                      placeholder="Enter Inc. Reported By"
                      className={`h-10 ${formData.IncidentReportedBy && formData.IncidentReportedBy.length > MAX_LENGTH_IncidentReportedBy ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                       />
                      <p className="text-xs  text-red-500">
                        {formData.IncidentReportedBy &&
                          formData.IncidentReportedBy.length > MAX_LENGTH_IncidentReportedBy &&
                          `Maximum character limit is ${MAX_LENGTH_IncidentReportedBy}. [${formData.IncidentReportedBy.length} / ${MAX_LENGTH_IncidentReportedBy}]`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentCloseDate">Incident Close Date</Label>
                      <div className="relative">
                        <Input id="incidentCloseDate" type="date" value={formData.IncidentCloseDate} onChange={(e) => handleInputChange('IncidentCloseDate', e.target.value)} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="riskInvolved">Risk Involved</Label>
                      {/* <Select value={formData.RiskInvolved} onValueChange={(value) => handleInputChange('RiskInvolved', value)}>
                        <SelectTrigger id="RiskInvolved">
                          <SelectValue placeholder="Select Risk Involved" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentRisks}
                        value={formData.RiskInvolved}
                        onChange={(value) => setFormData({ ...formData, RiskInvolved: value as string })}
                        placeholder="Select Risks Involved"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dangerousGoods">Dangerous Goods</Label>
                      {/* <Select value={formData.DangerousGoods} onValueChange={(value) => handleInputChange('DangerousGoods', value)}>
                        <SelectTrigger id="DangerousGoods">
                          <SelectValue placeholder="Select Danger Goods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchIncidentGoods}
                        value={formData.DangerousGoods}
                        onChange={(value) => setFormData({ ...formData, DangerousGoods: value as string })}
                        placeholder="Select Danger Goods"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loadTime">Load Time</Label>
                      {/* <Select value={formData.LoadTime} onValueChange={(value) => handleInputChange('LoadTime', value)}>
                        <SelectTrigger id="loadTime">
                          <SelectValue placeholder="Select Load Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select> */}
                      <DynamicLazySelect
                        fetchOptions={fetchLoadTime}
                        value={formData.LoadTime}
                        onChange={(value) => setFormData({ ...formData, LoadTime: value as string })}
                        placeholder="Select Load Time"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refDocNo">Ref. Doc. No.</Label>
                      <Input id="refDocNo" value={formData.RefDocNo} onChange={(e) => handleInputChange('RefDocNo', e.target.value)} placeholder="Enter Ref. Doc. No."
                      className={`h-10 ${formData.RefDocNo && formData.RefDocNo.length > MAX_LENGTH_RefDocNo ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                      />
                      <p className="text-xs  text-red-500">
                        {formData.RefDocNo &&
                          formData.RefDocNo.length > MAX_LENGTH_RefDocNo &&
                          `Maximum character limit is ${MAX_LENGTH_RefDocNo}. [${formData.RefDocNo.length} / ${MAX_LENGTH_RefDocNo}]`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileRefIncidentId">Mobile Ref. Incident ID</Label>
                      <Input id="mobileRefIncidentId" value={formData.MobileRefIncidentId} onChange={(e) => handleInputChange('MobileRefIncidentId', e.target.value)} placeholder="Enter Mobile Ref. Inc. ID"
                      className={`h-10 ${formData.MobileRefIncidentId && formData.MobileRefIncidentId.length > MAX_LENGTH_MobileRefIncidentId ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                      />
                      <p className="text-xs  text-red-500">
                        {formData.MobileRefIncidentId &&
                          formData.MobileRefIncidentId.length > MAX_LENGTH_MobileRefIncidentId &&
                          `Maximum character limit is ${MAX_LENGTH_MobileRefIncidentId}. [${formData.MobileRefIncidentId.length} / ${MAX_LENGTH_MobileRefIncidentId}]`}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Input id="remarks" value={formData.Remarks} onChange={(e) => handleInputChange('Remarks', e.target.value)} placeholder="Enter Remarks"
                      className={`h-10 ${formData.Remarks && formData.Remarks.length > MAX_LENGTH_Remarks ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                      />
                      <p className="text-xs  text-red-500">
                        {formData.Remarks && formData.Remarks.length > MAX_LENGTH_Remarks && `Maximum character limit is ${MAX_LENGTH_Remarks}. [${formData.Remarks.length} / ${MAX_LENGTH_Remarks}]`}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Work Order Details Section */}
              <AccordionItem value="work-order-details" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Work Order Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Work Order Number</Label>
                      <div className="text-sm text-primary font-medium">{formData.WorkOrderNumber || '-'}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Order Status</Label>
                      <div className="text-sm">{formData.WorkOrderStatus || '-'}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Request Number</Label>
                      <div className="text-sm">{formData.WorkRequestNumber || '-'}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Request Status</Label>
                      <div className="text-sm">{formData.WorkRequestStatus || '-'}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Error Message</Label>
                      <div className="text-sm">{formData.ErrorMessage || '-'}</div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Claim Details Section */}
              <AccordionItem value="claim-details" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-teal-500" />
                    <span>Claim Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Switch id="claimRequired" checked={formData.ClaimRequired} onCheckedChange={(checked) => handleInputChange('ClaimRequired', checked)} />
                      <Label htmlFor="claimRequired" className="cursor-pointer">Claim Required</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Claim No.</Label>
                        <div className="text-sm text-primary font-medium">{formData.ClaimNumber || '-'}</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Claim Status</Label>
                        <div className="text-sm">{formData.ClaimStatus || '-'}</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSave}>
          Save Incident
        </Button>
      </div>
    </div>
  );
};
