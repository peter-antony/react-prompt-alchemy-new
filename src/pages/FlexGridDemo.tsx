
import React, { useState } from 'react';
import { FlexGridLayout } from '@/components/FlexGridLayout';
import { 
  ToolbarComponent, 
  SidebarComponent, 
  MainContentComponent, 
  FormComponent, 
  FooterComponent 
} from '@/components/FlexGridLayout/SampleComponents';
import { LayoutConfig } from '@/components/FlexGridLayout/types';

const FlexGridDemo = () => {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    sections: {
      top: {
        id: 'top',
        visible: true,
        height: '60px',
        collapsible: true,
        collapsed: false,
        title: 'Toolbar',
        content: <ToolbarComponent />
      },
      left: {
        id: 'left',
        visible: true,
        width: '300px',
        collapsible: true,
        collapsed: false,
        minWidth: '0',
        title: 'Sidebar',
        content: <SidebarComponent />
      },
      center: {
        id: 'center',
        visible: true,
        width: 'calc(100% - 300px)',
        collapsible: false,
        title: 'Main Content',
        content: <MainContentComponent />
      },
      right: {
        id: 'right',
        visible: true,
        width: '250px',
        collapsible: true,
        collapsed: true,
        minWidth: '0',
        title: 'Properties',
        content: <FormComponent />
      },
      bottom: {
        id: 'bottom',
        visible: true,
        height: '50px',
        collapsible: true,
        collapsed: false,
        title: 'Footer',
        content: <FooterComponent />
      }
    }
  });

  const handleConfigChange = (newConfig: LayoutConfig) => {
    setLayoutConfig(newConfig);
    // Optionally save to localStorage
    localStorage.setItem('flexGridLayout', JSON.stringify(newConfig));
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('flexGridLayout');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setLayoutConfig(parsedConfig);
      } catch (error) {
        console.warn('Error loading layout config from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="h-screen bg-gray-50 p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Flex Grid Layout Demo
          </h1>
          <p className="text-gray-600">
            A dynamic, configurable 5-section layout with collapsible panels, drag handles, and per-section configuration.
          </p>
        </div>
        
        <div className="h-[calc(100%-100px)] border rounded-lg overflow-hidden bg-white">
          <FlexGridLayout
            config={layoutConfig}
            onConfigChange={handleConfigChange}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FlexGridDemo;
