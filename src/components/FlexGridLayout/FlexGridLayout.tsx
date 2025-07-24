
import React, { useState, useEffect } from 'react';
import FlexGridSection from './FlexGridSection';
import { FlexGridLayoutProps, LayoutConfig, SectionConfig } from './types';
import { cn } from '@/lib/utils';

const FlexGridLayout: React.FC<FlexGridLayoutProps> = ({
  config,
  onConfigChange,
  className
}) => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(config);

  useEffect(() => {
    setLayoutConfig(config);
  }, [config]);

  const handleToggleCollapse = (sectionId: string) => {
    const newConfig = { ...layoutConfig };
    const section = newConfig.sections[sectionId as keyof typeof newConfig.sections];
    section.collapsed = !section.collapsed;
    
    // Auto-adjust adjacent sections
    if (sectionId === 'left') {
      if (section.collapsed) {
        newConfig.sections.center.width = '100%';
      } else {
        newConfig.sections.center.width = '75%';
      }
    } else if (sectionId === 'right') {
      if (section.collapsed) {
        newConfig.sections.center.width = '100%';
      } else {
        newConfig.sections.center.width = '75%';
      }
    }
    
    setLayoutConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleConfigChange = (sectionId: string, updates: Partial<SectionConfig>) => {
    const newConfig = { ...layoutConfig };
    const section = newConfig.sections[sectionId as keyof typeof newConfig.sections];
    Object.assign(section, updates);
    
    setLayoutConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const getLayoutConfig = () => layoutConfig;
  const setLayoutConfigDirect = (config: LayoutConfig) => {
    setLayoutConfig(config);
    onConfigChange?.(config);
  };

  // Expose API methods
  React.useImperativeHandle(React.createRef(), () => ({
    getLayoutConfig,
    setLayoutConfig: setLayoutConfigDirect,
  }));

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Top Section */}
      {layoutConfig.sections.top.visible && (
        <FlexGridSection
          section={layoutConfig.sections.top}
          onToggleCollapse={handleToggleCollapse}
          onConfigChange={handleConfigChange}
          className="flex-shrink-0"
        />
      )}

      {/* Middle Row - Left, Center, Right */}
      <div className="flex flex-1 min-h-0">
        {/* Left Section */}
        {layoutConfig.sections.left.visible && (
          <FlexGridSection
            section={layoutConfig.sections.left}
            onToggleCollapse={handleToggleCollapse}
            onConfigChange={handleConfigChange}
            className="flex-shrink-0"
          />
        )}

        {/* Center Section */}
        {layoutConfig.sections.center.visible && (
          <FlexGridSection
            section={layoutConfig.sections.center}
            onToggleCollapse={handleToggleCollapse}
            onConfigChange={handleConfigChange}
            className="flex-1 min-w-0"
          />
        )}

        {/* Right Section */}
        {layoutConfig.sections.right.visible && (
          <FlexGridSection
            section={layoutConfig.sections.right}
            onToggleCollapse={handleToggleCollapse}
            onConfigChange={handleConfigChange}
            className="flex-shrink-0"
          />
        )}
      </div>

      {/* Bottom Section */}
      {layoutConfig.sections.bottom.visible && (
        <FlexGridSection
          section={layoutConfig.sections.bottom}
          onToggleCollapse={handleToggleCollapse}
          onConfigChange={handleConfigChange}
          className="flex-shrink-0"
        />
      )}
    </div>
  );
};

export default FlexGridLayout;
