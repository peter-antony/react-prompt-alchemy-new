import React from 'react';
import { DynamicPanel } from '@/components/DynamicPanel/DynamicPanel';
import { PanelConfig } from '@/types/dynamicPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BillingDemo = () => {
  const navigate = useNavigate();

  const snippetPanelConfig: PanelConfig = {
    contractPrice: {
      id: 'contractPrice',
      label: 'Contract Price',
      fieldType: 'card',
      value: '€ 1200.00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 1,
      width: 'half',
      color: '#10b981', // Emerald green background
      fieldColour: '#047857' // Dark emerald text
    },
    netAmount: {
      id: 'netAmount',
      label: 'Net Amount',
      fieldType: 'card',
      value: '€ 5580.00',
      mandatory: false,
      visible: true,
      editable: true,
      order: 2,
      width: 'half',
      color: '#8b5cf6', // Purple background
      fieldColour: '#6d28d9' // Dark purple text
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Billing Demo</h1>
        </div>

        <div className="space-y-6">
          <DynamicPanel
            panelId="billing-snippets"
            panelOrder={1}
            panelTitle="Financial Snippets"
            panelConfig={snippetPanelConfig}
            panelWidth="full"
            showPreview={false}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingDemo;