import React, { useState } from 'react';
import { Settings, Printer, NotebookPen, MoreHorizontal, BookText, EllipsisVertical } from 'lucide-react';
import { Button } from "./ui/button";
import { useFooterStore, FooterButtonConfig } from "../stores/footerStore";
import CommonPopup from "@/components/Common/CommonPopup";

const renderButton = (config: FooterButtonConfig, index: number) => {
  const buttonStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-background text-blue-600 border border-blue-600 hover:bg-blue-50",
    cancel: "bg-white text-red-500 hover:text-red-600 hover:bg-red-50",
  };

  const getButtonClass = () => {
    if (config.label.toLowerCase() === "cancel") {
      return buttonStyles.cancel;
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
      return (
        <Button
          key={`${config.iconName}-${index}`}
          variant="ghost"
          onClick={config.onClick}
          disabled={config.disabled || config.loading}
          className="font-medium transition-colors border border-gray-300 px-3 py-2 text-sm rounded-lg"
        >
          {config.loading ? "Loading..." : getIconButton()}
        </Button>
      );
    case "Link":
      return (
        <a
          key={`${config.label}-${index}`}
          href={config?.label || "#"}
          className="text-blue-600 underline text-sm"
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
          className={`${getButtonClass()} font-medium transition-colors px-4 py-2 text-sm rounded-sm`}
        >
          {config.loading ? "Loading..." : config.label}
        </Button>
      );
  }
};

export const AppFooter: React.FC = () => {

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
    <footer className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 fixed bottom-0 left-16 right-0 z-20">
      {/* {config.pageName == "Quick_Order" && (
        <> */}
      <div className="flex items-center space-x-4">
        {config.leftButtons.map((config, index) => renderButton(config, index))}
        {/* {config.leftButtons.length > 0 &&
              <Button variant="ghost" size="icon" className='h-9 w-9 border'>
                 <MoreHorizontal size={16} />
                <BookText size={16}/>
              </Button>
            } */}
      </div>
      <div className="flex items-center space-x-4">
        {config.rightButtons.map((config, index) => renderButton(config, index))}
      </div>
      {/* </>
      )} */}
    </footer>
  );
};