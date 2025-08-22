import React, { useState } from 'react';
import { Settings, Printer, NotebookPen, MoreHorizontal, BookText, EllipsisVertical } from 'lucide-react';
import { Button } from "./ui/button";
import { useFooterStore, FooterButtonConfig } from "../stores/footerStore";
import CommonPopup from "@/components/Common/CommonPopup";

const renderButton = (config: FooterButtonConfig, index: number, showPopover: boolean, setShowPopover: (show: boolean) => void) => {
  const buttonStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-background text-blue-600 border border-blue-600 hover:bg-blue-50",
    cancel: "bg-white text-red-300 hover:text-red-600 hover:bg-red-100",
  };

  const getButtonClass = () => {
    if (config.label.toLowerCase() === "cancel") {
      return buttonStyles.cancel;
    }else if(config.label.toLowerCase() === "save draft"){
      return buttonStyles.secondary;
    }
    return config.type === "Button"
      ? buttonStyles.primary
      : buttonStyles.secondary;
  };

  const getIconButton = () => {
    if (config.iconName === "BookText") return <BookText size={24} strokeWidth={1.5} />;
    if (config.iconName === "EllipsisVertical") return <EllipsisVertical size={24} />;
    return null; // fallback if icon not found
  };

  // ⛳ Apply key here to the root element
  switch (config.type) {
    case 'Icon':
      // Special handling for CIM/CUV Report button with hover popover
      if (config.label === "CIM/CUV Report") {
        return (
          <div key={`${config.iconName}-${index}`} className="relative">
            <Button
              variant="ghost"
              onClick={config.onClick}
              disabled={config.disabled || config.loading}
              className="font-medium transition-colors border border-gray-300 px-2 py-2 h-8 text-sm rounded-lg"
              onMouseEnter={() => setShowPopover(true)}
              onMouseLeave={() => setShowPopover(false)}
            >
              {config.loading ? "Loading..." : getIconButton()}
            </Button>
            {showPopover && (
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md shadow-lg z-50 whitespace-nowrap">
                CIM/CUV Report
              </div>
            )}
          </div>
        );
      }
      return (
        <Button
          key={`${config.iconName}-${index}`}
          variant="ghost"
          onClick={config.onClick}
          disabled={config.disabled || config.loading}
          className="font-medium transition-colors border border-gray-300 h-8 px-2 py-2 text-[13px] rounded-lg"
        >
          {config.loading ? "Loading..." : getIconButton()}
        </Button>
      );
    case "Link":
      return (
        <a
          key={`${config.label}-${index}`}
          href={config?.label || "#"}
          className="text-blue-600 underline text-[13px]"
        >
          {config.label}
        </a>
      );
    case "Button":
    default:
      return (
        <Button
          key={`${config.label}-${index}`}
          variant="secondary"
          onClick={config.onClick}
          disabled={config.disabled || config.loading}
          className={`${getButtonClass()} font-medium transition-colors px-4 py-2 h-8 text-[13px] rounded-sm`}
        >
          {config.loading ? "Loading..." : config.label}
        </Button>
      );
  }
};

export const AppFooter: React.FC = () => {
  const [showCimCuvPopover, setShowCimCuvPopover] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [fields, setFields] = useState([
    {
      type: "select",
      label: "Reason Code",
      name: "reasonCode",
      placeholder: "Select Reason Code",
      options: [
        { value: "A", label: "Reason A" },
        { value: "B", label: "Reason B" },
      ],
      value: "",
    },
    {
      type: "text",
      label: "Reason Code Desc.",
      name: "reasonDesc",
      placeholder: "Enter Reason Code Description",
      value: "",
    },
  ]);

  const handleFieldChange = (name, value) => {
    setFields(fields =>
      fields.map(f => (f.name === name ? { ...f, value } : f))
    );
  };

  const [popupTitle, setPopupTitle] = useState('');
  const [popupButtonName, setPopupButtonName] = useState('');
  const [popupBGColor, setPopupBGColor] = useState('');
  const [popupTextColor, setPopupTextColor] = useState('');
  const [popupTitleBgColor, setPopupTitleBgColor] = useState('');
  const openAmendPopup = () => {
    setPopupOpen(true);
    setPopupTitle('Amend');
    setPopupButtonName('Amend');
    setPopupBGColor('bg-blue-600');
    setPopupTextColor('text-blue-600');
    setPopupTitleBgColor('bg-blue-100');
  };

  const openCancelPopup = () => {
    setPopupOpen(true);
    setPopupTitle('Cancel Bill');
    setPopupButtonName('Cancel');
    setPopupBGColor('bg-red-600');
    setPopupTextColor('text-red-500');
    setPopupTitleBgColor('bg-red-50');
  };
  const { config } = useFooterStore();

  if (!config.visible) {
    return null;
  }

  return (
    // <footer className="h-12 w-96 bg-white border-t border-gray-200 flex items-center justify-between px-6 fixed bottom-0">
    //   <div className="flex items-center">
    //   </div>
    //   <div className="flex items-center space-x-3">
    //     <button onClick={() => openCancelPopup()} className="px-4 py-2 text-sm text-red-200 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
    //       Cancel
    //     </button>
    //     <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:text-accent-foreground px-4 py-2 h-8 my-2 rounded border-blue-600 text-blue-600 hover:bg-blue-50">
    //       Save Draft
    //     </button>
    //     <button onClick={() => openAmendPopup()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground px-4 py-2 h-8 my-2 bg-blue-200 rounded hover:bg-blue-700" >
    //       Confirm
    //     </button>
    //   </div>
    //   <CommonPopup
    //     open={popupOpen}
    //     onClose={() => setPopupOpen(false)}
    //     title={popupTitle}
    //     titleColor={popupTextColor}
    //     titleBGColor={popupTitleBgColor}
    //     icon={<NotebookPen className="w-4 h-4" />}
    //     fields={fields as any}
    //     onFieldChange={handleFieldChange}
    //     onSubmit={() => {
    //       setPopupOpen(false);
    //     }}
    //     submitLabel={popupButtonName}
    //     submitColor={popupBGColor}
    //   />
    // </footer>
    <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-between px-6 fixed bottom-0 left-[60px] right-0 z-20">
      {/* {config.pageName == "Quick_Order" && (
        <> */}
             <div className="flex items-center space-x-4">
         {config.leftButtons.map((config, index) => renderButton(config, index, showCimCuvPopover, setShowCimCuvPopover))}
         {/* {config.leftButtons.length > 0 &&
               <Button variant="ghost" size="icon" className='h-9 w-9 border'>
                  <MoreHorizontal size={16} />
                 <BookText size={16}/>
               </Button>
             } */}
       </div>
       <div className="flex items-center space-x-4">
         {config.rightButtons.map((config, index) => renderButton(config, index, showCimCuvPopover, setShowCimCuvPopover))}
       </div>
      {/* </>
      )} */}
    </footer>
  );
};