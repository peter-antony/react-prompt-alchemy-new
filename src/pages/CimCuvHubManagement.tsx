import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateSearchHub } from '@/components/CimCuvManagement/TemplateHub';
import { ReportSearchHub } from '@/components/CimCuvManagement/ReportHub';

const CimCuvHub = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const mapParamToTab = (t: string | null) => {
    if (!t) return null;
    const lower = t.toLowerCase();
    if (lower === 'report' || lower === 'ccreport') return 'CCReport';
    if (lower === 'template' || lower === 'cctemplate') return 'CCTemplate';
    return null;
  };

  const [activeTab, setActiveTab] = useState(() => {
    return mapParamToTab(searchParams.get('tab')) ?? 'CCTemplate';
  });

  useEffect(() => {
    const param = searchParams.get('tab');
    console.log('tab param changed:', param);
    // If param is missing or present but empty, default the URL and UI to 'template'
    if (param === null || param === '') {
      const params = new URLSearchParams(searchParams);
      params.set('tab', 'template');
      setSearchParams(params);
      if (activeTab !== 'CCTemplate') setActiveTab('CCTemplate');
      return;
    }

    const mapped = mapParamToTab(param);
    if (mapped && mapped !== activeTab) {
      setActiveTab(mapped);
    }
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const params = new URLSearchParams(searchParams);
    // store friendlier values in the URL
    params.set('tab', val === 'CCTemplate' ? 'template' : 'report');
    setSearchParams(params);
  };


  const breadcrumbItems = [
    { label: 'Home', href: '/', active: false },
    { label: 'CIM/CUV Management', active: true },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen main-bg">
        <div className="container-fluid mx-auto p-4 px-6 space-y-6">
          <div className="hidden md:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="">
            <TabsList className="bg-[#EBEFF9] rounded-lg h-[36px]">
              <TabsTrigger
                value="CCTemplate"
                className={`px-4 py-1 text-[12px] font-normal transition-all rounded-md h-[26px] 
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#0073E6]
                  data-[state=active]:font-medium
                  data-[state=active]:shadow-sm
                  data-[state=inactive]:text-[#475467]
                `}>
                Template
              </TabsTrigger>
              <TabsTrigger
                value="CCReport"
                className={`px-4 py-1 text-[12px] font-normal transition-all rounded-md h-[26px] 
                  data-[state=active]:bg-white
                  data-[state=active]:text-[#0073E6]
                  data-[state=active]:font-medium
                  data-[state=active]:shadow-sm
                  data-[state=inactive]:text-[#475467]
                `}>
                CIM/CUV Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="CCTemplate" className="mt-6">
              <TemplateSearchHub />
            </TabsContent>
            <TabsContent value="CCReport" className="mt-6">
              <ReportSearchHub />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

export default CimCuvHub;
