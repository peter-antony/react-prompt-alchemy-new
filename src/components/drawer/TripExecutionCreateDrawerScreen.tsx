import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Plus, NotebookPen, CalendarIcon, User, FileText, MapPin, Truck, Package, Calendar, Info, Trash2, RefreshCw, Send, AlertCircle, Download, Filter, CheckSquare, MoreVertical, Container, Box, Boxes, Search, Clock, PackageCheck, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { quickOrderService } from '@/api/services/quickOrderService';
import { ConsignmentTrip } from './ConsignmentTrip';
import { tripService } from "@/api/services/tripService";
import { useToast } from '@/hooks/use-toast';
import { TripData, LegDetail } from '@/types/manageTripTypes';
import CommonPopup from '@/components/Common/CommonPopup';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateTimePicker } from "@/components/Common/DateTimePicker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface TripExecutionCreateDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
  onFieldChange?: (name: string, value: string) => void;
  // tripExecutionRef?: React.RefObject<DynamicPanelRef>;
  // tripAdditionalRef?: React.RefObject<DynamicPanelRef>;
}

interface AdditionalActivity {
  id: string;
  name: string;
  icon: React.ReactNode;
  timestamp: string;
  fields: {
    sequence: string;
    category: string;
    fromLocation: string;
    toLocation: string;
    activity: string;
    revisedDateTime: string;
    actualDateTime: string;
    reasonForChanges: string;
  };
}

