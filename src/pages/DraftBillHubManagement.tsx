import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import DraftBillHubGridMain from '@/components/DraftBill/DraftBillHubGridMain';

const DraftBillHubManagement = () => {

    useEffect(() => {
        console.log("Draft Bill Hub Management Main Page");
    }, []);

    //BreadCrumb data
    const breadcrumbItems = [
        { label: 'Home', href: '/dashboard', active: false },
        { label: 'Draft Bill Management', href: '/draft-bill', active: true },
    ];

    return (
        <AppLayout>
            <div className="main-content-h bg-gray-100">
                <div className="p-4 px-6 ">
                    <div className="hidden md:block">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>

                    <div className="">
                        <DraftBillHubGridMain />
                    </div>

                </div>
            </div>

        </AppLayout>
    );
};

export default DraftBillHubManagement;
