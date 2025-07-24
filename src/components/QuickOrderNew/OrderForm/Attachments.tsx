import React, { useState } from "react";
import { Paperclip, Trash , CircleCheck, FileText, BookPlus , FileImage , BookA , UploadCloud, Search, Filter } from "lucide-react";

const fileIcons = {
  pdf: <FileText className="text-red-500 w-6 h-6" />,
  xls: <BookPlus  className="text-green-500 w-6 h-6" />,
  jpg: <FileImage  className="text-orange-400 w-6 h-6" />,
  doc: <BookA  className="text-blue-500 w-6 h-6" />,
};

const mockAttachments = [
  { name: "Booking Request.jpg", type: "jpg", category: "BR Amendment" },
  { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
  { name: "Booking Request.xls", type: "xls", category: "BR Amendment" },
  { name: "Booking Request.doc", type: "doc", category: "BR Amendment" },
];

export default function Attachments() {
  const [fileCategory, setFileCategory] = useState("BR Ammend");
  const [remarks, setRemarks] = useState("");
  const [uploadedFile, setUploadedFile] = useState({
    name: "Routine Check.pdf",
    type: "pdf",
    date: "20 Sep, 2023 at 11:30",
    size: "1.5 Mb",
    status: "success",
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full pr-6 bg-[#f8fafd]">
      {/* Left Form */}
      <div className="md:w-1/3 w-full bg-white p-6 flex flex-col gap-6">
        {/* File Category */}
        <div>
          <label className="block text-sm font-medium mb-1">File Category <span className="text-red-500">*</span></label>
          <select
            className="w-full border rounded px-3 py-2"
            value={fileCategory}
            onChange={e => setFileCategory(e.target.value)}
          >
            <option>BR Ammend</option>
            <option>BR Amendment</option>
            <option>Invoice</option>
          </select>
        </div>
        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Enter Remarks"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
          />
        </div>
        {/* Attachment */}
        <div>
          <label className="block text-sm font-medium mb-1">Attachment <span className="text-red-500">*</span></label>
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-blue-50 cursor-pointer mb-3">
            <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center">
              <UploadCloud className="w-7 h-7 p-1 text-gray-500 bg-gray-300 rounded-full" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-blue-600 font-medium">Click to Upload </span>or drag and drop<br />SVG, PNG, JPG, GIF or PDF (Maximum File Size 2 MB)
            </div>
          </div>
          {/* Uploaded file preview */}
          <div className="flex items-center gap-3 border rounded-lg p-3 bg-white shadow-sm">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <div className="font-medium text-gray-800">Routine Check.pdf</div>
              <div className="text-xs text-gray-500">20 Sep, 2023 at 11:30 • 1.5 Mb</div>
            </div>
            <CircleCheck  className="w-5 h-5 text-white" fill="green" />
            <button className="p-1 hover:bg-gray-100 rounded">
              <Trash className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
        {/* Save Button */}
        <button className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-2 hover:bg-blue-700 transition">Save</button>
      </div>

      {/* Right Attachments List */}
      <div className="flex-1 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Total Attachments</span>
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">6</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="border rounded border-gray-300 pl-3 pr-3 py-2 text-sm"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
            <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100">
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        {/* Attachments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAttachments.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border">
              {fileIcons[file.type]}
              <div className="flex-1">
                <div className="font-medium text-gray-800">{file.name}</div>
                <div className="text-xs text-gray-500">{file.category}</div>
              </div>
              <button className="p-2 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19.5" cy="12" r="1.5" />
                  <circle cx="4.5" cy="12" r="1.5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}