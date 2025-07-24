import React from "react";
import { Check } from "lucide-react"; // Add this import at the top


interface Step {
  label: string;
  subLabel?: string;
  active?: boolean;
  completed?: boolean;
  count?: number;
  color?: string;
}

interface VerticalStepperProps {
  steps: Step[];
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export const VerticalStepper: React.FC<VerticalStepperProps> = ({ steps, activeStep, onStepClick }) => {
  return (
    <div className="flex flex-col gap-0 py-4 px-6 w-72 bg-white border-r min-h-screen">
      {steps.map((step, idx) => (
        <div key={step.label} 
          onClick={() => onStepClick && onStepClick(idx + 1)} 
          className="flex items-start gap-3 relative cursor-pointer">
          <div className="flex flex-col items-center">
            <div className={
              `w-8 h-8 rounded-full flex items-center justify-center font-bold text-base z-10 ` +
              (idx + 1 < activeStep
                ? "bg-green-500 text-white"
                : idx + 1 === activeStep
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-400"
              )
            }>
              {idx + 1 < activeStep ? (
                <Check className="w-5 h-5" /> // Green: tick mark
              ) : (
                step.count ?? idx + 1 // Blue or gray: step number
              )}
            </div>
            {idx !== steps.length - 1 && (
              <div className="mt-4 mb-3 w-0.5 flex-1 bg-blue-500" style={{ minHeight: '32px', marginTop: '-2px' }} />
            )}
          </div>
          <div className="pt-1">
            <div className={
              `font-medium ` +
              (idx + 1 === activeStep ? "text-blue-700" : "text-gray-800")
            }>
              {step.label}
            </div>
            {step.subLabel && (
              <div className={
                `text-xs ` +
                (idx + 1 === activeStep ? "text-blue-400" : "text-gray-400")
              }>
                {step.subLabel}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 