import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PanelConfig } from '@/types/dynamicPanel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConsignorConsigneeSideDrawProps {
    isOpen: boolean;
    onClose: () => void;
    width?: string;
    onSave: (data: any) => void;
    initialConsignorData?: any;
    initialConsigneeData?: any;
}

const ConsignorConsigneeSideDraw: React.FC<ConsignorConsigneeSideDrawProps> = ({ isOpen, onClose, onSave, initialConsignorData, initialConsigneeData }) => {
    const [activeTab, setActiveTab] = useState('consignor');
    const [consignorId, setConsignorId] = useState('');
    const [consignorName, setConsignorName] = useState('');
    const [consigneeId, setConsigneeId] = useState('');
    const [consigneeName, setConsigneeName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [suburb, setSuburb] = useState('');
    const [pincode, setPincode] = useState('');
    const [zone, setZone] = useState('');
    const [subZone, setSubZone] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailId, setEmailId] = useState('');

    useEffect(() => {
        if (isOpen && initialConsignorData) {
            setConsignorId(initialConsignorData.ConsignorID || '');
            setConsignorName(initialConsignorData.ConsignorDescription || '');
            setAddressLine1(initialConsignorData.AddressLine1 || '');
            setAddressLine2(initialConsignorData.AddressLine2 || '');
            setSuburb(initialConsignorData.SubHurb || '');
            setPincode(initialConsignorData.Pincode || '');
            setZone(initialConsignorData.Zone || '');
            setSubZone(initialConsignorData.SubZone || '');
            setCity(initialConsignorData.City || '');
            setState(initialConsignorData.State || '');
            setCountry(initialConsignorData.Country || '');
            setRegion(initialConsignorData.Region || '');
            setContactPerson(initialConsignorData.ContactPerson || '');
            setPhoneNumber(initialConsignorData.PhoneNo || '');
            setEmailId(initialConsignorData.EmailID || '');
        }
        if (isOpen && initialConsigneeData) {
            setConsigneeId(initialConsigneeData.ConsigneeID || '');
            setConsigneeName(initialConsigneeData.ConsigneeDescription || '');
            // Note: Address and contact details are assumed to be common, so they are set by consignor or by the first one that exists.
            // If distinct address/contact for consignee is needed, add separate state for them and bind here.
        }
    }, [isOpen, initialConsignorData, initialConsigneeData]);

    if (!isOpen) return null;

    const handleSave = () => {
        const data = {
            consignorId,
            consignorName,
            consigneeId,
            consigneeName,
            addressLine1,
            addressLine2,
            suburb,
            pincode,
            zone,
            subZone,
            city,
            state,
            country,
            region,
            contactPerson,
            phoneNumber,
            emailId,
            activeTab, // To know which tab was active when saving
        };
        onSave(data);
        // onClose(); // Close the side draw after saving
    };

    //   const consignorConfig: PanelConfig = {
    //     consignorId: {
    //       id: 'consignorId',
    //       label: 'Consignor ID',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: true,
    //       visible: true,
    //       editable: true,
    //       order: 1,
    //       width: 'half',
    //       placeholder: 'Enter Consignor ID',
    //     },
    //     name: {
    //       id: 'name',
    //       label: 'Name',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: true,
    //       visible: true,
    //       editable: true,
    //       order: 2,
    //       width: 'half',
    //       placeholder: 'Enter Name',
    //     },
    //     addressLine1: {
    //       id: 'addressLine1',
    //       label: 'Address Line 1',
    //       fieldType: 'textarea',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 3,
    //       width: 'full',
    //       placeholder: 'Enter Details',
    //     },
    //     addressLine2: {
    //       id: 'addressLine2',
    //       label: 'Address Line 2',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 4,
    //       width: 'half',
    //       placeholder: 'Enter Details',
    //     },
    //     suburb: {
    //       id: 'suburb',
    //       label: 'Suburb',
    //       fieldType: 'select',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 5,
    //       width: 'half',
    //       placeholder: 'Select Suburb',
    //       options: [
    //         { label: 'Suburb 1', value: 'suburb1' },
    //         { label: 'Suburb 2', value: 'suburb2' },
    //       ],
    //     },
    //     pincode: {
    //       id: 'pincode',
    //       label: 'Pincode',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 6,
    //       width: 'half',
    //       placeholder: 'Enter Pincode',
    //     },
    //     zone: {
    //       id: 'zone',
    //       label: 'Zone',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 7,
    //       width: 'half',
    //       placeholder: 'Enter Zone',
    //     },
    //     subZone: {
    //       id: 'subZone',
    //       label: 'Sub Zone',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 8,
    //       width: 'half',
    //       placeholder: 'Enter Sub Zone',
    //     },
    //     city: {
    //       id: 'city',
    //       label: 'City',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 9,
    //       width: 'half',
    //       placeholder: 'Enter City',
    //     },
    //     state: {
    //       id: 'state',
    //       label: 'State',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 10,
    //       width: 'half',
    //       placeholder: 'Enter State',
    //     },
    //     country: {
    //       id: 'country',
    //       label: 'Country',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 11,
    //       width: 'half',
    //       placeholder: 'Enter Country',
    //     },
    //     region: {
    //       id: 'region',
    //       label: 'Region',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 12,
    //       width: 'full',
    //       placeholder: 'Enter Region',
    //     },
    //   };

    //   const consigneeConfig: PanelConfig = {
    //     consigneeId: {
    //       id: 'consigneeId',
    //       label: 'Consignee ID',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: true,
    //       visible: true,
    //       editable: true,
    //       order: 1,
    //       width: 'half',
    //       placeholder: 'Enter Consignee ID',
    //     },
    //     name: {
    //       id: 'name',
    //       label: 'Name',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: true,
    //       visible: true,
    //       editable: true,
    //       order: 2,
    //       width: 'half',
    //       placeholder: 'Enter Name',
    //     },
    //     addressLine1: {
    //       id: 'addressLine1',
    //       label: 'Address Line 1',
    //       fieldType: 'textarea',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 3,
    //       width: 'full',
    //       placeholder: 'Enter Details',
    //     },
    //     addressLine2: {
    //       id: 'addressLine2',
    //       label: 'Address Line 2',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 4,
    //       width: 'half',
    //       placeholder: 'Enter Details',
    //     },
    //     suburb: {
    //       id: 'suburb',
    //       label: 'Suburb',
    //       fieldType: 'select',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 5,
    //       width: 'half',
    //       placeholder: 'Select Suburb',
    //       options: [
    //         { label: 'Suburb 1', value: 'suburb1' },
    //         { label: 'Suburb 2', value: 'suburb2' },
    //       ],
    //     },
    //     pincode: {
    //       id: 'pincode',
    //       label: 'Pincode',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 6,
    //       width: 'half',
    //       placeholder: 'Enter Pincode',
    //     },
    //     zone: {
    //       id: 'zone',
    //       label: 'Zone',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 7,
    //       width: 'half',
    //       placeholder: 'Enter Zone',
    //     },
    //     subZone: {
    //       id: 'subZone',
    //       label: 'Sub Zone',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 8,
    //       width: 'half',
    //       placeholder: 'Enter Sub Zone',
    //     },
    //     city: {
    //       id: 'city',
    //       label: 'City',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 9,
    //       width: 'half',
    //       placeholder: 'Enter City',
    //     },
    //     state: {
    //       id: 'state',
    //       label: 'State',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 10,
    //       width: 'half',
    //       placeholder: 'Enter State',
    //     },
    //     country: {
    //       id: 'country',
    //       label: 'Country',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 11,
    //       width: 'half',
    //       placeholder: 'Enter Country',
    //     },
    //     region: {
    //       id: 'region',
    //       label: 'Region',
    //       fieldType: 'text',
    //       value: '',
    //       mandatory: false,
    //       visible: true,
    //       editable: true,
    //       order: 12,
    //       width: 'full',
    //       placeholder: 'Enter Region',
    //     },
    //   };

    //   const renderFormFields = (config: PanelConfig) => {
    //     const sortedFields = Object.values(config).sort((a, b) => a.order - b.order);

    //     return (
    //       <div className="grid grid-cols-12 gap-4 py-4">
    //         {sortedFields.map(field => (
    //           <div key={field.id} className={`col-span-12 ${field.width === 'half' ? 'md:col-span-6' : ''}`}>
    //             {field.label && <Label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</Label>}
    //             {field.fieldType === 'text' && (
    //               <Input
    //                 type="text"
    //                 id={field.id}
    //                 placeholder={field.placeholder}
    //                 defaultValue={field.value}
    //                 disabled={!field.editable}
    //                 className="w-full"
    //               />
    //             )}
    //             {field.fieldType === 'textarea' && (
    //               <textarea
    //                 id={field.id}
    //                 placeholder={field.placeholder}
    //                 defaultValue={field.value}
    //                 disabled={!field.editable}
    //                 rows={3}
    //                 className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    //               ></textarea>
    //             )}
    //             {field.fieldType === 'select' && (
    //               <Select defaultValue={field.value} disabled={!field.editable}>
    //                 <SelectTrigger className="w-full">
    //                   <SelectValue placeholder={field.placeholder} />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {field.options?.map(option => (
    //                     <SelectItem key={option.value} value={option.value}>
    //                       {option.label}
    //                     </SelectItem>
    //                   ))}
    //                 </SelectContent>
    //               </Select>
    //             )}
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   };

    // Max character length validation for text fields - will include special characters and whitespace
    const MAX_LENGTH_consignorId = 50;
    const MAX_LENGTH_consignorName = 100;
    const MAX_LENGTH_consigneeId = 50;
    const MAX_LENGTH_consigneeName = 100;
    const MAX_LENGTH_addressLine1 = 100;
    const MAX_LENGTH_addressLine2 = 100;
    const MAX_LENGTH_suburb = 100;
    const MAX_LENGTH_pincode = 50;
    const MAX_LENGTH_zone = 100;
    const MAX_LENGTH_subZone = 100;
    const MAX_LENGTH_city = 250;
    const MAX_LENGTH_state = 250;
    const MAX_LENGTH_country = 250;
    const MAX_LENGTH_region = 250;
    const MAX_LENGTH_contactPerson = 255;
    const MAX_LENGTH_phoneNumber = 50;
    const MAX_LENGTH_emailId = 150;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-600 bg-opacity-50 transition-opacity" onClick={onClose}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex" style={{ width: '40%' }}>
                <div className="w-full h-full bg-white flex flex-col shadow-xl">
                    <div className="flex items-start justify-between px-4 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Add Consignor/Consignee</h2>
                        <div className="ml-3 h-7 flex items-center">
                            <Button
                                type="button"
                                className="bg-white rounded-md text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close panel</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </Button>
                        </div>
                    </div>
                    <div className="px-4 mt-4 overflow-y-auto">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-1/2 grid-cols-2 bg-gray-100 border border-gray-200 rounded-md p-0">
                                <TabsTrigger value="consignor">Consignor</TabsTrigger>
                                <TabsTrigger value="consignee">Consignee</TabsTrigger>
                            </TabsList>
                            <TabsContent value="consignor" className="mt-6">
                                {/* {renderFormFields(consignorConfig)} */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Consignor ID</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Consignor ID"
                                                value={consignorId}
                                                onChange={(e) => setConsignorId(e.target.value)}
                                                className={`pr-10 h-10 ${consignorId && consignorId.length > MAX_LENGTH_consignorId
                                                        ? "border-red-600 focus-visible:ring-red-600"
                                                        : ""
                                                    }`}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {consignorId &&
                                                    consignorId.length > MAX_LENGTH_consignorId &&
                                                    `Maximum character limit is ${MAX_LENGTH_consignorId}. [${consignorId.length}/${MAX_LENGTH_consignorId}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Name"
                                                value={consignorName}
                                                onChange={(e) => setConsignorName(e.target.value)}
                                                className={`pr-10 h-10 ${consignorName && consignorName.length > MAX_LENGTH_consignorName
                                                        ? "border-red-600 focus-visible:ring-red-600"
                                                        : ""
                                                    }`}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {consignorName &&
                                                    consignorName.length > MAX_LENGTH_consignorName &&
                                                    `Maximum character limit is ${MAX_LENGTH_consignorName}. [${consignorName.length}/${MAX_LENGTH_consignorName}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="consignee" className="mt-6">
                                {/* {renderFormFields(consigneeConfig)} */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Consignee ID</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Consignee ID"
                                                value={consigneeId}
                                                onChange={(e) => setConsigneeId(e.target.value)}
                                                className={`pr-10 h-10 ${consigneeId && consigneeId.length > MAX_LENGTH_consigneeId
                                                        ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {consigneeId &&
                                                    consigneeId.length > MAX_LENGTH_consigneeId &&
                                                    `Maximum character limit is ${MAX_LENGTH_consigneeId}. [${consigneeId.length}/${MAX_LENGTH_consigneeId}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Name</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Name"
                                                value={consigneeName}
                                                onChange={(e) => setConsigneeName(e.target.value)}
                                                className={`pr-10 h-10 ${consigneeName && consigneeName.length > MAX_LENGTH_consigneeName
                                                        ? "border-red-600 focus-visible:ring-red-600" : ""}`}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {consigneeName &&
                                                    consigneeName.length > MAX_LENGTH_consigneeName &&
                                                    `Maximum character limit is ${MAX_LENGTH_consigneeName}. [${consigneeName.length}/${MAX_LENGTH_consigneeName}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <div className='mb-3'>
                                <h3 className='text-lg font-semibold text-gray-900 mt-3'>Address Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Address Line 1</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Address Line 1"
                                                value={addressLine1}
                                                onChange={(e) => setAddressLine1(e.target.value)}
                                                className={addressLine1 && addressLine1.length > MAX_LENGTH_addressLine1 ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {addressLine1 && addressLine1.length > MAX_LENGTH_addressLine1 && `Maximum character limit is ${MAX_LENGTH_addressLine1}. [${addressLine1.length}/${MAX_LENGTH_addressLine1}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Address Line 2</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Address Line 2"
                                                value={addressLine2}
                                                onChange={(e) => setAddressLine2(e.target.value)}
                                                className={addressLine2 && addressLine2.length > MAX_LENGTH_addressLine2 ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {addressLine2 && addressLine2.length > MAX_LENGTH_addressLine2 && `Maximum character limit is ${MAX_LENGTH_addressLine2}. [${addressLine2.length}/${MAX_LENGTH_addressLine2}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Suburb</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Suburb"
                                                value={suburb}
                                                onChange={(e) => setSuburb(e.target.value)}
                                                className={suburb && suburb.length > MAX_LENGTH_suburb ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {suburb && suburb.length > MAX_LENGTH_suburb && `Maximum character limit is ${MAX_LENGTH_suburb}. [${suburb.length}/${MAX_LENGTH_suburb}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pincode</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Pincode"
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                                className={pincode && pincode.length > MAX_LENGTH_pincode ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {pincode && pincode.length > MAX_LENGTH_pincode && `Maximum character limit is ${MAX_LENGTH_pincode}. [${pincode.length}/${MAX_LENGTH_pincode}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Zone</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Zone"
                                                value={zone}
                                                onChange={(e) => setZone(e.target.value)}
                                                className={zone && zone.length > MAX_LENGTH_zone ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {zone && zone.length > MAX_LENGTH_zone && `Maximum character limit is ${MAX_LENGTH_zone}. [${zone.length}/${MAX_LENGTH_zone}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Sub Zone</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Sub Zone"
                                                value={subZone}
                                                onChange={(e) => setSubZone(e.target.value)}
                                                className={subZone && subZone.length > MAX_LENGTH_subZone ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {subZone && subZone.length > MAX_LENGTH_subZone && `Maximum character limit is ${MAX_LENGTH_subZone}. [${subZone.length}/${MAX_LENGTH_subZone}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">City</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter City"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className={city && city.length > MAX_LENGTH_city ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {city && city.length > MAX_LENGTH_city && `Maximum character limit is ${MAX_LENGTH_city}. [${city.length}/${MAX_LENGTH_city}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">State</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter State"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className={state && state.length > MAX_LENGTH_state ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {state && state.length > MAX_LENGTH_state && `Maximum character limit is ${MAX_LENGTH_state}. [${state.length}/${MAX_LENGTH_state}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Country</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className={country && country.length > MAX_LENGTH_country ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {country && country.length > MAX_LENGTH_country && `Maximum character limit is ${MAX_LENGTH_country}. [${country.length}/${MAX_LENGTH_country}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Region</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Region"
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                className={region && region.length > MAX_LENGTH_region ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {region && region.length > MAX_LENGTH_region && `Maximum character limit is ${MAX_LENGTH_region}. [${region.length}/${MAX_LENGTH_region}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h3 className='text-lg font-semibold text-gray-900 mt-3'>Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Contact Person</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Contact Person"
                                                value={contactPerson}
                                                onChange={(e) => setContactPerson(e.target.value)}
                                                className={contactPerson && contactPerson.length > MAX_LENGTH_contactPerson ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {contactPerson && contactPerson.length > MAX_LENGTH_contactPerson && `Maximum character limit is ${MAX_LENGTH_contactPerson}. [${contactPerson.length}/${MAX_LENGTH_contactPerson}]`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone No.</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Phone Number"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className={phoneNumber && phoneNumber.length > MAX_LENGTH_phoneNumber ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {phoneNumber && phoneNumber.length > MAX_LENGTH_phoneNumber && `Maximum character limit is ${MAX_LENGTH_phoneNumber}. [${phoneNumber.length}/${MAX_LENGTH_phoneNumber}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email ID</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Enter Email ID"
                                                value={emailId}
                                                onChange={(e) => setEmailId(e.target.value)}
                                                className={emailId && emailId.length > MAX_LENGTH_emailId ? "border-red-600 focus-visible:ring-red-600" : ""}
                                            />
                                            <p className="text-xs text-red-500 mt-1">
                                                {emailId && emailId.length > MAX_LENGTH_emailId && `Maximum character limit is ${MAX_LENGTH_emailId}. [${emailId.length}/${MAX_LENGTH_emailId}]`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tabs>
                    </div>
                    <div className="flex-shrink-0 px-4 py-4 flex justify-end border-t border-gray-200 bg-gray-50 mt-auto">
                        {/* <Button type="button" variant="outline" onClick={onClose} className="mr-2">Cancel</Button> */}
                        <Button type="submit" onClick={handleSave} className='bg-blue-500 text-white hover:bg-blue-600'>Save</Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ConsignorConsigneeSideDraw;
