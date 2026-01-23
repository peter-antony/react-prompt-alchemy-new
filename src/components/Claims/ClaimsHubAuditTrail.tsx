import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Zap } from 'lucide-react';
import { ClaimService } from '@/api/services/ClaimService';
import { dateTimeFormatter } from '@/utils/formatter';

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
    console.log('Fetching audit trail for claim:', auditClaimObj);
    const fetchAuditTrail = async () => {
      try {
        const response = await ClaimService.viewAuditTrail({
          RefDocType: 'Claims',
          RefDocNo: auditClaimObj,
        });

        if (response?.data?.IsSuccess) {
          let responseData = null;
          try {
            responseData = JSON.parse(response?.data?.ResponseData);
            console.log('Parsed ResponseData:', responseData);
          } catch (parseError) {
            console.warn('Failed to parse ResponseData:', parseError);
          }
          setAuditEntries(responseData?.AuditEvents || []);
          // Refresh claim data after successful short close
        } else {
          setAuditEntries([]);
        }
      } catch (error) {
        // Case 3: Network / runtime error
        console.error('Audit Trail API Error:', error);
        setAuditEntries([]);
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
      badgeContent={auditClaimObj || ''}
    >
      <div className="p-4">
        {auditEntries?.length === 0 ? (
          <div className="text-sm text-gray-500">No audit entries available.</div>
        ) : (
          auditEntries?.map((entry, index) => (
            <div key={'entry-' + index} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry.EventName} - {entry.EventUniqueID}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm text-gray-600 ml-8">
                <div>
                  <div className="text-xs text-gray-600 font-normal">Date and Time</div>
                  <div className="font-medium text-gray-800">{dateTimeFormatter(entry.EventDateTime)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Name</div>
                  <div className="font-medium text-gray-800">{entry.UserDescription}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Role</div>
                  <div className="font-medium text-gray-800">{entry.RoleName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Reason Code</div>
                  <div className="font-medium text-gray-800">{entry.ReasonCode || '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">System Remarks</div>
                  <div className="font-medium text-gray-800">{entry.Remark}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}