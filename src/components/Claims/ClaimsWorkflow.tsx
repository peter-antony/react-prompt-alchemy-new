import React, { useState, useEffect } from 'react';
import { SideDrawer } from '@/components/Common/SideDrawer';
import { Layers } from 'lucide-react';
import { ClaimService } from '@/api/services/ClaimService';

export const ClaimsWorkflowSidedraw: any = ({ isOpen, onClose, workFlowObj }) => {
  console.log("workFlowObj in ClaimsWorkflowSidedraw:", workFlowObj);
  const [workflowEntries, setWorkflowEntries] = useState<any[]>([]);
  const DEFAULT_WORKFLOW_TASKS: any[] = [];

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await ClaimService.viewWorkFlowReport({
          RefDocType: "Claims",
          RefDocNo: workFlowObj?.Header?.ClaimNo,
        });

        if (response?.data?.IsSuccess) {
          let responseData = null;
          try {
            responseData = JSON.parse(response?.data?.ResponseData);
            console.log('Parsed ResponseData:', responseData);
          } catch (parseError) {
            console.warn('Failed to parse ResponseData:', parseError);
          }
          setWorkflowEntries(responseData?.WorkFlowReport || []);
          // setWorkflowEntries(DEFAULT_WORKFLOW_TASKS);
          // Refresh claim data after successful short close
        } else {
          setWorkflowEntries([]);
        }
      } catch (error) {
        // Case 3: Network / runtime error
        console.error('WorkflowEntries API Error:', error);
        setWorkflowEntries([]);
      }
    };

    if (workFlowObj) {
      fetchWorkflow();
    }
  }, [workFlowObj]);

  const getStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			// Status column colors
			'Released': 'badge-fresh-green rounded-2xl',
			'Executed': 'badge-purple rounded-2xl',
			'Cancelled': 'badge-red rounded-2xl',
			'Closed': 'badge-red rounded-2xl',
			'Approved': 'badge-green rounded-2xl',
			'Pending': 'badge-orange rounded-2xl',
			'Completed': 'badge-green rounded-2xl',
			'Initiated': 'badge-blue rounded-2xl',
			'Under Revision': 'badge-purple rounded-2xl',
			// Trip Billing Status colors
			'In Progress': 'badge-orange rounded-2xl',
			'Processed': 'badge-blue rounded-2xl',
			'Claim Initiated': 'badge-fresh-green rounded-2xl',
			'Draft': 'badge-orange rounded-2xl',
		};
		return statusColors[status] || "badge-gray rounded-2xl";
	};

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="82%"
      title="Workflow"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={workFlowObj?.Header?.ClaimNo || ''}
    >
      <div className="p-4">
        {workflowEntries?.length === 0 ? (
          <div className="text-sm text-gray-500">No workflow entries available.</div>
        ) : (
          workflowEntries?.map((entry, index) => (
            <div key={'workflow-' + index} className="bg-white rounded-lg shadow-sm p-4 mb-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* <Zap className="h-5 w-5 text-[#6938EF]" strokeWidth={1.33} /> */}
                  <Layers className="h-5 w-5 text-[#dd2590]" strokeWidth={1.33} />
                  <div className="text-sm font-semibold text-gray-800">{entry?.FormulaExpression}</div>
                  <span className={getStatusColor(entry?.Action) + ' text-xs'}>{entry?.Action}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-3 text-sm text-gray-600 ml-8">
                {/* <div>
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
                </div> */}
                <div>
                  <div className="text-xs text-gray-600 font-normal">Action Required</div>
                  <div className="font-medium text-gray-800">{entry?.ActionRequired || '--'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">User Name</div>
                  <div className="font-medium text-gray-800">{entry?.UserID}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Approval DeadLine</div>
                  <div className="font-medium text-gray-800">{entry?.ApprovalDeadLine}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">From State</div>
                  <div className="font-medium text-gray-800">{entry?.FromState}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">To State</div>
                  <div className="font-medium text-gray-800">{entry?.ToState}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-normal">Remarks</div>
                  <div className="font-medium text-gray-800">{entry?.Remark1 || '--'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </SideDrawer>

  );
}