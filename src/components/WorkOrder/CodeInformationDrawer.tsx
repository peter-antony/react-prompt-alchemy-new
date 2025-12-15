import React, { useState, useEffect } from "react";
import { SideDrawer } from "@/components/Common/SideDrawer";
import { 
  Settings, 
  AlertTriangle, 
  ClipboardList, 
  FileText, 
  CheckCircle2 
} from "lucide-react";
import { workOrderService } from "@/api/services/workOrderService";

interface CodeInformationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  operationCode?: string;
  selectedCode?: string;
  onCodeSelect?: (code: string) => void;
  selectedOnlyCodes?: any;
}

interface CodeInfo {
  CUUCode: string;
  Component: string;
  Irregularities: string;
  IrregularityClass?: string;
  Criteria: string;
  Notes: string;
  ActionToBeTaken: string;
}

const CodeInformationDrawer: React.FC<CodeInformationDrawerProps> = ({
  isOpen,
  onClose,
  operationCode = "Operation 01",
  selectedCode,
  onCodeSelect,
  selectedOnlyCodes,
}) => {
  const [codes, setCodes] = useState<string[]>([]);
  const [activeCode, setActiveCode] = useState<string>(selectedCode || "");
  const [codeInformation, setCodeInformation] = useState<Record<string, CodeInfo>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch code CUU details only when drawer is opened
  useEffect(() => {
    if (!isOpen) {
      // Reset state when drawer is closed
      setCodes([]);
      setCodeInformation({});
      setActiveCode(selectedCode || "");
      setError(null);
      return;
    }

    const fetchCodeCUUDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await workOrderService.getCodeCUUDetails();
        // Parse the response
        const parsedData = response?.data?.ResponseData
          ? JSON.parse(response.data.ResponseData)
          : response?.data;
        console.log("Code CUU Details Response:", parsedData);

        // Map API response to CodeInfo structure
        // Assuming the API returns an array of code objects
        // Adjust the mapping based on actual API response structure
        if (Array.isArray(parsedData)) {
          const codesList: string[] = [];
          const codeInfoMap: Record<string, CodeInfo> = {};

          // Build an allowed set from selectedOnlyCodes prop (if provided).
          const allowedSet = new Set<string>();
          if (selectedOnlyCodes) {
            if (Array.isArray(selectedOnlyCodes)) {
              selectedOnlyCodes.forEach((s: any) => {
                if (!s) return;
                if (typeof s === 'string') allowedSet.add(s);
                else if (typeof s === 'object') {
                  const v = s.CUUCode || s.CodeNoCUU || s.value || s.CUU || s.Id || s.id;
                  if (v) allowedSet.add(String(v));
                }
              });
            } else if (typeof selectedOnlyCodes === 'string') {
              allowedSet.add(selectedOnlyCodes);
            } else if (typeof selectedOnlyCodes === 'object') {
              const v = selectedOnlyCodes.CUUCode || selectedOnlyCodes.CodeNoCUU || selectedOnlyCodes.value || selectedOnlyCodes.id;
              if (v) allowedSet.add(String(v));
            }
          }

          // If the prop `selectedOnlyCodes` was provided but is empty, treat that as "show no codes".
          // This prevents returning the full list when the caller explicitly requests an empty selection.
          const hasSelectedOnlyCodesProp = typeof selectedOnlyCodes !== 'undefined';
          if (hasSelectedOnlyCodesProp && allowedSet.size === 0) {
            // Explicit empty selection — clear lists and exit early
            setCodes([]);
            setCodeInformation({});
            setActiveCode("");
            return;
          }

          parsedData.forEach((item: any) => {
            console.log("Code CUU Details Item:", item);
            const code = item.CUUCode || item.CUU || item.code || item.value || "";
            if (!code) return;

            // If an allowed set exists, only include codes present in it
            if (allowedSet.size > 0 && !allowedSet.has(String(code))) return;

            codesList.push(code);
            codeInfoMap[code] = {
              CUUCode: item.CUUCode || item.CUU || "",
              Component: item.Component || "",
              Irregularities: item.Irregularities || "",
              IrregularityClass: `Class : ${item.IrregularityClass}`,
              Criteria: item.Criteria || "",
              Notes: item.Notes || "",
              ActionToBeTaken: item.ActionToBeTaken || "",
            };
          });

          setCodes(codesList);
          setCodeInformation(codeInfoMap);

          // Set active code to selectedCode if provided and present in filtered list, otherwise first code
          if (selectedCode && codesList.includes(selectedCode)) {
            setActiveCode(selectedCode);
          } else if (codesList.length > 0) {
            setActiveCode(codesList[0]);
          } else {
            // If nothing matched (due to filtering), clear activeCode
            setActiveCode("");
          }
        } else if (parsedData && typeof parsedData === 'object') {
          // Handle single object or different structure
          // Adjust based on actual API response format
          console.warn("Unexpected API response format:", parsedData);
        }
      } catch (err: any) {
        console.error("Error fetching code CUU details:", err);
        setError(err.message || "Failed to fetch code CUU details");
      } finally {
        setLoading(false);
      }
    };

    fetchCodeCUUDetails();
  }, [isOpen, selectedCode]);

  const handleCodeClick = (code: string) => {
    setActiveCode(code);
    if (onCodeSelect) {
      onCodeSelect(code);
    }
  };

  // Update activeCode when selectedCode prop changes
  useEffect(() => {
    if (selectedCode && codes.includes(selectedCode)) {
      setActiveCode(selectedCode);
    }
  }, [selectedCode, codes]);

  const currentInfo = codeInformation[activeCode] || (codes.length > 0 ? codeInformation[codes[0]] : null);

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Code Information"
      badgeContent={operationCode || "-"}
      isBadgeRequired={true}
      width="600px"
      isBack={false}
      onScrollPanel={true}
    >
      <div className="p-6 bg-gray-50 min-h-full">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-b-2 border-gray-200"></div>
              <div className="text-sm text-gray-600">Loading code information...</div>
            </div>
          </div>
        ) : codes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500">No code information available</div>
          </div>
        ) : (
          <>
            {/* Code Selection Buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {codes.map((code) => (
                <button
                  key={code}
                  onClick={() => handleCodeClick(code)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeCode === code
                      ? "bg-blue-600 text-white border-2 border-blue-600"
                      : "bg-white text-gray-600 border-2 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Information Cards */}
            {currentInfo ? (
              <div className="space-y-4">
                {/* Component Card */}
                <div className="bg-white rounded-lg py-4 border border-gray-200 shadow-sm">
                    <div className="flex px-6 items-start gap-3">
                        <div className="rounded-lg">
                            <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Component</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3 px-6">{currentInfo.Component || "-"}</p>
                </div>

                {/* Irregularities Card */}
                <div className="bg-white rounded-lg py-4 border border-gray-200 shadow-sm">
                  <div className="flex px-6 items-start gap-3">
                    <div className="rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-700">Irregularities</h3>
                        {currentInfo.IrregularityClass && (
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200 text-xs font-medium">
                            {currentInfo.IrregularityClass}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                    <p className="text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3 px-6">{currentInfo.Irregularities || "-"}</p>
                </div>

                {/* Criteria Card */}
                <div className="bg-white rounded-lg py-4 border border-gray-200 shadow-sm">
                  <div className="flex px-6 items-start gap-3">
                    <div className="rounded-lg">
                        <ClipboardList className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Criteria</h3>
                    </div>
                  </div>
                    <p className="text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3 px-6">{currentInfo.Criteria || "-"}</p>
                </div>

                {/* Notes Card */}
                <div className="bg-white rounded-lg py-4 border border-gray-200 shadow-sm">
                  <div className="flex px-6 items-start gap-3">
                    <div className="rounded-lg">
                        <FileText className="w-5 h-5 text-lime-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
                    </div>
                  </div>
                    <p className="text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3 px-6">{currentInfo.Notes || "-"}</p>
                </div>

                {/* Action to be Taken Card */}
                <div className="bg-white rounded-lg py-4 border border-gray-200 shadow-sm">
                  <div className="flex px-6 items-start gap-3">
                    <div className="rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Action to be Taken</h3>
                    </div>
                  </div>
                    <p className="text-sm text-gray-600 border-t border-gray-200 mt-3 pt-3 px-6">{currentInfo.ActionToBeTaken || "-"}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-gray-500">No information available for selected code</div>
              </div>
            )}
          </>
        )}
      </div>
    </SideDrawer>
  );
};

export default CodeInformationDrawer;

