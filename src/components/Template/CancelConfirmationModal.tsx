import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { CimCuvService } from '@/api/services/CimCuvService';
import { quickOrderService } from '@/api/services/quickOrderService';



interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (reasonCode: string, reasonDescription: string) => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ isOpen, onClose, onConfirmCancel }) => {
  console.log("CancelConfirmationModal - isOpen:", isOpen);
  const [reasonCode, setReasonCode] = useState<{ value: string; label: string } | string>('');
  const [reasonDescription, setReasonDescription] = useState('');

  if (!isOpen) return null;

  // const [reasonCodes, setReasonCodes] = useState('');
  // const [location, setLocation] = useState('');

  // Generic fetch function for master common data using quickOrderService.getMasterCommonData
  const fetchMasterData = (messageType: string) => async ({ searchTerm, offset, limit }: { searchTerm: string; offset: number; limit: number }) => {
    try {
      // Call the API using the same service pattern as PlanAndActualDetails component
      const response = await quickOrderService.getMasterCommonData({
        messageType: messageType,
        searchTerm: searchTerm || '',
        offset,
        limit,
      });

      const rr: any = response.data
      return (JSON.parse(rr.ResponseData) || []).map((item: any) => ({
        ...(item.id !== undefined && item.id !== '' && item.name !== undefined && item.name !== ''
          ? {
            label: `${item.id} || ${item.name}`,
            value: `${item.id} || ${item.name}`,
          }
          : {})
      }));

      // Fallback to empty array if API call fails
      return [];
    } catch (error) {
      console.error(`Error fetching ${messageType}:`, error);
      // Return empty array on error
      return [];
    }
  };

  const fetchReasonCode = fetchMasterData("Cancellation Reason Init");


  const handleCancelClick = () => {
    onConfirmCancel(typeof reasonCode === 'string' ? reasonCode : reasonCode?.value || '', reasonDescription);
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
            <DynamicLazySelect
              fetchOptions={fetchReasonCode}
              value={typeof reasonCode === 'object' ? reasonCode.value : reasonCode}
              onChange={(value, isNewEntry, option) => setReasonCode(option as { value: string; label: string })}
              placeholder=""
            />
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
