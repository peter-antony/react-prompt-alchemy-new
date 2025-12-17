import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reasonCode: string, reasonDescription: string) => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ isOpen, onClose, onConfirmCancel }) => {
  const [reasonCode, setReasonCode] = useState('');
  const [reasonDescription, setReasonDescription] = useState('');

  if (!isOpen) return null;

  const handleCancelClick = () => {
    onConfirmCancel(reasonCode, reasonDescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              {/* <X className="h-5 w-5 text-red-500" /> */}
              <Pencil className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cancel Bill</h3>
          </div>
          <Button
            type="button"
            className="text-gray-400 hover:text-gray-500 bg-white hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="reasonCode" className="block text-sm font-medium text-gray-700">Reason Code</Label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Reason Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code1">Reason Code 1</SelectItem>
                <SelectItem value="code2">Reason Code 2</SelectItem>
                <SelectItem value="code3">Reason Code 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="reasonDesc" className="block text-sm font-medium text-gray-700">Reason Code Desc.</Label>
            <Input
              id="reasonDesc"
              type="text"
              value={reasonDescription}
              onChange={(e) => setReasonDescription(e.target.value)}
              placeholder="Enter Reason Code Description"
              className="mt-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleCancelClick}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
