import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Layers } from 'lucide-react';
import { ClaimService } from '@/api/services/ClaimService';

export const ClaimsWorkflowSidedraw: any = ({ isOpen, onClose, workFlowObj }) => {
  const [workflowEntries, setWorkflowEntries] = useState<any[]>([]);
  const DEFAULT_WORKFLOW_TASKS: any[] = [
  {
    id: '1',
    title: 'DB accepted value more than 100k',
    status: 'Pending',
    triggeringDate: '15-Aug-2025',
    actionRequired: 'Approve DB',
    userAssigned: 'User 1',
    approvalDeadline: '21-Aug-2025',
  },
  {
    id: '2',
    title: 'DB accepted value more than 100k',
    status: 'Pending',
    triggeringDate: '15-Aug-2025',
    actionRequired: 'Approve DB',
    userAssigned: 'User 1',
    approvalDeadline: '21-Aug-2025',
  },
];

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const response = await ClaimService.viewAuditTrail({
          RefDocType: workFlowObj?.RefDocType,
          RefDocNo: workFlowObj?.RefDocNo,
        });

        const responseDataString = response?.data?.ResponseData;

        // Case 1: Backend returned error inside ResponseData
        if (responseDataString) {
          const parsed = JSON.parse(responseDataString);

          if (parsed?.error) {
            // console.error('Audit Trail SP Error:', parsed.error.errorMessage);
            setWorkflowEntries(DEFAULT_WORKFLOW_TASKS);
            return;
          }
        }

        // Case 2: Valid data
        setWorkflowEntries(response?.data?.data ?? DEFAULT_WORKFLOW_TASKS);
      } catch (error) {
        // Case 3: Network / runtime error
        console.error('WorkflowEntries API Error:', error);
        setWorkflowEntries(DEFAULT_WORKFLOW_TASKS);
      }
    };

    if (workFlowObj) {
      fetchAuditTrail();
    }
  }, [workFlowObj]);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="70%"
      title="Workflow"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={workFlowObj?.ClaimNo || ''}
    >
      <div className="p-4">
        {workflowEntries?.length === 0 ? (
          <div className="text-sm text-gray-500">No workflow entries available.</div>
        ) : (
          workflowEntries?.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} /> */}
                  <Layers className="h-5 w-5 text-[#dd2590]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry.title}</div>
                  <span className='badge-orange rounded-2xl text-[11px]'>{entry.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm text-gray-600 ml-8">
                <div>
                  <div className="text-xs text-gray-600 font-normal">Triggering Date</div>
                  <div className="font-medium text-gray-800">{entry.triggeringDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Action Required</div>
                  <div className="font-medium text-gray-800">{entry.actionRequired}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Assigned</div>
                  <div className="font-medium text-gray-800">{entry.userAssigned}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Approval Deadline</div>
                  <div className="font-medium text-gray-800">{entry.approvalDeadline}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}