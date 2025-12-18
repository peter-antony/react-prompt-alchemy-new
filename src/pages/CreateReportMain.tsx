import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AppLayout } from '@/components/AppLayout';
import ReportCreate from '@/components/Template/ReportCreate';

const CreateReportMain = () => {

    useEffect(() => {
        console.log("Create Report Main Page");
    }, []);

    //BreadCrumb data
    const breadcrumbItems = [
        { label: 'Home', href: '/dashboard', active: false },
        { label: 'CIM/CUV Management', href: '/cim-cuv?tab=report', active: false },
        { label: 'CIM/CUV Report', active: true }
    ];

    return (
        <AppLayout>
            <div className="main-content-h bg-gray-100">
                <div className="p-4 px-6 ">
                    <div className="hidden md:block">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>

                    <div className="">
                        <ReportCreate />
                    </div>

                </div>
            </div>

        </AppLayout>
    );
};

export default CreateReportMain;
