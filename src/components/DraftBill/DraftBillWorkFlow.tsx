import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClaimService } from '@/api/services/ClaimService';
import { cn } from '@/lib/utils';

export const DraftBillWorkFlow: any = ({ isOpen, onClose, auditDraftBillObj }) => {
  const [workflowEntries, setWorkflowEntries] = useState<any[]>([]);

  const loadData = {
    "RefDocType": "DraftBill",
    "RefDocNo": "DB/00000940",
    "WorkFlowReport": [
        {
            "FormulaExpression": " DB_Accepted_Value_Item <> DB_Value_Item ",
            "FromState": "FRESH",
            "ToState": "S1Users",
            "PathID": "P2USERS",
            "DocumentStatus": "FRESH",
            "UserID": "RAMCOUSERSAS",
            "Action": "Pending",
            "Mandatory": "No",
            "ActionRequired": "",
            "ApprovalDeadLine": "",
            "Remark1": "",
            "Remark2": "",
            "Remark3": "",
            "ExtraCode1": "",
            "ExtraValue1": "",
            "ExtraCode2": "",
            "ExtraValue2": "",
            "ExtraCode3": "",
            "ExtraValue3": "",
            "ExtraCode4": "",
            "ExtraValue4": ""
        },
        {
            "FormulaExpression": " DB_Accepted_Value_Item <> DB_Value_Item ",
            "FromState": "S1Users",
            "ToState": "APPROVED",
            "PathID": "P2USERS",
            "DocumentStatus": "FRESH",
            "UserID": "RAMCOUSER",
            "Action": "Pending",
            "Mandatory": "Yes",
            "ActionRequired": "",
            "ApprovalDeadLine": "",
            "Remark1": "",
            "Remark2": "",
            "Remark3": "",
            "ExtraCode1": "",
            "ExtraValue1": "",
            "ExtraCode2": "",
            "ExtraValue2": "",
            "ExtraCode3": "",
            "ExtraValue3": "",
            "ExtraCode4": "",
            "ExtraValue4": ""
        }
    ]
}
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

  // Function to get status badge color classes based on Action value
  const getActionStatusColor = (action: string | null | undefined): string => {
    if (!action || action === '' || action === null) {
      return "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
    }

    const actionStatusMap: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-600 border border-yellow-200 rounded-2xl',
      'Approved': 'bg-green-100 text-green-600 border border-green-200 rounded-2xl',
      'Rejected': 'bg-red-100 text-red-600 border border-red-200 rounded-2xl',
      'Completed': 'bg-green-100 text-green-600 border border-green-200 rounded-2xl',
      'In Progress': 'bg-orange-100 text-orange-600 border border-orange-200 rounded-2xl',
      'Cancelled': 'bg-red-100 text-red-600 border border-red-200 rounded-2xl',
      'Under Review': 'bg-purple-100 text-purple-600 border border-purple-200 rounded-2xl',
      'Draft': 'bg-blue-100 text-blue-600 border border-blue-200 rounded-2xl',
      'Open': 'bg-blue-100 text-blue-600 border border-blue-200 rounded-2xl',
      'Closed': 'bg-gray-100 text-gray-600 border border-gray-200 rounded-2xl',
    };

    return actionStatusMap[action] || "bg-gray-100 text-gray-800 border-gray-300 rounded-2xl";
  };

  useEffect(() => {
    // Only fetch when drawer is open and we have a draft bill no
    if (!isOpen || !auditDraftBillObj) return;

    const fetchWorkFlowReport = async () => {
      try {
        const response = await ClaimService.viewWorkFlowReport({
          RefDocType: "DraftBill",
          RefDocNo: auditDraftBillObj,
        });

        const responseDataString = JSON.parse(response?.data?.ResponseData);
        console.log("responseDataString", responseDataString.WorkFlowReport);
        console.log("responseDataString", loadData);
        setWorkflowEntries(responseDataString.WorkFlowReport);
      } catch (error) {
        console.error('Workflow Report API Error:', error);
        // setAuditEntries(DEFAULT_AUDIT_TRAILS);
      }
    };

    fetchWorkFlowReport();
  }, [isOpen, auditDraftBillObj]);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="70%"
      title="Workflow Report"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={auditDraftBillObj || ''}
    >
      <div className="p-4">
        {workflowEntries?.length === 0 || workflowEntries === null ? (
          <div className="text-sm text-gray-500 mt-6 text-center">No workflow entries available.</div>
        ) : (
          workflowEntries?.map(entry => (
            <div key={entry.EventUniqueID} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry.FormulaExpression}</div>
                  {entry.Action && (
                    <Badge className={cn("whitespace-nowrap", getActionStatusColor(entry.Action))}>
                      {entry.Action}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm text-gray-600 ml-8">
                {/* <div>
                  <div className="text-xs text-gray-600 font-normal">Date and Time</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'EventDateTime')}</div>
                </div> */}
                <div>
                  <div className="text-xs text-gray-600 font-normal">Action Required</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'ActionRequired')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Name</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'UserID')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Approval DeadLine</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'ApprovalDeadLine')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">From State</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'FromState')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">To State</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'ToState')}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Remarks</div>
                  <div className="font-medium text-gray-800">{getFieldValue(entry, 'Remark1')}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}