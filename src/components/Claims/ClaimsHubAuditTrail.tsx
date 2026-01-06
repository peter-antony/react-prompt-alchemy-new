import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Zap } from 'lucide-react';
import { ClaimService } from '@/api/services/ClaimService';

export const ClaimsHubAuditTrail: any = ({ isOpen, onClose, auditClaimObj }) => {
  const [auditEntries, setAuditEntries] = useState<any[]>([]);
  const DEFAULT_AUDIT_TRAILS = [
    {
      id: '1',
      title: 'Processed Event - 13435',
      date: '10-May-2025 10:10:00 AM',
      userName: 'Samuel',
      userRole: 'Finance Manager',
      reasonCode: '2324',
      systemRemarks: '--',
    },
    {
      id: '2',
      title: 'Save - 56565',
      date: '10-May-2025 10:10:00 AM',
      userName: 'Samuel',
      userRole: 'Finance Manager',
      reasonCode: '2324',
      systemRemarks: '--',
    },
    {
      id: '3',
      title: 'Cancel - 76587',
      date: '10-May-2025 10:10:00 AM',
      userName: 'Samuel',
      userRole: 'Finance Manager',
      reasonCode: '2324',
      systemRemarks: '--',
    },
  ];

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await ClaimService.viewAuditTrail({
          RefDocType: auditClaimObj.RefDocType,
          RefDocNo: auditClaimObj.RefDocNo,
        });

        const responseDataString = response?.data?.ResponseData;

        // Case 1: Backend returned error inside ResponseData
        if (responseDataString) {
          const parsed = JSON.parse(responseDataString);

          if (parsed?.error) {
            // console.error('Audit Trail SP Error:', parsed.error.errorMessage);
            setAuditEntries(DEFAULT_AUDIT_TRAILS);
            return;
          }
        }

        // Case 2: Valid data
        setAuditEntries(response?.data?.data ?? DEFAULT_AUDIT_TRAILS);
      } catch (error) {
        // Case 3: Network / runtime error
        console.error('Audit Trail API Error:', error);
        setAuditEntries(DEFAULT_AUDIT_TRAILS);
      }
    };

    if (auditClaimObj) {
      fetchAuditTrail();
    }
  }, [auditClaimObj]);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="70%"
      title="Audit Trail"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={auditClaimObj?.ClaimNo || ''}
    >
      <div className="p-4">
        {auditEntries?.length === 0 ? (
          <div className="text-sm text-gray-500">No audit entries available.</div>
        ) : (
          auditEntries?.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry.title}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm text-gray-600 ml-8">
                <div>
                  <div className="text-xs text-gray-600 font-normal">Date and Time</div>
                  <div className="font-medium text-gray-800">{entry.date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Name</div>
                  <div className="font-medium text-gray-800">{entry.userName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Role</div>
                  <div className="font-medium text-gray-800">{entry.userRole}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Reason Code</div>
                  <div className="font-medium text-gray-800">{entry.reasonCode}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">System Remarks</div>
                  <div className="font-medium text-gray-800">{entry.systemRemarks}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}