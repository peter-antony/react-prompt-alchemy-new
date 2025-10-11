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

interface IncidentsDrawerScreenProps {
  onClose?: () => void;
}

interface FormData {
  incidentId: string;
  incidentStatus: string;
  incidentType: string;
  incidentDate: string;
  incidentTime: string;
  placeOfIncident: string;
  createdDate: string;
  weatherCondition: string;
  driverFault: string;
  vehicleFault: string;
  detailedDescription: string;
  maintenanceRequired: boolean;
  accidentType: string;
  causeCode: string;
  incidentResolution: string;
  maintenanceType: string;
  wagon: string;
  container: string;
  workType: string;
  workCategory: string;
  workGroup: string;
  maintenanceDescription: string;
  incidentCausedBy: string;
  incidentCauserName: string;
  incidentReportedBy: string;
  incidentCloseDate: string;
  riskInvolved: string;
  dangerousGoods: string;
  loadTime: string;
  refDocNo: string;
  mobileRefIncidentId: string;
  remarks: string;
  workOrderNumber: string;
  workOrderStatus: string;
  workRequestNumber: string;
  workRequestStatus: string;
  errorMessage: string;
  claimRequired: boolean;
  claimNo: string;
  claimStatus: string;
}

interface Incident {
  id: string;
  status: 'Open' | 'In Progress' | 'Closed';
  formData: FormData;
}

const initialFormData: FormData = {
  incidentId: '',
  incidentStatus: '',
  incidentType: '',
  incidentDate: '',
  incidentTime: '',
  placeOfIncident: '',
  createdDate: '',
  weatherCondition: '',
  driverFault: '',
  vehicleFault: '',
  detailedDescription: '',
  maintenanceRequired: false,
  accidentType: '',
  causeCode: '',
  incidentResolution: '',
  maintenanceType: '',
  wagon: '',
  container: '',
  workType: '',
  workCategory: '',
  workGroup: '',
  maintenanceDescription: '',
  incidentCausedBy: '',
  incidentCauserName: '',
  incidentReportedBy: '',
  incidentCloseDate: '',
  riskInvolved: '',
  dangerousGoods: '',
  loadTime: '',
  refDocNo: '',
  mobileRefIncidentId: '',
  remarks: '',
  workOrderNumber: 'WON00000001',
  workOrderStatus: 'In Progress',
  workRequestNumber: 'WRN00000001',
  workRequestStatus: 'Draft',
  errorMessage: 'Not Applicable',
  claimRequired: false,
  claimNo: 'CL00000001',
  claimStatus: 'Initiated',
};

const initialIncidents: Incident[] = [
  { 
    id: 'INC000001', 
    status: 'Open', 
    formData: { 
      ...initialFormData, 
      incidentId: 'INC000001', 
      incidentStatus: 'open',
      incidentType: 'accident',
      placeOfIncident: 'warehouse',
      detailedDescription: 'First incident - Open status'
    } 
  },
  { 
    id: 'INC000002', 
    status: 'In Progress', 
    formData: { 
      ...initialFormData, 
      incidentId: 'INC000002', 
      incidentStatus: 'in-progress',
      incidentType: 'breakdown',
      placeOfIncident: 'highway',
      detailedDescription: 'Second incident - In Progress status'
    } 
  },
  { 
    id: 'INC000003', 
    status: 'Open', 
    formData: { 
      ...initialFormData, 
      incidentId: 'INC000003', 
      incidentStatus: 'open',
      incidentType: 'delay',
      placeOfIncident: 'city',
      detailedDescription: 'Third incident - Open status'
    } 
  },
  { 
    id: 'INC000004', 
    status: 'Closed', 
    formData: { 
      ...initialFormData, 
      incidentId: 'INC000004', 
      incidentStatus: 'closed',
      incidentType: 'theft',
      placeOfIncident: 'warehouse',
      detailedDescription: 'Fourth incident - Closed status'
    } 
  },
  { 
    id: 'INC000005', 
    status: 'Open', 
    formData: { 
      ...initialFormData, 
      incidentId: 'INC000005', 
      incidentStatus: 'open',
      incidentType: 'accident',
      placeOfIncident: 'highway',
      detailedDescription: 'Fifth incident - Open status'
    } 
  },
];

