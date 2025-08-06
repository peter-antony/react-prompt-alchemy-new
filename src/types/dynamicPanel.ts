
export interface FieldConfig {
  id: string;
  label: string;
  fieldType: 'text' | 'select' | 'search' | 'currency' | 'date' | 'time' | 'textarea' | 'radio' | 'card' | 'inputdropdown';
  value: any;
  mandatory: boolean;
  visible: boolean;
  editable: boolean;
  order: number;
  width?: 'third' | 'half' | 'two-thirds' | 'full'; // Field width configuration
  options?: { label: string; value: string }[]; // For select and radio fields
  placeholder?: string;
  inputType?: any;
  onChange?: (value: any) => void;
  labelFlag?: boolean; // Flag to indicate if label should be displayed
  color?: string; // For card field type background color
  fieldColour?: string; // For card field type color
  // Event handlers for field interactions
  events?: {
    onClick?: (event: React.MouseEvent, value: any) => void;
    onChange?: (value: any, event: React.ChangeEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  };
  searchData?: string[]; // For search field type, local array for suggestions
}

export interface PanelConfig {
  [fieldId: string]: FieldConfig;
}

export interface getOrderFormDetailsConfig {
  [fieldId: string]: FieldConfig;
}

export interface PanelSettings {
  title: string;
  width?: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  collapsible?: boolean;
  showStatusIndicator?: boolean;
  showHeader?: boolean;
  fields: PanelConfig;
}

export interface DynamicPanelProps {
  panelId: string;
  panelOrder?: number; // Add panel order for tab navigation
  startingTabIndex?: number; // Starting tabIndex for sequential navigation across panels
  panelTitle: string;
  panelIcon?: React.ReactNode;
  panelConfig: PanelConfig;
  formName?: string; // Form name for the panel form element
  initialData?: Record<string, any>;
  onDataChange?: (updatedData: Record<string, any>) => void;
  onTitleChange?: (newTitle: string) => void;
  onWidthChange?: (newWidth: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12) => void;
  onCollapsibleChange?: (collapsible: boolean) => void;
  getUserPanelConfig?: (userId: string, panelId: string) => Promise<PanelSettings> | PanelSettings;
  saveUserPanelConfig?: (userId: string, panelId: string, settings: PanelSettings) => Promise<void> | void;
  userId?: string;
  panelWidth?: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  collapsible?: boolean;
  showPreview?: boolean;
  className?: string;
  panelSubTitle?: string;
  onScrollPanel?: boolean;
}

export interface FieldVisibilityConfig {
  fieldId: string;
  visible: boolean;
  order: number;
  label: string;
}
