import React, { useState } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import NewCreateQuickOrder from '@/components/QuickOrderNew/NewQuickOrder';
import { useSearchParams } from "react-router-dom";


const CreateQuickOrder = () => {
  const [searchParams] = useSearchParams();
  const isEditQuickOrder = !!searchParams.get("id");
  //here to store the id

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Quick Order Management', href: '/quick-order', active: false },
    { label: 'Create Quick Order', active: true }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4 px-6 space-y-6">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="">
            <NewCreateQuickOrder isEditQuickOrder={isEditQuickOrder} />
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default CreateQuickOrder;
