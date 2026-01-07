import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Zap } from 'lucide-react';
import { ClaimService } from '@/api/services/ClaimService';

export const DraftBillAuditTrail: any = ({ isOpen, onClose, auditDraftBillObj }) => {
  const [auditEntries, setAuditEntries] = useState<any[]>([]);

  // Helper function to format EventDateTime to "10-May-2025 10:10:00 AM" format
  const formatEventDateTime = (dateTime: string | null | undefined): string => {
    if (!dateTime || dateTime === '' || dateTime === null) {
      return '--';
    }

    try {
      const date = new Date(dateTime);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateTime; // Return original if invalid date
      }

      // Format: DD-MMM-YYYY HH:MM:SS AM/PM
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = hours.toString().padStart(2, '0');
      
      return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateTime; // Return original if formatting fails
    }
  };

  // Helper function to check if EventDateTime is empty/null and return "--" for all fields
  const getFieldValue = (entry: any, fieldName: string) => {
    const isEventDateTimeEmpty = !entry.EventDateTime || entry.EventDateTime === '' || entry.EventDateTime === null;
    if (isEventDateTimeEmpty) {
      return '--';
    }
    
    // Format EventDateTime field specifically
    if (fieldName === 'EventDateTime') {
      return formatEventDateTime(entry.EventDateTime);
    }
    
    return entry[fieldName] || '--';
  };

  useEffect(() => {
    // Only fetch when drawer is open and we have a draft bill no
    if (!isOpen || !auditDraftBillObj) return;

    const fetchAuditTrail = async () => {
      try {
        const response = await ClaimService.viewAuditTrail({
          RefDocType: "DraftBill",
          RefDocNo: auditDraftBillObj,
        });

        const responseDataString = JSON.parse(response?.data?.ResponseData);
        console.log("responseDataString", responseDataString.AuditEvents);
        setAuditEntries(responseDataString.AuditEvents);
      } catch (error) {
        console.error('Audit Trail API Error:', error);
        // setAuditEntries(DEFAULT_AUDIT_TRAILS);
      }
    };

    fetchAuditTrail();
  }, [isOpen, auditDraftBillObj]);

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
      badgeContent={auditDraftBillObj || ''}
    >
      <div className="p-4">
        {auditEntries?.length === 0 || auditEntries === null ? (
          <div className="text-sm text-gray-500 mt-6 text-center">No audit entries available.</div>
        ) : (
          auditEntries?.map(entry => (
            <div key={entry.EventUniqueID} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry.EventName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm text-gray-600 ml-8">
                <div>
                  <div className="text-xs text-gray-600 font-normal">Date and Time</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'EventDateTime')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Name</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'UserID')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Role</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'RoleName')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Reason Code</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'ReasonCode')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">System Remarks</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'Remark')}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}