import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Truck, Container as ContainerIcon, Package, Box, Calendar, Info } from 'lucide-react';
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

interface PlanActualDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
}) => {
  const { wagonItems, activeWagonId, setActiveWagon, updateActualsData, getWagonData } = usePlanActualStore();
  
  const [expandedSections, setExpandedSections] = useState({
    wagon: true,
    container: true,
    product: true,
    thu: true,
    journey: true,
    other: false,
  });

  const [selectedItems, setSelectedItems] = useState<WagonItem[]>([
    { id: 'WAG00000001', name: 'WAG00000001', description: 'Habbins', price: '€ 1395.00', checked: true },
    { id: 'WAG00000002', name: 'WAG00000002', description: 'Zaccs', price: '€ 1395.00', checked: false },
    { id: 'WAG00000003', name: 'WAG00000003', description: 'A Type Wagon', price: '€ 1395.00', checked: false },
    { id: 'WAG00000004', name: 'WAG00000004', description: 'Closed Wagon', price: '€ 1395.00', checked: false },
  ]);

  const [selectAll, setSelectAll] = useState(false);

  const handleItemClick = (item: WagonItem) => {
    setActiveWagon(item.id);
  };

  // Get current wagon's actuals data
  const currentWagonData = activeWagonId ? getWagonData(activeWagonId) : null;
  const actualsData = currentWagonData?.actuals || {};
  const plannedData = currentWagonData?.planned || {};

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

      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Sidebar - Items List */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          {/* Select All */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
              />
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
              <Button size="icon" variant="default" className="h-8 w-8">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "p-3 border rounded-md bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                  item.checked && "border-primary bg-accent",
                  activeWagonId === item.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItemCheck(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-blue-600">{item.name}</div>
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
                    <div className="text-xs text-muted-foreground mb-2">{item.description}</div>
                    <div className="text-sm font-medium text-blue-600">{item.price}</div>
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
          <Tabs defaultValue="actuals" className="flex-1 flex flex-col">
            <div className="border-b px-6 pt-4">
              <TabsList>
                <TabsTrigger value="planned">Planned</TabsTrigger>
                <TabsTrigger value="actuals">Actuals</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="planned" className="flex-1 m-0 overflow-y-auto p-6 space-y-4">
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
                      Wagon 1
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
                            <div className="text-sm font-medium">Habbins</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon ID</div>
                            <div className="text-sm font-medium">HAB3243</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Quantity</div>
                            <div className="text-sm font-medium">1 EA</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Tare Weight</div>
                            <div className="text-sm font-medium">100 TON</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Gross Weight</div>
                            <div className="text-sm font-medium">100 TON</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Length</div>
                            <div className="text-sm font-medium">2139 M</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Wagon Sequence</div>
                            <div className="text-sm font-medium">1A</div>
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
                      Container 1
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
                            <div className="text-sm font-medium">Container A</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container ID</div>
                            <div className="text-sm font-medium">CONT3243</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Quantity</div>
                            <div className="text-sm font-medium">1 EA</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Tare Weight</div>
                            <div className="text-sm font-medium">100 TON</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Container Load Weight</div>
                            <div className="text-sm font-medium">100 TON</div>
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
                      Wheat Muslin
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
                            <div className="text-sm font-medium">Yes</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">NHM</div>
                            <div className="text-sm font-medium">2WQ1E32R43</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product ID</div>
                            <div className="text-sm font-medium">Wheat Muslin</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Product Quantity</div>
                            <div className="text-sm font-medium">100 TON</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Class of Stores</div>
                            <div className="text-sm font-medium">Class A</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">UN Code</div>
                            <div className="text-sm font-medium">2432</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">DG Class</div>
                            <div className="text-sm font-medium">AAA</div>
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
                      THU 5
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
                            <div className="text-sm font-medium">THU329847</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Serial No.</div>
                            <div className="text-sm font-medium">TH23300000/2025</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Quantity</div>
                            <div className="text-sm font-medium">10 EA</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">THU Weight</div>
                            <div className="text-sm font-medium">10 TON</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Journey and Scheduling Details - Planned */}
              <div className="border rounded-lg bg-card">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection('journey')}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Journey and Scheduling Details</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      10-Mar-2025
                    </Badge>
                    {expandedSections.journey ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSections.journey && (
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
                            <div className="text-xs text-muted-foreground mb-1">Departure</div>
                            <div className="text-sm font-medium">Frankfurt Station Point A</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Arrival</div>
                            <div className="text-sm font-medium">Frankfurt Station Point B</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Activity Location</div>
                            <div className="text-sm font-medium">Frankfurt Station</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Activity</div>
                            <div className="text-sm font-medium">Loading</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Planned Date and Time</div>
                            <div className="text-sm font-medium">10-Mar-2025 10:00 AM</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Rev. Planned Date and Time</div>
                            <div className="text-sm font-medium">10-Mar-2025 10:00 AM</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Train No.</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Load Type</div>
                            <div className="text-sm font-medium">Loaded</div>
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
                            <div className="text-sm font-medium">12-Mar-2025 08:00 AM</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">To Date and Time</div>
                            <div className="text-sm font-medium">12-Mar-2025 08:00 AM</div>
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
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 2</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Remarks 3</div>
                            <div className="text-sm font-medium">---</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>

            <TabsContent value="actuals" className="flex-1 m-0 overflow-y-auto p-6 space-y-4">
              {/* Wagon Details */}
              <SimpleDynamicPanel
                title="Wagon Details"
                config={[
                  {
                    fieldType: 'lazyselect',
                    key: 'wagonType',
                    label: 'Wagon Type',
                    fetchOptions: async ({ searchTerm, offset, limit }) => {
                      const allOptions = [
                        { label: 'Habbins', value: 'habbins' },
                        { label: 'Zaccs', value: 'zaccs' },
                        { label: 'A Type Wagon', value: 'a-type' },
                        { label: 'Closed Wagon', value: 'closed' },
                      ];
                      const filtered = searchTerm
                        ? allOptions.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
                        : allOptions;
                      return filtered.slice(offset, offset + limit);
                    },
                    onChange: (selected) => updateCurrentActuals({ wagonType: selected?.value }),
                  },
                  {
                    fieldType: 'search',
                    key: 'wagonId',
                    label: 'Wagon ID',
                    placeholder: 'Search Wagon ID',
                    onChange: (value) => updateCurrentActuals({ wagonId: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'wagonQuantity',
                    label: 'Wagon Quantity',
                    placeholder: 'Enter quantity',
                    onChange: (value) => updateCurrentActuals({ wagonQuantity: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'wagonQuantityUnit',
                    label: 'Unit',
                    options: [
                      { label: 'EA', value: 'EA' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ wagonQuantityUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'wagonTareWeight',
                    label: 'Wagon Tare Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ wagonTareWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'wagonTareWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ wagonTareWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'wagonGrossWeight',
                    label: 'Wagon Gross Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ wagonGrossWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'wagonGrossWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ wagonGrossWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'wagonLength',
                    label: 'Wagon Length',
                    placeholder: 'Enter length',
                    onChange: (value) => updateCurrentActuals({ wagonLength: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'wagonLengthUnit',
                    label: 'Unit',
                    options: [
                      { label: 'M', value: 'M' },
                      { label: 'FT', value: 'FT' },
                    ],
                    onChange: (value) => updateCurrentActuals({ wagonLengthUnit: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'wagonSequence',
                    label: 'Wagon Sequence',
                    placeholder: 'Enter sequence',
                    onChange: (value) => updateCurrentActuals({ wagonSequence: value }),
                  },
                 ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />

              {/* Container Details */}
              <SimpleDynamicPanel
                title="Container Details"
                config={[
                  {
                    fieldType: 'select',
                    key: 'containerType',
                    label: 'Container Type',
                    options: [
                      { label: '20ft Standard', value: '20ft' },
                      { label: '40ft Standard', value: '40ft' },
                      { label: 'Container A', value: 'container-a' },
                    ],
                    onChange: (value) => updateCurrentActuals({ containerType: value }),
                  },
                  {
                    fieldType: 'search',
                    key: 'containerId',
                    label: 'Container ID',
                    placeholder: 'Search Container ID',
                    onChange: (value) => updateCurrentActuals({ containerId: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'containerQuantity',
                    label: 'Container Quantity',
                    placeholder: 'Enter quantity',
                    onChange: (value) => updateCurrentActuals({ containerQuantity: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'containerQuantityUnit',
                    label: 'Unit',
                    options: [{ label: 'EA', value: 'EA' }],
                    onChange: (value) => updateCurrentActuals({ containerQuantityUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'containerTareWeight',
                    label: 'Container Tare Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ containerTareWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'containerTareWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ containerTareWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'containerLoadWeight',
                    label: 'Container Load Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ containerLoadWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'containerLoadWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ containerLoadWeightUnit: value }),
                  },
                ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />

              {/* Product Details */}
              <SimpleDynamicPanel
                title="Product Details"
                config={[
                  {
                    fieldType: 'radio',
                    key: 'hazardousGoods',
                    label: 'Hazardous Goods',
                    options: [
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' },
                    ],
                    onChange: (value) => updateCurrentActuals({ hazardousGoods: value === 'yes' }),
                  },
                  {
                    fieldType: 'select',
                    key: 'nhm',
                    label: 'NHM',
                    options: [
                      { label: '2WQ1E32R43', value: '2WQ1E32R43' },
                      { label: 'NHM 1', value: 'nhm1' },
                      { label: 'NHM 2', value: 'nhm2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ nhm: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'productId',
                    label: 'Product ID',
                    placeholder: 'Enter Product ID',
                    onChange: (value) => updateCurrentActuals({ productId: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'productQuantity',
                    label: 'Product Quantity',
                    placeholder: 'Enter quantity',
                    onChange: (value) => updateCurrentActuals({ productQuantity: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'productQuantityUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'EA', value: 'EA' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ productQuantityUnit: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'classOfStores',
                    label: 'Class of Stores',
                    options: [
                      { label: 'Class A', value: 'class-a' },
                      { label: 'Class 1', value: 'class1' },
                      { label: 'Class 2', value: 'class2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ classOfStores: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'unCode',
                    label: 'UN Code',
                    options: [
                      { label: '2432', value: '2432' },
                      { label: 'UN 1', value: 'un1' },
                      { label: 'UN 2', value: 'un2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ unCode: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'dgClass',
                    label: 'DG Class',
                    options: [
                      { label: 'AAA', value: 'AAA' },
                      { label: 'DG 1', value: 'dg1' },
                      { label: 'DG 2', value: 'dg2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ dgClass: value }),
                  },
                 ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />

              {/* THU Details */}
              <SimpleDynamicPanel
                title="THU Details"
                config={[
                  {
                    fieldType: 'select',
                    key: 'thuId',
                    label: 'THU ID',
                    options: [
                      { label: 'THU329847', value: 'THU329847' },
                      { label: 'THU 1', value: 'thu1' },
                      { label: 'THU 2', value: 'thu2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ thuId: value }),
                  },
                  {
                    fieldType: 'text',
                    key: 'thuQuantity',
                    label: 'THU Quantity',
                    placeholder: 'Enter quantity',
                    onChange: (value) => updateCurrentActuals({ thuQuantity: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'thuQuantityUnit',
                    label: 'Unit',
                    options: [{ label: 'EA', value: 'EA' }],
                    onChange: (value) => updateCurrentActuals({ thuQuantityUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuGrossWeight',
                    label: 'THU Gross Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ thuGrossWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'thuGrossWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ thuGrossWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuTareWeight',
                    label: 'THU Tare Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ thuTareWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'thuTareWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ thuTareWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuNetWeight',
                    label: 'THU Net Weight',
                    placeholder: 'Enter weight',
                    onChange: (value) => updateCurrentActuals({ thuNetWeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'thuNetWeightUnit',
                    label: 'Unit',
                    options: [
                      { label: 'TON', value: 'TON' },
                      { label: 'KG', value: 'KG' },
                    ],
                    onChange: (value) => updateCurrentActuals({ thuNetWeightUnit: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuLength',
                    label: 'THU Length',
                    placeholder: 'Enter length',
                    onChange: (value) => updateCurrentActuals({ thuLength: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuWidth',
                    label: 'THU Width',
                    placeholder: 'Enter width',
                    onChange: (value) => updateCurrentActuals({ thuWidth: value }),
                  },
                  {
                    fieldType: 'currency',
                    key: 'thuHeight',
                    label: 'THU Height',
                    placeholder: 'Enter height',
                    onChange: (value) => updateCurrentActuals({ thuHeight: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'thuDimensionUnit',
                    label: 'Dimension Unit',
                    options: [
                      { label: 'M', value: 'M' },
                      { label: 'CM', value: 'CM' },
                    ],
                    onChange: (value) => updateCurrentActuals({ thuLengthUnit: value, thuWidthUnit: value, thuHeightUnit: value }),
                  },
                ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />

              {/* Journey and Scheduling Details */}
              <SimpleDynamicPanel
                title="Journey and Scheduling Details"
                config={[
                  {
                    fieldType: 'select',
                    key: 'departure',
                    label: 'Departure',
                    options: [
                      { label: 'Frankfurt Station Point A', value: 'frankfurt-a' },
                      { label: 'Frankfurt Station Point B', value: 'frankfurt-b' },
                    ],
                    onChange: (value) => updateCurrentActuals({ departure: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'destination',
                    label: 'Destination',
                    options: [
                      { label: 'Frankfurt Station Point A', value: 'frankfurt-a' },
                      { label: 'Frankfurt Station Point B', value: 'frankfurt-b' },
                    ],
                    onChange: (value) => updateCurrentActuals({ destination: value }),
                  },
                  {
                    fieldType: 'date',
                    key: 'fromDate',
                    label: 'From Date',
                    onChange: (value) => updateCurrentActuals({ fromDate: value }),
                  },
                  {
                    fieldType: 'time',
                    key: 'fromTime',
                    label: 'From Time',
                    onChange: (value) => updateCurrentActuals({ fromTime: value }),
                  },
                  {
                    fieldType: 'date',
                    key: 'toDate',
                    label: 'To Date',
                    onChange: (value) => updateCurrentActuals({ toDate: value }),
                  },
                  {
                    fieldType: 'time',
                    key: 'toTime',
                    label: 'To Time',
                    onChange: (value) => updateCurrentActuals({ toTime: value }),
                  },
                ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />

              {/* Other Details */}
              <SimpleDynamicPanel
                title="Other Details"
                config={[
                  {
                    fieldType: 'select',
                    key: 'qcUserdefined1',
                    label: 'QC Userdefined 1',
                    options: [
                      { label: 'QC 1', value: 'qc1' },
                      { label: 'QC 2', value: 'qc2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ qcUserdefined1: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'qcUserdefined2',
                    label: 'QC Userdefined 2',
                    options: [
                      { label: 'QC 1', value: 'qc1' },
                      { label: 'QC 2', value: 'qc2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ qcUserdefined2: value }),
                  },
                  {
                    fieldType: 'select',
                    key: 'qcUserdefined3',
                    label: 'QC Userdefined 3',
                    options: [
                      { label: 'QC 1', value: 'qc1' },
                      { label: 'QC 2', value: 'qc2' },
                    ],
                    onChange: (value) => updateCurrentActuals({ qcUserdefined3: value }),
                  },
                  {
                    fieldType: 'textarea',
                    key: 'remarks1',
                    label: 'Remarks 1',
                    placeholder: 'Enter remarks',
                    onChange: (value) => updateCurrentActuals({ remarks1: value }),
                  },
                  {
                    fieldType: 'textarea',
                    key: 'remarks2',
                    label: 'Remarks 2',
                    placeholder: 'Enter remarks',
                    onChange: (value) => updateCurrentActuals({ remarks2: value }),
                  },
                  {
                    fieldType: 'textarea',
                    key: 'remarks3',
                    label: 'Remarks 3',
                    placeholder: 'Enter remarks',
                    onChange: (value) => updateCurrentActuals({ remarks3: value }),
                  },
                ] as PanelFieldConfig[]}
                initialData={actualsData}
                onDataChange={(data) => updateCurrentActuals(data)}
                className="border-0 shadow-none"
              />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="border-t p-4 flex items-center justify-end gap-2">
            <Button variant="outline">Move to Transshipment</Button>
            <Button>Save Actual Details</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
