// import React from 'react';
// import { Check, Clock, X } from 'lucide-react';
// import { PanelConfig } from '@/types/dynamicPanel';

// interface PanelStatusIndicatorProps {
//   panelConfig: PanelConfig;
//   formData: Record<string, any>;
//   showStatus: boolean;
// }

// export const PanelStatusIndicator: React.FC<PanelStatusIndicatorProps> = ({
//   panelConfig,
//   formData,
//   showStatus
// }) => {
//   if (!showStatus) return null;

//   // Get visible mandatory fields
//   const mandatoryFields = Object.entries(panelConfig)
//     .filter(([_, config]) => config.visible && config.mandatory);

//   const totalMandatory = mandatoryFields.length;
//   const completedMandatory = mandatoryFields.filter(([fieldId, _]) => {
//     const value = formData[fieldId];
//     return value !== undefined && value !== null && value !== '';
//   }).length;

//   // Determine status
//   let status: 'complete' | 'partial' | 'empty';
//   let icon: React.ReactNode;
//   let colorClass: string;

//   if (completedMandatory === totalMandatory) {
//     status = 'complete';
//     icon = <Check className="h-3.5 w-3.5" />;
//     colorClass = 'text-white bg-green-600';
//   } else if (completedMandatory > 0) {
//     status = 'partial';
//     icon = <Check className="h-3.5 w-3.5" />;
//     colorClass = 'text-white bg-amber-600';
//   } else {
//     status = 'empty';
//     icon = <Check className="h-3.5 w-3.5" />;
//     colorClass = 'text-gray-600 bg-gray-100 border border-gray-300';
//   }

//   return (
//     <div
//       className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${colorClass}`}
//       title={`${completedMandatory}/${totalMandatory} mandatory fields completed`}
//     >
//       {icon}
//     </div>
//   );
// };

import React, { useEffect } from "react";
import { Check } from "lucide-react";
import { PanelConfig } from "@/types/dynamicPanel";

interface PanelStatusIndicatorProps {
  panelConfig: PanelConfig;
  formData: Record<string, any>;
  showStatus: boolean;
}

export const PanelStatusIndicator: React.FC<PanelStatusIndicatorProps> = ({
  panelConfig,
  formData,
  showStatus,
}) => {
  if (!showStatus) return null;

  /* -----------------------------
     Mandatory fields
  ----------------------------- */

  useEffect(()=>{
console.log(panelConfig,"panelConfig")
  },[panelConfig])
  const mandatoryFields = Object.entries(panelConfig).filter(
    ([_, config]) => config.visible && config.mandatory
  );

  const totalMandatory = mandatoryFields.length;

const isFieldCompleted = (value: any, config: any) => {
  if (value === undefined || value === null) return false;

  switch (config.fieldType) {
    case 'checkbox':
      return value === true;

    case 'inputdropdown': {
      const inputValue =
        value?.input !== undefined && value?.input !== null
          ? String(value.input).trim()
          : '';

      const dropdownValue =
        value?.dropdown !== undefined && value?.dropdown !== null
          ? String(value.dropdown).trim()
          : '';

      return inputValue !== '' && dropdownValue !== '';
    }

    case 'dropdown':
      return value !== '';

    case 'text':
    case 'input':
    default:
      return value !== '';
  }
};


  const completedMandatory = mandatoryFields.filter(([fieldId, config]) =>
    isFieldCompleted(formData[fieldId], config)
  ).length;

  /* -----------------------------
     Non-mandatory fields
  ----------------------------- */
  const nonMandatoryFields = Object.entries(panelConfig).filter(
    ([_, config]) => config.visible && !config.mandatory
  );

  const totalNonMandatory = nonMandatoryFields.length;

  const completedNonMandatory = nonMandatoryFields.filter(([fieldId, config]) =>
    isFieldCompleted(formData[fieldId], config)
  ).length;

  let icon = <Check className="h-3.5 w-3.5" />;
  let colorClass = "text-white bg-amber-600"; // default AMBER

  const hasMandatory = Object.values(panelConfig).some(
    (config) => config.mandatory
  );

  if (hasMandatory) {
    if (totalMandatory > 0 && completedMandatory === totalMandatory) {
      colorClass = "text-white bg-green-600";
    }
  } else {
    if (totalNonMandatory > 0 && completedNonMandatory === totalNonMandatory) {
      colorClass = "text-white bg-green-600";
    }
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
