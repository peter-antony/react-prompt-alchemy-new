import React, { useState, useEffect } from 'react';
import { DynamicPanel } from '@/components/DynamicPanel';
import { PanelVisibilityManager } from '@/components/DynamicPanel/PanelVisibilityManager';
import { PanelConfig, PanelSettings } from '@/types/dynamicPanel';
import { EyeOff } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import NewCreateQuickOrder from '@/components/QuickOrderNew/NewQuickOrder';
import { useSearchParams } from "react-router-dom";
import { useFooterStore } from '@/stores/footerStore';


const CreateQuickOrder = () => {
  const { setFooter, resetFooter } = useFooterStore();
  const [searchParams] = useSearchParams();
  const isEditQuickOrder = !!searchParams.get("id");
  //here to store the id

  useEffect(() => {
    setFooter({
      visible: true,
      pageName: 'Create_Quick_Order',
      // leftButtons: [
      //   {
      //     label: "CIM/CUV Report",
      //     onClick: () => console.log("CIM/CUV Report"),
      //     type: "Icon",
      //     iconName: 'BookText'
      //   },
      // ],
      rightButtons: [
        {
          label: "Cancel",
          disabled: false,
          type: 'Button',
          onClick: () => {
            console.log("Cancel clicked");
            // quickOrderCancelhandler();
          },
        },
        {
          label: "Save Draft",
          type: "Button",
          disabled: false,
          onClick: () => {
            console.log("Save Draft clicked");
            // orderConfirmhandler();
          },
        },
        {
          label: "Confirm",
          type: "Button",
          disabled: true,
          onClick: () => {
            console.log("Confirm clicked");
            // orderConfirmhandler();
          },
        },
      ],
    });
    return () => resetFooter();
  }, []);

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Quick Order Management', href: '/quick-order', active: false },
    { label: 'Create Quick Order', active: true }
  ];

  return (
    <AppLayout>
      <div className="main-content-h bg-gray-100">
        <div className="container mx-auto p-4 px-6 ">
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
