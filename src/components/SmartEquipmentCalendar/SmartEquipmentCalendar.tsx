import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EquipmentCalendarViewProps, EquipmentItem, EquipmentCalendarEvent } from '@/types/equipmentCalendar';
import { format, addHours, addDays, startOfDay, endOfDay, differenceInMinutes, differenceInDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

const eventTypeColors = {
  trip: 'bg-blue-200 text-blue-900 border-blue-300',
  maintenance: 'bg-orange-200 text-orange-900 border-orange-300',
  hold: 'bg-muted text-muted-foreground border-border',
};

export const SmartEquipmentCalendar = ({
  equipments,
  events,
  view: initialView = 'day',
  startDate: initialStartDate,
  showHourView: initialShowHourView = false,
  statusFilter: initialStatusFilter = 'all',
  selectedEquipments: initialSelectedEquipments = [],
  onViewChange,
  onShowHourViewChange,
  onStatusFilterChange,
  onSelectionChange,
  onAddToTrip,
  onBarClick,
  onEquipmentClick,
}: EquipmentCalendarViewProps) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>(initialView);
  const [startDate, setStartDate] = useState<Date>(initialStartDate || new Date());
  const [showHourView, setShowHourView] = useState(initialShowHourView);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(initialSelectedEquipments);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Filter equipments by status
  const filteredEquipments = statusFilter === 'all' 
    ? equipments 
    : equipments.filter(eq => eq.status === statusFilter);

  const ROW_HEIGHT = 60;
  
  // Consistent slot widths across all views
  const SLOT_WIDTH_HOUR = 80; // Width for each hour slot (in pixels)
  const SLOT_WIDTH_DAY = 120; // Width for each day slot (in pixels)

  // Calculate statistics
  const totalWagons = equipments.length;
  const availableNow = equipments.filter(eq => eq.status === 'available').length;
  const inWorkshop = equipments.filter(eq => eq.status === 'workshop').length;
  const activeTrips = events.filter(e => {
    const now = new Date();
    const eventStart = new Date(e.start);
    const eventEnd = new Date(e.end);
    return e.type === 'trip' && eventStart <= now && eventEnd >= now;
  }).length;

  // Handle view change
  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    setView(newView);
    onViewChange?.(newView);
  };

  // Handle show hour view toggle
  const handleShowHourViewChange = (checked: boolean) => {
    setShowHourView(checked);
    onShowHourViewChange?.(checked);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilterChange?.(value);
  };

  // Handle selection change
  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedEquipments(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Navigation handlers
  const handlePrevious = () => {
    let newDate: Date;
    if (view === 'day') {
      newDate = addDays(startDate, -1);
    } else if (view === 'week') {
      newDate = addDays(startDate, -7);
    } else {
      newDate = addMonths(startOfMonth(startDate), -1);
    }
    setStartDate(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    if (view === 'day') {
      newDate = addDays(startDate, 1);
    } else if (view === 'week') {
      newDate = addDays(startDate, 7);
    } else {
      newDate = addMonths(startOfMonth(startDate), 1);
    }
    setStartDate(newDate);
  };

  const handleToday = () => {
    setStartDate(new Date());
  };

  // Generate timeline header labels
  const getTimelineLabels = () => {
    const labels = [];
    
    if (view === 'month') {
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(startDate);
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      
      for (let i = 0; i < daysInMonth; i++) {
        const day = addDays(monthStart, i);
        labels.push({
          label: format(day, 'd'),
          fullLabel: format(day, 'EEE\nMMM d'),
          date: day,
        });
      }
      return labels;
    }
    
    if (view === 'day') {
      if (showHourView) {
        for (let i = 0; i < 24; i++) {
          const hour = addHours(startOfDay(startDate), i);
          labels.push({
            label: i === 0 ? format(startDate, 'EEE d') : format(hour, 'ha').toLowerCase(),
            fullLabel: format(hour, 'HH:00'),
            date: hour,
            isDayStart: i === 0,
          });
        }
      } else {
        labels.push({
          label: format(startDate, 'EEE d'),
          fullLabel: format(startDate, 'EEEE, MMM d'),
          date: startDate,
        });
      }
    } else if (view === 'week') {
      if (showHourView) {
        for (let d = 0; d < 7; d++) {
          const day = addDays(startOfDay(startDate), d);
          for (let h = 0; h < 24; h++) {
            const hour = addHours(day, h);
            labels.push({
              label: h === 0 ? format(day, 'EEE d') : format(hour, 'ha').toLowerCase(),
              fullLabel: format(hour, 'MMM d, ha'),
              date: hour,
              isDayStart: h === 0,
            });
          }
        }
      } else {
        for (let d = 0; d < 7; d++) {
          const day = addDays(startOfDay(startDate), d);
          labels.push({
            label: format(day, 'EEE d'),
            fullLabel: format(day, 'EEEE, MMM d'),
            date: day,
          });
        }
      }
    }
    
    return labels;
  };

  const timelineLabels = getTimelineLabels();

  // Calculate bar position and width
  const calculateBarPosition = (event: EquipmentCalendarEvent) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    if (view === 'month') {
      const monthStart = startOfMonth(startDate);
      const monthEnd = endOfMonth(startDate);
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const daysFromStart = differenceInDays(startOfDay(eventStart), monthStart);
      const duration = Math.max(1, differenceInDays(startOfDay(eventEnd), startOfDay(eventStart)) + 1);

      // Use fixed pixel-based positions so bars align exactly with day slots
      const left = Math.max(0, daysFromStart) * SLOT_WIDTH_DAY;
      const width = Math.max(1, duration) * SLOT_WIDTH_DAY;
      return { left, width, usePixels: true };
    } else if (view === 'week') {
      if (showHourView) {
        const viewStart = startOfDay(startDate);
        const hoursFromStart = differenceInMinutes(eventStart, viewStart) / 60;
        const duration = differenceInMinutes(eventEnd, eventStart) / 60;
        
        const leftPercent = (hoursFromStart / (7 * 24)) * 100;
        const widthPercent = (duration / (7 * 24)) * 100;
        return { leftPercent: Math.max(0, leftPercent), widthPercent: Math.max(0.5, widthPercent), usePixels: false };
      } else {
        const viewStart = startOfDay(startDate);
        const daysFromStart = differenceInDays(startOfDay(eventStart), viewStart);
        const duration = differenceInDays(endOfDay(eventEnd), startOfDay(eventStart));
        
        const leftPercent = (daysFromStart / 7) * 100;
        const widthPercent = (duration / 7) * 100;
        return { leftPercent: Math.max(0, leftPercent), widthPercent: Math.max(2, widthPercent), usePixels: false };
      }
    } else {
      // day view
      if (showHourView) {
        const viewStart = startOfDay(startDate);
        const minutesFromStart = differenceInMinutes(eventStart, viewStart);
        const duration = differenceInMinutes(eventEnd, eventStart);
        
        const leftPercent = (minutesFromStart / (24 * 60)) * 100;
        const widthPercent = (duration / (24 * 60)) * 100;
        return { leftPercent: Math.max(0, leftPercent), widthPercent: Math.max(1, widthPercent), usePixels: false };
      } else {
        return { leftPercent: 0, widthPercent: 100, usePixels: false };
      }
    }
  };

  // Get current view date range
  const getViewDateRange = () => {
    const viewStart = startOfDay(startDate);
    let viewEnd: Date;
    
    if (view === 'day') {
      viewEnd = endOfDay(startDate);
    } else if (view === 'week') {
      viewEnd = endOfDay(addDays(startDate, 6));
    } else {
      // month
      viewEnd = endOfMonth(startDate);
    }
    
    return { viewStart, viewEnd };
  };

  // Get events for a specific equipment that fall within the current view
  const getEventsForEquipment = (equipmentId: string) => {
    const { viewStart, viewEnd } = getViewDateRange();
    
    return events.filter(e => {
      if (e.equipmentId !== equipmentId) return false;
      
      const eventStart = new Date(e.start);
      const eventEnd = new Date(e.end);
      
      // Check if event overlaps with current view
      return eventStart <= viewEnd && eventEnd >= viewStart;
    });
  };

  const handleEquipmentSelect = (equipmentId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedEquipments, equipmentId]
      : selectedEquipments.filter(id => id !== equipmentId);
    handleSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    handleSelectionChange(checked ? filteredEquipments.map(eq => eq.id) : []);
  };

  const handleBarClickInternal = (event: EquipmentCalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onBarClick?.(event);
  };

  // Sync vertical scroll between left panel and timeline, and horizontal scroll between header and timeline
  useEffect(() => {
    const handleTimelineScroll = () => {
      if (timelineRef.current && leftPanelRef.current) {
        leftPanelRef.current.scrollTop = timelineRef.current.scrollTop;
      }
      if (timelineRef.current && headerRef.current) {
        headerRef.current.scrollLeft = timelineRef.current.scrollLeft;
      }
    };

    const handleHeaderScroll = () => {
      if (headerRef.current && timelineRef.current) {
        timelineRef.current.scrollLeft = headerRef.current.scrollLeft;
      }
    };

    const timeline = timelineRef.current;
    const header = headerRef.current;
    
    timeline?.addEventListener('scroll', handleTimelineScroll);
    header?.addEventListener('scroll', handleHeaderScroll);

    return () => {
      timeline?.removeEventListener('scroll', handleTimelineScroll);
      header?.removeEventListener('scroll', handleHeaderScroll);
    };
  }, []);

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      {/* Header with view controls */}
      <div className="border-b bg-background p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Rail Fleet Calendar</h2>
            <span className="text-sm text-muted-foreground">
              Manage wagon availability and trip scheduling
            </span>
          </div>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={(v) => handleViewChange(v as any)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="show-hour-view" 
                checked={showHourView}
                onCheckedChange={(checked) => handleShowHourViewChange(checked as boolean)}
              />
              <label htmlFor="show-hour-view" className="text-sm cursor-pointer">
                Show Hour View
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span>In Workshop</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(startDate, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="workshop">In Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Equipment List */}
        <div className="border-r bg-background flex flex-col w-[400px]">
          <div className="border-b p-3 bg-muted/50 font-medium text-sm flex items-center gap-3">
            <Checkbox 
              checked={selectedEquipments.length === filteredEquipments.length && filteredEquipments.length > 0}
              onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
            />
            <span className="flex-1">Wagon ID</span>
            <span className="w-24">Type</span>
            <span className="w-24">Capacity</span>
          </div>
          <ScrollArea className="flex-1" ref={leftPanelRef}>
            <div>
              {filteredEquipments.map((equipment) => (
                <div
                  key={equipment.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 border-b transition-colors hover:bg-accent/50"
                  )}
                  style={{ height: ROW_HEIGHT }}
                >
                  <Checkbox 
                    checked={selectedEquipments.includes(equipment.id)}
                    onCheckedChange={(checked) => handleEquipmentSelect(equipment.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div 
                    className="flex-1 min-w-0 cursor-pointer font-medium text-sm" 
                    onClick={() => onEquipmentClick?.(equipment)}
                  >
                    {equipment.title}
                  </div>
                  <span className="w-24 text-sm truncate">{equipment.type || '-'}</span>
                  <span className="w-24 text-sm truncate">{equipment.capacity || '-'}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Header */}
          <div ref={headerRef} className="border-b bg-muted/30 overflow-x-scroll scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex min-w-max">
              {timelineLabels.map((label, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "text-center py-2 px-2 text-xs font-medium border-r flex-shrink-0",
                    label.isDayStart && "border-l-2 border-l-primary bg-muted/70 font-semibold"
                  )}
                  style={{
                    width: (view === 'month' || !showHourView) ? `${SLOT_WIDTH_DAY}px` : `${SLOT_WIDTH_HOUR}px`
                  }}
                  title={label.fullLabel}
                >
                  <div className="whitespace-pre-line">{label.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Body */}
          <div className="flex-1 overflow-auto scrollbar-thin" ref={timelineRef} style={{ scrollbarWidth: 'thin' }}>
            <div className="relative min-w-max" style={{ minHeight: filteredEquipments.length * ROW_HEIGHT }}>
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none flex">
                {timelineLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "border-r border-border/30 flex-shrink-0",
                      label.isDayStart && "border-l-2 border-l-primary/30"
                    )}
                    style={{
                      width: (view === 'month' || !showHourView) ? `${SLOT_WIDTH_DAY}px` : `${SLOT_WIDTH_HOUR}px`
                    }}
                  />
                ))}
              </div>
              {filteredEquipments.map((_, idx) => (
                <div
                  key={idx}
                  className="absolute left-0 right-0 border-b border-border/30"
                  style={{ top: (idx + 1) * ROW_HEIGHT }}
                />
              ))}

              {/* Event bars */}
              {filteredEquipments.map((equipment, equipmentIdx) => {
                const equipmentEvents = getEventsForEquipment(equipment.id);
                
                return equipmentEvents.map((event) => {
                  const position = calculateBarPosition(event);
                  const top = equipmentIdx * ROW_HEIGHT + 8;
                  const height = ROW_HEIGHT - 16;

                  const positionStyle = position.usePixels
                    ? {
                        left: `${position.left}px`,
                        width: `${position.width}px`,
                      }
                    : {
                        left: `${position.leftPercent}%`,
                        width: `${position.widthPercent}%`,
                      };

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => handleBarClickInternal(event, e)}
                      className={cn(
                        "absolute rounded border text-xs px-2 py-1 flex flex-col justify-center shadow-sm cursor-pointer transition-all hover:shadow-md hover:brightness-95",
                        eventTypeColors[event.type]
                      )}
                      style={{
                        ...positionStyle,
                        top: `${top}px`,
                        height: `${height}px`,
                      }}
                      title={`${event.label}\n${format(new Date(event.start), 'MMM d, HH:mm')} - ${format(new Date(event.end), 'MMM d, HH:mm')}`}
                    >
                      <div className="truncate font-semibold leading-tight">{event.label}</div>
                      {event.type === 'trip' && (
                        <div className="truncate text-[10px] opacity-80">
                          {(event as any).code || 'CO001'}
                        </div>
                      )}
                      <div className="truncate text-[10px] opacity-80">
                        {format(new Date(event.start), 'ha')} - {format(new Date(event.end), 'ha')}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Statistics */}
      <div className="border-t bg-muted/30 px-4 py-3 flex items-center gap-8">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Wagons</span>
          <span className="text-2xl font-bold">{totalWagons}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Available Now</span>
          <span className="text-2xl font-bold text-green-600">{availableNow}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Active Trips</span>
          <span className="text-2xl font-bold text-blue-600">{activeTrips}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">In Workshop</span>
          <span className="text-2xl font-bold text-orange-600">{inWorkshop}</span>
        </div>
      </div>
    </Card>
  );
};
