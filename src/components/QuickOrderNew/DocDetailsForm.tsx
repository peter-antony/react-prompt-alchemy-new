import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { SimpleDropDown } from "../Common/SimpleDropDown";
import { InputDropDown } from "../Common/InputDropDown";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';



export const DocDetailsForm = () => {
  const [primaryDocType, setPrimaryDocType] = useState('');
  const [primaryDocNo, setPrimaryDocNo] = useState('');
  const [secondaryDocType, setSecondaryDocType] = useState('');
  const [secondaryDocNo, setSecondaryDocNo] = useState('');
  const [primaryDocDate, setPrimaryDocDate] = useState(new Date());
  const [secondaryDocDate, setSecondaryDocDate] = useState(new Date());
  const [qcDropdown, setQcDropdown] = useState('QC');
  const [qcInput, setQcInput] = useState('');
  const [qc2Dropdown, setQc2Dropdown] = useState('QC');
  const [qc2Input, setQc2Input] = useState('');
  const [qc3Dropdown, setQc3Dropdown] = useState('QC');
  const [qc3Input, setQc3Input] = useState('');
  const [formData, setFormData] = useState({
    primaryDocType: '',
    primaryDocNo: '',
    secondaryDocType: '',
    secondaryDocNo: '',
    primaryDocDate: '',
    secondaryDocDate: '',
    wbs: '',
    qc2Value: '',
    qc3Value: '',
    summary: '',
    remarks2: '',
    remarks3: ''
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Handle suggestions for customer order number

  };
  const handleQcChange = (dropdownValue: string, inputValue: string) => {
    setPrimaryDocType(dropdownValue);
    setPrimaryDocNo(inputValue);
    setFormData(prev => ({
      ...prev,
      primaryDocType: dropdownValue,
      primaryDocNo: inputValue
    }));
  };
  const handleQc2Change = (dropdownValue: string, inputValue: string) => {
    setQc2Dropdown(dropdownValue);
    setQc2Input(inputValue);
    setFormData(prev => ({
      ...prev,
      qcValue: `${dropdownValue}-${inputValue}`
    }));
  };
  const handleQc3Change = (dropdownValue: string, inputValue: string) => {
    setQc3Dropdown(dropdownValue);
    setQc3Input(inputValue);
    setFormData(prev => ({
      ...prev,
      qcValue: `${dropdownValue}-${inputValue}`
    }));
  };
  const onSave = () => {
    console.log("FORM DATA : ", formData);
  }
  return (
    <form className="space-y-4 w-full text-sm">
      {/* Primary Doc Type and No. */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Label htmlFor="order-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Primary Doc Type and No.
          </Label>
          <InputDropDown
            label="Primary Doc Type and No."
            dropdownOptions={['IO-Hire/Rent', 'IO-Buy/Rent']}
            selectedOption={primaryDocType}
            onOptionChange={option => handleQcChange(option, primaryDocNo)}
            value={primaryDocNo}
            onValueChange={val => handleQcChange(primaryDocType, val)}
          />
        </div>
      </div>
      {/* Secondary Doc Type and No. */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Secondary Doc Type and No.
          </Label>
          <InputDropDown
            label="Secondary Doc Type and No."
            dropdownOptions={['SO-Hire/Rent', 'SO-Buy/Rent']}
            selectedOption={secondaryDocType}
            onOptionChange={option => handleQcChange(option, secondaryDocNo)}
            value={primaryDocNo}
            onValueChange={val => handleQcChange(secondaryDocType, val)}
          />
        </div>
      </div>
      {/* Primary and Secondary Doc Dates */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Label htmlFor="primary-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Primary Doc Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal relative",
                  !primaryDocDate && "text-muted-foreground"
                )}
              >
                {primaryDocDate ? format(primaryDocDate, "dd/MM/yyyy") : "Select date"}
                <CalendarIcon className="mr-2 h-4 w-4 absolute right-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={primaryDocDate}
                onSelect={setPrimaryDocDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <Label htmlFor="secondary-date" className="text-sm font-medium text-gray-700 mb-2 block">
            Secondary Doc Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal relative",
                  !secondaryDocDate && "text-muted-foreground"
                )}
              >
                {secondaryDocDate ? format(secondaryDocDate, "dd/MM/yyyy") : "Select date"}
                <CalendarIcon className="mr-2 h-4 w-4 absolute right-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={secondaryDocDate}
                onSelect={setSecondaryDocDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {/* WBS */}
      <div className="w-full">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">WBS</Label>
        <Input
          value={formData.wbs}
          onChange={(e) => handleInputChange('wbs', e.target.value)}
          placeholder="DE17FRE001" className="w-full" />
      </div>
      {/* QC Userdefined 2 and 3 */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            QC Userdefined 2
          </Label>
          <InputDropDown
            label="QC Userdefined 2"
            dropdownOptions={["QC", "QA", "Test"]}
            selectedOption={qc2Dropdown}
            onOptionChange={option => handleQc2Change(option, qc2Dropdown)}
            value={qc2Input}
            onValueChange={val => handleQc2Change(qc2Dropdown, val)}
          />
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            QC Userdefined 3
          </Label>
          <InputDropDown
            label="QC Userdefined 3"
            dropdownOptions={["QC", "QA", "Test"]}
            selectedOption={qc3Dropdown}
            onOptionChange={option => handleQc3Change(option, qc3Dropdown)}
            value={qc3Input}
            onValueChange={val => handleQc3Change(qc3Dropdown, val)}
          />
        </div>
      </div>
      {/* Remarks 2 and 3 */}
      <div className="flex gap-2 w-full">
        <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Remarks 2</Label>
          <Input
            value={formData.remarks2}
            onChange={(e) => handleInputChange('remarks2', e.target.value)}
            placeholder="" className="w-full" />
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 mb-3 block">Remarks 3</Label>
          <Input
            value={formData.remarks3}
            onChange={(e) => handleInputChange('remarks3', e.target.value)}
            placeholder="" className="w-full" />

        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end w-full">
        <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium" onClick={onSave}>
          Save Details
        </button>
      </div>
    </form>
  );
};
