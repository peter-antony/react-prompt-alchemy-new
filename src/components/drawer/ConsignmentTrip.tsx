import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, ChevronDown, ChevronUp, Plus, User, FileText, MapPin, Truck, Package, Calendar, Info, Trash2, RefreshCw, Send, AlertCircle, Download, Filter, CheckSquare, MoreVertical, Container, Box, Boxes, Search, Clock, PackageCheck, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '../ui/card';
import { useTripExecutionDrawerStore } from '@/stores/tripExecutionDrawerStore';

export const ConsignmentTrip = ({ legId }) => {
  const [expandedPlanned, setExpandedPlanned] = useState(true);
  const [expandedActuals, setExpandedActuals] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pickupComplete, setPickupComplete] = useState(false);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState('0');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>(null);
  const [plannedData, setPlannedData] = useState<any[]>([]);
  const [actualData, setActualData] = useState<any[]>([]);
  const [currentLeg, setCurrentLeg] = useState<string | null>(null);

  const { getConsignments } = useTripExecutionDrawerStore();
  const consignments = getConsignments(legId) || [];

  // 🧩 Step 1: Build Customer Order dropdown list
  const buildCustomerOrderList = (consignments: any[] = []) => {
    return consignments.map((item, index) => ({
      label: `${item.CustomerID || '-'} — ${item.CustomerName || "-"}`,
      value: index.toString(),
      departureFrom: item.DepartureFrom,
      departureTo: item.DepartureTo,
      loadType: item.LoadType,
      serviceDesc: item.ServiceDescription,
      subServiceDesc: item.SubServiceDescription,
      customerRefNo: item.CustomerReferenceNo,
      SourceBRId: item.SourceBRId,
      ReturnBRId: item.ReturnBRId,
    }));
  };

  // 🧩 Step 2: Load fresh data whenever legId changes
  useEffect(() => {
    if (!legId) return;

    // detect leg change
    if (legId !== currentLeg) {
      setCurrentLeg(legId);

      const cons = getConsignments(legId) || [];
      if (cons.length > 0) {
        const list = buildCustomerOrderList(cons);
        setCustomerList(list);

        // ✅ reset selection to 0 for new leg
        setSelectedCustomerIndex('0');
        const selected = cons[0];
        setSelectedCustomerData(selected);
        setPlannedData(selected?.Planned ?? []);
        setActualData(selected?.Actual ?? []);
        console.log('Planned legid', plannedData, actualData);
      } else {
        // reset everything if no consignment for new leg
        setCustomerList([]);
        setSelectedCustomerIndex('');
        setSelectedCustomerData(null);
        setPlannedData([]);
        setActualData([]);
        console.log('Planned No', plannedData, actualData);
      }
    }
  }, [legId]); // only on leg change

  // 🧩 Step 3: Keep selection stable if same leg data updates
  useEffect(() => {
    if (currentLeg && consignments.length > 0) {
      const list = buildCustomerOrderList(consignments);
      setCustomerList(list);

      const selectedIndex = parseInt(selectedCustomerIndex || '0', 10);
      const selected = consignments[selectedIndex];
      if (selected) {
        setSelectedCustomerData(selected);
        setPlannedData(selected?.Planned ?? []);
        setActualData(selected?.Actual ?? []);
        // console.log('Planned select', plannedData,actualData);
      }
    }
  }, [consignments]); // re-sync planned/actual if store updates

  // 🧩 Step 4: Handle dropdown change
  const handleCustomerChange = (indexValue: string) => {
    setSelectedCustomerIndex(indexValue);
    const index = parseInt(indexValue, 10);
    const selected = consignments[index];
    setSelectedCustomerData(selected);
    setPlannedData(selected?.Planned ?? []);
    setActualData(selected?.Actual ?? []);
    console.log('Planned changed:', plannedData, actualData);
  };

  return (
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
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
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
        <div className='space-y-2 p-4 bg-muted/30 rounded-lg'>
          {/* 🔹 CO Info Section */}
          {selectedCustomerData && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="font-medium text-gray-700">Departure: </span>
                {selectedCustomerData?.DepartureFrom || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Arrival: </span>
                {selectedCustomerData?.DepartureTo || "-"}
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
                {selectedCustomerData?.serviceDesc || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Sub Service: </span>
                {selectedCustomerData?.subServiceDesc || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer Ref No: </span>
                {selectedCustomerData?.CustomerRefNo || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Source BR ID: </span>
                {selectedCustomerData?.SourceBRID || "-"}
              </div>
              <div>
                <span className="font-medium text-gray-700">Return BR ID: </span>
                {selectedCustomerData?.ReturnBRID || "-"}
              </div>
            </div>
          )}
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
  );
};