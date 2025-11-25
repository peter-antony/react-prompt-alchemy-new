import React, { useRef } from 'react';
import WorkOrderForm, { WorkOrderFormHandle } from '@/components/WorkOrder/WorkOrderForm';

const CreateWorkerOrder = () => {
  const workOrderFormRef = useRef<WorkOrderFormHandle>(null);

  return (
    <WorkOrderForm ref={workOrderFormRef} />
  );
};

export default CreateWorkerOrder;