export const IncidentsDrawerScreen: React.FC<IncidentsDrawerScreenProps> = ({ onClose }) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (incidents.length > 0) {
      const firstIncident = incidents[0];
      setSelectedIncident(firstIncident);
      setFormData(firstIncident.formData);
    }
  }, []);

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

  const handleSave = () => {
    if (selectedIncident) {
      const newStatus: 'Open' | 'In Progress' | 'Closed' = 
        formData.incidentStatus === 'open' ? 'Open' : 
        formData.incidentStatus === 'in-progress' ? 'In Progress' : 'Closed';
      
      const updatedIncident: Incident = { 
        ...selectedIncident, 
        formData, 
        status: newStatus 
      };
      setIncidents(prev => 
        prev.map(inc => 
          inc.id === selectedIncident.id ? updatedIncident : inc
        )
      );
      setSelectedIncident(updatedIncident);
    } else {
      const newStatus: 'Open' | 'In Progress' | 'Closed' = 
        formData.incidentStatus === 'open' ? 'Open' : 
        formData.incidentStatus === 'in-progress' ? 'In Progress' : 'Closed';
      
      const newIncident: Incident = {
        id: `INC${String(incidents.length + 1).padStart(6, '0')}`,
        status: newStatus,
        formData,
      };
      setIncidents(prev => [...prev, newIncident]);
      setSelectedIncident(newIncident);
    }
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

  return (
    <div className="flex flex-col h-full">
      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Incident List */}
        <div className="w-[30%] border-r border-border bg-muted/30 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">All Incidents</h3>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddNew}>
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
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    isSelected ? 'bg-accent border-primary' : ''
                  }`}
                  onClick={() => handleIncidentClick(incident)}
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm font-medium">{incident.id}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(incident.status)} text-xs font-medium`}>
                        {incident.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteIncident(index, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="incidentId">Incident ID <span className="text-destructive">*</span></Label>
                <Input
                  id="incidentId"
                  value={formData.incidentId}
                  onChange={(e) => handleInputChange('incidentId', e.target.value)}
                  placeholder="Enter incident ID"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="incidentStatus">Incident Status <span className="text-destructive">*</span></Label>
                <Select value={formData.incidentStatus} onValueChange={(value) => handleInputChange('incidentStatus', value)}>
                  <SelectTrigger id="incidentStatus">
                    <SelectValue placeholder="Select Incident Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
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
                      <Select value={formData.incidentType} onValueChange={(value) => handleInputChange('incidentType', value)}>
                        <SelectTrigger id="incidentType">
                          <SelectValue placeholder="Select Incident Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="breakdown">Breakdown</SelectItem>
                          <SelectItem value="delay">Delay</SelectItem>
                          <SelectItem value="theft">Theft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentDate">Incident Date <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input id="incidentDate" type="date" value={formData.incidentDate} onChange={(e) => handleInputChange('incidentDate', e.target.value)} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentTime">Incident Time <span className="text-destructive">*</span></Label>
                      <div className="relative">
                        <Input id="incidentTime" type="time" value={formData.incidentTime} onChange={(e) => handleInputChange('incidentTime', e.target.value)} />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placeOfIncident">Place of Incident</Label>
                      <Select value={formData.placeOfIncident} onValueChange={(value) => handleInputChange('placeOfIncident', value)}>
                        <SelectTrigger id="placeOfIncident">
                          <SelectValue placeholder="Select Place of Inc." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="highway">Highway</SelectItem>
                          <SelectItem value="city">City</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createdDate">Created Date</Label>
                      <div className="relative">
                        <Input id="createdDate" type="date" value={formData.createdDate} onChange={(e) => handleInputChange('createdDate', e.target.value)} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weatherCondition">Weather Condition</Label>
                      <Select value={formData.weatherCondition} onValueChange={(value) => handleInputChange('weatherCondition', value)}>
                        <SelectTrigger id="weatherCondition">
                          <SelectValue placeholder="Select Weather Con." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Clear</SelectItem>
                          <SelectItem value="rainy">Rainy</SelectItem>
                          <SelectItem value="foggy">Foggy</SelectItem>
                          <SelectItem value="snowy">Snowy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driverFault">Driver Fault</Label>
                      <Select value={formData.driverFault} onValueChange={(value) => handleInputChange('driverFault', value)}>
                        <SelectTrigger id="driverFault">
                          <SelectValue placeholder="Select Driver Fault" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleFault">Vehicle Fault</Label>
                      <Select value={formData.vehicleFault} onValueChange={(value) => handleInputChange('vehicleFault', value)}>
                        <SelectTrigger id="vehicleFault">
                          <SelectValue placeholder="Select Vehicle Fault" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-5 space-y-2">
                      <Label htmlFor="detailedDescription">Detailed Description</Label>
                      <Textarea id="detailedDescription" value={formData.detailedDescription} onChange={(e) => handleInputChange('detailedDescription', e.target.value)} placeholder="Enter Description" className="min-h-[80px] resize-none" />
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
                      <Switch id="maintenanceRequired" checked={formData.maintenanceRequired} onCheckedChange={(checked) => handleInputChange('maintenanceRequired', checked)} />
                      <Label htmlFor="maintenanceRequired" className="cursor-pointer">Maintenance Required</Label>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accidentType">Accident Type <span className="text-destructive">*</span></Label>
                        <Select value={formData.accidentType} onValueChange={(value) => handleInputChange('accidentType', value)}>
                          <SelectTrigger id="accidentType">
                            <SelectValue placeholder="Select Accident Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="collision">Collision</SelectItem>
                            <SelectItem value="rollover">Rollover</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="causeCode">Cause Code <span className="text-destructive">*</span></Label>
                        <Select value={formData.causeCode} onValueChange={(value) => handleInputChange('causeCode', value)}>
                          <SelectTrigger id="causeCode">
                            <SelectValue placeholder="Select Cause Code" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mechanical">Mechanical Failure</SelectItem>
                            <SelectItem value="driver-error">Driver Error</SelectItem>
                            <SelectItem value="weather">Weather Related</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="incidentResolution">Incident Resolution <span className="text-destructive">*</span></Label>
                        <Input id="incidentResolution" value={formData.incidentResolution} onChange={(e) => handleInputChange('incidentResolution', e.target.value)} placeholder="Enter Incident Resolution" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maintenanceType">Maintenance Type</Label>
                        <Select value={formData.maintenanceType} onValueChange={(value) => handleInputChange('maintenanceType', value)}>
                          <SelectTrigger id="maintenanceType">
                            <SelectValue placeholder="Select Maint. Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preventive">Preventive</SelectItem>
                            <SelectItem value="corrective">Corrective</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wagon">Wagon <span className="text-destructive">*</span></Label>
                        <Input id="wagon" value={formData.wagon} onChange={(e) => handleInputChange('wagon', e.target.value)} placeholder="Enter Wagon" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="container">Container <span className="text-destructive">*</span></Label>
                        <Input id="container" value={formData.container} onChange={(e) => handleInputChange('container', e.target.value)} placeholder="Enter Container" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workType">Work Type <span className="text-destructive">*</span></Label>
                        <Select value={formData.workType} onValueChange={(value) => handleInputChange('workType', value)}>
                          <SelectTrigger id="workType">
                            <SelectValue placeholder="Select Work Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                            <SelectItem value="replacement">Replacement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workCategory">Work Category <span className="text-destructive">*</span></Label>
                        <Select value={formData.workCategory} onValueChange={(value) => handleInputChange('workCategory', value)}>
                          <SelectTrigger id="workCategory">
                            <SelectValue placeholder="Select Work Categ." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mechanical">Mechanical</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                            <SelectItem value="structural">Structural</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workGroup">Work Group <span className="text-destructive">*</span></Label>
                        <Select value={formData.workGroup} onValueChange={(value) => handleInputChange('workGroup', value)}>
                          <SelectTrigger id="workGroup">
                            <SelectValue placeholder="Select Work Group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-5 space-y-2">
                        <Label htmlFor="maintenanceDescription">Maintenance Description <span className="text-destructive">*</span></Label>
                        <Textarea id="maintenanceDescription" value={formData.maintenanceDescription} onChange={(e) => handleInputChange('maintenanceDescription', e.target.value)} placeholder="Enter Maintenance Desc." className="min-h-[80px] resize-none" />
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
                      <Select value={formData.incidentCausedBy} onValueChange={(value) => handleInputChange('incidentCausedBy', value)}>
                        <SelectTrigger id="incidentCausedBy">
                          <SelectValue placeholder="Select Inc. Caused" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="vehicle">Vehicle</SelectItem>
                          <SelectItem value="external">External Factors</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentCauserName">Incident Causer Name</Label>
                      <Select value={formData.incidentCauserName} onValueChange={(value) => handleInputChange('incidentCauserName', value)}>
                        <SelectTrigger id="incidentCauserName">
                          <SelectValue placeholder="Select Inc. Causer Name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john-doe">John Doe</SelectItem>
                          <SelectItem value="jane-smith">Jane Smith</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentReportedBy">Incident Reported By</Label>
                      <Input id="incidentReportedBy" value={formData.incidentReportedBy} onChange={(e) => handleInputChange('incidentReportedBy', e.target.value)} placeholder="Enter Inc. Reported By" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incidentCloseDate">Incident Close Date</Label>
                      <div className="relative">
                        <Input id="incidentCloseDate" type="date" value={formData.incidentCloseDate} onChange={(e) => handleInputChange('incidentCloseDate', e.target.value)} />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="riskInvolved">Risk Involved</Label>
                      <Select value={formData.riskInvolved} onValueChange={(value) => handleInputChange('riskInvolved', value)}>
                        <SelectTrigger id="riskInvolved">
                          <SelectValue placeholder="Select Risk Involved" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dangerousGoods">Dangerous Goods</Label>
                      <Select value={formData.dangerousGoods} onValueChange={(value) => handleInputChange('dangerousGoods', value)}>
                        <SelectTrigger id="dangerousGoods">
                          <SelectValue placeholder="Select Danger Goods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loadTime">Load Time</Label>
                      <Select value={formData.loadTime} onValueChange={(value) => handleInputChange('loadTime', value)}>
                        <SelectTrigger id="loadTime">
                          <SelectValue placeholder="Select Load Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refDocNo">Ref. Doc. No.</Label>
                      <Input id="refDocNo" value={formData.refDocNo} onChange={(e) => handleInputChange('refDocNo', e.target.value)} placeholder="Enter Ref. Doc. No." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileRefIncidentId">Mobile Ref. Incident ID</Label>
                      <Input id="mobileRefIncidentId" value={formData.mobileRefIncidentId} onChange={(e) => handleInputChange('mobileRefIncidentId', e.target.value)} placeholder="Enter Mobile Ref. Inc. ID" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="remarks">Remarks</Label>
                      <Input id="remarks" value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} placeholder="Enter Remarks" />
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
                      <div className="text-sm text-primary font-medium">{formData.workOrderNumber}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Order Status</Label>
                      <div className="text-sm">{formData.workOrderStatus}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Request Number</Label>
                      <div className="text-sm">{formData.workRequestNumber}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Work Request Status</Label>
                      <div className="text-sm">{formData.workRequestStatus}</div>
                    </div>

                    <div className="space-y-2">
                      <Label>Error Message</Label>
                      <div className="text-sm">{formData.errorMessage}</div>
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
                      <Switch id="claimRequired" checked={formData.claimRequired} onCheckedChange={(checked) => handleInputChange('claimRequired', checked)} />
                      <Label htmlFor="claimRequired" className="cursor-pointer">Claim Required</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Claim No.</Label>
                        <div className="text-sm text-primary font-medium">{formData.claimNo}</div>
                      </div>

                      <div className="space-y-2">
                        <Label>Claim Status</Label>
                        <div className="text-sm">{formData.claimStatus}</div>
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
