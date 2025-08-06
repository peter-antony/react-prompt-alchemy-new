import { useRef, useState } from "react";
import { Download, UploadCloud, FileCheck2, MoreVertical } from "lucide-react";

export default function BulkUpload() {
  const [files, setFiles] = useState([
    {
      name: "Wagon Details.xls",
      size: "1.5 mb",
      date: "20 Sep, 2023 at 11:30",
      status: "Uploaded (5/5)",
      icon: "/xls-icon.png", // Replace with your icon path or use an SVG
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // You can add file upload logic here
      // For now, just add to the list
      const file = e.target.files[0];
      setFiles([
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} mb`,
          date: new Date().toLocaleString(),
          status: "Uploaded (1/1)",
          icon: "/xls-icon.png",
        },
      ]);
    }
  };

  const onUploadFiles = () => {
    console.log("FORM DATA : ");
  }

  return (
    <div className="bg-[#f8fafd] min-h-screen flex flex-col items-start ">
        <div className="w-full max-w-3xl mx-auto px-4 py-4 mb-16 h-full content-scroll">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Bulk Upload</h2>
            <button className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                <Download className="w-4 h-4" />
                Download Templates
            </button>
            </div>

            <div className="mb-6">
            <div
                className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 flex flex-col items-center justify-center py-6 cursor-pointer transition hover:border-blue-400"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center">
                    <UploadCloud className="w-7 h-7 p-1 text-gray-500 rounded-full" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    <span className="text-blue-600 font-medium">Click to Upload </span>or drag and drop<br />XLSX or CSV (Maximum File Size 2 MB)
                </div>
                {/* <span className="text-blue-600 font-medium text-sm mb-1">
                Click to Upload
                </span>
                <span className="text-xs text-gray-500 mb-1">
                or drag and drop
                </span>
                <span className="text-xs text-gray-400">
                XLSX or CSV (Maximum File Size 2 MB)
                </span> */}
                <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx,.csv"
                className="hidden"
                onChange={handleFileChange}
                />
            </div>
            </div>

            <div className="mb-16">
              <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-base">Attached Files</span>
                  <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {files.length.toString().padStart(2, "0")}
                  </span>
              </div>
              {files.map((file, idx) => (
                  <div
                  key={idx}
                  className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-3 mb-2 shadow-sm"
                  >
                  <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded">
                      {/* Replace with your own icon if needed */}
                      <img
                          src="https://img.icons8.com/color/48/000000/ms-excel.png"
                          alt="xls"
                          className="w-7 h-7"
                      />
                      </div>
                      <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-400">
                          {file.size} &nbsp;•&nbsp; {file.date}
                      </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="flex items-center bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                      <FileCheck2 className="w-4 h-4 mr-1" /> {file.status}
                      </span>
                      <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                  </div>
                  </div>
              ))}
            </div>

        </div>

        <div className="flex bg-white justify-end w-full px-4 border-t border-gray-300 absolute bottom-0">
            <button type="button" className="bg-blue-600 my-2 text-white px-4 py-1 rounded font-medium h-8" onClick={onUploadFiles}>
                Upload File
            </button>
        </div>

    </div>
    
  );
}