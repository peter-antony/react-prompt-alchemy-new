
export interface SectionConfig {
  id: string;
  visible: boolean;
  width?: string;
  height?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  minWidth?: string;
  minHeight?: string;
  content?: React.ReactNode;
  title?: string;
}

export interface LayoutConfig {
  sections: {
    top: SectionConfig;
    left: SectionConfig;
    center: SectionConfig;
    right: SectionConfig;
    bottom: SectionConfig;
  };
}

export interface FlexGridLayoutProps {
  config: LayoutConfig;
  onConfigChange?: (config: LayoutConfig) => void;
  className?: string;
}

export interface SectionProps {
  section: SectionConfig;
  onToggleCollapse: (sectionId: string) => void;
  onConfigChange: (sectionId: string, updates: Partial<SectionConfig>) => void;
  className?: string;
  children?: React.ReactNode;
}
