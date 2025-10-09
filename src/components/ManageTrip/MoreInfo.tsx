import React from "react";

interface MoreInfoPanelProps {
  data: any;
  onSave?: () => void;
  onPreviousTrip?: () => void;
  onNextTrip?: () => void;
}

export const MoreInfoPanel: React.FC<MoreInfoPanelProps> = ({
  data,
  onSave,
  onPreviousTrip,
  onNextTrip,
}) => {
  return (
    <div className="bg-[#f8fafd] min-h-screen flex flex-col items-start ">

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Trip Type */}
        <div>
          <label className="text-sm font-semibold text-gray-600">Trip Type</label>
          <div className="mt-1 text-gray-900 font-medium">Normal</div>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Service</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200">
              <option>Block Train Conventional</option>
              <option>Express Cargo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Sub Service</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200">
              <option>Repair</option>
              <option>Replacement</option>
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Load Type</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200">
            <option>Loaded</option>
            <option>Empty</option>
          </select>
        </div>

        {/* QC Userdefined 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">QC Userdefined 2</label>
          <div className="flex gap-2">
            <select className="w-1/3 border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200">
              <option>QC</option>
              <option>Check</option>
            </select>
            <input
              className="w-2/3 border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200"
              placeholder="Enter Value"
            />
          </div>
        </div>

        {/* QC Userdefined 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">QC Userdefined 3</label>
          <div className="flex gap-2">
            <select className="w-1/3 border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200">
              <option>QC</option>
              <option>Check</option>
            </select>
            <input
              className="w-2/3 border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200"
              placeholder="Enter Value"
            />
          </div>
        </div>

        {/* Remarks 2 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks 2</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200"
            placeholder="Enter Remarks"
          />
        </div>

        {/* Remarks 3 */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks 3</label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-200"
            placeholder="Enter Remarks"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onPreviousTrip}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>↩</span> Previous Trip <span className="text-blue-600 font-semibold">(3)</span>
          </button>

          <button
            onClick={onNextTrip}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>↪</span> Next Trip <span className="text-blue-600 font-semibold">(1)</span>
          </button>
        </div>
      </div>

      
      {/* Footer action */}
      <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300 absolute bottom-0">
            <button type="button" className="bg-blue-600 my-2 text-white px-4 py-1 rounded font-medium h-8" onClick={() => ''}>
                Save Details
            </button>
        </div>
    </div>
  );
};