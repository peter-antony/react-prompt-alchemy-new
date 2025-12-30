import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicLazySelect } from '@/components/DynamicPanel/DynamicLazySelect';
import { CimCuvService } from '@/api/services/CimCuvService';
import { quickOrderService } from '@/api/services/quickOrderService';



interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmGenerateInvoice: (consolidationCode: string, reasonDescription: string) => void;
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({ isOpen, onClose, onConfirmGenerateInvoice }) => {
  console.log("GenerateInvoiceModal - isOpen:", isOpen);
  const [consolidationCode, setconsolidationCode] = useState<{ value: string; label: string } | string>('');
  const [reasonDescription, setReasonDescription] = useState('');

  if (!isOpen) return null;

  // const [consolidationCodes, setconsolidationCodes] = useState('');
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

  const fetchconsolidationCode = fetchMasterData("DB Consolidation Type Init");


  const handleCancelClick = () => {
    onConfirmGenerateInvoice(typeof consolidationCode === 'string' ? consolidationCode : consolidationCode?.value || '', reasonDescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">Invoice Consolidation</h3>
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
            <Label htmlFor="consolidationCode" className="block text-sm font-medium text-gray-700">Consolidation Type</Label>
            <DynamicLazySelect
              fetchOptions={fetchconsolidationCode}
              value={typeof consolidationCode === 'object' ? consolidationCode.value : consolidationCode}
              onChange={(value, isNewEntry, option) => setconsolidationCode(option as { value: string; label: string })}
              placeholder=""
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleCancelClick}>Generate Invoice</Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateInvoiceModal;
