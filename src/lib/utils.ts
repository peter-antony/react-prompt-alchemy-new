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

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  try {
    // Try modern Clipboard API first (works in secure contexts)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API unavailable');
  } catch (err) {
    // Fallback for non-secure contexts (HTTP)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure the textarea is not visible but part of the DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch (fallbackErr) {
      console.error('Copy failed:', fallbackErr);
      return false;
    }
  }
};
