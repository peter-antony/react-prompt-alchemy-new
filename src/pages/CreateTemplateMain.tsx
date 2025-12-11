import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import TemplateCreate from '@/components/Template/TemplateCreate';

const CreateTemplateMain = () => {

  useEffect(() => {
    console.log("Create Template Main Page");
  }, []);

  //BreadCrumb data
  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard', active: false },
    { label: 'Template', href: '/main-template', active: false },
    { label: 'Create Template', active: true }
  ];
 
  return (
    <AppLayout>
      <div className="main-content-h bg-gray-100">
        <div className="p-4 px-6 ">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className="">
            <TemplateCreate />
          </div>

        </div>
      </div>

    </AppLayout>
  );
};

export default CreateTemplateMain;
