
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DynamicPanelProps, PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { InputDropDown } from '../Common/InputDropDown';

interface BillingDetailsPanelProps {
  panelId: string;
  panelTitle: string;
  panelIcon: React.ReactNode;
  panelConfig: PanelConfig;
  initialData: any;
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
}

export const BillingDetailsPanel: React.FC<BillingDetailsPanelProps> = ({
  panelId,
  panelTitle: initialPanelTitle,
  panelIcon: initialPanelIcon,
  panelConfig: initialPanelConfig,
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
  showPreview = false
}) => {
  const [panelConfig, setPanelConfig] = useState<PanelConfig>(initialPanelConfig);
  const [panelTitle, setPanelTitle] = useState(initialPanelTitle);
  const [panelIcon, setPanelIcon] = useState(initialPanelIcon);
  const [currentPanelWidth, setCurrentPanelWidth] = useState<'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(panelWidth);
  const [isCollapsible, setIsCollapsible] = useState(collapsible);
  const [panelVisible, setPanelVisible] = useState(true);
  const [showStatusIndicator, setShowStatusIndicator] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState(initialData);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Load user configuration on mount
  useEffect(() => {
    const loadUserConfig = async () => {
      console.log('loadUserConfig bbb', initialData);
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
              setShowStatusIndicator(false);
              // setShowStatusIndicator(userSettings.showStatusIndicator);
            }
          }
        } catch (error) {
          console.error('Failed to load user panel config:', error);
        }
      }
    };

    loadUserConfig();
  }, [ userId, panelId]);

  // Get visible fields sorted by order
  const visibleFields = Object.entries(panelConfig)
    .filter(([_, config]) => config.visible)
    .sort(([_, a], [__, b]) => a.order - b.order);

  // Add handleFieldChange for all form controls
  const handleFieldChange = (fieldId: string, value: any) => {
    const updatedData = { ...formData, [fieldId]: value };
    console.log("updatedData = ",updatedData)
    setFormData(updatedData);
    onDataChange?.(updatedData);
  };
  const [unitDropdown, setUnitDropdown] = useState('QC');
  const [unitInput, setUnitInput] = useState('');
  const handleConfigSave = async (
    updatedConfig: PanelConfig,
    newTitle?: string,
    newWidth?: 'full' | 'half' | 'third' | 'quarter' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
    newCollapsible?: boolean,
    newPanelVisible?: boolean
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

    if (saveUserPanelConfig) {
      try {
        const settings: PanelSettings = {
          title: newTitle || panelTitle,
          width: newWidth || currentPanelWidth,
          collapsible: newCollapsible !== undefined ? newCollapsible : isCollapsible,
          showStatusIndicator: showStatusIndicator,
          fields: updatedConfig
        };
        await saveUserPanelConfig(userId, panelId, settings);
      } catch (error) {
        console.error('Failed to save user panel config:', error);
      }
    }
  };

  const handleQcChange = (dropdownValue: string, inputValue: string) => {
    setUnitDropdown(dropdownValue);
    setUnitInput(inputValue);
    handleFieldChange('UnitPrice',`${dropdownValue}-${inputValue}`)
    // setFormData(prev => ({
    //   ...prev,
    //   UnitPrice: `${dropdownValue}-${inputValue}`
    // }));
  };
  return (
    <div className="">
      {/* Header */}
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4 border-b">
        <div className='flex items-center gap-2'>
          <div className="">{panelIcon}</div>
          <h3 className="tracking-tight text-sm font-semibold text-gray-700">{panelTitle}</h3>
        </div>
        <span className="text-blue-600 bg-blue-50 px-3 py-1 text-sm font-semibold rounded-full">{formData.DraftBillNo}</span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <Card className="p-4 border-0 bg-emerald-50">
          <p className="text-sm text-gray-600">Contract Price</p>
          <p className="text-lg font-semibold text-[#00A76F]">€ {formData.ContractPrice}</p>
        </Card>
        <Card className="p-4 border-0 bg-indigo-50">
          <p className="text-sm text-gray-600">Net Amount</p>
          <p className="text-lg font-semibold text-[#7C3AED]">€ {formData.NetAmount}</p>
        </Card>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 px-4 pb-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Billing Type</label>
          <Select
            value={formData.BillingType || ''}
            onValueChange={value => handleFieldChange('BillingType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select billing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wagon">Wagon</SelectItem>
              <SelectItem value="Container">Container</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Unit Price</label>
            <div >
            <InputDropDown
              label="QC Userdefined 1"
              dropdownOptions={['€', '$', '£']}
              selectedOption={unitDropdown}
              onOptionChange={option => handleQcChange(option, unitInput)}
              value={unitInput}
              onValueChange={val => handleQcChange(unitDropdown, val)}
            />
              
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Billing Qty.</label>
            <Input
              type="number"
              value={formData.BillingQty || ''}
              onChange={e => handleFieldChange('BillingQty', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Tariff</label>
          <div className="relative">
            <Input
              value={formData.Tariff || ''}
              onChange={e => handleFieldChange('Tariff', e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Tariff Type</label>
          <Input
            value={formData.TariffType || ''}
            className="bg-gray-50"
            onChange={e => handleFieldChange('TariffType', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Remarks</label>
          <Input
            value={formData.Remarks || ''}
            placeholder="Enter Remarks"
            onChange={e => handleFieldChange('Remarks', e.target.value)}
          />
        </div>
      </div>
    </div>
  );


};
