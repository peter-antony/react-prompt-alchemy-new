import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useTripExecutionDrawerStore } from '@/stores/tripExecutionDrawerStore';
import { toast } from 'sonner';
import { DynamicPanel, DynamicPanelRef } from '@/components/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { quickOrderService } from '@/api/services/quickOrderService';
import { manageTripStore } from '@/stores/mangeTripStore';
import { ConsignmentTrip } from './ConsignmentTrip';
import { tripService } from "@/api/services/tripService";
import { useToast } from '@/hooks/use-toast';
import CommonPopup from '@/components/Common/CommonPopup';
import { DynamicLazySelect } from '../DynamicPanel/DynamicLazySelect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateTimePicker } from "@/components/Common/DateTimePicker";


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

  // Zustand store
  const { legs, selectedLegId, selectLeg, getSelectedLeg, addLeg, removeLeg, loadLegsFromAPI } = useTripExecutionDrawerStore();
  const { toast } = useToast();
  // State to track form data changes
  const [formDataState, setFormDataState] = useState<any>({});
  const [activitiesFormData, setActivitiesFormData] = useState<any[]>([]);
  
  // State to track additional activities form data
  const [additionalFormDataState, setAdditionalFormDataState] = useState<any>({});
  const [additionalActivitiesFormData, setAdditionalActivitiesFormData] = useState<any[]>([]);

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
  
  // Load legs from API on component mount
  useEffect(() => {
    loadLegsFromAPI();
  }, [loadLegsFromAPI]);

  // Auto-bind first leg data when legs are loaded
  useEffect(() => {
    setLoading(false);
    if (legs.length > 0 && selectedLegId && tripExecutionRef?.current?.setFormValues) {
      console.log("load tripExecutionRef ====");
      const selectedLegData = legs.find(leg => leg.id === selectedLegId);
      if (selectedLegData) {
        console.log("Auto-binding first leg data on load:", selectedLegData);
        
        const rawActivitiesData = selectedLegData.activities || [];
        const formattedActivities = formatActivitiesForForm(rawActivitiesData);
        const consignmentsData = selectedLegData.consignments || [];

        // Prepare additional activities data for form binding
        const rawAdditionalActivitiesData = selectedLegData.additionalActivities || [];
        const formattedAdditionalActivities = formatAdditionalActivitiesForForm(rawAdditionalActivitiesData);
        
        const formData = {
          // Basic leg information
          legSequence: selectedLegData.id,
          from: selectedLegData.from,
          to: selectedLegData.to,
          distance: selectedLegData.distance,
          duration: selectedLegData.duration,
          
          // Activities array - this is the key data we want to bind
          activities: formattedActivities,
          
          // Individual activity fields for easier form access
          ...(formattedActivities.length > 0 && {
            firstActivity: formattedActivities[0],
            lastActivity: formattedActivities[formattedActivities.length - 1],
            activityCount: formattedActivities.length,
            
            // Bind first activity fields directly for easy access
            ActivitySeqNo: formattedActivities[0].SeqNo,
            ActivityName: formattedActivities[0].Activity,
            ActivityDescription: formattedActivities[0].ActivityDescription,
            CustomerName: formattedActivities[0].CustomerName,
            CustomerID: formattedActivities[0].CustomerID,
            PlannedDate: formattedActivities[0].PlannedDate,
            PlannedTime: formattedActivities[0].PlannedTime,
            CustomerOrder: formattedActivities[0].CustomerOrder,
            EventProfile: formattedActivities[0].EventProfile,
            RevisedDate: formattedActivities[0].RevisedDate,
            RevisedTime: formattedActivities[0].RevisedTime,
            ActualDate: formattedActivities[0].ActualDate,
            ActualTime: formattedActivities[0].ActualTime,
            DelayedIn: formattedActivities[0].DelayedIn,
            QuickCode1: formattedActivities[0].QuickCode1,
            QuickCode2: formattedActivities[0].QuickCode2,
            QuickCode3: formattedActivities[0].QuickCode3,
            QuickCodeValue1: formattedActivities[0].QuickCodeValue1,
            QuickCodeValue2: formattedActivities[0].QuickCodeValue2,
            QuickCodeValue3: formattedActivities[0].QuickCodeValue3,
            Remarks1: formattedActivities[0].Remarks1,
            Remarks2: formattedActivities[0].Remarks2,
            Remarks3: formattedActivities[0].Remarks3,
            ReasonForChanges: formattedActivities[0].ReasonForChanges,
            DelayedReason: formattedActivities[0].DelayedReason,
            LastIdentifiedLocation: formattedActivities[0].LastIdentifiedLocation + '||' + formattedActivities[0].LastIdentifiedLocationDescription,
            // LastIdentifiedLocationDescription: formattedActivities[0].LastIdentifiedLocationDescription,
            LastIdentifiedDate: formattedActivities[0].LastIdentifiedDate,
            LastIdentifiedTime: formattedActivities[0].LastIdentifiedTime,
            AmendmentNo: formattedActivities[0].AmendmentNo,
          }),
          
          // Consignments data
          consignments: consignmentsData,
          
          // Additional leg metadata
          hasInfo: selectedLegData.hasInfo,
          transshipments: selectedLegData.transshipments || []
        };
        console.log("formData ====", formData);
        console.log("formData ====", tripExecutionRef.current.setFormValues);
        tripExecutionRef.current.setFormValues(formData);
        // Create additional activities form data
        const additionalFormData = {
          // Basic leg information
          legSequence: selectedLegData.id,
          from: selectedLegData.from,
          to: selectedLegData.to,
          distance: selectedLegData.distance,
          duration: selectedLegData.duration,
          
          // Additional activities array - this is the key data we want to bind
          additionalActivities: formattedAdditionalActivities,
          
          // Individual additional activity fields for easier form access
          ...(formattedAdditionalActivities.length > 0 && {
            firstAdditionalActivity: formattedAdditionalActivities[0],
            lastAdditionalActivity: formattedAdditionalActivities[formattedAdditionalActivities.length - 1],
            additionalActivityCount: formattedAdditionalActivities.length,
            
            // Bind first additional activity fields directly for easy access
            Sequence: formattedAdditionalActivities[0].Sequence,
            Category: formattedAdditionalActivities[0].Category,
            ActivityName: formattedAdditionalActivities[0].Activity,
            ActivityDescription: formattedAdditionalActivities[0].ActivityDescription,
            ActivityPlaceIt: formattedAdditionalActivities[0].PlaceIt,
            FromLocation: formattedAdditionalActivities[0].FromLocation,
            ToLocation: formattedAdditionalActivities[0].ToLocation,
            Activity: formattedAdditionalActivities[0].Activity,
            RevisedDate: formattedAdditionalActivities[0].RevisedDate,
            ActualDate: formattedAdditionalActivities[0].ActualDate
          }),
          
          // Consignments data
          consignments: consignmentsData,
          
          // Additional leg metadata
          hasInfo: selectedLegData.hasInfo,
          transshipments: selectedLegData.transshipments || []
        };
        console.log("Form data to additionalFormData:", additionalFormData);
        if (tripAdditionalRef?.current?.setFormValues) {
          tripAdditionalRef.current.setFormValues(additionalFormData);
        }
        console.log("First leg data auto-bound to form fields");
        setLoading(true);
      }
    }
  }, [legs, selectedLegId, tripExecutionRef]);

  // Handle selected leg changes and bind data to form fields
  useEffect(() => {
    setLoading(false);
    if (selectedLegId && legs.length > 0) {
      const selectedLegData = legs.find(leg => leg.id === selectedLegId);
      if (selectedLegData) {
        console.log("Selected leg changed, binding data:", selectedLegData);
        
        // Prepare activities data for form binding
        const rawActivitiesData = selectedLegData.activities || [];
        const formattedActivities = formatActivitiesForForm(rawActivitiesData);
        const consignmentsData = selectedLegData.consignments || [];
        
        // Prepare additional activities data for form binding
        const rawAdditionalActivitiesData = selectedLegData.additionalActivities || [];
        const formattedAdditionalActivities = formatAdditionalActivitiesForForm(rawAdditionalActivitiesData);
        
        // Create form data object with activities array
        const formData = {
          // Basic leg information
          legSequence: selectedLegData.id,
          from: selectedLegData.from,
          to: selectedLegData.to,
          distance: selectedLegData.distance,
          duration: selectedLegData.duration,
          
          // Activities array - this is the key data we want to bind
          activities: formattedActivities,
          
          // Individual activity fields for easier form access
          ...(formattedActivities.length > 0 && {
            firstActivity: formattedActivities[0],
            lastActivity: formattedActivities[formattedActivities.length - 1],
            activityCount: formattedActivities.length,
            
            // Bind first activity fields directly for easy access
            ActivitySeqNo: formattedActivities[0].SeqNo,
            ActivityName: formattedActivities[0].Activity,
            ActivityDescription: formattedActivities[0].ActivityDescription,
            CustomerName: formattedActivities[0].CustomerName,
            CustomerID: formattedActivities[0].CustomerID,
            PlannedDate: formattedActivities[0].PlannedDate,
            PlannedTime: formattedActivities[0].PlannedTime,
            CustomerOrder: formattedActivities[0].CustomerOrder,
            EventProfile: formattedActivities[0].EventProfile,
            RevisedDate: formattedActivities[0].RevisedDate,
            RevisedTime: formattedActivities[0].RevisedTime,
            ActualDate: formattedActivities[0].ActualDate,
            ActualTime: formattedActivities[0].ActualTime,
            DelayedIn: formattedActivities[0].DelayedIn,
            QuickCode1: formattedActivities[0].QuickCode1,
            QuickCode2: formattedActivities[0].QuickCode2,
            QuickCode3: formattedActivities[0].QuickCode3,
            QuickCodeValue1: formattedActivities[0].QuickCodeValue1,
            QuickCodeValue2: formattedActivities[0].QuickCodeValue2,
            QuickCodeValue3: formattedActivities[0].QuickCodeValue3,
            Remarks1: formattedActivities[0].Remarks1,
            Remarks2: formattedActivities[0].Remarks2,
            Remarks3: formattedActivities[0].Remarks3,
            ReasonForChanges: formattedActivities[0].ReasonForChanges,
            DelayedReason: formattedActivities[0].DelayedReason,
            LastIdentifiedLocation: formattedActivities[0].LastIdentifiedLocation + '||' + formattedActivities[0].LastIdentifiedLocationDescription,
            // LastIdentifiedLocationDescription: formattedActivities[0].LastIdentifiedLocationDescription,
            LastIdentifiedDate: formattedActivities[0].LastIdentifiedDate,
            LastIdentifiedTime: formattedActivities[0].LastIdentifiedTime,
            AmendmentNo: formattedActivities[0].AmendmentNo,
          }),
          
          // Consignments data
          consignments: consignmentsData,
          
          // Additional leg metadata
          hasInfo: selectedLegData.hasInfo,
          transshipments: selectedLegData.transshipments || []
        };
        console.log("formData -----", formData.activities[0]);
        // Make sure to bind the entire formData, not just the first activity, 
        // so the Activities panel gets all fields it expects.
        // The DynamicPanel usually expects a full set of fields, not just a partial activity object.
        if (tripExecutionRef?.current?.setFormValues) {
          tripExecutionRef.current.setFormValues(formData);
        }
        console.log("tripExecutionRef?.current?.setFormValues ", tripExecutionRef?.current?.setFormValues);
        // if (tripExecutionRef?.current?.setFormValues) {
        tripExecutionRef?.current?.setFormValues(formData.activities[0]);
        console.log("Data automatically bound to tripExecutionRef on leg change");
        // }

        const additionalFormData = {
          // Basic leg information
          legSequence: selectedLegData.id,
          from: selectedLegData.from,
          to: selectedLegData.to,
          distance: selectedLegData.distance,
          duration: selectedLegData.duration,
          
          // Additional activities array - this is the key data we want to bind
          additionalActivities: formattedAdditionalActivities,
          
          // Individual additional activity fields for easier form access
          ...(formattedAdditionalActivities.length > 0 && {
            firstAdditionalActivity: formattedAdditionalActivities[0],
            lastAdditionalActivity: formattedAdditionalActivities[formattedAdditionalActivities.length - 1],
            additionalActivityCount: formattedAdditionalActivities.length,
            
            // Bind first additional activity fields directly for easy access
            Sequence: formattedAdditionalActivities[0].Sequence,
            Category: formattedAdditionalActivities[0].Category,
            ActivityName: formattedAdditionalActivities[0].Activity,
            ActivityDescription: formattedAdditionalActivities[0].ActivityDescription,
            ActivityPlaceIt: formattedAdditionalActivities[0].PlaceIt,
            FromLocation: formattedAdditionalActivities[0].FromLocation,
            ToLocation: formattedAdditionalActivities[0].ToLocation,
            Activity: formattedAdditionalActivities[0].Activity,
            RevisedDate: formattedAdditionalActivities[0].RevisedDate,
            ActualDate: formattedAdditionalActivities[0].ActualDate
          }),
          
          // Consignments data
          consignments: consignmentsData,
          
          // Additional leg metadata
          hasInfo: selectedLegData.hasInfo,
          transshipments: selectedLegData.transshipments || []
        };
        console.log("Form data to additionalFormData:", additionalFormData);
        // Bind data to tripExecutionRef (Activities panel)
        if (tripExecutionRef?.current?.setFormValues) {
          tripExecutionRef.current.setFormValues(formData.activities[0]);
          console.log("Data automatically bound to tripExecutionRef on leg change");
        }
        
        // Bind data to tripAdditionalRef (Additional Activities panel)
        if (tripAdditionalRef?.current?.setFormValues) {
          tripAdditionalRef.current.setFormValues(additionalFormData);
          // tripAdditionalRef.current.setFormValues({
          //   ...formData,
          //   // Additional specific data for additional activities panel
          //   additionalActivities: formattedActivities.filter(activity => 
          //     activity.category === 'Additional' || activity.subCategory === 'Additional'
          //   )
          // });
          console.log("Data automatically bound to tripAdditionalRef on leg change");
        }
        setLoading(true);
      }
    }
  }, [selectedLegId, legs, tripExecutionRef, tripAdditionalRef]);

  // Helper function to update activities in the store
  const updateActivitiesInStore = (legId: string, updatedActivities: any[]) => {
    try {
      // Update the activities in the store
      const updatedLegs = legs.map(leg => 
        leg.id === legId 
          ? { ...leg, activities: updatedActivities }
          : leg
      );
      
      // You can add a method to update the store here
      // For now, we'll just log the updated data
      console.log("Updated legs with new activities:", updatedLegs);
      
      return updatedLegs;
    } catch (error) {
      console.error("Error updating activities in store:", error);
      return null;
    }
  };

  const { getLegDetails, tripData, setTrip } = manageTripStore();
    
  const onSaveActivities = async () => {
    console.log("Saving activities");
    
    // try {
      // Get the selected leg data
      const selectedLegData = legs.find(leg => leg.id === selectedLegId);
      if (!selectedLegData) {
        console.warn("No selected leg found");
        // toast.error('No leg selected');
        return null;
      }
      
      console.log("Selected leg data:", selectedLegData);
      
      // Get the full getLegDetails() data from manageTripStore
      const fullLegDetails = getLegDetails();
      console.log("Full getLegDetails() data:", fullLegDetails);
      
      // Find the leg in the full data by matching the selectedLegData.id
      const legIndex = fullLegDetails.findIndex((leg: any) => leg.LegSequence === selectedLegData.id);
      if (legIndex === -1) {
        console.warn("Leg not found in getLegDetails() data");
        // toast.error('Leg not found in trip data');
        return null;
      }
      
      console.log("Found leg at index:", legIndex, "in getLegDetails() data");
      
      // Get form data from tripExecutionRef
      let formData = null;
      
      if (tripExecutionRef?.current?.getFormValues) {
        try {
          formData = tripExecutionRef.current.getFormValues();
          console.log("Form data from tripExecutionRef:", formData);
        } catch (error) {
          console.warn("tripExecutionRef.getFormValues() failed:", error);
        }
      }
      
      // Fallback to state-based form data
      if (!formData || Object.keys(formData).length === 0) {
        formData = formDataState;
        console.log("Using state-based form data:", formData);
      }
      
      if (!formData) {
        console.warn("No form data available");
        // toast.error('No form data available');
        return null;
      }
      
      // Get the sequence number from form data
      const sequenceNumber = formData.ActivitySeqNo || formData.SeqNo || 1;
      console.log("Sequence number from form:", sequenceNumber);
      
      // Get the current leg's activities
      const currentLeg = fullLegDetails[legIndex];
      const currentActivities = currentLeg.Activities || [];
      console.log("Current activities in leg:", currentActivities);
      
      // Find the activity by sequence number
      const activityIndex = currentActivities.findIndex((activity: any) => 
        activity.SeqNo === sequenceNumber || activity.SeqNo === parseInt(sequenceNumber)
      );
      
      if (activityIndex === -1) {
        console.warn(`Activity with sequence number ${sequenceNumber} not found`);
        // toast.error(`Activity with sequence number ${sequenceNumber} not found`);
        return null;
      }

      console.log("formData ==========================", formData);
      
      // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
      let LastIdentifiedLocationValue = '';
      let LastIdentifiedLocationLabel = '';

      if (typeof formData.LastIdentifiedLocation === 'string' && formData.LastIdentifiedLocation.includes('||')) {
        // If activityName is a string with '||', split it into value and label
        const [value, ...labelParts] = formData.LastIdentifiedLocation.split('||');
        LastIdentifiedLocationValue = value.trim();
        LastIdentifiedLocationLabel = labelParts.join('||').trim();
      } else if (typeof formData.LastIdentifiedLocation === 'string') {
        LastIdentifiedLocationValue = formData.LastIdentifiedLocation;
        LastIdentifiedLocationLabel = formData.LastIdentifiedLocation;
      } else if (typeof formData.LastIdentifiedLocation === 'object' && formData.LastIdentifiedLocation !== null) {
        // In case it's already an object (from dropdown)
        const splitData = splitDropdowns(formData.LastIdentifiedLocation);
        LastIdentifiedLocationValue = splitData.value || '';
        LastIdentifiedLocationLabel = splitData.label || '';
      }

      // Fallback if label is empty, just use value
      if (!LastIdentifiedLocationLabel) LastIdentifiedLocationLabel = LastIdentifiedLocationValue;
      
      console.log("Found activity at index:", activityIndex, "with sequence number:", sequenceNumber);
      
      // Create updated activity with form data
      const currentActivity = currentActivities[activityIndex] as any;
      const updatedActivity = {
        ...currentActivity,
        // Update with form data
        Activity: formData.ActivityName || currentActivity.Activity,
        ActivityDescription: formData.ActivityDescription || currentActivity['ActivityDescription'],
        CustomerID: formData.CustomerID || currentActivity.CustomerID,
        CustomerName: formData.CustomerName || currentActivity.CustomerName,
        ConsignmentInformation: formData.ConsignmentInformation || currentActivity['ConsignmentInformation'],
        CustomerOrder: formData.CustomerOrder || currentActivity['CustomerOrder'],
        PlannedDate: formData.PlannedDate || currentActivity['PlannedDate'],
        PlannedTime: formData.PlannedTime || currentActivity['PlannedTime'],
        RevisedDate: formData.RevisedDate || currentActivity['RevisedDate'],
        RevisedTime: formData.RevisedTime || currentActivity['RevisedTime'],
        ActualDate: formData.ActualDate || currentActivity['ActualDate'],
        ActualTime: formData.ActualTime || currentActivity['ActualTime'],
        DelayedIn: formData.DelayedIn || currentActivity['DelayedIn'],
        // Transform QuickCode objects to separate fields using helper function
        ...transformQuickCodeFields(formData, currentActivity),
        Remarks1: formData.Remarks1 || currentActivity['Remarks1'],
        Remarks2: formData.Remarks2 || currentActivity['Remarks2'],
        Remarks3: formData.Remarks3 || currentActivity['Remarks3'],
        EventProfile: formData.EventProfile || currentActivity['EventProfile'],
        ReasonForChanges: formData.ReasonForChanges || currentActivity['ReasonForChanges'],
        DelayedReason: formData.DelayedReason || currentActivity['DelayedReason'],
        LastIdentifiedLocation: LastIdentifiedLocationValue || currentActivity['LastIdentifiedLocation'],
        LastIdentifiedLocationDescription: LastIdentifiedLocationLabel || currentActivity['LastIdentifiedLocationDescription'],
        // LastIdentifiedLocation: formData.LastIdentifiedLocation || currentActivity['LastIdentifiedLocation'],
        // LastIdentifiedLocationDescription: formData.LastIdentifiedLocationDescription || currentActivity['LastIdentifiedLocationDescription'],
        LastIdentifiedDate: formData.LastIdentifiedDate || currentActivity['LastIdentifiedDate'],
        LastIdentifiedTime: formData.LastIdentifiedTime || currentActivity['LastIdentifiedTime'],
        AmendmentNo: formData.AmendmentNo || currentActivity['AmendmentNo'],
        ModeFlag: 'Update'
        // ModeFlag: formData.ModeFlag || currentActivity['ModeFlag'] || 'Update'
      };
      
      console.log("Updated activity:", updatedActivity);
      
      // Update the activity in the full leg details
      const updatedLegDetails = [...fullLegDetails];
      updatedLegDetails[legIndex] = {
        ...updatedLegDetails[legIndex],
        Activities: [
          ...updatedLegDetails[legIndex].Activities.slice(0, activityIndex),
          updatedActivity,
          ...updatedLegDetails[legIndex].Activities.slice(activityIndex + 1)
        ]
      };
      
      console.log("Updated leg details:", updatedLegDetails[legIndex]);
      console.log("Updated activities array:", updatedLegDetails[legIndex].Activities);
      
      // Handle Additional Activities if tripAdditionalRef is available
      let updatedAdditionalActivity = null;
      if (tripAdditionalRef?.current?.getFormValues) {
        try {
          // Get additional activities form data from tripAdditionalRef
          let additionalFormData = null;
          
          if (tripAdditionalRef?.current?.getFormValues) {
            try {
              additionalFormData = tripAdditionalRef.current.getFormValues();
              console.log("Additional activities form data from tripAdditionalRef:", additionalFormData);
            } catch (error) {
              console.warn("tripAdditionalRef.getFormValues() failed:", error);
            }
          }
          
          // Fallback to state-based form data
          if (!additionalFormData || Object.keys(additionalFormData).length === 0) {
            additionalFormData = additionalFormDataState;
            console.log("Using state-based additional activities form data:", additionalFormData);
          }
          
          if (additionalFormData && Object.keys(additionalFormData).length > 0) {
            // Get the sequence number from additional activities form data
            const additionalSequenceNumber = additionalFormData.firstAdditionalActivitySequence || additionalFormData.Sequence || 1;
            console.log("Additional activities sequence number from form:", additionalSequenceNumber);
            
            // Get the current leg's additional activities
            const currentAdditionalActivities = currentLeg.AdditionalActivities || [];
            console.log("Current additional activities in leg:", currentAdditionalActivities);
            
            // Find the additional activity by sequence number
            const additionalActivityIndex = currentAdditionalActivities.findIndex((activity: any) => 
              activity.Sequence === additionalSequenceNumber || activity.Sequence === parseInt(additionalSequenceNumber)
            );
            
            if (additionalActivityIndex !== -1) {
              console.log("Found additional activity at index:", additionalActivityIndex, "with sequence number:", additionalSequenceNumber);
              // Create updated additional activity with form data
              const currentAdditionalActivity = currentAdditionalActivities[additionalActivityIndex] as any;
              console.log("additionalFormData ===", additionalFormData);
              console.log("currentAdditionalActivity ===", currentAdditionalActivity);
              updatedAdditionalActivity = {
                ...currentAdditionalActivity,
                // Update with form data
                Category: additionalFormData.Category || currentAdditionalActivity.Category,
                Activity: additionalFormData.ActivityName || currentAdditionalActivity.Activity,
                ActivityDescription: additionalFormData.firstAdditionalActivityDescription || currentAdditionalActivity.ActivityDescription,
                PlaceIt: additionalFormData.ActivityPlaceIt || currentAdditionalActivity.PlaceIt,
                ReportedBy: additionalFormData.ReportedBy || currentAdditionalActivity.ReportedBy,
                CustomerOrder: additionalFormData.ActivityCustomerOrder || currentAdditionalActivity.CustomerOrder,
                LocationID: additionalFormData.ActivityLocationID || currentAdditionalActivity.LocationID,
                LocationDescription: additionalFormData.ActivityLocationDescription || currentAdditionalActivity.LocationDescription,
                FromLocation: additionalFormData.FromLocation || currentAdditionalActivity.FromLocation,
                FromLocationDescription: additionalFormData.FromLocationDescription || currentAdditionalActivity.FromLocationDescription,
                ToLocation: additionalFormData.ToLocation || currentAdditionalActivity.ToLocation,
                ToLocationDescription: additionalFormData.ToLocationDescription || currentAdditionalActivity.ToLocationDescription,
                PlannedDate: additionalFormData.ActivityPlannedDate || currentAdditionalActivity.PlannedDate,
                PlannedTime: additionalFormData.ActivityPlannedTime || currentAdditionalActivity.PlannedTime,
                RevisedDate: additionalFormData.RevisedDate || currentAdditionalActivity.RevisedDate,
                RevisedTime: additionalFormData.RevisedTime || currentAdditionalActivity.RevisedTime,
                ActualDate: additionalFormData.ActualDate || currentAdditionalActivity.ActualDate,
                ActualTime: additionalFormData.ActualTime || currentAdditionalActivity.ActualTime,
                Remarks: additionalFormData.Remarks || currentAdditionalActivity.Remarks,
                Remarks1: additionalFormData.Remarks1 || currentAdditionalActivity.Remarks1,
                Remarks2: additionalFormData.Remarks2 || currentAdditionalActivity.Remarks2,
                EventProfile: additionalFormData.ActivityEventProfile || currentAdditionalActivity.EventProfile,
                ModeFlag: 'Update'
              };
              
              console.log("Updated additional activity:", updatedAdditionalActivity);
              
              // Update the additional activity in the leg details
              updatedLegDetails[legIndex] = {
                ...updatedLegDetails[legIndex],
                AdditionalActivities: [
                  ...updatedLegDetails[legIndex].AdditionalActivities.slice(0, additionalActivityIndex),
                  updatedAdditionalActivity,
                  ...updatedLegDetails[legIndex].AdditionalActivities.slice(additionalActivityIndex + 1)
                ]
              };
              
              console.log("Updated additional activities array:", updatedLegDetails[legIndex].AdditionalActivities);
            } else {
              console.log("No additional activity found with sequence number:", additionalSequenceNumber);
            }
          } else {
            console.log("No additional activities form data available");
          }
        } catch (error) {
          console.warn("Error processing additional activities:", error);
        }
      }
      
      // Get the current trip data from the store
      const currentTripData = tripData;
      console.log("Current trip data:", currentTripData);
      
      if (!currentTripData) {
        console.warn("No trip data available in store");
        // toast.error('No trip data available');
        return null;
      }
      
      // Update the trip data with the modified leg details
      const updatedTripData = {
        ...currentTripData,
        LegDetails: updatedLegDetails
      };
      
      console.log("Updated trip data:", updatedTripData);

      try{
        const response = await tripService.saveTrip(updatedTripData);
        console.log("Trip saved response:", response);
        console.log("Trip saved response:", (response as any)?.data?.ResponseData);
        const resourceStatus = (response as any)?.data?.IsSuccess;
        console.log("resourceStatus ===", resourceStatus);
        if(resourceStatus){
          toast({
            title: "✅ Trip Saved Successfully",
            description: (response as any)?.data?.ResponseData.Message,
            variant: "default", // or "success" if you have custom variant
          });
        }else{
          console.log("error as any ===", (response as any)?.data?.Message);
          toast({
            title: "⚠️ Submission failed",
            description: (response as any)?.data?.Message,
            variant: "destructive", // or "success" if you have custom variant
          });
        }
        // const resourceStatus = JSON.parse(response?.data?.ResponseData)[0].Status;
        // const isSuccessStatus = JSON.parse(response?.data?.IsSuccess);
        // if(resourceStatus === "Success" || resourceStatus === "SUCCESS"){
        //   toast({
        //     title: "✅ Form submitted successfully",
        //     description: "Your changes have been saved.",
        //     variant: "default", // or "success" if you have custom variant
        //   });
        // }else{
        //   toast({
        //     title: "⚠️ Submission failed",
        //     description: isSuccessStatus ? JSON.parse(response?.data?.ResponseData)[0].Error_msg : JSON.parse(data?.data?.Message),
        //     variant: "destructive", // or "success" if you have custom variant
        //   });
        // }
      } catch (err) {

      }
      
      // Push the updated trip data back to the store
      if (setTrip) {
        setTrip(updatedTripData);
        console.log("Trip data updated in store");
      } else {
        console.warn("setTrip method not available");
      }
      
      // Create the final data structure for API submission
      // const apiSubmissionData = {
      //   // Updated trip data
      //   updatedTripData: updatedTripData,
        
      //   // Updated leg details
      //   updatedLegDetails: updatedLegDetails,
        
      //   // Specific updated leg
      //   updatedLeg: updatedLegDetails[legIndex],
        
      //   // Updated activity
      //   updatedActivity: updatedActivity,
        
      //   // Form data for reference
      //   formData: formData,
        
      //   // Original data for comparison
      //   originalTripData: currentTripData,
      //   originalLeg: currentLeg,
      //   originalActivity: currentActivities[activityIndex]
      // };
      
      // console.log("API submission data:", apiSubmissionData);
      
      // Show success message
      // toast.success('Activity updated successfully and pushed to trip data');
      
      // return apiSubmissionData;

    // } catch (error) {
    //   console.error("Error saving activities:", error);
    //   toast.error('Error saving activities');
    //   return null;
    // }
  };

  // const onSaveActivities = async () => {
  //   console.log("Saving activities");
    
  //   // try {
  //     // Get the selected leg data
  //     const selectedLegData = legs.find(leg => leg.id === selectedLegId);
  //     if (!selectedLegData) {
  //       console.warn("No selected leg found");
  //       // toast.error('No leg selected');
  //       return null;
  //     }
      
  //     console.log("Selected leg data:", selectedLegData);
      
  //     // Get the full getLegDetails() data from manageTripStore
  //     const fullLegDetails = getLegDetails();
  //     console.log("Full getLegDetails() data:", fullLegDetails);
      
  //     // Find the leg in the full data by matching the selectedLegData.id
  //     const legIndex = fullLegDetails.findIndex((leg: any) => leg.LegSequence === selectedLegData.id);
  //     if (legIndex === -1) {
  //       console.warn("Leg not found in getLegDetails() data");
  //       // toast.error('Leg not found in trip data');
  //       return null;
  //     }
      
  //     console.log("Found leg at index:", legIndex, "in getLegDetails() data");
      
  //     // Collect data from all DynamicPanel forms
  //     const allFormData: any[] = [];
      
  //     // Get data from the main tripExecutionRef
  //     if (tripExecutionRef?.current?.getFormValues) {
  //       try {
  //         const mainFormData = tripExecutionRef.current.getFormValues();
  //         if (mainFormData && Object.keys(mainFormData).length > 0) {
  //           allFormData.push({
  //             formId: 'main-form',
  //             formType: 'main',
  //             data: mainFormData
  //           });
  //           console.log("Main form data:", mainFormData);
  //         }
  //       } catch (error) {
  //         console.warn("tripExecutionRef.getFormValues() failed:", error);
  //       }
  //     }
      
  //     let localFormArray = [];
  //     // Get data from all individual form refs
  //     formRefs.current.forEach((ref, formId) => {
  //       if (ref?.current?.getFormValues) {
  //         try {
  //           const formData = ref.current.getFormValues();
  //           if (formData && Object.keys(formData).length > 0) {
  //             // Remove unwanted fields from formData before pushing to localFormArray
  //             const { NetAmount, id, title, ...cleanedFormData } = formData;
  //             const transformedFormData = transformQuickCodeFields(cleanedFormData, '');
  //             console.log("transformedFormData ", transformedFormData);
  //             console.log("formData ", cleanedFormData);

  //             // Use splitDropdowns to correctly parse activityName value and label from the pipe-separated string
  //             let LastIdentifiedLocationValue = '';
  //             let LastIdentifiedLocationLabel = '';

  //             if (typeof cleanedFormData.LastIdentifiedLocation === 'string' && cleanedFormData.LastIdentifiedLocation.includes('||')) {
  //               // If activityName is a string with '||', split it into value and label
  //               const [value, ...labelParts] = cleanedFormData.LastIdentifiedLocation.split('||');
  //               LastIdentifiedLocationValue = value.trim();
  //               LastIdentifiedLocationLabel = labelParts.join('||').trim();
  //             } else if (typeof cleanedFormData.LastIdentifiedLocation === 'string') {
  //               LastIdentifiedLocationValue = cleanedFormData.LastIdentifiedLocation;
  //               LastIdentifiedLocationLabel = cleanedFormData.LastIdentifiedLocation;
  //             } else if (typeof cleanedFormData.LastIdentifiedLocation === 'object' && cleanedFormData.LastIdentifiedLocation !== null) {
  //               // In case it's already an object (from dropdown)
  //               const splitData = splitDropdowns(cleanedFormData.LastIdentifiedLocation);
  //               LastIdentifiedLocationValue = splitData.value || '';
  //               LastIdentifiedLocationLabel = splitData.label || '';
  //             }

  //             // Fallback if label is empty, just use value
  //             if (!LastIdentifiedLocationLabel) LastIdentifiedLocationLabel = LastIdentifiedLocationValue;

  //             const updatedFormData = {
  //               ...cleanedFormData,
  //               QuickCode1: transformedFormData.QuickCode1 || '',
  //               QuickCode2: transformedFormData.QuickCode2 || '',
  //               QuickCode3: transformedFormData.QuickCode3 || '',
  //               QuickCodeValue1: transformedFormData.QuickCodeValue1 || '',
  //               QuickCodeValue2: transformedFormData.QuickCodeValue2 || '',
  //               QuickCodeValue3: transformedFormData.QuickCodeValue3 || '',
  //               LastIdentifiedLocation: LastIdentifiedLocationValue,
  //               LastIdentifiedLocationDescription: LastIdentifiedLocationLabel,
  //               ModeFlag:
  //                 cleanedFormData.ModeFlag === 'Insert'
  //                   ? 'Insert'
  //                   : (cleanedFormData.ModeFlag === 'NoChange' || !cleanedFormData.ModeFlag)
  //                     ? 'Update'
  //                     : cleanedFormData.ModeFlag
  //             };
  //             allFormData.push({
  //               formId: formId,
  //               formType: 'dynamic',
  //               data: updatedFormData
  //             });
              
  //             // Push cleaned data to localFormArray
  //             localFormArray.push(updatedFormData);
  //             console.log(`Form ${formId} data:`, updatedFormData);
  //             console.log(`Form ${formId} cleaned data (removed NetAmount, id, title):`, cleanedFormData);
  //           }
  //         } catch (error) {
  //           console.warn(`Form ${formId} getFormValues() failed:`, error);
  //         }
  //       }
  //     });
  //     console.log(`localFormArray:`, localFormArray);
      
  //     // Get data from eventsForms (popup created forms)
  //     // eventsForms.forEach((eventForm, index) => {
  //     //   if (eventForm.data && Object.keys(eventForm.data).length > 0) {
  //     //     // Remove unwanted fields from eventForm.data before pushing to localFormArray
  //     //     const { NetAmount, id, title, ...cleanedEventData } = eventForm.data;
          
  //     //     allFormData.push(eventForm.data);
  //     //     // allFormData.push({
  //     //     //   formId: eventForm.id,
  //     //     //   formType: 'event',
  //     //     //   data: eventForm.data,
  //     //     //   title: eventForm.title,
  //     //     //   createdAt: eventForm.createdAt
  //     //     // });
          
  //     //     // Push cleaned data to localFormArray
  //     //     localFormArray.push(cleanedEventData);
  //     //     console.log(`Event form ${eventForm.id} data:`, eventForm.data);
  //     //     console.log(`Event form ${eventForm.id} cleaned data (removed NetAmount, id, title):`, cleanedEventData);
  //     //   }
  //     // });
      
  //     // console.log("All collected form data:", allFormData);
      
  //     // if (allFormData.length === 0) {
  //     //   console.warn("No form data available from any forms");
  //     //   toast({
  //     //     title: "Warning",
  //     //     description: "No form data available to save",
  //     //     variant: "destructive",
  //     //   });
  //     //   return null;
  //     // }
      
  //     // Display summary of collected forms
  //     // console.log(`✅ Successfully collected data from ${allFormData.length} forms:`);
  //     // allFormData.forEach((form, index) => {
  //     //   console.log(`  ${index + 1}. ${form.formType} form (${form.formId}):`, form.data);
  //     //   if (form.title) {
  //     //     console.log(`     Title: ${form.title}`);
  //     //   }
  //     //   if (form.createdAt) {
  //     //     console.log(`     Created: ${form.createdAt}`);
  //     //   }
  //     // });
      
  //     // Show success message with form count
  //     toast({
  //       title: "Forms Collected",
  //       description: `Successfully collected data from ${allFormData.length} forms`,
  //       variant: "default",
  //     });
      
  //     // Use the first form data as the primary data for backward compatibility
  //     // let formData = allFormData[0]?.data || formDataState;
  //     let formData = localFormArray;
      
  //     // Remove unwanted fields from main formData
  //     // if (formData && typeof formData === 'object') {
  //     //   const { NetAmount, id, title, ...cleanedFormData } = formData;
  //     //   formData = cleanedFormData;
  //     //   console.log("Main formData cleaned (removed NetAmount, id, title):", formData);
  //     // }
      
  //     console.log("formData +++++++++++++", formData);
  //     // Get the sequence number from form data
  //     // const sequenceNumber = formData.ActivitySeqNo || formData.SeqNo || 1;
  //     // console.log("Sequence number from form:", sequenceNumber);
      
  //     // Get the current leg's activities
  //     const currentLeg = fullLegDetails[legIndex];
  //     const currentActivities = currentLeg.Activities || [];
  //     console.log("Current activities in leg:", currentActivities);
      
  //     // Find the activity by sequence number
  //     // const activityIndex = currentActivities.findIndex((activity: any) => 
  //     //   activity.SeqNo === sequenceNumber || activity.SeqNo === parseInt(sequenceNumber)
  //     // );
      
  //     // if (activityIndex === -1) {
  //     //   console.warn(`Activity with sequence number ${sequenceNumber} not found`);
  //     //   // toast.error(`Activity with sequence number ${sequenceNumber} not found`);
  //     //   return null;
  //     // }
      
  //     // console.log("Found activity at index:", activityIndex, "with sequence number:", sequenceNumber);
      
  //     // Create updated activity with form data
  //     // const currentActivity = currentActivities[activityIndex] as any;
  //     // const updatedActivity = {
  //     //   ...currentActivity,
  //     //   // Update with form data
  //     //   Activity: formData.ActivityName || currentActivity.Activity,
  //     //   ActivityDescription: formData.ActivityDescription || currentActivity['ActivityDescription'],
  //     //   CustomerID: formData.CustomerID || currentActivity.CustomerID,
  //     //   CustomerName: formData.CustomerName || currentActivity.CustomerName,
  //     //   ConsignmentInformation: formData.ConsignmentInformation || currentActivity['ConsignmentInformation'],
  //     //   CustomerOrder: formData.CustomerOrder || currentActivity['CustomerOrder'],
  //     //   PlannedDate: formData.PlannedDate || currentActivity['PlannedDate'],
  //     //   PlannedTime: formData.PlannedTime || currentActivity['PlannedTime'],
  //     //   RevisedDate: formData.RevisedDate || currentActivity['RevisedDate'],
  //     //   RevisedTime: formData.RevisedTime || currentActivity['RevisedTime'],
  //     //   ActualDate: formData.ActualDate || currentActivity['ActualDate'],
  //     //   ActualTime: formData.ActualTime || currentActivity['ActualTime'],
  //     //   DelayedIn: formData.DelayedIn || currentActivity['DelayedIn'],
  //     //   // Transform QuickCode objects to separate fields using helper function
  //     //   ...transformQuickCodeFields(formData, currentActivity),
  //     //   Remarks1: formData.Remarks1 || currentActivity['Remarks1'],
  //     //   Remarks2: formData.Remarks2 || currentActivity['Remarks2'],
  //     //   Remarks3: formData.Remarks3 || currentActivity['Remarks3'],
  //     //   EventProfile: formData.EventProfile || currentActivity['EventProfile'],
  //     //   ReasonForChanges: formData.ReasonForChanges || currentActivity['ReasonForChanges'],
  //     //   DelayedReason: formData.DelayedReason || currentActivity['DelayedReason'],
  //     //   LastIdentifiedLocation: formData.LastIdentifiedLocation || currentActivity['LastIdentifiedLocation'],
  //     //   LastIdentifiedLocationDescription: formData.LastIdentifiedLocationDescription || currentActivity['LastIdentifiedLocationDescription'],
  //     //   LastIdentifiedDate: formData.LastIdentifiedDate || currentActivity['LastIdentifiedDate'],
  //     //   LastIdentifiedTime: formData.LastIdentifiedTime || currentActivity['LastIdentifiedTime'],
  //     //   AmendmentNo: formData.AmendmentNo || currentActivity['AmendmentNo'],
  //     //   ModeFlag: 'Update'
  //     //   // ModeFlag: formData.ModeFlag || currentActivity['ModeFlag'] || 'Update'
  //     // };
      
  //     // console.log("Updated activity:", updatedActivity);
      
  //     // Update the activity in the full leg details
  //     const updatedLegDetails = [...fullLegDetails];
  //     updatedLegDetails[legIndex] = {
  //       ...updatedLegDetails[legIndex],
  //       Activities: [
  //         // ...updatedLegDetails[legIndex].Activities.slice(0, activityIndex),
  //         ...formData,
  //         // ...updatedLegDetails[legIndex].Activities.slice(activityIndex + 1)
  //       ]
  //     };
      
  //     console.log("Updated leg details:", updatedLegDetails[legIndex]);
  //     console.log("Updated activities array:", updatedLegDetails[legIndex].Activities);
      
  //     // Handle Additional Activities if tripAdditionalRef is available
  //     let updatedAdditionalActivity = null;
  //     if (tripAdditionalRef?.current?.getFormValues) {
  //       try {
  //         // Get additional activities form data from tripAdditionalRef
  //         let additionalFormData = null;
          
  //         if (tripAdditionalRef?.current?.getFormValues) {
  //           try {
  //             additionalFormData = tripAdditionalRef.current.getFormValues();
  //             console.log("Additional activities form data from tripAdditionalRef:", additionalFormData);
  //           } catch (error) {
  //             console.warn("tripAdditionalRef.getFormValues() failed:", error);
  //           }
  //         }
          
  //         // Fallback to state-based form data
  //         if (!additionalFormData || Object.keys(additionalFormData).length === 0) {
  //           additionalFormData = additionalFormDataState;
  //           console.log("Using state-based additional activities form data:", additionalFormData);
  //         }
          
  //         if (additionalFormData && Object.keys(additionalFormData).length > 0) {
  //           // Get the sequence number from additional activities form data
  //           const additionalSequenceNumber = additionalFormData.firstAdditionalActivitySequence || additionalFormData.Sequence || 1;
  //           console.log("Additional activities sequence number from form:", additionalSequenceNumber);
            
  //           // Get the current leg's additional activities
  //           const currentAdditionalActivities = currentLeg.AdditionalActivities || [];
  //           console.log("Current additional activities in leg:", currentAdditionalActivities);
            
  //           // Find the additional activity by sequence number
  //           const additionalActivityIndex = currentAdditionalActivities.findIndex((activity: any) => 
  //             activity.Sequence === additionalSequenceNumber || activity.Sequence === parseInt(additionalSequenceNumber)
  //           );
            
  //           if (additionalActivityIndex !== -1) {
  //             console.log("Found additional activity at index:", additionalActivityIndex, "with sequence number:", additionalSequenceNumber);
  //             // Create updated additional activity with form data
  //             const currentAdditionalActivity = currentAdditionalActivities[additionalActivityIndex] as any;
  //             console.log("additionalFormData ===", additionalFormData);
  //             console.log("currentAdditionalActivity ===", currentAdditionalActivity);
  //             updatedAdditionalActivity = {
  //               ...currentAdditionalActivity,
  //               // Update with form data
  //               Category: additionalFormData.Category || currentAdditionalActivity.Category,
  //               Activity: additionalFormData.ActivityName || currentAdditionalActivity.Activity,
  //               ActivityDescription: additionalFormData.firstAdditionalActivityDescription || currentAdditionalActivity.ActivityDescription,
  //               PlaceIt: additionalFormData.ActivityPlaceIt || currentAdditionalActivity.PlaceIt,
  //               ReportedBy: additionalFormData.ReportedBy || currentAdditionalActivity.ReportedBy,
  //               CustomerOrder: additionalFormData.ActivityCustomerOrder || currentAdditionalActivity.CustomerOrder,
  //               LocationID: additionalFormData.ActivityLocationID || currentAdditionalActivity.LocationID,
  //               LocationDescription: additionalFormData.ActivityLocationDescription || currentAdditionalActivity.LocationDescription,
  //               FromLocation: additionalFormData.FromLocation || currentAdditionalActivity.FromLocation,
  //               FromLocationDescription: additionalFormData.FromLocationDescription || currentAdditionalActivity.FromLocationDescription,
  //               ToLocation: additionalFormData.ToLocation || currentAdditionalActivity.ToLocation,
  //               ToLocationDescription: additionalFormData.ToLocationDescription || currentAdditionalActivity.ToLocationDescription,
  //               PlannedDate: additionalFormData.ActivityPlannedDate || currentAdditionalActivity.PlannedDate,
  //               PlannedTime: additionalFormData.ActivityPlannedTime || currentAdditionalActivity.PlannedTime,
  //               RevisedDate: additionalFormData.RevisedDate || currentAdditionalActivity.RevisedDate,
  //               RevisedTime: additionalFormData.RevisedTime || currentAdditionalActivity.RevisedTime,
  //               ActualDate: additionalFormData.ActualDate || currentAdditionalActivity.ActualDate,
  //               ActualTime: additionalFormData.ActualTime || currentAdditionalActivity.ActualTime,
  //               Remarks: additionalFormData.Remarks || currentAdditionalActivity.Remarks,
  //               Remarks1: additionalFormData.Remarks1 || currentAdditionalActivity.Remarks1,
  //               Remarks2: additionalFormData.Remarks2 || currentAdditionalActivity.Remarks2,
  //               EventProfile: additionalFormData.ActivityEventProfile || currentAdditionalActivity.EventProfile,
  //               ModeFlag: 'Update'
  //             };
              
  //             console.log("Updated additional activity:", updatedAdditionalActivity);
              
  //             // Update the additional activity in the leg details
  //             updatedLegDetails[legIndex] = {
  //               ...updatedLegDetails[legIndex],
  //               AdditionalActivities: [
  //                 ...updatedLegDetails[legIndex].AdditionalActivities.slice(0, additionalActivityIndex),
  //                 updatedAdditionalActivity,
  //                 ...updatedLegDetails[legIndex].AdditionalActivities.slice(additionalActivityIndex + 1)
  //               ]
  //             };
              
  //             console.log("Updated additional activities array:", updatedLegDetails[legIndex].AdditionalActivities);
  //           } else {
  //             console.log("No additional activity found with sequence number:", additionalSequenceNumber);
  //           }
  //         } else {
  //           console.log("No additional activities form data available");
  //         }
  //       } catch (error) {
  //         console.warn("Error processing additional activities:", error);
  //       }
  //     }
      
  //     // Get the current trip data from the store
  //     const currentTripData = tripData;
  //     console.log("Current trip data:", currentTripData);
      
  //     if (!currentTripData) {
  //       console.warn("No trip data available in store");
  //       // toast.error('No trip data available');
  //       return null;
  //     }
      
  //     // Update the trip data with the modified leg details
  //     const updatedTripData = {
  //       ...currentTripData,
  //       LegDetails: updatedLegDetails
  //     };
      
  //     console.log("Updated trip data:", updatedTripData);

  //     try{
  //       const response = await tripService.saveTrip(updatedTripData);
  //       console.log("Trip saved response:", response);
  //       console.log("Trip saved response:", (response as any)?.data?.ResponseData);
  //       const resourceStatus = (response as any)?.data?.IsSuccess;
  //       console.log("resourceStatus ===", resourceStatus);
  //       if(resourceStatus){
  //         toast({
  //           title: "✅ Trip Saved Successfully",
  //           description: (response as any)?.data?.ResponseData.Message,
  //           variant: "default", // or "success" if you have custom variant
  //         });
  //       }else{
  //         console.log("error as any ===", (response as any)?.data?.Message);
  //         toast({
  //           title: "⚠️ Submission failed",
  //           description: (response as any)?.data?.Message,
  //           variant: "destructive", // or "success" if you have custom variant
  //         });
  //       }
  //     } catch (err) {
  //       console.error("Error saving activities:", err);
  //       toast({
  //         title: "⚠️ Submission failed",
  //         description: (err as any)?.data?.Message,
  //         variant: "destructive", // or "success" if you have custom variant
  //       });
  //       // return null;
  //     }
      
  //     // Push the updated trip data back to the store
  //     if (setTrip) {
  //       setTrip(updatedTripData);
  //       console.log("Trip data updated in store");
  //     } else {
  //       console.warn("setTrip method not available");
  //     }
      
  //     // Create the final data structure for API submission
  //     // const apiSubmissionData = {
  //     //   // Updated trip data
  //     //   updatedTripData: updatedTripData,
        
  //     //   // Updated leg details
  //     //   updatedLegDetails: updatedLegDetails,
        
  //     //   // Specific updated leg
  //     //   updatedLeg: updatedLegDetails[legIndex],
        
  //     //   // Updated activity
  //     //   updatedActivity: updatedActivity,
        
  //     //   // Form data for reference
  //     //   formData: formData,
        
  //     //   // Original data for comparison
  //     //   originalTripData: currentTripData,
  //     //   originalLeg: currentLeg,
  //     //   originalActivity: currentActivities[activityIndex]
  //     // };
      
  //     // console.log("API submission data:", apiSubmissionData);
      
  //     // Show success message
  //     // toast.success('Activity updated successfully and pushed to trip data');
      
  //     // return apiSubmissionData;

  //   // } catch (error) {
  //   //   console.error("Error saving activities:", error);
  //   //   toast.error('Error saving activities');
  //   //   return null;
  //   // }
  // };

  const selectedLeg = getSelectedLeg();

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
      Remarks: activity.Remarks || '',
      Remarks1: activity.Remarks1 || '',
      Remarks2: activity.Remarks2 || '',
      EventProfile: activity.EventProfile || '',
      ModeFlag: activity.ModeFlag || 'NoChange',
      
      // Keep original activity data for reference
      ...activity
    }));
  };

  // Handle leg selection and bind data to dynamic panels
  const handleLegSelection = (legId: string) => {
    selectLeg(legId);
    setLoading(false);
    // Increment resetKey to force form re-render
    setResetKey(prev => prev + 1);
    // Find the selected leg data
    const selectedLegData = legs.find(leg => leg.id === legId);
    if (selectedLegData) {
      console.log("Selected leg data:", selectedLegData);
      console.log("Selected leg activities:", selectedLegData.activities);
      
      // Prepare activities data for form binding
      const rawActivitiesData = selectedLegData.activities || [];
      const formattedActivities = formatActivitiesForForm(rawActivitiesData);
      const consignmentsData = selectedLegData.consignments || [];
      
      // Prepare additional activities data for form binding
      const rawAdditionalActivitiesData = selectedLegData.additionalActivities || [];
      const formattedAdditionalActivities = formatAdditionalActivitiesForForm(rawAdditionalActivitiesData);
      
      // Create form data object with activities array
      const formData = {
        // Basic leg information
        legSequence: selectedLegData.id,
        from: selectedLegData.from,
        to: selectedLegData.to,
        distance: selectedLegData.distance,
        duration: selectedLegData.duration,
        
        // Activities array - this is the key data we want to bind
        activities: formattedActivities,
        
        // Individual activity fields for easier form access
        ...(formattedActivities.length > 0 && {
          firstActivity: formattedActivities[0],
          lastActivity: formattedActivities[formattedActivities.length - 1],
          activityCount: formattedActivities.length,
          
          // Bind first activity fields directly for easy access
          ActivitySeqNo: formattedActivities[0].SeqNo,
          ActivityName: formattedActivities[0].Activity,
          ActivityDescription: formattedActivities[0].ActivityDescription,
          CustomerName: formattedActivities[0].CustomerName,
          CustomerID: formattedActivities[0].CustomerID,
          PlannedDate: formattedActivities[0].PlannedDate,
          PlannedTime: formattedActivities[0].PlannedTime,
          CustomerOrder: formattedActivities[0].CustomerOrder,
          EventProfile: formattedActivities[0].EventProfile,
          RevisedDate: formattedActivities[0].RevisedDate,
          RevisedTime: formattedActivities[0].RevisedTime,
          ActualDate: formattedActivities[0].ActualDate,
          ActualTime: formattedActivities[0].ActualTime,
          DelayedIn: formattedActivities[0].DelayedIn,
          QuickCode1: formattedActivities[0].QuickCode1,
          QuickCode2: formattedActivities[0].QuickCode2,
          QuickCode3: formattedActivities[0].QuickCode3,
          QuickCodeValue1: formattedActivities[0].QuickCodeValue1,
          QuickCodeValue2: formattedActivities[0].QuickCodeValue2,
          QuickCodeValue3: formattedActivities[0].QuickCodeValue3,
          Remarks1: formattedActivities[0].Remarks1,
          Remarks2: formattedActivities[0].Remarks2,
          Remarks3: formattedActivities[0].Remarks3,
          ReasonForChanges: formattedActivities[0].ReasonForChanges,
          DelayedReason: formattedActivities[0].DelayedReason,
          LastIdentifiedLocation: formattedActivities[0].LastIdentifiedLocation + '||' + formattedActivities[0].LastIdentifiedLocationDescription,
          // LastIdentifiedLocationDescription: formattedActivities[0].LastIdentifiedLocationDescription,
          LastIdentifiedDate: formattedActivities[0].LastIdentifiedDate,
          LastIdentifiedTime: formattedActivities[0].LastIdentifiedTime,
          AmendmentNo: formattedActivities[0].AmendmentNo,
        }),
        
        // Consignments data
        consignments: consignmentsData,
        
        // Additional leg metadata
        hasInfo: selectedLegData.hasInfo,
        transshipments: selectedLegData.transshipments || []
      };
      
      console.log("Form data to be bound:", formData);
      
      // Store form data in state for later retrieval
      setFormDataState(formData);
      setActivitiesFormData(formattedActivities);
      
      // Create additional activities form data
      const additionalFormData = {
        // Basic leg information
        legSequence: selectedLegData.id,
        from: selectedLegData.from,
        to: selectedLegData.to,
        distance: selectedLegData.distance,
        duration: selectedLegData.duration,
        
        // Additional activities array - this is the key data we want to bind
        additionalActivities: formattedAdditionalActivities,
        
        // Individual additional activity fields for easier form access
        ...(formattedAdditionalActivities.length > 0 && {
          firstAdditionalActivity: formattedAdditionalActivities[0],
          lastAdditionalActivity: formattedAdditionalActivities[formattedAdditionalActivities.length - 1],
          additionalActivityCount: formattedAdditionalActivities.length,
          
          // Bind first additional activity fields directly for easy access
          Sequence: formattedAdditionalActivities[0].Sequence,
          Category: formattedAdditionalActivities[0].Category,
          ActivityName: formattedAdditionalActivities[0].Activity,
          ActivityDescription: formattedAdditionalActivities[0].ActivityDescription,
          ActivityPlaceIt: formattedAdditionalActivities[0].PlaceIt,
          FromLocation: formattedAdditionalActivities[0].FromLocation,
          ToLocation: formattedAdditionalActivities[0].ToLocation,
          Activity: formattedAdditionalActivities[0].Activity,
          RevisedDate: formattedAdditionalActivities[0].RevisedDate,
          ActualDate: formattedAdditionalActivities[0].ActualDate
        }),
        
        // Consignments data
        consignments: consignmentsData,
        
        // Additional leg metadata
        hasInfo: selectedLegData.hasInfo,
        transshipments: selectedLegData.transshipments || []
      };
      console.log("Form data to additionalFormData:", additionalFormData);
      
      // Store additional form data in state for later retrieval
      setAdditionalFormDataState(additionalFormData);
      setAdditionalActivitiesFormData(formattedAdditionalActivities);
      
      // Bind data to tripExecutionRef (Activities panel)
      if (tripExecutionRef?.current?.setFormValues) {
        tripExecutionRef.current.setFormValues(formData.activities[0]);
        console.log("Data bound to tripExecutionRef");
      }
      
      // Bind data to tripAdditionalRef (Additional Activities panel)
      if (tripAdditionalRef?.current?.setFormValues) {
        tripAdditionalRef.current.setFormValues(additionalFormData);
        console.log("Additional activities data bound to tripAdditionalRef");
      }
      setLoading(true);
    }
  };

  const handleAddViaPoint = () => {
    if (!viaPointForm.viaLocation) {
      // toast.error('Please enter via location');
      return;
    }

    const [from, to] = viaPointForm.legFromTo ? viaPointForm.legFromTo.split(' - ') : ['', ''];
    
    addLeg(
      from || viaPointForm.viaLocation,
      to || viaPointForm.viaLocation,
      viaPointForm.viaLocation,
      viaPointForm.plannedDate,
      viaPointForm.plannedTime
    );

    // Reset form
    setViaPointForm({
      legFromTo: '',
      viaLocation: '',
      plannedDate: '',
      plannedTime: '',
    });
    setShowAddViaPointsDialog(false);
    // toast.success('Via point added successfully');
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
    console.log("Legs loaded from API:", legs);
  }, [legs]);

  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [LastIdentifiedLocation, setLastIdentifiedLocation] = useState<any[]>([]);
  const [ReasonForChanges, setReasonForChanges] = useState<any[]>([]);
  const [DelayedReason, setDelayedReason] = useState<any[]>([]);
  const [TripLogActivity, setTripLogActivity] = useState<any[]>([]);
  const [TripLogCustomEventCategory, setTripLogCustomEventCategory] = useState<any[]>([]);
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
    "Activity Name Init"
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
      width: 'third',
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
      width: 'third',
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
      width: 'third',
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
      width: 'third',
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
      width: 'third',
      options: TripLogActivity?.filter((qc: any) => qc.id).map(c => ({ label: `${c.id} || ${c.name}`, value: c.id })),
      events: {
        onChange: (value, event) => {
          console.log('contractType changed:', value);
        }
      }
    },
    RevisedDate: {
      id: "RevisedDate",
      label: "Revised Date and Time",
      fieldType: "date",
      width: 'third',
      value: '',
      mandatory: false,
      visible: true,
      editable: true,
      order: 6,
    },
    ActualDate: {
      id: "ActualDate",
      label: "Actual Date And Time",
      fieldType: "date",
      width: 'third',
      value: "",
      mandatory: false,
      visible: true,
      editable: true,
      order: 7,
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
              Total Legs
              <Badge variant="secondary" className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                {legs.length}
              </Badge>
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setShowAddViaPointsDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legs List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-2">
            {legs.map((leg) => (
              <div
                key={leg.id}
                onClick={() => handleLegSelection(leg.id)}
                className={cn(
                  "p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer space-y-2 relative min-h-[80px]",
                  selectedLegId === leg.id && "border-primary bg-accent"
                )}
              >
                {/* Leg Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-1">
                      <span>{leg.id}:</span>
                      {/* <MapPin className="h-4 w-4 text-muted-foreground" /> */}
                      <div className="flex-1">
                        <span className="font-medium text-sm truncate">{leg.from}</span> - <span className="font-medium text-sm truncate">{leg.to}</span>
                        {/* <div className="text-xs text-muted-foreground">Origin</div> */}
                      </div>
                      <div className="absolute right-1 top-3 inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground whitespace-nowrap badge-blue rounded-2xl">
                        {leg.LegBehaviourDescription}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* {leg.hasInfo && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            <Info className="h-3 w-3" />
                          </Badge>
                        )} */}
                        {/* <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLeg(leg.id);
                            // toast.success('Leg removed successfully');
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                {/* <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{leg.to}</div>
                    <div className="text-xs text-muted-foreground">Destination</div>
                  </div>
                </div> */}

                {/* Distance & Duration */}
                {/* <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{leg.distance}</span>
                  <span>•</span>
                  <span>{leg.duration}</span>
                </div> */}

                {/* API Data - Leg Sequence and Behavior */}
                {leg.id && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bottom-3">
                    <span className="font-medium">{formatDateToDDMMYYYY(leg.PlanStartDate)} {formatTimeTo12Hour(leg.PlanStartTime)} - {formatDateToDDMMYYYY(leg.PlanEndDate)} {formatTimeTo12Hour(leg.PlanEndTime)}</span>
                    
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {!selectedLeg ? (
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
              <TabsTrigger value="activities">Events ({selectedLeg.activities.length})</TabsTrigger>
              <TabsTrigger value="consignment">Consignment ({selectedLeg.consignments.length})</TabsTrigger>
              <TabsTrigger value="transshipment">Transloading ({selectedLeg.transshipments.length})</TabsTrigger>
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
                      {selectedLeg.activities.length}
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
                    
                      {selectedLeg.activities.map((activity) => (
                        <div key={activity.id} className="rounded-lg bg-card">
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-3"> 
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                <Package className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{(activity as any).ActivityDescription} - {formatDateToDDMMYYYY((activity as any).PlannedDate)} {formatTimeTo12Hour((activity as any).PlannedTime)}</div>
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

                          {loading ?
                            <DynamicPanel
                              ref={tripExecutionRef}
                              key="trip-execution-panel"
                              panelId="operational-details"
                              panelTitle="Trip Activities"
                              panelConfig={tripExecutionPanelConfig}
                              formName="operationalDetailsForm"
                              initialData={activity}
                            /> : ''
                            // <DynamicPanel
                            //   ref={getFormRef(`main-${activity.id}`)}
                            //   key={`trip-execution-panel-main-${activity.id}`}
                            //   panelId={`operational-details-main-${activity.id}`}
                            //   panelTitle="Events"
                            //   panelConfig={tripExecutionPanelConfig}
                            //   formName={`operationalDetailsForm-main-${activity.id}`}
                            //   initialData={activity}
                            // /> : ''
                          }
                        </div>
                      ))}

                      {/* New Activity Forms */}
                      {eventsForms.map((activity) => (
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
                      {additionalActivities.length}
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
                      {additionalActivities.map((activity) => (
                        <div key={activity.id} className="rounded-lg bg-card p-4 space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                {activity.icon}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{(activity as any).ActivityDescription} - {formatDateToDDMMYYYY((activity as any).PlannedDate)} {formatTimeTo12Hour((activity as any).PlannedTime)}</div>
                                {/* <div className="text-xs text-muted-foreground">{activity.timestamp}</div> */}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

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
                      ))}

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
            <ConsignmentTrip legId={selectedLegId}/>
          </TabsContent>

          <TabsContent value="transshipment" className="flex-1 flex flex-col m-0">
            {/* Transshipment Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Transloading Details</h3>
                  <Badge variant="secondary" className="h-6 px-2">
                    {selectedLeg.transshipments.length}
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
                      {selectedLeg.transshipments.map((transshipment) => (
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
                    <SelectItem key={leg.id} value={`${leg.from} - ${leg.to}`}>
                      {leg.from} - {leg.to}
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