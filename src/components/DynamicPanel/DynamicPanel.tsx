import React, { useState, useEffect, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';
import { EnhancedFieldVisibilityModal } from './EnhancedFieldVisibilityModal';
import { PanelStatusIndicator } from './PanelStatusIndicator';
import { DynamicPanelProps, PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ConfirmSwitch from '../../assets/images/ConfirmSwitch.png';
import { combineInputDropdownValue, InputDropdownValue, splitInputDropdownValue } from '@/utils/inputDropdown';

export interface DynamicPanelRef {
  getFormValues: () => any;
}

export const DynamicPanel = forwardRef<DynamicPanelRef, DynamicPanelProps>(({
  panelId,
  panelOrder = 1,
  startingTabIndex = 1,
  panelTitle: initialPanelTitle,
  panelIcon: initialPanelIcon,
  panelConfig: initialPanelConfig,
  formName,
  initialData = {},
  onDataChange,
  onTitleChange,
  onWidthChange,
  onCollapsibleChange,
  getUserPanelConfig,
  saveUserPanelConfig,
  userId = 'default-user',
  panelWidth = 'full',
  collapsible = false,
  showPreview = false,
  onScrollPanel = false,
  className = '',
  panelSubTitle = '',
}, ref) => {
  const [panelConfig, setPanelConfig] = useState<PanelConfig>(initialPanelConfig);
  const [panelTitle, setPanelTitle] = useState(initialPanelTitle);
  const [panelIcon, setPanelIcon] = useState(initialPanelIcon);
  const [currentPanelWidth, setCurrentPanelWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(panelWidth);
  const [isCollapsible, setIsCollapsible] = useState(collapsible);
  const [panelVisible, setPanelVisible] = useState(true);
  const [showStatusIndicator, setShowStatusIndicator] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Create default values from panel config
  const createDefaultValues = useMemo(() => {
    const defaults = { ...initialData };
    Object.entries(panelConfig).forEach(([fieldId, config]) => {
      if (config.value !== undefined && config.value !== '') {
        defaults[fieldId] = config.value;
      }
      // Force split for UnitPrice for debugging
      // if (fieldId === 'UnitPrice' && typeof defaults[fieldId] === 'string') {
      //   console.log('Forcing split for UnitPrice:', defaults[fieldId]);
      //   defaults[fieldId] = splitInputDropdownValue(defaults[fieldId]);
      // }
      // Or keep your generic logic for all inputdropdowns
      if (config.fieldType === 'inputdropdown' && typeof defaults[fieldId] === 'string') {
        defaults[fieldId] = splitInputDropdownValue(defaults[fieldId]);
      }
    });
    return defaults;
  }, [initialData, panelConfig]);

  // Initialize react-hook-form
  const form = useForm({
    defaultValues: createDefaultValues,
    mode: 'onBlur'
  });

  const { control, watch, setValue, getValues } = form;
  const [isSwitchModalOpen, setSwitchModalOpen] = useState(false);

  // Expose getFormValues method via ref
  useImperativeHandle(ref, () => ({
    getFormValues: () => {
      const values = getValues();
      // Convert all inputdropdown fields to string using the utility
      const result: Record<string, any> = { ...values };
      Object.entries(panelConfig).forEach(([fieldId, config]) => {
        if (config.fieldType === 'inputdropdown' && result[fieldId]) {
          result[fieldId] = combineInputDropdownValue(result[fieldId] as InputDropdownValue);
        }
      });
      return result;
    }
  }), [getValues, panelConfig]);

  // Load user configuration on mount
  useEffect(() => {
    const loadUserConfig = async () => {
      if (getUserPanelConfig) {
        try {
          const userSettings = await getUserPanelConfig(userId, panelId);
          if (userSettings && Object.keys(userSettings.fields).length > 0) {
            setPanelConfig(userSettings.fields);
            if (userSettings.title) {
              setPanelTitle(userSettings.title);
            }
            if (userSettings.width) {
              setCurrentPanelWidth(userSettings.width);
            }
            if (userSettings.collapsible !== undefined) {
              setIsCollapsible(userSettings.collapsible);
            }
            if (userSettings.showStatusIndicator !== undefined) {
              setShowStatusIndicator(userSettings.showStatusIndicator);
            }
            if (userSettings.showHeader !== undefined) {
              setShowHeader(userSettings.showHeader);
            }
          }
        } catch (error) {
          console.error('Failed to load user panel config:', error);
        }
      }
    };

    loadUserConfig();
  }, [getUserPanelConfig, userId, panelId]);

  // Get visible fields sorted by order with calculated tab indices
  const visibleFields = useMemo(() => {
    const fields = Object.entries(panelConfig)
      .filter(([_, config]) => config.visible)
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([fieldId, config], index) => {
        const tabIndex = startingTabIndex + index;
        console.log(`Field ${fieldId} in panel ${panelOrder}: order=${config.order}, tabIndex=${tabIndex}`);
        return {
          fieldId,
          config,
          tabIndex
        };
      });
    
    console.log('All visible fields with tabIndex:', fields);
    return fields;
  }, [panelConfig, panelOrder]);

  // Watch for form changes and notify parent
  useEffect(() => {
    const subscription = watch((data) => {
      onDataChange?.(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onDataChange]);

  const handleConfigSave = async (
    updatedConfig: PanelConfig, 
    newTitle?: string, 
    newWidth?: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    newCollapsible?: boolean,
    newPanelVisible?: boolean,
    newShowHeader?: boolean
  ) => {
    setPanelConfig(updatedConfig);
    
    if (newTitle !== undefined) {
      setPanelTitle(newTitle);
      onTitleChange?.(newTitle);
    }

    if (newWidth !== undefined) {
      setCurrentPanelWidth(newWidth);
      onWidthChange?.(newWidth);
    }

    if (newCollapsible !== undefined) {
      setIsCollapsible(newCollapsible);
      onCollapsibleChange?.(newCollapsible);
    }

    if (newPanelVisible !== undefined) {
      setPanelVisible(newPanelVisible);
    }

    if (newShowHeader !== undefined) {
      setShowHeader(newShowHeader);
    }
    
    if (saveUserPanelConfig) {
      try {
        const settings: PanelSettings = {
          title: newTitle || panelTitle,
          width: newWidth || currentPanelWidth,
          collapsible: newCollapsible !== undefined ? newCollapsible : isCollapsible,
          showStatusIndicator: showStatusIndicator,
          showHeader: newShowHeader !== undefined ? newShowHeader : showHeader,
          fields: updatedConfig
        };
        await saveUserPanelConfig(userId, panelId, settings);
      } catch (error) {
        console.error('Failed to save user panel config:', error);
      }
    }
  };

  // Determine panel width class based on 12-column grid system
  const getWidthClass = () => {
    if (typeof currentPanelWidth === 'number') {
      const colSpan = Math.min(Math.max(currentPanelWidth, 1), 12); // Clamp between 1-12
      return `col-span-${colSpan}`;
    }
    
    switch (currentPanelWidth) {
      case 'half':
        return 'col-span-6'; // 6/12 = 50%
      case 'third':
        return 'col-span-4'; // 4/12 = 33.33%
      case 'quarter':
        return 'col-span-3'; // 3/12 = 25%
      case 'full':
      default:
        return 'col-span-12'; // Full width
    }
  };

  const getFieldWidthClass = (fieldWidth?: 'third' | 'half' | 'two-thirds' | 'full') => {
    switch (fieldWidth) {
      case 'third':
        return 'col-span-4'; // 4/12 = 1/3
      case 'half':
        return 'col-span-6'; // 6/12 = 1/2 (50%)
      case 'two-thirds':
        return 'col-span-8'; // 8/12 = 2/3
      case 'full':
      default:
        return 'col-span-12'; // 12/12 = 100%
    }
  };

  const PanelContent = () => (
    <form name={formName}>
      <div className="grid grid-cols-12 gap-4">
        {visibleFields.map(({ fieldId, config, tabIndex }) => (
          <div
            key={fieldId}
            className={`space-y-1 ${getFieldWidthClass(config.width)}`}
          >
            <label className="text-xs font-medium text-gray-600 block">
              {config.label}
              {config.mandatory && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <FieldRenderer
              config={config}
              control={control}
              fieldId={fieldId}
              tabIndex={tabIndex}
              // Pass mandatory info
              mandatory={config.mandatory}
            />
          </div>
        ))}
      </div>
      {visibleFields.length === 0 && !showPreview && (
        <div className="text-center text-gray-500 py-8 text-sm">
          No visible fields configured. Click the settings icon to configure fields.
        </div>
      )}
    </form>
  );

  // Don't render the panel if it's not visible
  if (!panelVisible && !showPreview) {
    return (
      <EnhancedFieldVisibilityModal
        open={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        panelConfig={panelConfig}
        panelTitle={panelTitle}
        panelWidth={currentPanelWidth}
        collapsible={isCollapsible}
        panelVisible={panelVisible}
        showHeader={showHeader}
        onSave={handleConfigSave}
      />
    );
  }

  const SettingsButton = () => (
    !showPreview && isHovered && (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsConfigModalOpen(true);
        }}
        className="h-5 w-5 text-gray-400 hover:text-gray-600"
      >
        <Settings className="h-3 w-3" />
      </Button>
    )
  );

  if (isCollapsible) {
    return (
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen} 
        className={`${getWidthClass()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="border border-gray-200 shadow-sm mb-6">
          {showHeader ? (
            <CollapsibleTrigger asChild>
              <CardHeader className="flex border-b border-gray-300 flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {/* <div className="w-5 h-5 border-2 border-purple-500 rounded"></div> */}
                  <div className="">{panelIcon}</div>
                  <CardTitle className="text-sm font-medium text-gray-700">{panelTitle}</CardTitle>
                  {/* {isEditQuickOrder && quickOrder && (
                    <>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200">
                        {quickOrder.QuickUniqueID || "QO/00001/2025"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                        {quickOrder.Status || "Confirmed"}
                      </span>
                    </>
                  )} */}
                  <PanelStatusIndicator 
                     panelConfig={panelConfig}
                     formData={getValues() || {}}
                     showStatus={showStatusIndicator}
                   />
                  {panelSubTitle && (
                    <span className="text-xs text-blue-600 font-medium">DB000023/42</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <SettingsButton />
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
          ) : (
            <div className="absolute top-2 right-2 z-10">
              <SettingsButton />
            </div>
          )}
          
          <CollapsibleContent>
            <CardContent className={`px-4 pb-4 ${!showHeader ? 'pt-8' : ''}`}>
              <PanelContent />
            </CardContent>
          </CollapsibleContent>

          {!showPreview && (
            <EnhancedFieldVisibilityModal
              open={isConfigModalOpen}
              onClose={() => setIsConfigModalOpen(false)}
              panelConfig={panelConfig}
              panelTitle={panelTitle}
              panelWidth={currentPanelWidth}
              collapsible={isCollapsible}
              panelVisible={panelVisible}
              showHeader={showHeader}
              onSave={handleConfigSave}
            />
          )}
        </Card>
      </Collapsible>
    );
  }

  return (
    <>
      <Card 
        className={`${getWidthClass()} ${className} relative` + (panelTitle === "Order Details" ? " " : " border shadow-sm mb-6")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showHeader ? (
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4` +
            (panelTitle === "Order Details" ? " " : " border-b mb-3")
          }>
            <div className="flex items-center gap-2">
            {/* <div className={`flex items-center` + (panelTitle === "Order Details" ? " " : " gap-2")}> */}
              {/* <div className="w-5 h-5 border-2 border-purple-500 rounded"></div> */}
              {panelTitle !== 'Order Details' && (
                <div className="">{panelIcon}</div>
              )}
              <CardTitle className="text-sm font-medium text-gray-700">{panelTitle}</CardTitle>
              <PanelStatusIndicator 
                panelConfig={panelConfig}
                formData={getValues() || {}}
                showStatus={showStatusIndicator}
              />
              {panelSubTitle && (
                <span onClick={() => setSwitchModalOpen(true)} className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1 rounded-full cursor-pointer">DB000023/42</span>
              )}
            </div>
            <SettingsButton />
          </CardHeader>
        ) : (
          <div className="absolute top-2 right-2 z-10">
            <SettingsButton />
          </div>
        )}
        
        <CardContent className={`px-4 pb-4 ${!showHeader ? 'pt-8' : ''}`}>
          <PanelContent />
        </CardContent>

        {!showPreview && (
          <EnhancedFieldVisibilityModal
            open={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            panelConfig={panelConfig}
            panelTitle={panelTitle}
            panelWidth={currentPanelWidth}
            collapsible={isCollapsible}
            panelVisible={panelVisible}
            showHeader={showHeader}
            onSave={handleConfigSave}
          />
        )}
      </Card>

      <Dialog open={isSwitchModalOpen} onOpenChange={setSwitchModalOpen}>
        <DialogContent className="max-w-sm w-full p-0 rounded-xl text-xs">
          <div className="flex flex-col items-center py-4 px-6">
            {/* Icon */}
            <DialogTitle></DialogTitle>
            <div className="mb-4">
              {/* Replace with your actual icon or image */}
              <img src={ConfirmSwitch} alt="Switch Icon" className="w-20 h-20" />
            </div>
            {/* Title */}
            <div className="font-semibold text-xl text-center mb-2">Confirm Switch?</div>
            {/* Description */}
            <div className="text-gray-500 text-center mb-6">
              Any unsaved data from your current session will be lost, and you may need to re-enter it.
            </div>
            {/* Buttons */}
            <div className="flex gap-4 w-full justify-center">
              <button
                className="border rounded px-6 py-2 text-gray-700 text-sm hover:bg-gray-100 flex-1"
                onClick={() => setSwitchModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white rounded px-6 py-2 text-sm font-medium flex-1"
                onClick={() => {
                  // handle continue logic here
                  setSwitchModalOpen(false);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
