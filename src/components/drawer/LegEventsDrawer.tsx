import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Clock, MapPin, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useTripLegandEventsStore } from '@/stores/tripLegandEventsStore';
import { tripService } from '@/api/services/tripService';

interface Activity {
  id: string;
  type: 'Arrived at Destination' | 'Departed at Source' | 'Loaded';
  status?: string;
  plannedDate: Date;
  plannedTime: string;
}

interface Leg {
  id: string;
  sequence: number;
  from: string;
  to: string;
  type: string;
  badge?: string;
  customer: string;
  orderNo: string;
}

interface LegEventsDrawerProps {
  tripId: string;
  tripStartDate?: Date;
  tripStartTime?: string;
  tripEndDate?: Date;
  tripEndTime?: string;
  legStartDate?: Date;
  legStartTime?: string;
  legEndDate?: Date;
  legEndTime?: string;
  legs?: Leg[];
  activities?: Activity[];
  onSave?: () => Promise<void>;
}

export const LegEventsDrawer: React.FC<LegEventsDrawerProps> = ({
  tripId,
  tripStartDate = new Date(2025, 2, 10),
  tripStartTime = '10:00AM',
  tripEndDate = new Date(2025, 2, 15),
  tripEndTime = '12:00PM',
  legStartDate = new Date(2025, 2, 10),
  legStartTime = '10:00AM',
  legEndDate = new Date(2025, 2, 10),
  legEndTime = '12:00PM',
  legs = [
    {
      id: '1',
      sequence: 1,
      from: 'Berlin',
      to: 'Berlin',
      type: 'Pickup',
      badge: 'success',
      customer: 'ABC Customer',
      orderNo: 'CO00000001',
    },
    {
      id: '2',
      sequence: 2,
      from: 'Berlin',
      to: 'Frankfurt',
      type: 'Via',
      badge: 'info',
      customer: 'ABC Customer',
      orderNo: 'CO00000001',
    },
    {
      id: '3',
      sequence: 3,
      from: 'Frankfurt',
      to: 'Paris',
      type: 'Bhub',
      badge: 'secondary',
      customer: 'Multiple',
      orderNo: 'Multiple',
    },
  ],
  activities = [
    {
      id: '1',
      type: 'Arrived at Destination',
      status: '1d 2h 45m Delayed',
      plannedDate: new Date(2025, 2, 10),
      plannedTime: '10:20 AM',
    },
    {
      id: '2',
      type: 'Departed at Source',
      plannedDate: new Date(2025, 2, 10),
      plannedTime: '10:20 AM',
    },
    {
      id: '3',
      type: 'Loaded',
      plannedDate: new Date(2025, 2, 10),
      plannedTime: '10:20 AM',
    },
  ],
  onSave,
}) => {
  const [selectedLegIndex, setSelectedLegIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const isReadOnly = true; // or from props, e.g. props.readOnly

  // Store bindings (destructured in a single selector to avoid multiple subscriptions)
  const data = useTripLegandEventsStore((s) => s.data);
  const isLoading = useTripLegandEventsStore((s) => s.isLoading);
  const loadFromApi = useTripLegandEventsStore((s) => s.loadFromApi);
  const updateHeaderField = useTripLegandEventsStore((s) => s.updateHeaderField);
  const updateLegField = useTripLegandEventsStore((s) => s.updateLegField);
  const addActivityToStore = useTripLegandEventsStore((s) => s.addActivity);
  const updateActivityField = useTripLegandEventsStore((s) => s.updateActivityField);
  const saveTripData = useTripLegandEventsStore((s) => s.saveTripData);

  const [localTripStartDate, setLocalTripStartDate] = useState(tripStartDate);
  const [localTripStartTime, setLocalTripStartTime] = useState(tripStartTime);
  const [localTripEndDate, setLocalTripEndDate] = useState(tripEndDate);
  const [localTripEndTime, setLocalTripEndTime] = useState(tripEndTime);
  const [localLegStartDate, setLocalLegStartDate] = useState(legStartDate);
  const [localLegStartTime, setLocalLegStartTime] = useState(legStartTime);
  const [localLegEndDate, setLocalLegEndDate] = useState(legEndDate);
  const [localLegEndTime, setLocalLegEndTime] = useState(legEndTime);
  const [isLegStartDateOpen, setIsLegStartDateOpen] = useState(false);
  const [isLegEndDateOpen, setIsLegEndDateOpen] = useState(false);
  const [activityDatePopoverStates, setActivityDatePopoverStates] = useState<Record<string, boolean>>({});

  // Helpers
  const parseDate = (value?: string | null): Date | undefined => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  };

  // Derive legs and activities from store if available
  const storeLegs = useMemo<Leg[]>(() => {
    const legDetails = data?.LegDetails || [];
    if (!legDetails.length) return [];
    return legDetails.map((leg, i) => {
      // Get first activity if exists
      const firstActivity = leg.Activities && leg.Activities.length > 0 ? leg.Activities[0] : null;
      return {
        id: String(i + 1),
        sequence: Number(leg.LegSequence) || i + 1,
        from: leg.DeparturePointDescription || leg.DeparturePoint || '-',
        to: leg.ArrivalPointDescription || leg.ArrivalPoint || '-',
        type: leg.LegBehaviourDescription || leg.LegBehaviour || '',
        customer: firstActivity?.CustomerName || firstActivity?.CustomerID || 'Unknown',
        orderNo: firstActivity?.CustomerOrder || 'Unknown',
      };
    });
  }, [data?.LegDetails]);

  const storeActivities = useMemo<Activity[]>(() => {
    const leg = data?.LegDetails?.[selectedLegIndex];
    const acts = leg?.Activities || [];
    if (!acts.length) return [];
    return acts.map((a, idx) => ({
      id: String(idx + 1),
      type: (a as any).ActivityDescription || (a as any).Activity || 'Activity',
      status: undefined,
      plannedDate: parseDate((a as any).PlannedDate) || new Date(),
      plannedTime: (a as any).PlannedTime || '00:00',
    }));
  }, [data?.LegDetails, selectedLegIndex]);

  const effectiveLegs = storeLegs.length ? storeLegs : [];
  const effectiveActivities = storeActivities.length ? storeActivities : [];

  // Sync initial dates from store when available
  useEffect(() => {
    if (!data) return;
    const hdr = data.Header;
    const tsd = parseDate(hdr?.PlanStartDate || undefined) || localTripStartDate;
    const ted = parseDate(hdr?.PlanEndDate || undefined) || localTripEndDate;
    setLocalTripStartDate(tsd);
    setLocalTripEndDate(ted);
    if (hdr?.PlanStartTime) setLocalTripStartTime(hdr.PlanStartTime);
    if (hdr?.PlanEndTime) setLocalTripEndTime(hdr.PlanEndTime);
  }, [data]);

  useEffect(() => {
    const leg = data?.LegDetails?.[selectedLegIndex];
    if (!leg) return;
    const lsd = parseDate(leg.PlanStartDate || undefined) || localLegStartDate;
    const led = parseDate(leg.PlanEndDate || undefined) || localLegEndDate;
    setLocalLegStartDate(lsd);
    setLocalLegEndDate(led);
    if (leg.PlanStartTime) setLocalLegStartTime(leg.PlanStartTime);
    if (leg.PlanEndTime) setLocalLegEndTime(leg.PlanEndTime);
  }, [data?.LegDetails, selectedLegIndex]);

  // Auto-load from API by tripId when component mounts/changes
  useEffect(() => {
    if (!tripId) return;
    // Load only if store is empty or different tripId
    if (!data || (useTripLegandEventsStore.getState().lastLoadedTripId !== tripId)) {
      loadFromApi({ tripId }).catch(() => {});
    }
  }, [tripId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Get fresh data from store
      const dataToSave = saveTripData();
      console.log('dataToSave = ', dataToSave);
      if (!dataToSave) {
        throw new Error('No data to save');
      }
      // Send to API
      const response: any = await tripService.saveLegAndEventsTripLevel(dataToSave);
      console.log('response = ', response);
      
      // Check if response has data
      if (response?.data) {
        const { IsSuccess, ResponseData, Message } = response.data;
        
        // Parse ResponseData if it exists (it's a JSON string)
        let parsedResponseData: any = null;
        if (ResponseData) {
          try {
            parsedResponseData = JSON.parse(ResponseData);
          } catch (parseError) {
            console.warn('Failed to parse ResponseData:', parseError);
          }
        }
        
        // Check for error in parsed ResponseData even if IsSuccess is true
        if (parsedResponseData?.error) {
          const { errorCode, errorMessage } = parsedResponseData.error;
          toast({
            title: errorCode || "Error",
            description: errorMessage || Message || "Failed to save leg and events",
            variant: "destructive",
          });
          return;
        }
        
        // If IsSuccess is true and no error in ResponseData, show success
        if (IsSuccess) {
          toast({
            title: "Success",
            description: Message || "Leg and events saved successfully",
          });
          // Refresh data from API after successful save
          if (tripId) {
            await loadFromApi({ tripId });
          }
          // Also call the optional onSave callback if provided
          if (onSave) {
            await onSave();
          }
        } else {
          throw new Error(Message || "Failed to save leg and events");
        }
      } else {
        throw new Error("No response data received");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save leg and events",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeClass = (badge?: string) => {
    const badgeMap: Record<string, string> = {
      success: 'bg-green-100 text-green-800 border-green-200',
      info: 'bg-pink-100 text-pink-800 border-pink-200',
      secondary: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return badgeMap[badge || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Arrived at Destination':
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'Departed at Source':
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case 'Loaded':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const toHHMM = (timeStr = "") => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5); // returns HH:MM
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {/* <div className="sticky top-0 z-20 px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Leg and Events</h2>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {tripId}
          </Badge>
        </div>
      </div> */}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading trip details...</div>
          )}
          {/* Trip Level Dates */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trip Start Date 
                {/* <span className="text-red-500">*</span> */}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isReadOnly}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localTripStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                          {localTripStartDate ? format(localTripStartDate, "dd-MMM-yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                          selected={localTripStartDate}
                          onSelect={(date) => {
                            if (!date) return;
                            setLocalTripStartDate(date);
                            try { updateHeaderField('PlanStartDate', format(date, 'yyyy-MM-dd') as any); } catch {}
                          }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trip Start Time 
                {/* <span className="text-red-500">*</span> */}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isReadOnly}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                          {toHHMM(localTripStartTime)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Input
                    type="time"
                          value={localTripStartTime}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLocalTripStartTime(v);
                            try { updateHeaderField('PlanStartTime', v as any); } catch {}
                          }}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trip End Date 
                {/* <span className="text-red-500">*</span> */}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isReadOnly}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localTripEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localTripEndDate ? format(localTripEndDate, "dd-MMM-yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                          selected={localTripEndDate}
                          onSelect={(date) => {
                            if (!date) return;
                            setLocalTripEndDate(date);
                            try { updateHeaderField('PlanEndDate', format(date, 'yyyy-MM-dd') as any); } catch {}
                          }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Trip End Time 
                {/* <span className="text-red-500">*</span> */}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isReadOnly}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {toHHMM(localTripEndTime)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Input
                    type="time"
                          value={localTripEndTime}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLocalTripEndTime(v);
                            try { updateHeaderField('PlanEndTime', v as any); } catch {}
                          }}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Leg Level Section */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-[400px_1fr] gap-6">
              {/* Left Panel - Legs List */}
              <div className="space-y-3">
                <div className="flex items-center mb-2 gap-2">
                  <h3 className="text-sm font-semibold">Total Legs</h3>
                  <Badge variant="outline" className="rounded-full">
                    {effectiveLegs?.length}
                  </Badge>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {effectiveLegs.map((leg: any, index: any) => (
                      <Card
                        key={leg.id + index}
                        className={cn(
                          "p-3 cursor-pointer transition-all hover:shadow-md",
                          selectedLegIndex === index && "border-primary ring-2 ring-primary/20"
                        )}
                        onClick={() => setSelectedLegIndex(index)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">
                                {leg.sequence} : {leg.from}
                              </span>
                              <ArrowRight className="h-3 w-3" />
                              <span className="text-sm font-semibold">{leg.to}</span>
                            </div>
                            <Badge className={cn("text-xs rounded-2xl", getBadgeClass(leg.badge))}>
                              {leg.type}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* <Badge className={cn("text-xs", getBadgeClass(leg.badge))}>
                              {leg.type}
                            </Badge> */}
                            {/* <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
                            </Badge> */}
                          </div>

                          <div className="text-xs space-y-1 grid grid-cols-2">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{leg.customer}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>{leg.orderNo}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Panel - Leg Details and Activities */}
              <div className="space-y-6">
                {/* Leg Date/Time Fields */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Leg Start Date</Label>
                    <Popover open={isLegStartDateOpen} onOpenChange={setIsLegStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localLegStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localLegStartDate ? format(localLegStartDate, "dd-MMM-yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localLegStartDate}
                          onSelect={(date) => {
                            if (!date) return;
                            setLocalLegStartDate(date);
                            try { updateLegField(selectedLegIndex, 'PlanStartDate' as any, format(date, 'yyyy-MM-dd')); } catch {}
                            setIsLegStartDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Leg Start Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {toHHMM(localLegStartTime)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <Input
                          type="time"
                          value={toHHMM(localLegStartTime)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLocalLegStartTime(v);
                            try { updateLegField(selectedLegIndex, 'PlanStartTime' as any, v); } catch {}
                          }}
                          className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Leg End Date</Label>
                    <Popover open={isLegEndDateOpen} onOpenChange={setIsLegEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !localLegEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localLegEndDate ? format(localLegEndDate, "dd-MMM-yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localLegEndDate}
                          onSelect={(date) => {
                            if (!date) return;
                            setLocalLegEndDate(date);
                            try { updateLegField(selectedLegIndex, 'PlanEndDate' as any, format(date, 'yyyy-MM-dd')); } catch {}
                            setIsLegEndDateOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Leg End Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          {toHHMM(localLegEndTime)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="start">
                        <Input
                          type="time"
                          value={toHHMM(localLegEndTime)}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLocalLegEndTime(v);
                            try { updateLegField(selectedLegIndex, 'PlanEndTime' as any, v); } catch {}
                          }}
                          className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Activities Tabs */}
                <Tabs defaultValue="activities" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="activities">Activities</TabsTrigger>
                      <TabsTrigger value="additional">Additional Activities</TabsTrigger>
                    </TabsList>
                    <Button variant="outline" size="sm" onClick={() => {
                      try { addActivityToStore(selectedLegIndex); } catch {}
                    }}>
                      <span className="text-primary">+</span>
                      <span className="ml-1">Add</span>
                    </Button>
                  </div>

                  <TabsContent value="activities" className="mt-0">
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-2 gap-6">
                        {effectiveActivities.map((activity, idx) => (
                          <Card key={activity.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                                  <div>
                                    <h4 className="font-semibold text-sm">{activity.type}</h4>
                                    {activity.status && (
                                      <Badge variant="outline" className="mt-1 text-xs bg-red-50 text-red-700 border-red-200">
                                        {activity.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Planned Date</Label>
                                  <Popover 
                                    open={activityDatePopoverStates[`${selectedLegIndex}-${idx}`] || false}
                                    onOpenChange={(open) => setActivityDatePopoverStates(prev => ({...prev, [`${selectedLegIndex}-${idx}`]: open}))}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-3 w-3" />
                                        {format(activity.plannedDate, "dd-MMM-yyyy")}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={activity.plannedDate}
                                        onSelect={(date) => {
                                          if (!date) return;
                                          try { updateActivityField(selectedLegIndex, idx, 'PlannedDate' as any, format(date, 'yyyy-MM-dd')); } catch {}
                                          setActivityDatePopoverStates(prev => ({...prev, [`${selectedLegIndex}-${idx}`]: false}));
                                        }}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs text-muted-foreground">Planned Time</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <Clock className="mr-2 h-3 w-3" />
                                        {toHHMM(activity.plannedTime)}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-2" align="start">
                                      <Input
                                        type="time"
                                        value={toHHMM(activity.plannedTime)}
                                        onChange={(e) => {
                                          const v = e.target.value;
                                          try { updateActivityField(selectedLegIndex, idx, 'PlannedTime' as any, v); } catch {}
                                        }}
                                        className="w-full"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="additional" className="mt-0">
                    <div className="text-center text-muted-foreground py-8">
                      No additional activities
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 px-6 py-4 border-t bg-card">
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="px-8">
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};