import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Plus, User, FileText, MapPin, Truck, Package, Calendar, Info, Trash2, RefreshCw, Send, AlertCircle, Download, Filter, CheckSquare, MoreVertical, Container, Box, Boxes, Search, Clock, PackageCheck, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface TripExecutionCreateDrawerScreenProps {
  onClose: () => void;
  tripId?: string;
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
  tripId = 'TRIP00000001'
}) => {
  const [expandedActivities, setExpandedActivities] = useState(true);
  const [expandedAdditional, setExpandedAdditional] = useState(false);
  const [expandedPlanned, setExpandedPlanned] = useState(true);
  const [expandedActuals, setExpandedActuals] = useState(true);
  const [pickupComplete, setPickupComplete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddViaPointsDialog, setShowAddViaPointsDialog] = useState(false);
  
  // Add Via Points dialog state
  const [viaPointForm, setViaPointForm] = useState({
    legFromTo: '',
    viaLocation: '',
    plannedDate: '',
    plannedTime: '',
  });

  // Zustand store
  const { legs, selectedLegId, selectLeg, getSelectedLeg, addLeg, removeLeg } = useTripExecutionDrawerStore();
  const selectedLeg = getSelectedLeg();

  const handleAddViaPoint = () => {
    if (!viaPointForm.viaLocation) {
      toast.error('Please enter via location');
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
    toast.success('Via point added successfully');
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
                onClick={() => selectLeg(leg.id)}
                className={cn(
                  "p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer space-y-2",
                  selectedLegId === leg.id && "border-primary bg-accent"
                )}
              >
                {/* Leg Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{leg.from}</div>
                        <div className="text-xs text-muted-foreground">Origin</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {leg.hasInfo && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            <Info className="h-3 w-3" />
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLeg(leg.id);
                            toast.success('Leg removed successfully');
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{leg.to}</div>
                    <div className="text-xs text-muted-foreground">Destination</div>
                  </div>
                </div>

                {/* Distance & Duration */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{leg.distance}</span>
                  <span>•</span>
                  <span>{leg.duration}</span>
                </div>
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
        <Tabs defaultValue="activities" className="flex-1 flex flex-col">
          <div className="border-b px-6 pt-4">
            <TabsList className="h-10">
              <TabsTrigger value="activities">Activities ({selectedLeg.activities.length})</TabsTrigger>
              <TabsTrigger value="consignment">Consignment ({selectedLeg.consignments.length})</TabsTrigger>
              <TabsTrigger value="transshipment">Transshipment ({selectedLeg.transshipments.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="activities" className="flex-1 flex flex-col m-0">
            {/* Activities Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Activities Details - {selectedLeg.from} to {selectedLeg.to}</h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Activities
                  </Button>
                </div>
              </div>
            </div>

            {/* Activities Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Activities Section */}
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedActivities(!expandedActivities)}
                >
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    Activities
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
                        <div key={activity.id} className="border rounded-lg bg-card">
                          {/* Activity Header */}
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                <Package className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{activity.category} - {activity.subCategory}</div>
                                <div className="text-xs text-muted-foreground">{activity.plannedDate} {activity.plannedTime}</div>
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

                          {/* Activity Details */}
                          <div className="px-4 pb-4 pt-4 border-t space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Planned Date
                                </Label>
                                <Input
                                  value={activity.plannedDate}
                                  className="text-sm h-9"
                                  readOnly
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Planned Time
                                </Label>
                                <Input
                                  value={activity.plannedTime}
                                  className="text-sm h-9"
                                  readOnly
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">
                                  Location
                                </Label>
                                <Input
                                  value={activity.location}
                                  className="text-sm h-9"
                                  readOnly
                                />
                              </div>
                            </div>

                            {activity.remarks && (
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Remarks</Label>
                                <Input
                                  value={activity.remarks}
                                  className="text-sm h-9"
                                  readOnly
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Additional Activities Section */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedAdditional(!expandedAdditional)}
                >
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    Additional Activities
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
                        <div key={activity.id} className="border rounded-lg bg-card p-4 space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                {activity.icon}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{activity.name}</div>
                                <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
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

                          {/* Fields */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Sequence</Label>
                              <Input defaultValue={activity.fields.sequence} className="h-9" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Category</Label>
                              <div className="relative">
                                <Input defaultValue={activity.fields.category} className="pr-8 h-9" />
                                <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">From Location</Label>
                              <Select defaultValue={activity.fields.fromLocation}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pickup">Pickup</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">To Location</Label>
                              <Select defaultValue={activity.fields.toLocation}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pickup">Pickup</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Activity (Event)</Label>
                              <Select defaultValue={activity.fields.activity}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pickup">Pickup</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Revised Date and Time</Label>
                              <div className="relative">
                                <Input defaultValue={activity.fields.revisedDateTime} className="pr-8 h-9" />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">
                                Actual Date and Time <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input defaultValue={activity.fields.actualDateTime} className="pr-8 h-9" />
                                <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Reason for Changes</Label>
                              <Select defaultValue={activity.fields.reasonForChanges}>
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SevenLRC">SevenLRC</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consignment" className="flex-1 flex flex-col m-0">
            {/* Warning Alert */}
            <Alert className="mx-6 mt-4 mb-2 border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm text-orange-800 dark:text-orange-200">
                Kindly take note that the Actual {'<<'} weight/length/wagon quantity {'>>'} is higher than the allowed limit. Please check path constraints for more details.
              </AlertDescription>
            </Alert>

            {/* Consignment Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Consignment Details</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Actuals
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* CO Selection */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
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
              </div>

              {/* Planned Section */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedPlanned(!expandedPlanned)}
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    Planned
                    <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                      5
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
                              <div className="text-2xl font-bold">12 Nos</div>
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

                      {/* Plan List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Plan List</h5>
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
                                <TableHead className="w-[150px]">Wagon ID Type</TableHead>
                                <TableHead className="w-[150px]">Container ID Type</TableHead>
                                <TableHead className="w-[120px]">Hazardous Goods</TableHead>
                                <TableHead className="w-[280px]">Departure and Arrival</TableHead>
                                <TableHead className="w-[200px]">Plan From & To Date</TableHead>
                                <TableHead className="w-[120px]">Price</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[1, 2, 3].map((item) => (
                                <TableRow key={item}>
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
                                      {item > 1 ? (
                                        <Badge variant="outline" className="h-6 w-6 p-0 rounded-full flex items-center justify-center border-orange-500 text-orange-500">
                                          <AlertCircle className="h-4 w-4" />
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
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
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4 rotate-90" />
                            <ChevronDown className="h-4 w-4 rotate-90 -ml-2" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4 rotate-90" />
                          </Button>
                          {[1, 2, 3, 4, 5].map((page) => (
                            <Button
                              key={page}
                              size="sm"
                              variant={currentPage === page ? "default" : "outline"}
                              className="h-8 w-8 p-0"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                          <span className="text-sm text-muted-foreground px-2">...</span>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            10
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <ChevronDown className="h-4 w-4 -rotate-90" />
                            <ChevronDown className="h-4 w-4 -rotate-90 -ml-2" />
                          </Button>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-muted-foreground">Go to</span>
                            <Input type="number" className="h-8 w-16 text-center" defaultValue="12" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actuals Section */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between cursor-pointer p-2 -mx-2 rounded hover:bg-muted/50"
                  onClick={() => setExpandedActuals(!expandedActuals)}
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    Actuals
                    <Badge variant="secondary" className="rounded-full h-5 px-2 text-xs">
                      5
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
                              <div className="text-2xl font-bold">12 Nos</div>
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

                      {/* Actual List */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">Actual List</h5>
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
                                <TableHead className="w-[150px]">Wagon ID Type</TableHead>
                                <TableHead className="w-[150px]">Container ID Type</TableHead>
                                <TableHead className="w-[120px]">Hazardous Goods</TableHead>
                                <TableHead className="w-[280px]">Departure and Arrival</TableHead>
                                <TableHead className="w-[200px]">Plan From & To Date</TableHead>
                                <TableHead className="w-[120px]">Price</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[1, 2, 3].map((item) => (
                                <TableRow key={item}>
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
                                      {item > 1 ? (
                                        <Badge variant="outline" className="h-6 w-6 p-0 rounded-full flex items-center justify-center border-orange-500 text-orange-500">
                                          <AlertCircle className="h-4 w-4" />
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
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
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transshipment" className="flex-1 flex flex-col m-0">
            {/* Transshipment Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Transshipment Details</h3>
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
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
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
              </div>

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
                  <h4 className="font-semibold">Transshipment List</h4>
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

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
        </>
        )}
      </div>
    </motion.div>

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
    </>
  );
};

