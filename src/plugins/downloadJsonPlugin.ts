
import { GridPlugin } from '@/types/smartgrid';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import React from 'react';

export const downloadJsonPlugin: GridPlugin = {
  id: 'download-json',
  name: 'Download JSON',
  toolbar: (api) => {
    const handleDownloadJson = () => {
      const jsonData = JSON.stringify(api.filteredData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    return React.createElement(Button, {
      variant: "outline",
      size: "sm",
      onClick: handleDownloadJson
    }, React.createElement(Download, { className: "h-4 w-4 mr-2" }), "JSON");
  }
};
