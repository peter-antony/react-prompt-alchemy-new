import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
} from "react";
import { SideDrawer } from "@/components/Common/SideDrawer";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import { Paperclip, BookX, Link, Copy } from "lucide-react";

export type WorkOrderFormHandle = {
  getWorkOrderValues: () => any;
};

type Props = {
  value: boolean;
  onClose: () => void;
};

const WorkOrderOperationDetails = forwardRef<WorkOrderFormHandle, Props>(
  ({ onClose, value }, ref) => {
    const panelRef1 = useRef<DynamicPanelRef>(null);
    const panelRef2 = useRef<DynamicPanelRef>(null);
    const panelRef3 = useRef<DynamicPanelRef>(null);

    useImperativeHandle(ref, () => ({
      getWorkOrderValues: () => {
        return {
          Operation: panelRef1.current?.getFormValues?.(),
          Location: panelRef2.current?.getFormValues?.(),
          Schedule: panelRef3.current?.getFormValues?.(),
        };
      },
    }));

    // ------ PANEL CONFIGS -------- //

    const operationPanelConfig: PanelConfig = {
      TypeOfAction: {
        id: "TypeOfAction",
        label: "Type of Action",
        fieldType: "lazyselect",
        width: "third",
        mandatory: true,
        visible: true,
        editable: true,
        order: 1,
        value: "",
      },
      Operation: {
        id: "Operation",
        label: "Operation",
        fieldType: "lazyselect",
        width: "third",
        mandatory: true,
        visible: true,
        editable: true,
        order: 2,
        value: "",
      },
      CodeNo: {
        id: "CodeNo",
        label: "Code No / CUU",
        fieldType: "lazyselect",
        width: "third",
        mandatory: true,
        visible: true,
        editable: true,
        order: 3,
        value: "",
      },
      ServiceMode: {
        id: "ServiceMode",
        label: "Service Mode",
        fieldType: "radio",
        width: "third",
        mandatory: true,
        value: "Workshop",
        visible: true,
        editable: true,
        order: 4,
        options: [
          { label: "Workshop", value: "Workshop" },
          { label: "Mobile", value: "Mobile" },
        ],
      },
      ShipmentType: {
        id: "ShipmentType",
        label: "Shipment Type",
        fieldType: "radio",
        width: "third",
        mandatory: true,
        value: "return",
        visible: true,
        editable: true,
        order: 5,
        options: [
          { label: "Forward / Return", value: "return" },
          { label: "One-Way", value: "oneWay" },
        ],
      },
    };

    const locationPanelConfig: PanelConfig = {
      Origin: {
        id: "Origin",
        label: "Origin",
        fieldType: "lazyselect",
        width: "six",
        value: "",
        mandatory: true,
        visible: true,
        editable: true,
        order: 1,
      },
      OutboundDest: {
        id: "OutboundDest",
        label: "Outbound Destination",
        fieldType: "lazyselect",
        width: "six",
        value: "",
        mandatory: true,
        visible: true,
        editable: true,
        order: 2,
      },
      RUForward: {
        id: "RUForward",
        label: "RU Forward",
        fieldType: "lazyselect",
        width: "six",
        value: "",
        visible: true,
        mandatory: true,
        editable: true,
        order: 3,
      },
      ReturnDest: {
        id: "ReturnDest",
        label: "Return Destination",
        fieldType: "lazyselect",
        width: "six",
        value: "",
        visible: true,
        mandatory: true,
        editable: true,
        order: 4,
      },
      RUReturn: {
        id: "RUReturn",
        label: "RU Return",
        fieldType: "lazyselect",
        width: "six",
        value: "",
        visible: true,
        mandatory: true,
        editable: true,
        order: 5,
      },
    };

    const schedulePanelConfig: PanelConfig = {
      DepartureDate: {
        id: "DepartureDate",
        label: "Departure Date",
        fieldType: "date",
        width: "six",
        value: "",
        visible: true,
        editable: true,
        mandatory: true,
        order: 1,
      },
      ArrivalDate: {
        id: "ArrivalDate",
        label: "Arrival Date",
        fieldType: "date",
        width: "six",
        value: "",
        visible: true,
        editable: true,
        mandatory: true,
        order: 2,
      },
      EntryDate: {
        id: "EntryDate",
        label: "Entry Date",
        fieldType: "date",
        width: "six",
        value: "",
        visible: true,
        editable: true,
        mandatory: true,
        order: 3,
      },
      ScheduledExitDate: {
        id: "ScheduledExitDate",
        label: "Scheduled Exit Date",
        fieldType: "date",
        width: "six",
        value: "",
        visible: true,
        editable: true,
        mandatory: true,
        order: 4,
      },
      ActualExitDate: {
        id: "ActualExitDate",
        label: "Actual Exit Date",
        fieldType: "date",
        width: "full",
        value: "",
        visible: true,
        editable: true,
        mandatory: true,
        order: 5,
      },
    };

    return (
      <SideDrawer
        isOpen={value}
        isBack={false}
        onClose={onClose}
        title="Operation Details"
        width="90%"
      >
        <div className="space-y-6 p-4 bg-[#F8F9FC] h-full overflow-y-auto custom-scrollbar">
          {/* ------ PANEL 1 ------ */}
          <DynamicPanel
            ref={panelRef1}
            panelId="OperationPanel"
            panelTitle="Operation Details"
            panelConfig={operationPanelConfig}
          />

          {/* ------ PANEL 2 ------ */}
          <DynamicPanel
            ref={panelRef2}
            panelId="LocationPanel"
            panelTitle="Location Details"
            panelConfig={locationPanelConfig}
          />
          <div className="flex justify-center gap-3 py-3 mt-2 border-t border-gray-200">
            <button
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Attachments"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <div className=" items-center justify-center">
              Create Forward Trip
            </div>

            <button
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Amendment History"
            >
              <BookX className="w-5 h-5 text-gray-600" />
               <div className=" items-center justify-center">
              Create Forward Trip
            </div>
            </button>

            <button
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Linked Orders"
            >
              <Link className="w-5 h-5 text-gray-600" />
               <div className=" items-center justify-center">
              Create Forward Trip
            </div>
            </button>

            <button
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Copy"
            >
              <Copy className="w-5 h-5 text-gray-600" />
               <div className=" items-center justify-center">
              Create Forward Trip
            </div>
            </button>
          </div>

          {/* ------ PANEL 3 ------ */}
          <DynamicPanel
            ref={panelRef3}
            panelId="SchedulePanel"
            panelTitle="Schedule"
            panelConfig={schedulePanelConfig}
          />
          <div className="bg-white border-t border-red-300 p-3 flex justify-end gap-3 mt-26 ">
            <button className="px-4 border border-gray-300 rounded-md hover:bg-gray-100">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save
            </button>
          </div>
        </div>
      </SideDrawer>
    );
  }
);

export default WorkOrderOperationDetails;