export const TripExecutionCreateDrawerScreen: React.FC<TripExecutionCreateDrawerScreenProps> = ({
  onClose,
  onFieldChange,
  tripId = 'TRIP00000001',
  // tripExecutionRef,
  // tripAdditionalRef
}) => {
  // const { tripData, fetchTrip, updateHeaderField } = manageTripStore();
  const [expandedActivities, setExpandedActivities] = useState(true);
  const [expandedAdditional, setExpandedAdditional] = useState(false);
  const [expandedPlanned, setExpandedPlanned] = useState(true);
  const [expandedActuals, setExpandedActuals] = useState(true);
  const [pickupComplete, setPickupComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddViaPointsDialog, setShowAddViaPointsDialog] = useState(false);
  
  const tripExecutionRef = useRef<DynamicPanelRef>(null);
  const tripAdditionalRef = useRef<DynamicPanelRef>(null);
  const [resetKey, setResetKey] = useState(0);
  const [dates, setDates] = useState<Record<string, Date | undefined>>({});
  
  // Refs for multiple forms - using Map to store refs by form ID
  const formRefs = useRef<Map<string, React.RefObject<DynamicPanelRef>>>(new Map());
  
  // Function to get or create a ref for a specific form
  const getFormRef = (formId: string): React.RefObject<DynamicPanelRef> => {
    if (!formRefs.current.has(formId)) {
      formRefs.current.set(formId, React.createRef<DynamicPanelRef>());
    }
    return formRefs.current.get(formId)!;
  };
  // Add Via Points dialog state
  const [viaPointForm, setViaPointForm] = useState({
    legFromTo: '',
    viaLocation: '',
    plannedDate: '',
    plannedTime: '',
  });

  // State for normal popup modal
  const [showNormalPopup, setShowNormalPopup] = useState(false);
  const [showNormalPopupTitle, setShowNormalPopupTitle] = useState('Add Events');
  const [popupData, setPopupData] = useState({
    eventType: '',
    eventStatus: '',
    eventDescription: '',
    eventDate: '',
    eventTime: ''
  });

  // State for managing multiple Events forms
  const [eventsForms, setEventsForms] = useState<any[]>([]);
  const [additionalEventsForms, setAdditionalEventsForms] = useState<any[]>([]);
  const [currentEventFormIndex, setCurrentEventFormIndex] = useState<number>(-1);
  const [showEventsForm, setShowEventsForm] = useState(false);

  const { toast } = useToast();
  
  // Direct API data state - no store dependencies
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [legs, setLegs] = useState<LegDetail[]>([]);
  const [selectedLegId, setSelectedLegId] = useState<string | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);
  const [loading, setLoading] = useState(true); // Start as true so forms can render
  
  // Refs for Activities forms - one ref per activity
  const activitiesRefs = useRef<Map<string, React.RefObject<DynamicPanelRef>>>(new Map());
  // Refs for AdditionalActivities forms - one ref per additional activity
  const additionalActivitiesRefs = useRef<Map<string, React.RefObject<DynamicPanelRef>>>(new Map());
  
  // Helper to get or create ref for an activity
  const getActivityRef = (activityId: string): React.RefObject<DynamicPanelRef> => {
    if (!activitiesRefs.current.has(activityId)) {
      activitiesRefs.current.set(activityId, React.createRef<DynamicPanelRef>());
    }
    return activitiesRefs.current.get(activityId)!;
  };
  
  // Helper to get or create ref for an additional activity
  const getAdditionalActivityRef = (activityId: string): React.RefObject<DynamicPanelRef> => {
    if (!additionalActivitiesRefs.current.has(activityId)) {
      additionalActivitiesRefs.current.set(activityId, React.createRef<DynamicPanelRef>());
    }
    return additionalActivitiesRefs.current.get(activityId)!;
  };

  // Date formatting utility function
  const formatDateToDDMMYYYY = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      // Handle different date formats
      let date: Date;
      
      // If it's already in YYYY-MM-DD format
      if (dateString.includes('-') && dateString.length === 10) {
        date = new Date(dateString);
      }
      // If it's in DD/MM/YYYY format
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateString);
        }
      }
      // Try parsing as is
      else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return dateString; // Return original if invalid
      }
      
      // Format to DD-MM-YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString || '';
    }
  };

  // Time formatting utility function
  const formatTimeTo12Hour = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    
    try {
      // Handle different time formats
      let time: Date;
      
      // If it's in HH:MM:SS format
      if (timeString.includes(':') && timeString.split(':').length === 3) {
        const [hours, minutes, seconds] = timeString.split(':');
        time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
      }
      // If it's in HH:MM format
      else if (timeString.includes(':') && timeString.split(':').length === 2) {
        const [hours, minutes] = timeString.split(':');
        time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      // Try parsing as is
      else {
        time = new Date(`1970-01-01T${timeString}`);
      }
      
      // Check if time is valid
      if (isNaN(time.getTime())) {
        console.warn('Invalid time:', timeString);
        return timeString; // Return original if invalid
      }
      
      // Format to 12-hour format without seconds
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
      return timeString || '';
    }
  };

  // Helper function to transform QuickCode objects to separate fields
  const transformQuickCodeFields = (formData: any, currentActivity: any) => {
    const transformQuickCode = (quickCodeField: string, quickCodeValueField: string) => {
      const quickCodeData = formData[quickCodeField];
      const quickCodeValueData = formData[quickCodeValueField];
      
      // If QuickCode is an object with dropdown/input properties
      if (typeof quickCodeData === 'object' && quickCodeData?.dropdown !== undefined) {
        return {
          [quickCodeField]: quickCodeData.dropdown,
          [quickCodeValueField]: quickCodeData.input || ''
        };
      }
      // If QuickCodeValue is an object with dropdown/input properties
      else if (typeof quickCodeValueData === 'object' && quickCodeValueData?.dropdown !== undefined) {
        return {
          [quickCodeField]: quickCodeValueData.dropdown,
          [quickCodeValueField]: quickCodeValueData.input || ''
        };
      }
      // Use existing values or fallback to current activity
      else {
        return {
          [quickCodeField]: formData[quickCodeField] || currentActivity[quickCodeField],
          [quickCodeValueField]: formData[quickCodeValueField] || currentActivity[quickCodeValueField]
        };
      }
    };

    return {
      ...transformQuickCode('QuickCode1', 'QuickCodeValue1'),
      ...transformQuickCode('QuickCode2', 'QuickCodeValue2'),
      ...transformQuickCode('QuickCode3', 'QuickCodeValue3')
    };
  };

  // Helper function to extract QuickCode ID (handles both "id" and "id||name" formats)
  // This is used for formatting QuickCode fields for inputdropdown components
  // Must be defined before useEffect hooks that use it
  const extractQuickCodeId = (value: string | null | undefined): string => {
    if (!value || typeof value !== 'string') return '';
    // If value contains "||", extract the ID part (before the pipe)
    if (value.includes('||')) {
      const [id] = value.split('||');
      return id.trim();
    }
    // Otherwise, return the value as is
    return value.trim();
  };
  
  // Fetch trip data directly from API
  const fetchTripData = useCallback(async () => {
    if (!tripId) {
      console.warn('No tripId provided to TripExecutionCreateDrawerScreen');
      return;
    }
    
    setIsLoadingTrip(true);
    // Don't set loading to false - keep forms renderable
    try {
      console.log('Fetching trip data for tripId:', tripId);
      // Use getTripById API - note: it expects { id: tripId }
      const response: any = await tripService.getTripById({ id: tripId });
      
      console.log('API Response:', response);
      console.log('Response structure:', {
        hasData: !!response?.data,
        hasResponseData: !!response?.data?.ResponseData,
        responseKeys: response?.data ? Object.keys(response.data) : [],
        fullResponse: response
      });
      
      let parsedResponse: any = null;
      
      // Try different response structures
      if (response?.data?.ResponseData) {
        try {
          parsedResponse = JSON.parse(response.data.ResponseData);
        } catch (e) {
          console.warn('Failed to parse ResponseData as JSON, trying as object:', e);
          parsedResponse = response.data.ResponseData;
        }
      } else if (response?.ResponseData) {
        try {
          parsedResponse = JSON.parse(response.ResponseData);
        } catch (e) {
          parsedResponse = response.ResponseData;
        }
      } else if (response?.data) {
        parsedResponse = response.data;
      } else if (Array.isArray(response)) {
        parsedResponse = response;
      } else {
        parsedResponse = response;
      }
      
      console.log('Parsed Response:', parsedResponse);
      
      // Handle array response - get the first object
      const trip = Array.isArray(parsedResponse) ? parsedResponse[0] : parsedResponse;
      console.log('Trip data:', trip);
      console.log('Trip LegDetails:', trip?.LegDetails);
      
      if (!trip) {
        console.warn('No trip data found in response');
        setLoading(false);
        toast({
          title: "Warning",
          description: "No trip data found in response",
          variant: "default",
        });
        return;
      }
      
      // Ensure LegDetails is an array
      const formattedTripData: TripData = {
        Header: trip?.Header || {},
        LegDetails: Array.isArray(trip?.LegDetails) ? trip.LegDetails : (trip?.LegDetails ? [trip.LegDetails] : []),
        CustomerOrders: trip?.CustomerOrders || [],
        ResourceDetails: trip?.ResourceDetails || [],
      };
      
      console.log('Formatted Trip Data:', formattedTripData);
      console.log('LegDetails count:', formattedTripData.LegDetails?.length);
      console.log('First leg:', formattedTripData.LegDetails?.[0]);
      console.log('First leg Activities:', formattedTripData.LegDetails?.[0]?.Activities);
      console.log('First leg AdditionalActivities:', formattedTripData.LegDetails?.[0]?.AdditionalActivities);
      
      setTripData(formattedTripData);
      setLegs(formattedTripData.LegDetails || []);
      
      // Auto-select first leg if available
      if (formattedTripData.LegDetails && formattedTripData.LegDetails.length > 0) {
        const firstLegSequence = formattedTripData.LegDetails[0].LegSequence;
        console.log('Auto-selecting first leg:', firstLegSequence);
        setSelectedLegId(firstLegSequence || null);
      } else {
        console.warn('No LegDetails found in trip data');
        setLoading(false); // Only set to false if no data
      }
      
      // Keep loading as true so forms can render
    } catch (error) {
      console.error('Error fetching trip data:', error);
      toast({
        title: "Error",
        description: `Failed to load trip data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTrip(false);
    }
  }, [tripId, toast]);
  
  // Fetch trip data directly from API on component mount
  useEffect(() => {
    if (tripId) {
      fetchTripData();
    }
  }, [tripId, fetchTripData]);

  // Listen for trip data refresh events from child components (e.g., ConsignmentTrip)
  useEffect(() => {
    const handleTripDataRefreshed = async (event: CustomEvent) => {
      console.log('Trip data refreshed event received:', event.detail);
      // Refresh trip data when child component dispatches refresh event
      if (tripId) {
        await fetchTripData();
      }
    };

    window.addEventListener('tripDataRefreshed', handleTripDataRefreshed as EventListener);

    return () => {
      window.removeEventListener('tripDataRefreshed', handleTripDataRefreshed as EventListener);
    };
  }, [tripId, fetchTripData]);
  
  // Get selected leg from legs array
  const selectedLeg = legs.find(leg => leg.LegSequence === selectedLegId) || null;

  // Bind activity data to forms when selected leg changes
  useEffect(() => {
    if (!selectedLeg || !loading) {
      console.log('Skipping form binding - selectedLeg:', selectedLeg, 'loading:', loading);
      return;
    }
    
    console.log('Binding data for selected leg:', selectedLeg);
    console.log('Activities:', selectedLeg.Activities);
    console.log('AdditionalActivities:', selectedLeg.AdditionalActivities);
    
    // Small delay to ensure refs are ready after render
    const timer = setTimeout(() => {
      // Bind Activities data to their respective forms
      if (selectedLeg.Activities && Array.isArray(selectedLeg.Activities)) {
        selectedLeg.Activities.forEach((activity: any, index) => {
          const activityId = `activity-${selectedLeg.LegSequence}-${activity.SeqNo || index}`;
          const activityRef = getActivityRef(activityId);
          const formattedActivity = formatActivitiesForForm([activity])[0];
          
          // Format data for DynamicPanel
          const formData = {
            ...formattedActivity,
            // Format QuickCode fields for inputdropdown
            QuickCode1: formattedActivity.QuickCode1 ? {
              dropdown: typeof formattedActivity.QuickCode1 === 'string' 
                ? formattedActivity.QuickCode1 
                : (formattedActivity.QuickCode1?.dropdown || extractQuickCodeId(formattedActivity.QuickCode1)),
              input: formattedActivity.QuickCodeValue1 || ''
            } : { dropdown: '', input: '' },
            QuickCode2: formattedActivity.QuickCode2 ? {
              dropdown: typeof formattedActivity.QuickCode2 === 'string' 
                ? formattedActivity.QuickCode2 
                : (formattedActivity.QuickCode2?.dropdown || extractQuickCodeId(formattedActivity.QuickCode2)),
              input: formattedActivity.QuickCodeValue2 || ''
            } : { dropdown: '', input: '' },
            QuickCode3: formattedActivity.QuickCode3 ? {
              dropdown: typeof formattedActivity.QuickCode3 === 'string' 
                ? formattedActivity.QuickCode3 
                : (formattedActivity.QuickCode3?.dropdown || extractQuickCodeId(formattedActivity.QuickCode3)),
              input: formattedActivity.QuickCodeValue3 || ''
            } : { dropdown: '', input: '' },
            LastIdentifiedLocation: formattedActivity.LastIdentifiedLocation 
              ? `${formattedActivity.LastIdentifiedLocation}||${formattedActivity.LastIdentifiedLocationDescription || ''}`
              : '',
          };
          
          if (activityRef?.current?.setFormValues) {
            console.log(`Binding activity ${activityId} to form`);
            activityRef.current.setFormValues(formData);
          } else {
            console.warn(`Activity ref ${activityId} not ready`);
          }
        });
      }
      
      // Bind AdditionalActivities data to their respective forms
      if (selectedLeg.AdditionalActivities && Array.isArray(selectedLeg.AdditionalActivities)) {
        selectedLeg.AdditionalActivities.forEach((additionalActivity: any, index) => {
          const activityId = `additional-activity-${selectedLeg.LegSequence}-${additionalActivity.Sequence || index}`;
          const additionalActivityRef = getAdditionalActivityRef(activityId);
          const formattedAdditionalActivity = formatAdditionalActivitiesForForm([additionalActivity])[0];
          
          if (additionalActivityRef?.current?.setFormValues) {
            console.log(`Binding additional activity ${activityId} to form`);
            additionalActivityRef.current.setFormValues(formattedAdditionalActivity);
          } else {
            console.warn(`Additional activity ref ${activityId} not ready`);
          }
        });
      }
      
      setResetKey(prev => prev + 1);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [selectedLeg, loading]);


    
  // Save all activities and additional activities
  const onSaveActivities = async () => {
    if (!selectedLeg || !tripData) {
      toast({
        title: "Error",
        description: "No leg or trip data available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Find the leg index in tripData
      const legIndex = tripData.LegDetails?.findIndex(
        (leg: any) => leg.LegSequence === selectedLeg.LegSequence
      );
      
      if (legIndex === -1 || legIndex === undefined) {
        toast({
          title: "Error",
          description: "Leg not found in trip data",
          variant: "destructive",
        });
        return;
      }
      
      const updatedLegDetails = [...(tripData.LegDetails || [])];
      const currentLeg = updatedLegDetails[legIndex];
      
      // Collect all updated Activities from their respective forms
      const updatedActivities = (selectedLeg.Activities || []).map((activity: any, index) => {
        const activityId = `activity-${selectedLeg.LegSequence}-${activity.SeqNo || index}`;
        const activityRef = getActivityRef(activityId);
        
        if (activityRef?.current?.getFormValues) {
          try {
            const formData = activityRef.current.getFormValues();
            
            // Parse LastIdentifiedLocation
            let LastIdentifiedLocationValue = '';
            let LastIdentifiedLocationLabel = '';
            if (typeof formData.LastIdentifiedLocation === 'string' && formData.LastIdentifiedLocation.includes('||')) {
              const [value, ...labelParts] = formData.LastIdentifiedLocation.split('||');
              LastIdentifiedLocationValue = value.trim();
              LastIdentifiedLocationLabel = labelParts.join('||').trim();
            } else if (typeof formData.LastIdentifiedLocation === 'string') {
              LastIdentifiedLocationValue = formData.LastIdentifiedLocation;
              LastIdentifiedLocationLabel = formData.LastIdentifiedLocation;
            } else if (typeof formData.LastIdentifiedLocation === 'object' && formData.LastIdentifiedLocation !== null) {
              const splitData = splitDropdowns(formData.LastIdentifiedLocation);
              LastIdentifiedLocationValue = splitData.value || '';
              LastIdentifiedLocationLabel = splitData.label || '';
            }
            if (!LastIdentifiedLocationLabel) LastIdentifiedLocationLabel = LastIdentifiedLocationValue;
            
            // Return updated activity (cast to any to allow all fields)
            return {
              ...activity,
              Activity: formData.ActivityName || formData.Activity || activity.Activity,
              ActivityDescription: formData.ActivityDescription || activity.ActivityDescription,
              CustomerID: formData.CustomerID || activity.CustomerID,
              CustomerName: formData.CustomerName || activity.CustomerName,
              ConsignmentInformation: formData.ConsignmentInformation || activity.ConsignmentInformation,
              CustomerOrder: formData.CustomerOrder || activity.CustomerOrder,
              PlannedDate: formData.PlannedDate || activity.PlannedDate,
              PlannedTime: formData.PlannedTime || activity.PlannedTime,
              RevisedDate: formData.RevisedDate || activity.RevisedDate,
              RevisedTime: formData.RevisedTime || activity.RevisedTime,
              ActualDate: formData.ActualDate || activity.ActualDate,
              ActualTime: formData.ActualTime || activity.ActualTime,
              DelayedIn: formData.DelayedIn || activity.DelayedIn,
              ...transformQuickCodeFields(formData, activity),
              Remarks1: formData.Remarks1 || activity.Remarks1,
              Remarks2: formData.Remarks2 || activity.Remarks2,
              Remarks3: formData.Remarks3 || activity.Remarks3,
              EventProfile: formData.EventProfile || activity.EventProfile,
              ReasonForChanges: formData.ReasonForChanges || activity.ReasonForChanges,
              DelayedReason: formData.DelayedReason || activity.DelayedReason,
              LastIdentifiedLocation: LastIdentifiedLocationValue || activity.LastIdentifiedLocation,
              LastIdentifiedLocationDescription: LastIdentifiedLocationLabel || activity.LastIdentifiedLocationDescription,
              LastIdentifiedDate: formData.LastIdentifiedDate || activity.LastIdentifiedDate,
              LastIdentifiedTime: formData.LastIdentifiedTime || activity.LastIdentifiedTime,
              AmendmentNo: formData.AmendmentNo || activity.AmendmentNo,
              ModeFlag: 'Update' as any
            } as any;
          } catch (error) {
            console.warn(`Error getting form data for activity ${activityId}:`, error);
            return { ...activity, ModeFlag: 'NoChange' as any } as any;
          }
        }
        return { ...activity, ModeFlag: 'NoChange' as any } as any;
      });
      
      // Collect data from NEW events forms (forms added via popup)
      const newActivities = eventsForms.map((newForm: any) => {
        const formRef = getFormRef(newForm.id);
        
        if (formRef?.current?.getFormValues) {
          try {
            const formData = formRef.current.getFormValues();
            console.log("New event form data:", formData);
            
            // Parse LastIdentifiedLocation
            let LastIdentifiedLocationValue = '';
            let LastIdentifiedLocationLabel = '';
            if (typeof formData.LastIdentifiedLocation === 'string' && formData.LastIdentifiedLocation.includes('||')) {
              const [value, ...labelParts] = formData.LastIdentifiedLocation.split('||');
              LastIdentifiedLocationValue = value.trim();
              LastIdentifiedLocationLabel = labelParts.join('||').trim();
            } else if (typeof formData.LastIdentifiedLocation === 'string') {
              LastIdentifiedLocationValue = formData.LastIdentifiedLocation;
              LastIdentifiedLocationLabel = formData.LastIdentifiedLocation;
            } else if (typeof formData.LastIdentifiedLocation === 'object' && formData.LastIdentifiedLocation !== null) {
              const splitData = splitDropdowns(formData.LastIdentifiedLocation);
              LastIdentifiedLocationValue = splitData.value || '';
              LastIdentifiedLocationLabel = splitData.label || '';
            }
            if (!LastIdentifiedLocationLabel) LastIdentifiedLocationLabel = LastIdentifiedLocationValue;
            
            // Create new activity object with ModeFlag: 'Insert'
            return {
              Activity: formData.ActivityName || formData.Activity || newForm.Activity || null,
              ActivityDescription: formData.ActivityDescription || newForm.ActivityDescription || newForm.title || '',
              CustomerID: formData.CustomerID || newForm.CustomerID || null,
              CustomerName: formData.CustomerName || newForm.CustomerName || '',
              ConsignmentInformation: formData.ConsignmentInformation || newForm.ConsignmentInformation || '',
              CustomerOrder: formData.CustomerOrder || newForm.CustomerOrder || null,
              PlannedDate: formData.PlannedDate || newForm.PlannedDate || newForm.PlanDate || null,
              PlannedTime: formData.PlannedTime || newForm.PlannedTime || newForm.PlanTime || null,
              RevisedDate: formData.RevisedDate || newForm.RevisedDate || null,
              RevisedTime: formData.RevisedTime || newForm.RevisedTime || null,
              ActualDate: formData.ActualDate || newForm.ActualDate || null,
              ActualTime: formData.ActualTime || newForm.ActualTime || null,
              DelayedIn: formData.DelayedIn || newForm.DelayedIn || null,
              ...transformQuickCodeFields(formData, newForm),
              Remarks1: formData.Remarks1 || newForm.Remarks1 || null,
              Remarks2: formData.Remarks2 || newForm.Remarks2 || null,
              Remarks3: formData.Remarks3 || newForm.Remarks3 || null,
              EventProfile: formData.EventProfile || newForm.EventProfile || null,
              ReasonForChanges: formData.ReasonForChanges || newForm.ReasonForChanges || null,
              DelayedReason: formData.DelayedReason || newForm.DelayedReason || null,
              LastIdentifiedLocation: LastIdentifiedLocationValue || newForm.LastIdentifiedLocation || null,
              LastIdentifiedLocationDescription: LastIdentifiedLocationLabel || newForm.LastIdentifiedLocationDescription || '',
              LastIdentifiedDate: formData.LastIdentifiedDate || newForm.LastIdentifiedDate || null,
              LastIdentifiedTime: formData.LastIdentifiedTime || newForm.LastIdentifiedTime || null,
              AmendmentNo: formData.AmendmentNo || newForm.AmendmentNo || null,
              ModeFlag: 'Insert' as any // Mark as new insert
            } as any;
          } catch (error) {
            console.warn(`Error getting form data for new event ${newForm.id}:`, error);
            // Return basic data even if form data retrieval fails
            return {
              Activity: newForm.Activity || null,
              ActivityDescription: newForm.title || newForm.ActivityDescription || '',
              PlannedDate: newForm.PlanDate || null,
              PlannedTime: newForm.PlanTime || null,
              ModeFlag: 'Insert' as any
            } as any;
          }
        } else {
          console.warn(`Form ref not found for new event ${newForm.id}`);
          // Return basic data if ref is not available
          return {
            Activity: newForm.Activity || null,
            ActivityDescription: newForm.title || newForm.ActivityDescription || '',
            PlannedDate: newForm.PlanDate || null,
            PlannedTime: newForm.PlanTime || null,
            ModeFlag: 'Insert' as any
          } as any;
        }
      });
      
      // Combine existing updated activities with new activities
      const allActivities = [...updatedActivities, ...newActivities];
      
      console.log("All Activities (existing + new):", allActivities);
      console.log("New activities count:", newActivities.length);
      
      // Helper to split dropdown values
      const splitDropdownValue = (value: any) => {
        if (typeof value === 'string' && value.includes('||')) {
          const [val, ...labelParts] = value.split('||');
          return { value: val.trim(), label: labelParts.join('||').trim() };
        } else if (typeof value === 'object' && value !== null) {
          const splitData = splitDropdowns(value);
          return { value: splitData.value || splitData.dropdown || value, label: splitData.label || value };
        }
        return { value: value || '', label: value || '' };
      };
      
      // Collect all updated AdditionalActivities from their respective forms (existing activities)
      const updatedAdditionalActivities = (selectedLeg.AdditionalActivities || []).map((additionalActivity: any, index) => {
        const activityId = `additional-activity-${selectedLeg.LegSequence}-${additionalActivity.Sequence || index}`;
        const additionalActivityRef = getAdditionalActivityRef(activityId);
        
        if (additionalActivityRef?.current?.getFormValues) {
          try {
            const formData = additionalActivityRef.current.getFormValues();
            console.log("formData ------------", formData);
            
            const fromLocationData = splitDropdownValue(formData.FromLocation);
            const toLocationData = splitDropdownValue(formData.ToLocation);
            // const activityData = splitDropdownValue(formData.Activity);
            // const categoryData = splitDropdownValue(formData.Category);
            // const placeItData = splitDropdownValue(formData.PlaceIt);
            // const reportedByData = splitDropdownValue(formData.ReportedBy);
            const customerOrderData = splitDropdownValue(formData.CustomerOrder);
            
            console.log("fromLocationData =================", fromLocationData);
            console.log("activityData =================", additionalActivity);
            console.log("activityData =================", formData);

            return {
              ...additionalActivity,
              Sequence: formData.Sequence || additionalActivity.Sequence,
              Category: formData.Category || additionalActivity.Category,
              Activity: formData.Activity || additionalActivity.Activity,
              ActivityDescription: formData.ActivityDescription || additionalActivity.ActivityDescription,
              PlaceIt: formData.PlaceIt || additionalActivity.PlaceIt,
              ReportedBy: formData.ReportedBy || additionalActivity.ReportedBy,
              CustomerOrder: customerOrderData.value || additionalActivity.CustomerOrder,
              FromLocation: fromLocationData.value || additionalActivity.FromLocation,
              FromLocationDescription: fromLocationData.label || additionalActivity.FromLocationDescription,
              ToLocation: toLocationData.value || additionalActivity.ToLocation,
              ToLocationDescription: toLocationData.label || additionalActivity.ToLocationDescription,
              PlannedDate: formData.PlannedDate || additionalActivity.PlannedDate,
              PlannedTime: formData.PlannedTime || additionalActivity.PlannedTime,
              RevisedDate: formData.RevisedDate || additionalActivity.RevisedDate,
              RevisedTime: formData.RevisedTime || additionalActivity.RevisedTime,
              ActualDate: formData.ActualDate || additionalActivity.ActualDate,
              ActualTime: formData.ActualTime || additionalActivity.ActualTime,
              // Remarks1: formData.Remarks1 || additionalActivity.Remarks1,
              Remarks: formData.Remarks1 || additionalActivity.Remarks1,
              Remarks1: formData.Remarks2 || additionalActivity.Remarks2,
              Remarks2: formData.Remarks3 || additionalActivity.Remarks3,
              ModeFlag: 'Update'
            };
          } catch (error) {
            console.warn(`Error getting form data for additional activity ${activityId}:`, error);
            return { ...additionalActivity, ModeFlag: 'NoChange' };
          }
        }
        return { ...additionalActivity, ModeFlag: 'NoChange' };
      });
      
      // Collect data from NEW additional events forms (forms added via popup)
      const newAdditionalActivities = additionalEventsForms.map((newForm: any) => {
        const formRef = getFormRef(`additional-${newForm.id}`);
        
        if (formRef?.current?.getFormValues) {
          try {
            const formData = formRef.current.getFormValues();
            console.log("New additional event form data:", formData);
            
            const fromLocationData = splitDropdownValue(formData.FromLocation);
            const toLocationData = splitDropdownValue(formData.ToLocation);
            const customerOrderData = splitDropdownValue(formData.CustomerOrder);
            // Create new additional activity object with ModeFlag: 'Insert'
            return {
              Sequence: formData.Sequence || newForm.Sequence || null,
              Category: formData.Category || newForm.Category || null,
              Activity: formData.Activity || newForm.Activity || null,
              ActivityDescription: formData.ActivityDescription || newForm.ActivityDescription || newForm.title || '',
              PlaceIt: formData.PlaceIt || newForm.PlaceIt || null,
              ReportedBy: formData.ReportedBy || newForm.ReportedBy || null,
              CustomerOrder: customerOrderData.value || newForm.CustomerOrder || null,
              FromLocation: fromLocationData.value || newForm.FromLocation || null,
              FromLocationDescription: fromLocationData.label || newForm.FromLocationDescription || '',
              ToLocation: toLocationData.value || newForm.ToLocation || null,
              ToLocationDescription: toLocationData.label || newForm.ToLocationDescription || '',
              PlannedDate: formData.PlannedDate || newForm.PlannedDate || newForm.PlanDate || null,
              PlannedTime: formData.PlannedTime || newForm.PlannedTime || newForm.PlanTime || null,
              RevisedDate: formData.RevisedDate || newForm.RevisedDate || null,
              RevisedTime: formData.RevisedTime || newForm.RevisedTime || null,
              ActualDate: formData.ActualDate || newForm.ActualDate || null,
              ActualTime: formData.ActualTime || newForm.ActualTime || null,
              Remarks: formData.Remarks1 || newForm.Remarks || null,
              Remarks1: formData.Remarks2 || newForm.Remarks1 || null,
              Remarks2: formData.Remarks3 || newForm.Remarks2 || null,
              ModeFlag: 'Insert' // Mark as new insert
            };
          } catch (error) {
            console.warn(`Error getting form data for new additional event ${newForm.id}:`, error);
            // Return basic data even if form data retrieval fails
            return {
              Activity: newForm.Activity || null,
              ActivityDescription: newForm.title || newForm.ActivityDescription || '',
              PlannedDate: newForm.PlanDate || null,
              PlannedTime: newForm.PlanTime || null,
              ModeFlag: 'Insert'
            };
          }
        } else {
          console.warn(`Form ref not found for new additional event ${newForm.id}`);
          // Return basic data if ref is not available
          return {
            Activity: newForm.Activity || null,
            ActivityDescription: newForm.title || newForm.ActivityDescription || '',
            PlannedDate: newForm.PlanDate || null,
            PlannedTime: newForm.PlanTime || null,
            ModeFlag: 'Insert'
          };
        }
      });
      
      // Combine existing updated activities with new activities
      const allAdditionalActivities = [...updatedAdditionalActivities, ...newAdditionalActivities];
      
      console.log("All AdditionalActivities (existing + new):", allAdditionalActivities);
      console.log("New activities count:", newAdditionalActivities.length);
      
      // Update the leg with new activities (including new events and new additional events)
      updatedLegDetails[legIndex] = {
        ...currentLeg,
        Activities: allActivities as any,
        AdditionalActivities: allAdditionalActivities
      };
      
      // Update trip data
      const updatedTripData: TripData = {
        ...tripData,
        LegDetails: updatedLegDetails
      };
      
      console.log("updatedTripData =================", updatedTripData);
      // Save to API
      const response = await tripService.saveTrip(updatedTripData);
      const resourceStatus = (response as any)?.data?.IsSuccess;
      
      if (resourceStatus) {
        toast({
          title: "✅ Trip Saved Successfully",
          description: (response as any)?.data?.ResponseData?.Message || "Your changes have been saved.",
          variant: "default",
        });
        
        // Clear the new events forms and additional events forms after successful save
        setEventsForms([]);
        setAdditionalEventsForms([]);
        
        // Refresh trip data after successful save
        await fetchTripData();
      } else {
        toast({
          title: "⚠️ Submission failed",
          description: (response as any)?.data?.Message || "Failed to save changes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving activities:", error);
      toast({
        title: "⚠️ Error",
        description: "Failed to save activities",
        variant: "destructive",
      });
    }
  };

  // Helper function to format activities data for form binding
  const formatActivitiesForForm = (activities: any[]) => {
    if (!activities || activities.length === 0) return [];
    
    return activities.map((activity, index) => ({
      // Map API response fields to form fields
      SeqNo: activity.SeqNo || (index + 1),
      Activity: activity.Activity || '',
      ActivityDescription: (activity as any).ActivityDescription || '',
      CustomerID: activity.CustomerID || '',
      CustomerName: activity.CustomerName || '',
      ConsignmentInformation: activity.ConsignmentInformation || '',
      CustomerOrder: activity.CustomerOrder || '',
      PlannedDate: activity.PlannedDate || '',
      PlannedTime: activity.PlannedTime || '',
      RevisedDate: activity.RevisedDate || '',
      RevisedTime: activity.RevisedTime || '',
      ActualDate: activity.ActualDate || '',
      ActualTime: activity.ActualTime || '',
      DelayedIn: activity.DelayedIn || '',
      QuickCode1: activity.QuickCode1 || '',
      QuickCode2: activity.QuickCode2 || '',
      QuickCode3: activity.QuickCode3 || '',
      QuickCodeValue1: activity.QuickCodeValue1 || '',
      QuickCodeValue2: activity.QuickCodeValue2 || '',
      QuickCodeValue3: activity.QuickCodeValue3 || '',
      Remarks1: activity.Remarks1 || '',
      Remarks2: activity.Remarks2 || '',
      Remarks3: activity.Remarks3 || '',
      EventProfile: activity.EventProfile || '',
      ReasonForChanges: activity.ReasonForChanges || '',
      DelayedReason: activity.DelayedReason || '',
      LastIdentifiedLocation: activity.LastIdentifiedLocation || '' + '||' + activity.LastIdentifiedLocationDescription || '',
      // LastIdentifiedLocationDescription: activity.LastIdentifiedLocationDescription || '',
      LastIdentifiedDate: activity.LastIdentifiedDate || '',
      LastIdentifiedTime: activity.LastIdentifiedTime || '',
      AmendmentNo: activity.AmendmentNo || '',
      ModeFlag: activity.ModeFlag || 'NoChange',
      
      // Keep original activity data for reference
      ...activity
    }));
  };

  // Helper function to format additional activities data for form binding
  const formatAdditionalActivitiesForForm = (additionalActivities: any[]) => {
    if (!additionalActivities || additionalActivities.length === 0) return [];
    
    console.log("get data ===", additionalActivities);
    return additionalActivities.map((activity, index) => ({
      // Map API response fields to form fields
      Sequence: activity.Sequence || (index + 1),
      Category: activity.Category || '',
      Activity: activity.Activity || '',
      ActivityDescription: (activity as any).ActivityDescription || '',
      PlaceIt: activity.PlaceIt || '',
      ReportedBy: activity.ReportedBy || '',
      CustomerOrder: activity.CustomerOrder || '',
      LocationID: activity.LocationID || '',
      LocationDescription: activity.LocationDescription || '',
      FromLocation: activity.FromLocation || '',
      FromLocationDescription: activity.FromLocationDescription || '',
      ToLocation: activity.ToLocation || '',
      ToLocationDescription: activity.ToLocationDescription || '',
      PlannedDate: activity.PlannedDate || '',
      PlannedTime: activity.PlannedTime || '',
      RevisedDate: activity.RevisedDate || '',
      RevisedTime: activity.RevisedTime || '',
      ActualDate: activity.ActualDate || '',
      ActualTime: activity.ActualTime || '',
      Remarks1: activity.Remarks || '',
      Remarks2: activity.Remarks1 || '',
      Remarks3: activity.Remarks2 || '',
      EventProfile: activity.EventProfile || '',
      ModeFlag: activity.ModeFlag || 'NoChange',
      
      // Keep original activity data for reference
      ...activity
    }));
  };

  // Handle leg selection
  const handleLegSelection = (legSequence: string) => {
    setSelectedLegId(legSequence);
    setResetKey(prev => prev + 1);
  };

  const handleAddViaPoint = () => {
    if (!viaPointForm.viaLocation) {
      toast({
        title: "Error",
        description: "Please enter via location",
        variant: "destructive",
      });
      return;
    }
    // Note: Via point addition would need to be handled through API
    // For now, just close the dialog
    setShowAddViaPointsDialog(false);
    toast({
      title: "Info",
      description: "Via point addition requires API integration",
      variant: "default",
    });
  };

  const additionalActivities: AdditionalActivity[] = [
    {
      id: 'repair',
      name: 'Repair',
      icon: <Info className="h-4 w-4" />,
      timestamp: '25-Mar-2025 10:10 AM',
      fields: {
        sequence: '1',
        category: 'SevenLRC',
        fromLocation: 'Pickup',
        toLocation: 'Pickup',
        activity: 'Pickup',
        revisedDateTime: '25-Mar-2025 10:20 AM',
        actualDateTime: '25-Mar-2025 10:20 AM',
        reasonForChanges: 'SevenLRC'
      }
    }
  ];

  useEffect(() => {
    setDates({});
    setResetKey(k => k + 1);
  }, [legs]);

  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [LastIdentifiedLocation, setLastIdentifiedLocation] = useState<any[]>([]);
  const [ReasonForChanges, setReasonForChanges] = useState<any[]>([]);
  const [DelayedReason, setDelayedReason] = useState<any[]>([]);
  const [TripLogActivity, setTripLogActivity] = useState<any[]>([]);
  const [TripLogCustomEventCategory, setTripLogCustomEventCategory] = useState<any[]>([]);
  const [TripLogPlaceIt, setTripLogPlaceIt] = useState<any[]>([]);
  const [TripLogReportedBy, setTripLogReportedBy] = useState<any[]>([]);
  const [qcList1, setqcList1] = useState<any>();
  const [qcList2, setqcList2] = useState<any>();
  const [qcList3, setqcList3] = useState<any>();
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const [popupAmendFlag, setPopupAmendFlag] = useState('');
  const [fields, setFields] = useState([]);
  const [activityPlaced, setActivityPlaced] = useState('');
  const [activityName, setActivityName] = useState('');

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

  const fetchActivityPlaced = fetchMasterData("Trip Log Placed Init");
  const fetchActivityName = fetchMasterData("Activity Name Init");
  const [planDate, setPlanDate] = useState<Date>(new Date());

  const messageTypes = [
    "Location Init",
    "Reason for changes Init",
    "DelayedReason Init",
    "Trip Log Activity (Event) Init",
    "Trip Log Custom Event Category",
    "Trip Log QC1 Combo Init",
    "Trip Log QC2 Combo Init",
    "Trip Log QC3 Combo Init",
    "Trip Log Placed Init",
    "Activity Name Init",
    "PlaceIt Init",
    "Report By Init",
  ];
  useEffect(() => {
    fetchAll();
  }, []);
  const fetchAll = async () => {
    for (const type of messageTypes) {
      await fetchData(type);
    }
  };
  const fetchData = async (messageType) => {
    setError(null);
    setLoading(false);
    try {
      const data: any = await quickOrderService.getMasterCommonData({ messageType: messageType });
      setApiData(data);
      console.log("API Data:", data);
      // if (messageType == "Location Init") {
      //   setLastIdentifiedLocation(JSON.parse(data?.data?.ResponseData));
      // }
      if (messageType == "Reason for changes Init") {
        setReasonForChanges(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "DelayedReason Init") {
        setDelayedReason(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log Activity (Event) Init") {
        setTripLogActivity(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log Custom Event Category") {
        setTripLogCustomEventCategory(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "PlaceIt Init") {
        setTripLogPlaceIt(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Report By Init") {
        setTripLogReportedBy(JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log QC1 Combo Init") {
        setqcList1(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code1 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log QC2 Combo Init") {
        setqcList2(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code2 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log QC3 Combo Init") {
        setqcList3(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code3 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Trip Log Placed Init") {
        setActivityPlaced(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code3 Init', JSON.parse(data?.data?.ResponseData));
      }
      if (messageType == "Activity Name Init") {
        setActivityName(JSON.parse(data?.data?.ResponseData) || []);
        // console.log('Quick Order Header Quick Code3 Init', JSON.parse(data?.data?.ResponseData));
      }
    } catch (err) {
      setError(`Error fetching API data for ${messageType}`);
      // setApiData(data);
    } finally {
      setLoading(true);
    }
  };
  const tripExecutionPanelConfig: PanelConfig = {
      RevisedDate: {
        id: "RevisedDate",
        label: "Revised Date",
        fieldType: "date",
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 1,
      },
      RevisedTime: {
        id: 'RevisedTime',
        label: 'Revised Time',
        fieldType: 'time',
        width: 'four',
        value: "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 2
      },
      ActualDate: {
        id: "ActualDate",
        label: "Actual Date",
        fieldType: "date",
        width: 'four',
        value: "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 3,
      },
      ActualTime: {
        id: 'ActualTime',
        label: 'Actual Time',
        fieldType: 'time',
        width: 'four',
        value: "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 4
      },
      LastIdentifiedLocation: {
        id: 'LastIdentifiedLocation',
        label: 'Last Identified Location',
        fieldType: 'lazyselect',
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 5,
        hideSearch: false,
        disableLazyLoading: false,
        // options: arrivalList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
        fetchOptions: async ({ searchTerm, offset, limit }) => {
          const response = await quickOrderService.getMasterCommonData({
            messageType: "Location Init",
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
        events: {
          onChange: (selected, event) => {
            console.log('Customer changed:', selected);
          },
          onClick: (event, value) => {
            console.log('Customer dropdown clicked:', { event, value });
          }
        }
      },
      LastIdentifiedDate: {
        id: "LastIdentifiedDate",
        label: "Last Identified Date",
        fieldType: "date",
        width: 'four',
        value: "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 6,
      },
      LastIdentifiedTime: {
        id: 'LastIdentifiedTime',
        label: 'Last Identified Time',
        fieldType: 'time',
        width: 'four',
        value: "",
        mandatory: false,
        visible: true,
        editable: true,
        order: 7
      },
      DelayedReason: {
        id: 'DelayedReason',
        label: 'Delayed Reason',
        fieldType: 'select',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 8,
        width: 'four',
        options: ReasonForChanges?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
        events: {
          onChange: (value, event) => {
            console.log('contractType changed:', value);
          }
        }
      },
      ReasonForChanges: {
        id: 'ReasonForChanges',
        label: 'Reason For Changes',
        fieldType: 'select',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 9,
        width: 'four',
        options: ReasonForChanges?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
        events: {
          onChange: (value, event) => {
            console.log('contractType changed:', value);
          }
        }
      },
      QuickCode1: {
        id: 'QuickCode1',
        label: 'QC Userdefined 1',
        fieldType: 'inputdropdown',
        width: 'four',
        value: '', // <-- Set default dropdown value here
        // value: { dropdown: qcList1[0]?.id || '', input: '' }, // <-- Set default dropdown value here
        mandatory: false,
        visible: true,
        editable: true,
        order: 10,
        maxLength: 255,
        options: qcList1?.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      QuickCode2: {
        id: 'QuickCode2',
        label: 'QC Userdefined 2',
        fieldType: 'inputdropdown',
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 11,
        maxLength: 255,
        options: qcList2?.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      QuickCode3: {
        id: 'QuickCode3',
        label: 'QC Userdefined 3',
        fieldType: 'inputdropdown',
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 12,
        maxLength: 255,
        options: qcList3?.filter((qc:any) => qc.id).map((qc: any) => ({ label: qc.name, value: qc.id })),
      },
      Remarks1: {
        id: 'Remarks1',
        label: 'Remarks 1',
        fieldType: 'text',
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 13,
        placeholder: '',
        maxLength: 500,
      },
      Remarks2: {
        id: 'Remarks2',
        label: 'Remarks 2',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 14,
        placeholder: '',
        width: 'four',
        maxLength: 500,
      },
      Remarks3: {
        id: 'Remarks3',
        label: 'Remarks 3',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 15,
        placeholder: '',
        width: 'four',
        maxLength: 500,
      }
  };

  const handlerModalAddEvents = () => {
    setShowNormalPopupTitle('Add Events');
    console.log('Opening normal popup modal');
    // Reset popup data
    setPopupData({
      eventType: '',
      eventStatus: '',
      eventDescription: '',
      eventDate: '',
      eventTime: ''
    });
    setShowNormalPopup(true);
  };

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const addActivitiesData = async (fields: any) => {
    console.log("Amend Fields:");
  }

  // Handle popup data change
  const handlePopupDataChange = (field: string, value: string) => {
    setPopupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const splitAtPipe = (value: string | null | undefined) => {
    if (typeof value === "string" && value.includes("||")) {
      const [first, ...rest] = value.split("||");
      return first.trim(); // Return only the value part (before pipe)
    }
    return value;
  };

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
    console.log("splitDropdowns ===", newObj);
    return newObj;
  };
  
  // Handle Add Events popup save
  const handleAddEventsPopupSave = () => {
    console.log('Saving popup data:', popupData);
    console.log('activityPlaced:', activityPlaced);
    console.log('activityName:', activityName);
    console.log('planDate:', planDate);

    // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
    let activityNameValue = '';
    let activityNameLabel = '';

    if (typeof activityName === 'string' && activityName.includes('||')) {
      // If activityName is a string with '||', split it into value and label
      const [value, ...labelParts] = activityName.split('||');
      activityNameValue = value.trim();
      activityNameLabel = labelParts.join('||').trim();
    } else if (typeof activityName === 'string') {
      activityNameValue = activityName;
      activityNameLabel = activityName;
    } else if (typeof activityName === 'object' && activityName !== null) {
      // In case it's already an object (from dropdown)
      const splitData = splitDropdowns(activityName);
      activityNameValue = splitData.value || '';
      activityNameLabel = splitData.label || '';
    }

    // Fallback if label is empty, just use value
    if (!activityNameLabel) activityNameLabel = activityNameValue;

    const newEventForm = {
      id: `event-${Date.now()}`,
      title: activityNameLabel,
      ModeFlag: "Insert",
      Activity: activityNameValue,
      ActivityDescription: activityNameLabel,
      SeqNo: null,
      CustomerID: null,
			CustomerName: "",
			ConsignmentInformation: "",
			CustomerOrder: null,
      PlanDate: dates.planDate,
      PlanTime: dates.planTime,
    };
    
    // Add to the events forms array
    setEventsForms(prev => [...prev, newEventForm]);
    
    // Close popup
    setShowNormalPopup(false);
    
    // Show success message
    toast({
      title: "Success",
      description: "Event added successfully",
      variant: "default",
    });
    
    console.log('New Events form created from popup:', newEventForm);
  };

  // Handle popup cancel
  const handlePopupCancel = () => {
    setShowNormalPopup(false);
    // Reset popup data
    setPopupData({
      eventType: '',
      eventStatus: '',
      eventDescription: '',
      eventDate: '',
      eventTime: ''
    });
  };

  const tripExecutionAdditionalPanelConfig: PanelConfig = {
    Sequence: {
      id: "Sequence",
      label: "Sequence",
      fieldType: "text",
      width: 'four',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
    },
    Category: {
      id: 'Category',
      label: 'Category',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'four',
      options: TripLogCustomEventCategory?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    FromLocation: {
      id: 'FromLocation',
      label: 'From Location',
      fieldType: 'lazyselect',
      width: 'four',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 3,
      hideSearch: false,
      disableLazyLoading: false,
      // options: arrivalList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Location Init",
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
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    ToLocation: {
      id: 'ToLocation',
      label: 'To Location',
      fieldType: 'lazyselect',
      width: 'four',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 4,
      hideSearch: false,
      disableLazyLoading: false,
      // options: arrivalList.map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "Location Init",
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
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    Activity: {
      id: 'Activity',
      label: 'Activity (Event)',
      fieldType: 'select',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 5,
      width: 'four',
      options: TripLogActivity?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    RevisedDate: {
      id: "RevisedDate",
      label: "Revised Date",
      fieldType: "date",
      width: 'four',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
    },
    RevisedTime: {
      id: "RevisedTime",
      label: "Revised Time",
      fieldType: "time",
      width: 'four',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
    },
    ActualDate: {
      id: "ActualDate",
      label: "Actual Date",
      fieldType: "date",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 8,
    },
    ActualTime: {
      id: "ActualTime",
      label: "Actual Time",
      fieldType: "time",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 9,
    },
    PlaceIt: {
      id: "PlaceIt",
      label: "Place It",
      fieldType: "select",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 10,
      options: TripLogPlaceIt?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
    },
    ReportedBy: {
      id: "ReportedBy",
      label: "Reported By",
      fieldType: "select",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 11,
      options: TripLogReportedBy?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id }))
    },
    CustomerOrder: {
      id: "CustomerOrder",
      label: "Customer Order",
      fieldType: "lazyselect",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 12,
      hideSearch: false,
      disableLazyLoading: false,
      fetchOptions: async ({ searchTerm, offset, limit }) => {
        const response = await quickOrderService.getMasterCommonData({
          messageType: "CustomerOrder Number Init",
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
      events: {
        onChange: (selected, event) => {
          console.log('Customer changed:', selected);
        },
        onClick: (event, value) => {
          console.log('Customer dropdown clicked:', { event, value });
        }
      }
    },
    PlannedDate: {
      id: "PlannedDate",
      label: "Planned Date",
      fieldType: "date",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 13,
    },
    PlannedTime: {
      id: "PlannedTime",
      label: "Planned Time",
      fieldType: "time",
      width: 'four',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 14,
    },
    Remarks1: {
        id: 'Remarks1',
        label: 'Remarks 1',
        fieldType: 'text',
        width: 'four',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 15,
        placeholder: '',
        maxLength: 500,
      },
      Remarks2: {
        id: 'Remarks2',
        label: 'Remarks 2',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 16,
        placeholder: '',
        width: 'four',
        maxLength: 500,
      },
      Remarks3: {
        id: 'Remarks3',
        label: 'Remarks 3',
        fieldType: 'text',
        value: '',
        mandatory: false,
        visible: true,
        editable: true,
        order: 17,
        placeholder: '',
        width: 'four',
        maxLength: 500,
      }
  }; // Dependencies for useMemo

  const handlerModalAdditionalEvents = () => {
    setShowNormalPopupTitle('Add Additional Events');
    console.log('Opening normal popup modal');
    // Reset popup data
    setPopupData({
      eventType: '',
      eventStatus: '',
      eventDescription: '',
      eventDate: '',
      eventTime: ''
    });
    setShowNormalPopup(true);
  };

  // Handle popup save
  const handleAdditionalEventsPopupSave = () => {
    console.log('Saving popup data:', popupData);
    console.log('activityPlaced:', activityPlaced);
    console.log('activityName:', activityName);
    console.log('planDate:', planDate);

    // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
    let activityNameValue = '';
    let activityNameLabel = '';

    if (typeof activityName === 'string' && activityName.includes('||')) {
      // If activityName is a string with '||', split it into value and label
      const [value, ...labelParts] = activityName.split('||');
      activityNameValue = value.trim();
      activityNameLabel = labelParts.join('||').trim();
    } else if (typeof activityName === 'string') {
      activityNameValue = activityName;
      activityNameLabel = activityName;
    } else if (typeof activityName === 'object' && activityName !== null) {
      // In case it's already an object (from dropdown)
      const splitData = splitDropdowns(activityName);
      activityNameValue = splitData.value || '';
      activityNameLabel = splitData.label || '';
    }

    // Fallback if label is empty, just use value
    if (!activityNameLabel) activityNameLabel = activityNameValue;

    const newEventForm = {
      id: `event-${Date.now()}`,
      title: activityNameLabel,
      ModeFlag: "Insert",
      Activity: activityNameValue,
      ActivityDescription: activityNameLabel,
      SeqNo: null,
      CustomerID: null,
			CustomerName: "",
			ConsignmentInformation: "",
			CustomerOrder: null,
      PlanDate: dates.planDate,
      PlanTime: dates.planTime,
    };
    
    // Add to the events forms array
    setAdditionalEventsForms(prev => [...prev, newEventForm]);
    
    // Close popup
    setShowNormalPopup(false);
    
    // Show success message
    toast({
      title: "Success",
      description: "Event added successfully",
      variant: "default",
    });
    
    console.log('New Events form created from popup:', newEventForm);
  };

  // Helper: parse combined date and time into a Date object
  const parseDateTime = (
    dateString?: string | null,
    timeString?: string | null
  ): Date | null => {
    if (!dateString || !timeString) return null;
    try {
      let date: Date;
      if (dateString.includes('-') && dateString.length === 10) {
        // YYYY-MM-DD
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // DD/MM/YYYY
          date = new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          );
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
 
      if (isNaN(date.getTime())) return null;
 
      let hours = 0,
        minutes = 0,
        seconds = 0;
      if (timeString.includes(':')) {
        const tParts = timeString.split(':');
        if (tParts.length >= 2) {
          hours = parseInt(tParts[0], 10);
          minutes = parseInt(tParts[1], 10);
          seconds = tParts.length >= 3 ? parseInt(tParts[2], 10) : 0;
        } else {
          const dt = new Date(`1970-01-01T${timeString}`);
          if (!isNaN(dt.getTime())) {
            hours = dt.getHours();
            minutes = dt.getMinutes();
            seconds = dt.getSeconds();
          }
        }
      } else {
        const dt = new Date(`1970-01-01T${timeString}`);
        if (!isNaN(dt.getTime())) {
          hours = dt.getHours();
          minutes = dt.getMinutes();
          seconds = dt.getSeconds();
        }
      }
      date.setHours(hours, minutes, seconds, 0);
      return date;
    } catch {
      return null;
    }
  };
 
  // Helper: format millisecond diff into "DD Days HH Hours MM Mins"
  const formatDelay = (diffMs: number): string => {
    const totalMinutes = Math.round(Math.abs(diffMs) / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(days)} Days ${pad(hours)} Hours ${pad(minutes)} Mins`;
  };
 
  // Helper: calculate delayed time based on planned/revised vs actual
  const getDelayedTime = (activity: any): string => {
    const actual = parseDateTime(activity?.ActualDate, activity?.ActualTime);
    const revised = parseDateTime(activity?.RevisedDate, activity?.RevisedTime);
    const planned = parseDateTime(activity?.PlannedDate, activity?.PlannedTime);
    if (!actual) return '';
    const target = revised ?? planned;
    if (!target) return '';
    const diff = target.getTime() - actual.getTime();
    return formatDelay(diff);
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-full bg-background"
      >
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        {/* Version Selection */}
        <div className="p-4 border-b space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Version No.</Label>
            <Select defaultValue="v1">
              <SelectTrigger>
                <SelectValue placeholder="Select Version No." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1">Version 1</SelectItem>
                <SelectItem value="v2">Version 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Total Legs */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Execution sequence
              <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {legs.length}
              </Badge>
            </h3>
            {/* <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowAddViaPointsDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button> */}
          </div>
        </div>

        {/* Legs List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {isLoadingTrip ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading legs...
              </div>
            ) : legs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No legs found
              </div>
            ) : (
              legs.map((leg) => (
                <div
                  key={leg.LegSequence}
                  onClick={() => handleLegSelection(leg.LegSequence)}
                  className={cn(
                    "p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer space-y-2 relative min-h-[50px]",
                    selectedLegId === leg.LegSequence && "border-primary bg-accent"
                  )}
                >
                  {/* Leg Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1">
                        <span className="flex-shrink-0">{leg.LegSequence} </span>
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                          <div className="flex-1 min-w-0 truncate">
                            {/* <span className="font-medium text-sm truncate">{leg.DeparturePointDescription}</span> - <span className="font-medium text-sm truncate">{leg.ArrivalPointDescription}</span> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground whitespace-nowrap badge-blue rounded-2xl ml-2">
                      {leg.LegBehaviourDescription || leg.LegBehaviour || ''}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 mt-1"
                            aria-label="View location details"
                          >
                            <Info className="h-3 w-3 text-gray-600" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          className="max-w-xs p-3 text-sm bg-white border border-gray-200 shadow-lg z-50"
                          sideOffset={5}
                        >
                          <div className="space-y-1 mb-2">
                            <div><span className="font-medium"></span> {leg.DeparturePointDescription} - <span className="font-medium"></span> {leg.ArrivalPointDescription}</div>
                          </div>
                          {(leg as any).PlanStartDate && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bottom-3">
                              <span className="font-medium">{formatDateToDDMMYYYY((leg as any).PlanStartDate)} {formatTimeTo12Hour((leg as any).PlanStartTime)} - {formatDateToDDMMYYYY((leg as any).PlanEndDate)} {formatTimeTo12Hour((leg as any).PlanEndTime)}</span>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

       {/* Main Content */}
       <div className="flex-1 flex flex-col">
         {isLoadingTrip ? (
           <div className="flex-1 flex items-center justify-center text-muted-foreground">
             <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
               <p className="text-sm">Loading trip data...</p>
             </div>
           </div>
         ) : !selectedLeg ? (
           <div className="flex-1 flex items-center justify-center text-muted-foreground">
             <div className="text-center">
               <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
               <p className="text-sm">Select a leg to view details</p>
             </div>
           </div>
         ) : (
          <>
        {/* Tabs */}
        <Tabs defaultValue="consignment" className="flex-1 flex flex-col">
          <div className="border-b px-6 pt-4">
            <TabsList className="h-10">
              <TabsTrigger value="activities">Events </TabsTrigger>
              <TabsTrigger value="consignment">Consignment </TabsTrigger>
              {/* <TabsTrigger value="transshipment">Transloading ({selectedLeg.transshipments.length})</TabsTrigger> */}
            </TabsList>
          </div>

          <TabsContent value="activities" className="flex-1 flex flex-col m-0">
            {/* Activities Header */}
            {/* <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Trip Events</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={quickOrderAmendHandler} variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Events
                  </Button>
                </div>
              </div>
            </div> */}

            {/* Activities Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Activities Section */}
              <div className="space-y-3 border p-3">
                <div 
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedActivities(!expandedActivities)}
                >
                   <h3 className="text-sm font-semibold flex items-center gap-2">
                     Events
                     <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                       {selectedLeg.Activities?.length || 0}
                     </Badge>
                   </h3>
                  {expandedActivities ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Activities List */}
                <AnimatePresence>
                  {expandedActivities && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 overflow-hidden"
                    >
                     
                       {selectedLeg.Activities?.map((activity: any, index) => {
                         const activityId = `activity-${selectedLeg.LegSequence}-${activity.SeqNo || index}`;
                         const activityRef = getActivityRef(activityId);
                         const formattedActivity = formatActivitiesForForm([activity])[0];
                         
                         // Format data for DynamicPanel
                         const formData = {
                           ...formattedActivity,
                           // Format QuickCode fields for inputdropdown
                           QuickCode1: formattedActivity.QuickCode1 ? {
                             dropdown: typeof formattedActivity.QuickCode1 === 'string' 
                               ? formattedActivity.QuickCode1 
                               : (formattedActivity.QuickCode1?.dropdown || extractQuickCodeId(formattedActivity.QuickCode1)),
                             input: formattedActivity.QuickCodeValue1 || ''
                           } : { dropdown: '', input: '' },
                           QuickCode2: formattedActivity.QuickCode2 ? {
                             dropdown: typeof formattedActivity.QuickCode2 === 'string' 
                               ? formattedActivity.QuickCode2 
                               : (formattedActivity.QuickCode2?.dropdown || extractQuickCodeId(formattedActivity.QuickCode2)),
                             input: formattedActivity.QuickCodeValue2 || ''
                           } : { dropdown: '', input: '' },
                           QuickCode3: formattedActivity.QuickCode3 ? {
                             dropdown: typeof formattedActivity.QuickCode3 === 'string' 
                               ? formattedActivity.QuickCode3 
                               : (formattedActivity.QuickCode3?.dropdown || extractQuickCodeId(formattedActivity.QuickCode3)),
                             input: formattedActivity.QuickCodeValue3 || ''
                           } : { dropdown: '', input: '' },
                           LastIdentifiedLocation: formattedActivity.LastIdentifiedLocation 
                             ? `${formattedActivity.LastIdentifiedLocation}||${formattedActivity.LastIdentifiedLocationDescription || ''}`
                             : '',
                         };
                         
                         return (
                           <div key={activityId} className="rounded-lg bg-card">
                             <div className="flex items-center justify-between p-4 bg-muted/30">
                               <div className="flex items-center gap-3"> 
                                 <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                   <Package className="h-4 w-4" />
                                 </div>
                                 <div className='flex items-center gap-2'>
                                   <div className="font-medium text-sm">
                                     {activity.ActivityDescription || activity.Activity} - {formatDateToDDMMYYYY(activity.PlannedDate)} {formatTimeTo12Hour(activity.PlannedTime)}
                                   </div>
                                   {activity?.ActualTime && (     
                                   <div className="flex-shrink-0 inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground whitespace-nowrap badge-red rounded-2xl ml-2">
                                      {`${getDelayedTime(activity)} Delayed`}
                                    </div>
                                   )}
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="text-xs">
                                   Seq: {activity.SeqNo || index + 1}
                                 </Badge>
                               </div>
                             </div>

                             {loading ? (
                               <DynamicPanel
                                 ref={activityRef}
                                 key={`trip-execution-panel-${activityId}`}
                                 panelId={`operational-details-${activityId}`}
                                 panelTitle="Trip Activities"
                                 panelConfig={tripExecutionPanelConfig}
                                 formName={`operationalDetailsForm-${activityId}`}
                                 initialData={formData}
                               />
                             ) : null}
                           </div>
                         );
                       })}

                      {/* New Activity Forms */}
                      {eventsForms.map((activity) => (
                        <div key={activity.id} className="rounded-lg bg-card">
                          {/* Activity Header */}
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-3"> 
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                <Package className="h-4 w-4" />
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className="font-medium text-sm">{(activity as any).title} - {formatDateToDDMMYYYY((activity as any).RevisedDate)} {formatTimeTo12Hour((activity as any).RevisedTime)}</div>
                                {activity?.ActualTime && (     
                                <div className="flex-shrink-0 inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground whitespace-nowrap badge-red rounded-2xl ml-2">
                                  {`${getDelayedTime(activity)} Delayed`}
                                </div>
                                )}
                                {/* <div className="text-xs text-muted-foreground">{activity.PlannedDate}</div> */}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={activity.status === 'completed' ? 'default' : activity.status === 'in-progress' ? 'secondary' : 'outline'} 
                                className="text-xs"
                              >
                                {activity.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Activity Details Form */}
                          <div className="px-4 pb-4 pt-4 border-t space-y-4">
                            {loading ?
                              <DynamicPanel
                                ref={getFormRef(activity.id)}
                                key={`trip-execution-panel-${activity.id}`}
                                panelId={`operational-details-${activity.id}`}
                                panelTitle="Events"
                                panelConfig={tripExecutionPanelConfig}
                                formName={`operationalDetailsForm-${activity.id}`}
                                initialData={activity}
                              /> : ''
                            }
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 justify-end">
                        <Button onClick={handlerModalAddEvents} variant="outline" size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Events
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Additional Activities Section */}
              <div className="space-y-3 border p-3">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedAdditional(!expandedAdditional)}
                >
                   <h3 className="text-sm font-semibold flex items-center gap-2">
                     Additional Events
                     <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                       {selectedLeg.AdditionalActivities?.length || 0}
                     </Badge>
                   </h3>
                  {expandedAdditional ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedAdditional && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                       {selectedLeg.AdditionalActivities?.map((activity: any, index) => {
                         const activityId = `additional-activity-${selectedLeg.LegSequence}-${activity.Sequence || index}`;
                         const additionalActivityRef = getAdditionalActivityRef(activityId);
                         const formattedAdditionalActivity = formatAdditionalActivitiesForForm([activity])[0];
                         
                         return (
                           <div key={activityId} className="rounded-lg bg-card p-4 space-y-4">
                             {/* Header */}
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                   <Info className="h-4 w-4" />
                                 </div>
                                 <div>
                                   <div className="font-medium text-sm">
                                     {activity.ActivityDescription || activity.Activity} - {formatDateToDDMMYYYY(activity.RevisedDate)} {formatTimeTo12Hour(activity.RevisedTime)}
                                   </div>
                                 </div>
                               </div>
                               <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="text-xs">
                                   Seq: {activity.Sequence || index + 1}
                                 </Badge>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             </div>

                             {loading ? (
                               <DynamicPanel
                                 ref={additionalActivityRef}
                                 key={`trip-execution-panel-additional-${activityId}`}
                                 panelId={`operational-details-additional-${activityId}`}
                                 panelTitle="Additional Events"
                                 panelConfig={tripExecutionAdditionalPanelConfig}
                                 formName={`operationalDetailsForm-additional-${activityId}`}
                                 initialData={formattedAdditionalActivity}
                               />
                             ) : null}
                           </div>
                         );
                       })}

                      {/* New Activity Forms */}
                      {additionalEventsForms.map((activity) => (
                        <div key={activity.id} className="rounded-lg bg-card">
                          {/* Activity Header */}
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-3"> 
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                <Package className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{(activity as any).title} - {formatDateToDDMMYYYY((activity as any).RevisedDate)} {formatTimeTo12Hour((activity as any).RevisedTime)}</div>
                                {/* <div className="text-xs text-muted-foreground">{activity.PlannedDate}</div> */}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={activity.status === 'completed' ? 'default' : activity.status === 'in-progress' ? 'secondary' : 'outline'} 
                                className="text-xs"
                              >
                                {activity.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Activity Details Form */}
                          <div className="px-4 pb-4 pt-4 border-t space-y-4">
                            {loading ?
                              <DynamicPanel
                                ref={getFormRef(`additional-${activity.id}`)}
                                key={`trip-execution-panel-additional-${activity.id}`}
                                panelId={`operational-details-additional-${activity.id}`}
                                panelTitle="Additional Events"
                                panelConfig={tripExecutionAdditionalPanelConfig}
                                formName={`operationalDetailsForm-additional-${activity.id}`}
                                initialData={activity}
                              /> : ''
                            }
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-2 justify-end">
                        <Button onClick={handlerModalAdditionalEvents} variant="outline" size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Additional Events
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* Footer Actions */}
            <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
              {/* <Button variant="outline" onClick={onClose} className='inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-background text-blue-600 border border-blue-600 hover:bg-blue-50 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm'>
                Close
              </Button> */}
              <Button onClick={onSaveActivities} className='inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm' >
                Save
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="consignment" className="flex-1 flex flex-col m-0">
            <ConsignmentTrip legId={selectedLegId} selectedLeg={selectedLeg} tripData={tripData} onClose={onClose}/>
          </TabsContent>

          <TabsContent value="transshipment" className="flex-1 flex flex-col m-0">
            {/* Transshipment Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <h3 className="text-lg font-semibold">Transloading Details</h3>
                   <Badge variant="secondary" className="h-6 px-2">
                     0
                   </Badge>
                 </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CO Selection */}
              {/* <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Select defaultValue="CN000000001">
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="Select CO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CN000000001">CN000000001</SelectItem>
                    <SelectItem value="CN000000002">CN000000002</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pickup-complete" />
                  <Label htmlFor="pickup-complete" className="text-sm font-normal cursor-pointer">
                    Pickup Complete for this CO
                  </Label>
                </div>
              </div> */}

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12 Nos</div>
                      <div className="text-xs text-muted-foreground">Wagon Quantity</div>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">12 Nos</div>
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
                      <div className="text-2xl font-bold">23 Ton</div>
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
                      <div className="text-2xl font-bold">10 Nos</div>
                      <div className="text-xs text-muted-foreground">THU Quantity</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Transshipment List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Transloading List</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search" className="pl-8 h-9 w-[200px]" />
                    </div>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px]">Wagon ID Type</TableHead>
                        <TableHead className="w-[180px]">Container ID Type</TableHead>
                        <TableHead className="w-[120px]">Hazardous Goods</TableHead>
                        <TableHead className="w-[240px]">Departure and Arrival</TableHead>
                        <TableHead className="w-[200px]">Plan From & To Date</TableHead>
                        <TableHead className="w-[120px]">Price</TableHead>
                        <TableHead className="w-[120px]">Draft Bill</TableHead>
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                       {/* Transshipments would come from API if available */}
                       {[].map((transshipment: any) => (
                         <TableRow key={transshipment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-blue-600">WAG00000001</div>
                              <div className="text-xs text-muted-foreground">Habbins</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">CONT100001</div>
                              <div className="text-xs text-muted-foreground">Container A</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="h-6 w-6 p-0 rounded-full flex items-center justify-center border-orange-500 text-orange-500">
                                <AlertCircle className="h-4 w-4" />
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">Frankfurt Station A - Frankfurt Station B</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">12-Mar-2025 to 12-Mar-2025</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">€ 1395.00</div>
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="h-auto p-0 text-blue-600">
                              DB/000234
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        </>
        )}
      </div>
    </motion.div>

      {loading ?
        <CommonPopup
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          title={popupTitle}
          titleColor={popupTextColor}
          titleBGColor={popupTitleBgColor}
          icon={<NotebookPen className="w-4 h-4" />}
          fields={fields as any}
          onFieldChange={handleFieldChange}
          onSubmit={addActivitiesData}
          submitLabel={popupButtonName}
          submitColor={popupBGColor}
        /> : ''
      }
      
      {/* Add Via Points Dialog */}
      <Dialog open={showAddViaPointsDialog} onOpenChange={setShowAddViaPointsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Via Points</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Leg From and To (Optional)</Label>
              <Select value={viaPointForm.legFromTo} onValueChange={(value) => setViaPointForm({ ...viaPointForm, legFromTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leg or leave empty" />
                </SelectTrigger>
                 <SelectContent>
                   {legs.map((leg) => (
                     <SelectItem key={leg.LegSequence} value={`${leg.DeparturePointDescription} - ${leg.ArrivalPointDescription}`}>
                       {leg.DeparturePointDescription} - {leg.ArrivalPointDescription}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Via Location *</Label>
              <Input
                placeholder="Enter via location"
                value={viaPointForm.viaLocation}
                onChange={(e) => setViaPointForm({ ...viaPointForm, viaLocation: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Planned Date
                </Label>
                <Input
                  type="date"
                  value={viaPointForm.plannedDate}
                  onChange={(e) => setViaPointForm({ ...viaPointForm, plannedDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Planned Time
                </Label>
                <Input
                  type="time"
                  value={viaPointForm.plannedTime}
                  onChange={(e) => setViaPointForm({ ...viaPointForm, plannedTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddViaPointsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddViaPoint}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Normal Popup Modal */}
      {showNormalPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{showNormalPopupTitle}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePopupCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Placed</label>
                <DynamicLazySelect
                  fetchOptions={fetchActivityPlaced}
                  value={activityPlaced}
                  onChange={(value) => setActivityPlaced(value as string)}
                  hideSearch={true}
                  disableLazyLoading={true}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Name</label>
                <DynamicLazySelect
                  fetchOptions={fetchActivityName}
                  value={activityName}
                  onChange={(value) => setActivityName(value as string)}
                  hideSearch={true}
                  disableLazyLoading={true}
                  placeholder=""
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Date</label>
                <DateTimePicker
                  key={`${resetKey}-planDate`} // optional: guarantees fresh mount
                  value={dates.planDate}
                  onChange={(newDate) => {
                    setDates((s) => ({ ...s, planDate: newDate }))
                    setPlanDate(planDate)
                    onFieldChange?.("planDate", format(newDate, "yyyy-MM-dd HH:mm:00")) // update field value
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-6 border-t">
              {/* <Button
                variant="outline"
                onClick={handlePopupCancel}
              >
                Cancel
              </Button> */}
              {showNormalPopupTitle == 'Add Events' ? (
                <Button
                  onClick={handleAddEventsPopupSave}
                  // disabled={!popupData.eventType || !popupData.eventStatus}
                >
                  Save Event
                </Button>
              ) : (
                <Button
                  onClick={handleAdditionalEventsPopupSave}
                  // disabled={!popupData.eventType || !popupData.eventStatus}
                >
                  Save Additional Event
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};