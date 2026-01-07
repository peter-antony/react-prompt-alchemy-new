import React, { useEffect, useState } from "react";
import { SideDrawer } from "../Common/SideDrawer";
import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  rowEditData?: any;
  // Callback invoked when user saves — parent receives an object with edited values
  onSave?: (updated: { ClaimNo?: string; RefDocTypeNo?: string; ClaimantRefNo?: string; SecondaryRefNo?: string; originalRow?: any }) => void;
};

export const ClaimsHubEditSave: React.FC<Props> = ({ isOpen, onClose, rowEditData, onSave }) => {
  const [refDocTypeNo, setRefDocTypeNo] = useState<string>("");
  const [claimantRefNo, setClaimantRefNo] = useState<string>("");
  const [secondaryRefNo, setSecondaryRefNo] = useState<string>("");

  useEffect(() => {
    // Initialize form fields when drawer opens or row changes
    if (rowEditData) {
      // Combine RefDocType & RefDocNo if both exist, otherwise prefer existing combined string
      const refType = rowEditData.RefDocType ?? rowEditData.RefDocTypeNo ?? '';
      const refNo = rowEditData.RefDocNo ?? '';
      const combined = [refType, refNo].filter(Boolean).join(' - ').trim();
      setRefDocTypeNo(combined || '');
      setClaimantRefNo(rowEditData.ClaimantRefNo ?? rowEditData.ClaimantRefNo ?? '');
      setSecondaryRefNo(rowEditData.SecondaryRefNo ?? '');
    } else {
      setRefDocTypeNo('');
      setClaimantRefNo('');
      setSecondaryRefNo('');
    }
  }, [rowEditData, isOpen]);

  const handleSave = () => {
    const payload = {
      ClaimNo: rowEditData?.ClaimNo,
      RefDocTypeNo: refDocTypeNo,
      ClaimantRefNo: claimantRefNo,
      SecondaryRefNo: secondaryRefNo,
      originalRow: rowEditData,
    };

    if (onSave) onSave(payload);
    // close drawer after save
    // onClose();
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      width="32%"
      title="Edit Claim"
      isBack={false}
      contentBgColor='#f8f9fc'
      onScrollPanel={true}
      isBadgeRequired={true}
      badgeContent={rowEditData ? rowEditData?.ClaimNo : ''}
      additionalBadge={rowEditData ? rowEditData.ClaimDate : ''}
    >
      <div className="h-full">
        {/* Form fields */}
        <div className="space-y-4 p-4">
          <div>
            <label className="text-xs text-gray-600 block mb-2 font-medium">Ref. Doc. Type/No.</label>
            <input
              type="text"
              value={refDocTypeNo}
              onChange={(e) => setRefDocTypeNo(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-gray-50 text-xs"
              placeholder="Enter Ref. Doc. Type/No."
              readOnly={true}
              disabled={true}
              tabIndex={0}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-2 font-medium">Claimant Ref. No.</label>
            <input
              value={claimantRefNo}
              onChange={(e) => setClaimantRefNo(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white text-xs"
              placeholder="Enter Claimant Ref. No."
            />
          </div>

          <div>
            <label className="text-xs text-gray-600 block mb-2 font-medium">Secondary Ref. No.</label>
            <input
              value={secondaryRefNo}
              onChange={(e) => setSecondaryRefNo(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-white text-xs"
              placeholder="Enter Secondary Ref. No."
            />
          </div>
        </div>

        {/* Footer actions - sticky to bottom of drawer content */}
        <div className="w-full bg-white border-t flex justify-end absolute bottom-0 px-4 py-2">
          <div className="flex justify-end gap-2">
            {/* <Button variant="ghost" onClick={onClose}>Cancel</Button> */}
            <Button onClick={handleSave} className="h-9 bg-blue-500 text-white hover:bg-blue-600 rounded-sm">Save</Button>
          </div>
        </div>
      </div>
    </SideDrawer>
  );
};