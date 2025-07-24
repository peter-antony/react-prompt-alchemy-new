
import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { PanelConfig } from '@/types/dynamicPanel';

interface PanelStatusIndicatorProps {
  panelConfig: PanelConfig;
  formData: Record<string, any>;
  showStatus: boolean;
}

export const PanelStatusIndicator: React.FC<PanelStatusIndicatorProps> = ({
  panelConfig,
  formData,
  showStatus
}) => {
  if (!showStatus) return null;

  // Get visible mandatory fields
  const mandatoryFields = Object.entries(panelConfig)
    .filter(([_, config]) => config.visible && config.mandatory);

  const totalMandatory = mandatoryFields.length;
  const completedMandatory = mandatoryFields.filter(([fieldId, _]) => {
    const value = formData[fieldId];
    return value !== undefined && value !== null && value !== '';
  }).length;

  // Determine status
  let status: 'complete' | 'partial' | 'empty';
  let icon: React.ReactNode;
  let colorClass: string;

  if (completedMandatory === totalMandatory) {
    status = 'complete';
    icon = <Check className="h-4 w-4" />;
    colorClass = 'text-green-600 bg-green-100';
  } else if (completedMandatory > 0) {
    status = 'partial';
    icon = <Clock className="h-4 w-4" />;
    colorClass = 'text-amber-600 bg-amber-100';
  } else {
    status = 'empty';
    icon = <X className="h-4 w-4" />;
    colorClass = 'text-red-600 bg-red-100';
  }

  return (
    <div 
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${colorClass}`}
      title={`${completedMandatory}/${totalMandatory} mandatory fields completed`}
    >
      {icon}
    </div>
  );
};
