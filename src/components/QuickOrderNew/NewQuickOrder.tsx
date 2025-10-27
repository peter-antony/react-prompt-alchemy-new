import React, { useState,useEffect, forwardRef, useImperativeHandle } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import OrderForm, { OrderFormHandle } from '@/components/QuickOrderNew/OrderForm/OrderForm';
import NewResourceGroup from '@/components/QuickOrderNew/NewResourceGroup';
import { toast } from 'sonner';
import jsonStore from '@/stores/jsonStore';

interface NewCreateQuickOrderProps {
  isEditQuickOrder?: boolean;
  onOrderCreated?: () => void;
  onConfirm?: () => void;
}

export type NewQuickOrderHandle = { getOrderValues: () => any };

const NewCreateQuickOrder = forwardRef<NewQuickOrderHandle, NewCreateQuickOrderProps>(({ isEditQuickOrder, onOrderCreated, onConfirm }, ref) => {
  useEffect(() => {
    if (!isEditQuickOrder) {
      // Set ResourceGroup as empty array in jsonStore
      const quickOrder = jsonStore.getQuickOrder();
      if (quickOrder && quickOrder.ResourceGroup !== undefined) {
        quickOrder.ResourceGroup = [];
      } else if (quickOrder && quickOrder.ResponseResult && quickOrder.ResponseResult.QuickOrder) {
        quickOrder.ResponseResult.QuickOrder.ResourceGroup = [];
      }
      jsonStore.setQuickOrder(quickOrder);
    }
    const jsonData = jsonStore.getQuickOrder();
    console.log('QUICK ORDER  JSON data:', jsonData);
    // You can now use jsonData as needed (e.g., set state, prefill form, etc.)
  }, [isEditQuickOrder]);
  const handleSaveDraft = () => {
    toast.success('Order saved as draft successfully!');
    console.log('Save draft clicked');
  };

  const handleConfirm = () => {
    toast.success('Order confirmed successfully!');
    console.log('Confirm order clicked');
  };

  const handleCancel = () => {
    toast.info('Order creation cancelled');
    console.log('Cancel clicked');
  };

  const handleAddResource = () => {
    // toast.success('Resource group functionality will be implemented next!');
    console.log('Add resource group clicked');
  };

  // expose child OrderForm getter through this component
  let orderFormGetter: (() => any) | null = null;
  useImperativeHandle(ref, () => ({
    getOrderValues: () => orderFormGetter?.() || {},
  }));

  return (
    <div className="flex gap-6">
        {/* Left Column - Order Form */}
        {/* <div className="lg:col-span-1 w-2/6"> */}
          <OrderForm
            ref={(r: OrderFormHandle | null) => {
              orderFormGetter = r?.getOrderValues || null;
            }}
            onSaveDraft={handleSaveDraft}
            onConfirm={onConfirm || handleConfirm}
            onCancel={handleCancel}
            isEditQuickOrder={isEditQuickOrder}
            onOrderCreated={onOrderCreated}
            onScroll={true}
          />
        {/* </div> */}
        
        {/* Right Column - Resource Group Panel */}
        {/* <div className="lg:col-span-1 w-4/6">
          <NewResourceGroup onAddResource={handleAddResource} isEditQuickOrder={isEditQuickOrder} />
        </div> */}
    </div>
  );
});

export default NewCreateQuickOrder;
