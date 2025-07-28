
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
    icon = <Check className="h-3.5 w-3.5" />;
    colorClass = 'text-white bg-green-600';
  } else if (completedMandatory > 0) {
    status = 'partial';
    icon = <Check className="h-3.5 w-3.5" />;
    colorClass = 'text-white bg-amber-600';
  } else {
    status = 'empty';
    icon = <Check className="h-3.5 w-3.5" />;
    colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
  }

  return (
    <div 
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${colorClass}`}
      title={`${completedMandatory}/${totalMandatory} mandatory fields completed`}
    >
      {icon}
    </div>
  );
};
