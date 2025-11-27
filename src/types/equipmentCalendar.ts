export interface EquipmentItem {
  id: string;
  title: string;
  supplier: string;
  status: 'available' | 'occupied' | 'workshop';
  type?: string;
  capacity?: string;
}

export interface EquipmentCalendarEvent {
  id: string;
  equipmentId: string;
  label: string;
  type: 'trip' | 'maintenance' | 'hold';
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  color?: string; // CSS color
}

export interface EquipmentCalendarViewProps {
  equipments: EquipmentItem[];
  events: EquipmentCalendarEvent[];
  view: 'day' | 'week' | 'month';
  startDate: Date;
  showHourView: boolean;
  statusFilter: string;
  selectedEquipments: string[];
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onShowHourViewChange: (show: boolean) => void;
  onStatusFilterChange: (status: string) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onAddToTrip: (selectedIds: string[]) => void;
  onBarClick?: (event: EquipmentCalendarEvent) => void;
  onEquipmentClick?: (equipment: EquipmentItem) => void;
  scrollSyncKey?: string;
  enableDrag?: boolean;
}
