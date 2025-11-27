import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { WorkOrderSearchPayload } from "@/api/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const buildWorkOrderPayload = (workOrderNo: string): WorkOrderSearchPayload => ({
  context: {
    MessageID: "12345",
    MessageType: "Work Order Selection",
    OUID: 4,
    Role: "ramcorole",
    UserID: "ramcouser",
  },
  SearchCriteria: {
    WorkOrderNo: workOrderNo,
    AdditionalFilter: [
      {
        FilterName: "ServiceType",
        FilterValue: "Standard",
      }
    ]
  }
});