import React, { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel"; // Changed import
import { Banknote, Search, Plus, FileSearch, SquarePen, ClipboardCheck, FileText, FileBarChart, ChevronDown, ChevronUp, Copy, MoreVertical, Files, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SmartGrid, SmartGridWithGrouping } from "@/components/SmartGrid";
import { GridColumnConfig } from "@/types/smartgrid";
import { useFooterStore } from "@/stores/footerStore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { InvestigationDetails } from "./InvestigationDetails";
import { ClaimFindings } from "./ClaimFindings";
import ClaimLinkedInternalOrders from "./ClaimLinkedInternalOrders";
import { quickOrderService } from "@/api/services";
import { ClaimService } from '@/api/services/ClaimService';
import { useToast } from '@/hooks/use-toast';
import { useSmartGridState } from '@/hooks/useSmartGridState';

const ClaimsForm = () => {
	const gridId = "ClaimsForm_DocumentDetails";
	const navigate = useNavigate();
	const gridState = useSmartGridState();
	const [searchParams] = useSearchParams();
	const formRef = useRef<DynamicPanelRef>(null);
	const { setFooter, resetFooter } = useFooterStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [claimStatus, setClaimStatus] = useState<string>(""); // Default status
	const [showTooltip, setShowTooltip] = useState(false);
	const [showDropdownMenu, setShowDropdownMenu] = useState(false);
	const [investigationCount, setInvestigationCount] = useState(3); // State for investigation count
	const [isDocumentDetailsOpen, setIsDocumentDetailsOpen] = useState(true); // State for document details collapse
	const [investigationDetailsOpen, setInvestigationDetailsOpen] = useState(false); // State for investigation details sidedrawer
	const [claimFindingsOpen, setClaimFindingsOpen] = useState(false); // State for claim findings sidedrawer
	const [linkedInternalOrdersOpen, setLinkedInternalOrdersOpen] = useState(false); // State for linked internal orders sidedrawer
	const [qcList1, setqcList1] = useState<any>();
	const [qcList2, setqcList2] = useState<any>();
	const [qcList3, setqcList3] = useState<any>();
	const [currencyList, setCurrencyList] = useState<any>();
	const [counterParty, setCounterParty] = useState<any>();

	// Local loader while fetching claim data
	const [isLoadingClaim, setIsLoadingClaim] = useState<boolean>(false);

	// API response and snapshot
	const [apiResponse, setApiResponse] = useState<any>(null);
	const [initialApiResponse, setInitialApiResponse] = useState<any>(null);
	const initialSnapshotRef = useRef<any>(null);
	const { toast } = useToast();
	// Function to get status color classes based on status name (same as ClaimsHub)
	const getStatusColor = (status: string) => {
		const statusColors: Record<string, string> = {
			// Status column colors
			'Released': 'badge-fresh-green rounded-2xl',
			'Executed': 'badge-purple rounded-2xl',
			'Cancelled': 'badge-red rounded-2xl',
			'Rejected': 'badge-red rounded-2xl',
			'Approved': 'badge-green rounded-2xl',
			'Under Amendment': 'badge-orange rounded-2xl',
			'Completed': 'badge-green rounded-2xl',
			'Initiated': 'badge-blue rounded-2xl',
			'Under Revision': 'badge-purple rounded-2xl',
			// Trip Billing Status colors
			'In Progress': 'badge-orange rounded-2xl',
			'Processed': 'badge-blue rounded-2xl',
			'Claim Initiated': 'badge-fresh-green rounded-2xl',
			'Draft': 'badge-orange rounded-2xl',
		};
		return statusColors[status] || "badge-gray rounded-2xl";
	};

	// Get claim ID and status from URL and bind to searchQuery
	useEffect(() => {
		const claimId = searchParams.get('id') || searchParams.get('claimId') || searchParams.get('claimNo');
		const status = searchParams.get('status') || searchParams.get('claimStatus');

		if (claimId) {
			setSearchQuery(claimId);
		}

		if (status) {
			setClaimStatus(status);
		}
	}, [searchParams]);

	useEffect(() => {
		const loadQcMasters = async () => {
			try {
				const [res1, res2, res3, currencyList]: any = await Promise.all([
					quickOrderService.getMasterCommonData({
						messageType: "Claim QC1 Init",
					}),
					quickOrderService.getMasterCommonData({
						messageType: "Claim QC2 Init",
					}),
					quickOrderService.getMasterCommonData({
						messageType: "Claim QC3 Init",
					}),
					quickOrderService.getMasterCommonData({
						messageType: "Currency Init",
					})
				]);
				console.log("res1?.data?.ResponseData", JSON.parse(res1?.data?.ResponseData))
				setqcList1(JSON.parse(res1?.data?.ResponseData || "[]"));
				setqcList2(JSON.parse(res2?.data?.ResponseData || "[]"));
				setqcList3(JSON.parse(res3?.data?.ResponseData || "[]"));
				setCurrencyList(JSON.parse(currencyList?.data?.ResponseData || "[]"));
			} catch (err) {
				console.error("QC API failed", err);
			}
		};
		loadQcMasters();
	}, []);

	// Claims Findings data state - bound to form fields
	const [claimsFindingsData, setClaimsFindingsData] = useState({
		refDocTypeID: "Internal Order - IO_DE24_0239",
		finalClaimAmount: "€ 1000.00",
		usageIDGLAccount: "---",
		supplierNoteNo: "SU/001",
		supplierNoteAmount: "€ 1000.00",
		commentsRemarks: "Mistake Invoice"
	});

	// Document Details Grid Columns
	const documentDetailsColumns: GridColumnConfig[] = [
		{
			key: 'Line_No',
			label: 'Line No.',
			type: 'Text',
			sortable: false,
			editable: false,
			subRow: false,
			width: 100
		},
		{
			key: 'TariffIDOrUsageID',
			label: 'Tariff/Usage ID',
			type: 'Link',
			sortable: false,
			editable: false,
			subRow: false,
			width: 250
		},
		{
			key: 'TariffDescOrUsageDesc',
			label: 'Tariff/Usage Desc.',
			type: 'Text',
			sortable: false,
			editable: false,
			subRow: false,
			width: 250
		},
		{
			key: 'RefDocNo',
			label: 'Ref. Document No.',
			type: 'Text',
			sortable: false,
			editable: false,
			subRow: false,
			width: 100
		},
		{
			key: 'RefDocDate',
			label: 'Ref. Document Date',
			type: 'Date',
			sortable: false,
			editable: false,
			subRow: false,
			// width:
		},
		// {
		// 	key: 'Amount',
		// 	label: 'Invoice Amount',
		// 	type: 'CurrencyWithSymbol',
		// 	sortable: false,
		// 	editable: false,
		// 	width: 150
		// },
		{
			key: 'ClaimAmount',
			label: 'Claim Amount',
			type: 'Integer',
			sortable: false,
			editable: true,
			subRow: false,
			width: 150
		},
		{
			key: 'Amount',
			label: 'Balance Amount',
			type: 'Integer',
			sortable: false,
			editable: true,
			subRow: false,
			width: 150
		},
		{
			key: 'CreditNoteNumber',
			label: 'Credit Note No.',
			type: 'Link',
			sortable: false,
			editable: false,
			subRow: false,
			width: 180
		},
		{
			key: 'SupplierNoteNo',
			label: 'Supplier Note No.',
			type: 'Link',
			sortable: false,
			editable: false,
			subRow: false,
			width: 180
		}
	];

	// Dummy fetcher for lazyselect fields
	const fetchMaster = (
		messageType: string,
		// additionalFilter?: { FilterName: string; FilterValue: string }[]
		extraParams?: Record<string, any>
	) => {
		return async ({ searchTerm, offset, limit }) => {
			try {
				const response = await quickOrderService.getMasterCommonData({
					messageType,
					searchTerm: searchTerm || "",
					offset,
					limit,
					...(extraParams || {}),
				});

				const rr: any = response?.data;
				const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

				return arr.map((item: any) => {
					const id = item.id ?? "";
					const name = item.name ?? "";
					return {
						label: `${id} || ${name}`,
						value: `${id} || ${name}`,
					};
				});
			} catch (err) {
				return [];
			}
		};
	};
	const fetchMasterClaims = (
		messageType: string,
		// additionalFilter?: { FilterName: string; FilterValue: string }[]
		extraParams?: Record<string, any>
	) => {
		return async ({ searchTerm, offset, limit }) => {
			try {
				const response = await ClaimService.getMasterCommonData({
					messageType,
					searchTerm: searchTerm || "",
					offset,
					limit,
					...(extraParams || {}),
				});

				const rr: any = response?.data;
				const arr = rr && rr.ResponseData ? JSON.parse(rr.ResponseData) : [];

				return arr.map((item: any) => {
					const id = item.id ?? "";
					const name = item.name ?? "";
					return {
						label: `${id} || ${name}`,
						value: `${id} || ${name}`,
					};
				});
			} catch (err) {
				return [];
			}
		};
	};

	const getQcOptions = (list: any[]) =>
		list
			?.filter((qc) => qc.id)
			.map((qc) => ({
				label: `${qc.id} || ${qc.name}`,
				value: qc.id,
				name: qc.name
			})) || [];

	// Defining the config as PanelConfig object (Record<string, FieldConfig>)
	const claimPanelConfig: PanelConfig = {
		InvestigationNeeded: {
			id: "InvestigationNeeded",
			label: "Investigation Required",
			fieldType: "switch",
			width: "full",
			value: false,
			mandatory: false,
			visible: true,
			editable: true,
			order: 1
		},
		InitiatedBy: {
			id: "InitiatedBy",
			label: "Initiate By",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims Initiated by Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 2
		},
		Counterparty: {
			id: "Counterparty",
			label: "Counterparty",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims Counter Party Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 3,
			events: {
				onChange: (value) => {
					// Update CounterParty selection
					const [id, description] = (value?.value || value || "").split(" || ");
					setCounterParty(id);
					if (formRef.current) {
						const currentValues = formRef.current.getFormValues() || {};
						// Update form values - explicitly set UNCodeID and UNCodeDescription
						const updatedValues = {
							...currentValues,
							BusinessPartnerID: "",
							BusinessPartnerDescription: ""
						};
						formRef.current.setFormValues(updatedValues);
					}
					// Clear Wagon/Container selection in the DynamicPanel UI
				},
			},
		},
		ForwardisFinancialAction: {
			id: "ForwardisFinancialAction",
			label: "Forwardis Financial Action",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims Forwardis Financial Action Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 4
		},
		ExpectedDocument: {
			id: "ExpectedDocument",
			label: "Expected Document",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims Expected Document Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 5
		},
		BusinessPartnerID: {
			id: "BusinessPartnerID",
			label: "Business Partner",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMasterClaims("Claims Counter Party OnSelect", { selectedClaimCounterParty: counterParty || "" }),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 6
		},
		ClaimDate: {
			id: "ClaimDate",
			label: "Claim Date",
			fieldType: "date",
			width: "four",
			value: null,
			mandatory: true,
			visible: true,
			editable: true,
			order: 7
		},
		ClaimCategory: {
			id: "ClaimCategory",
			label: "Claim Category",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claim Category Init"),
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 8
		},
		CurrencyAmount: {
			id: "CurrencyAmount",
			label: "Claim Amount",
			fieldType: "inputdropdown",
			width: "four",
			mandatory: true,
			visible: true,
			editable: true,
			order: 9,
			value: {
				dropdown: "",
				input: "",
			},
			options: getQcOptions(currencyList),
		},
		ClaimantRefNo: {
			id: "ClaimantRefNo",
			label: "Claimant Ref. No.",
			fieldType: "text",
			width: "four",
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 10
		},
		IncidentType: {
			id: "IncidentType",
			label: "Incident Type",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claim Incident Type Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 11
		},
		IncidentDateTime: {
			id: "IncidentDateTime",
			label: "Incident Date and Time",
			fieldType: "date",
			width: "four",
			value: null,
			mandatory: false,
			visible: true,
			editable: true,
			order: 12
		},
		IncidentLocation: {
			id: "IncidentLocation",
			label: "Incident Location",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Location Init"),
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 13
		},
		RefDocType: {
			id: "RefDocType",
			label: "Ref. Doc. Type",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claim Ref Doc Type Init"),
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 14
		},
		RefDocID: {
			id: "RefDocID",
			label: "Ref. Doc. ID",
			fieldType: "text",
			width: "four",
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 14
		},
		Wagon: {
			id: "Wagon",
			label: "Wagon No.",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Wagon id Init"),
			value: [],
			mandatory: false,
			visible: true,
			editable: true,
			order: 15,
			// multiSelect: true // Not supported in FieldConfig yet, commenting out to avoid error
		},
		Container: {
			id: "Container",
			label: "Container ID",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims RefDocType OnSelect"),
			value: [],
			mandatory: false,
			visible: true,
			editable: true,
			order: 16,
			// multiSelect: true
		},
		THU: {
			id: "THU",
			label: "THU ID",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("THU id Init"),
			value: [],
			mandatory: false,
			visible: true,
			editable: true,
			order: 17,
			// multiSelect: true
		},
		WBS: {
			id: "WBS",
			label: "WBS",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("WBS Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 18
		},
		ActionResolution: {
			id: "ActionResolution",
			label: "Action/ Resolution",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Claims Action/Resolution Init"),
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 19
		},
		AssignedUser: {
			id: "AssignedUser",
			label: "Assigned User",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Createdby Init"),
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 20
		},
		SecondaryRefNo: {
			id: "SecondaryRefNo",
			label: "Secondary Ref. No.",
			fieldType: "text",
			width: "four",
			placeholder: "Enter Secondary Ref. No.",
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 21
		},
		ActionResolutionRemark: {
			id: "ActionResolutionRemark",
			label: "Remark for Action/Resolution",
			fieldType: "text",
			width: "four",
			value: "",
			maxLength: 255,
			placeholder: "Enter Remark for Action/Resolution",
			mandatory: true,
			visible: true,
			editable: true,
			order: 22
		},
		FirstInformationRegister: {
			id: "FirstInformationRegister",
			label: "First Information Register",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter First Information Register",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 23
		},
		FinanceYear: {
			id: "FinanceYear",
			label: "Finance Year",
			fieldType: "lazyselect",
			width: "four",
			fetchOptions: fetchMaster("Financial Year Init"),
			value: "",
			mandatory: false,
			visible: true,
			editable: true,
			order: 24
		},
		QCUserDefined1: {
			id: "QCUserDefined1",
			label: "QC Userdefined 1",
			fieldType: "inputdropdown",
			width: "four",
			mandatory: false,
			visible: true,
			editable: true,
			value: {
				dropdown: "",
				input: "",
			},
			options: getQcOptions(qcList1),
			order: 25,
		},
		QCUserDefined2: {
			id: "QCUserDefined2",
			label: "QC Userdefined 2",
			fieldType: "inputdropdown",
			width: "four",
			mandatory: false,
			visible: true,
			editable: true,
			value: {
				dropdown: "",
				input: "",
			},
			options: getQcOptions(qcList2),
			order: 26,
		},
		QCUserDefined3: {
			id: "QCUserDefined3",
			label: "QC Userdefined 3",
			fieldType: "inputdropdown",
			width: "four",
			mandatory: false,
			visible: true,
			editable: true,
			value: {
				dropdown: "",
				input: "",
			},
			options: getQcOptions(qcList3),
			order: 27,
		},
		Remark1: {
			id: "Remark1",
			label: "Remarks 1",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter Remarks",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 28
		},
		Remark2: {
			id: "Remark2",
			label: "Remarks 2",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter Remarks",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 29
		},
		Remark3: {
			id: "Remark3",
			label: "Remarks 3",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter Remarks",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 30
		},
		Remark4: {
			id: "Remark4",
			label: "Remarks 4",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter Remarks",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 31
		},
		Remark5: {
			id: "Remark5",
			label: "Remarks 5",
			fieldType: "text",
			width: "four",
			maxLength: 255,
			placeholder: "Enter Remarks",
			value: "",
			mandatory: true,
			visible: true,
			editable: true,
			order: 32
		},
	};

	useEffect(() => {
		setFooter({
			visible: true,
			leftButtons: [],
			rightButtons: [
				{
					label: "Cancel",
					onClick: () => navigate(-1),
					// variant: "outline", // Removed unauthorized property
					type: "Button"
				},
				{
					label: "Save",
					onClick: () => {
						// Sync form data to findings before save then persist
						handleSaveClaim();
					},
					// variant: "default", // Removed unauthorized property
					type: "Button"
				},
			],
		});
		return () => resetFooter();
	}, [setFooter, resetFooter, navigate]);

	// Function to sync form field data to Claims Findings panel
	const syncFormDataToFindings = () => {
		if (!formRef.current) return;

		const formValues = formRef.current.getFormValues();
		if (formValues) {
			// Map form fields to claims findings data
			setClaimsFindingsData(prev => {
				const updated: typeof prev = { ...prev };

				// Map RefDocTypeID from form to refDocTypeID
				if (formValues.RefDocTypeID) {
					if (typeof formValues.RefDocTypeID === 'string') {
						updated.refDocTypeID = formValues.RefDocTypeID;
					} else if (typeof formValues.RefDocTypeID === 'object') {
						const docType = formValues.RefDocTypeID;
						const typeName = docType.name || docType.label || '';
						const typeId = docType.id || docType.value || '';
						updated.refDocTypeID = typeName && typeId
							? `${typeName} - ${typeId}`
							: typeName || typeId || prev.refDocTypeID;
					}
				}

				// Map ClaimAmount to finalClaimAmount (format as currency)
				if (formValues.ClaimAmount) {
					const amount = parseFloat(formValues.ClaimAmount);
					if (!isNaN(amount)) {
						updated.finalClaimAmount = `€ ${amount.toFixed(2)}`;
					}
				}

				// You can add more field mappings here as needed
				// Example: updated.supplierNoteNo = formValues.SupplierNoteNo || prev.supplierNoteNo;

				return updated;
			});
		}
	};

	// Sync form data to findings when component mounts or when form data might have changed
	useEffect(() => {
		// Initial sync after a short delay to ensure form is ready
		const timer = setTimeout(() => {
			syncFormDataToFindings();
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	// ---------- Claim API loading + save helpers ----------

	const deepEqual = (a: any, b: any): boolean => {
		if (a === b) return true;
		if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
		const ka = Object.keys(a);
		const kb = Object.keys(b);
		if (ka.length !== kb.length) return false;
		for (const k of ka) {
			if (!kb.includes(k) || !deepEqual(a[k], b[k])) return false;
		}
		return true;
	};

	const normalizeObject = (obj: any) => JSON.parse(JSON.stringify(obj, (_k, v) => (v === '' || v === undefined ? null : v)));

	const resolveModeFlag = (current: any, initial: any, claimNo?: string): 'Insert' | 'Update' | 'NoChange' => {
		if (!claimNo) return 'Insert';
		return deepEqual(normalizeObject(current), normalizeObject(initial)) ? 'NoChange' : 'Update';
	};

	const fetchClaimData = async (claimNo: string) => {
		if (!claimNo) return;
		setIsLoadingClaim(true);
		try {
			const response: any = await ClaimService.getClaimData({ claimNo });
			const parsed = JSON.parse(response?.data?.ResponseData || '{}');
			// Many endpoints return ResultSet array; fall back to entire parsed object if not
			const record = Array.isArray(parsed?.ResultSet) && parsed.ResultSet.length > 0 ? parsed.ResultSet[0] : parsed;
			setApiResponse(record);
			setInitialApiResponse(record);
			console.log('Fetched claim data:', record, apiResponse);
			if (Array.isArray(record?.Document?.Details)) {
				gridState.setGridData(record.Document.Details);
			}
			const Header = record?.Header || {};
			setClaimStatus(Header?.ClaimStatus || '');
			// Map returned record to panel fields (best-effort mapping)
			if (formRef.current && Header) {
				const mapped: Record<string, any> = {
					InvestigationNeeded: Header?.Reference?.InvestigationNeeded === 1 || Header?.Reference?.InvestigationNeeded === '1' || Header?.Reference?.InvestigationNeeded === 'YES' || Header?.Reference?.InvestigationNeeded === 'Yes',
					InitiatedBy: Header?.Reference?.InitiatedBy || '',
					Counterparty: Header?.Reference?.Counterparty || '',
					ForwardisFinancialAction: Header?.Reference?.ForwardisFinancialAction || '',
					ExpectedDocument: Header?.Reference?.ExpectedDocument || '',
					BusinessPartnerID: Header?.Reference?.BusinessPartnerID || '',
					ClaimDate: Header?.Reference?.ClaimDate || null,
					ClaimCategory: Header?.Reference?.ClaimCategory || '',
					CurrencyAmount: Header?.Reference ? { dropdown: Header?.Reference?.Currency, input: Header?.Reference?.ClaimAmount } : { dropdown: '', input: '' },
					ClaimantRefNo: Header?.Reference?.ClaimantRefNo || '',
					IncidentType: Header?.Reference?.IncidentType || '',
					IncidentDateTime: Header?.Reference?.IncidentDateTime || null,
					IncidentLocation: Header?.Reference?.IncidentLocation || '',
					RefDocType: Header?.Reference?.RefDocType || '',
					RefDocID: Header?.Reference?.RefDocID || '',
					Wagon: Header?.Reference?.Wagon || '',
					Container: Header?.Reference?.Container || '',
					THU: Header?.Reference?.THU || '',
					WBS: Header?.Reference?.WBS || '',
					ActionResolution: Header?.Reference?.ActionResolution || '',
					AssignedUser: Header?.Reference?.AssignedUser || '',
					SecondaryRefNo: Header?.Reference?.SecondaryRefNo || '',
					ActionResolutionRemark: Header?.Reference?.ActionResolutionRemark || '',
					FirstInformationRegister: Header?.Reference?.FirstInformationRegister || '',
					FinanceYear: Header?.Reference?.FinanceYear || '',
					QCUserDefined1: Header?.Reference ? { dropdown: Header?.Reference?.QuickCode1, input: Header?.Reference?.QCValue1 } : { dropdown: '', input: '' },
					QCUserDefined2: Header?.Reference ? { dropdown: Header?.Reference?.QuickCode2, input: Header?.Reference?.QCValue2 } : { dropdown: '', input: '' },
					QCUserDefined3: Header?.Reference ? { dropdown: Header?.Reference?.QuickCode3, input: Header?.Reference?.QCValue3 } : { dropdown: '', input: '' },
					Remark1: Header?.Reference?.Remark1 || '',
					Remark2: Header?.Reference?.Remark2 || '',
					Remark3: Header?.Reference?.Remark3 || '',
					Remark4: Header?.Reference?.Remark4 || '',
					Remark5: Header?.Reference?.Remark5 || '',
				};

				formRef.current.setFormValues(mapped);

				// capture snapshot after slight delay to allow form to set
				setTimeout(() => {
					initialSnapshotRef.current = formRef.current?.getFormValues?.();
				}, 50);
			}
		} catch (err) {
			console.error('Failed to fetch claim data:', err);
		}
		finally {
			setIsLoadingClaim(false);
		}
	};

	// Load claim when searchQuery changes
	useEffect(() => {
		if (searchQuery) {
			fetchClaimData(searchQuery);
		} else {
			// New claim - ensure snapshot cleared
			setApiResponse(null);
			setInitialApiResponse(null);
			initialSnapshotRef.current = null;
		}
	}, [searchQuery]);

	const handleSaveClaim = async () => {
		// Sync findings
		syncFormDataToFindings();
		const values = formRef.current?.getFormValues();
		if (!values) return;

		// Debug: raw form values
		console.log('ClaimsForm - form values before payload:', values);

		// Build a fuller debug payload (mapped from form fields)
		const payloadFull = {
			Header: {
				ClaimNo: searchQuery || values.ClaimNo || "",
				ClaimStatus: values.ClaimStatus || "",
				ClaimStatusDescription: values.ClaimStatusDescription || "",
				Reference: {
					InitiatedBy: values.InitiatedBy || "",
					Counterparty: values.Counterparty || "",
					ExpectedDocument: values.ExpectedDocument || "",
					ForwardisFinancialAction: values.ForwardisFinancialAction || "",
					BusinessPartnerID: values.BusinessPartnerID || "",
					BusinessPartnerDescription: values.BusinessPartnerDescription || "",
					IncidentType: values.IncidentType || "",
					IncidentDateTime: values.IncidentDateTime || "",
					IncidentLocation: values.IncidentLocation || "",
					IncidentLocationDescription: values.IncidentLocationDescription || "",
					ClaimCategory: values.ClaimCategory || "",
					Currency: values.CurrencyAmount.dropdown || "",
					ClaimAmount: values.CurrencyAmount.input || "",
					ClaimDate: values.ClaimDate || null,
					RefDocType: values.RefDocType || "",
					RefDocID: values.RefDocID || "",
					ClaimantRefNo: values.ClaimantRefNo || "",
					SecondaryRefNo: values.SecondaryRefNo || null,
					InvestigationNeeded: values.InvestigationNeeded || false,
					Wagon: values.Wagon || null,
					Container: values.Container || null,
					THU: values.THU || null,
					WBS: values.WBS || null,
					ActionResolution: values.ActionResolution || null,
					AssignedUser: values.AssignedUser || null,
					QCUserDefined1: values.QCUserDefined1 || null,
					QCUserDefined2: values.QCUserDefined2 || null,
					QCUserDefined3: values.QCUserDefined3 || null,
					Remark1: values.Remark1 || null,
					Remark2: values.Remark2 || null,
					Remark3: values.Remark3 || null,
					Remark4: values.Remark4 || null,
					Remark5: values.Remark5 || null,
					ModeFlag: resolveModeFlag(values, initialSnapshotRef.current, searchQuery),
					Reason: values.Reason || ""
				}
			}
		};

		console.log('ClaimsForm - final payload to send:', JSON.stringify(payloadFull, null, 2));

		// Call save endpoint (existing limited smart-edit endpoint)
	};

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "Manage Claims", href: "/claims-hub" },
		{ label: "Claims", active: true },
	];

	const pipedData = (id: any, desc: any) => {
		if (id && desc) return `${id} - ${desc}`;
		return id || desc || '-';
	}

	const handleInlineEditDocumentDetails = (rowIndex: number, row: any) => {
		// Update document details data with edited rows
		console.log("Edited Row:", row, rowIndex);
	};
	useEffect(() => {
		gridState.setColumns(documentDetailsColumns);
	}, []);

	const handleClaimNoChange = async (newClaimNo: string) => {
		if (!newClaimNo || newClaimNo.trim() === '') {
			return;
		}

		// Debounce the API call - wait 800ms after user stops typing
		// setIsLoading(true)
		// setLoadingText("Loading Trip")
		await fetchClaimData(newClaimNo.trim());
	};

	return (
		<AppLayout>
			<div className="relative flex flex-col h-full bg-gray-50">
				{isLoadingClaim && (
					<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
						<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
						<div className="text-lg font-semibold text-blue-700">Loading...</div>
						<div className="text-sm text-gray-500 mt-1">Fetching data from server, please wait.</div>
					</div>
				)}
				{/* Breadcrumb */}
				<div className="px-6 pt-4">
					<Breadcrumb items={breadcrumbItems} />
				</div>

				{/* Header */}
				<div className="px-6 py-4 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-semibold">Claims</h1>
						<div className="relative max-w-md">
							<Input
								placeholder="Search Claim No."
								className="pr-10"
								value={searchQuery}
								onChange={(e) => {
									const claimNo = e.target.value;
									setSearchQuery(claimNo);
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										const claimNo = e.currentTarget.value;
										if (claimNo && claimNo.trim() !== '') {
											console.log("🔍 Enter pressed - Fetching claim data for:", claimNo);
											handleClaimNoChange(claimNo);
										} else {
											toast({
												title: "⚠️ Invalid Claim No.",
												description: "Please enter a valid Claim No. to search.",
												variant: "destructive",
											});
										}
									}
								}}
								onBlur={(e) => {
									const claimNo = e.target.value;
									// Auto-trigger on blur if URL param exists and value changed
									if (searchQuery && claimNo && claimNo.trim() !== '' && claimNo !== searchQuery) {
										console.log("🔍 Input blur - Fetching claim data for:", claimNo);
										handleClaimNoChange(claimNo);
									}
								}}
							/>
							{isLoadingClaim ? (
								<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
							) : (
								<Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							)}
						</div>
						<div className="">
							<span className={getStatusColor(claimStatus) + ' text-xs'}>
								{claimStatus}
							</span>
						</div>
					</div>

					{/* new claim button and action buttons */}
					<div className="flex items-center gap-3">
						{/* New Claim Button */}
						<div className="relative inline-block">
							<button
								onClick={() => {
									// Dynamically get the base path from the current URL
									const { pathname } = window.location;
									// Find the base path 
									const basePathMatch = pathname.match(/^\/[^/]+/);
									const basePath = basePathMatch ? basePathMatch[0] : "";
									window.location.href = `${basePath}/create-claim`;
								}}
								className="border border-blue-500 text-blue-500 text-sm font-medium hover:bg-blue-50 h-9 rounded flex items-center transition-colors duration-200 gap-2 px-3"
								type='button'
								onMouseEnter={() => setShowTooltip(true)}
								onMouseLeave={() => setShowTooltip(false)}
							>
								<Plus className="h-4 w-4" />
								New Claim
							</button>

							{/* Tooltip */}
							{showTooltip && (
								<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-50 whitespace-nowrap">
									Create New Claim
									{/* Tooltip arrow */}
									<div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-full left-1/2 -translate-x-1/2 -mt-1" />
								</div>
							)}
						</div>

						{/* Copy Icon Button */}
						<button
							onClick={() => {
								// Handle copy action
								console.log("Copy clicked");
							}}
							className="h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors duration-200"
							type='button'
							title="Copy"
						>
							<Copy className="h-4 w-4 text-gray-600" />
						</button>

						{/* 3 Dots Menu Button */}
						<div className="relative inline-block">
							<button
								onClick={() => setShowDropdownMenu(!showDropdownMenu)}
								className="h-9 w-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors duration-200"
								type='button'
								title="More options"
							>
								<MoreVertical className="h-4 w-4 text-gray-600" />
							</button>

							{/* Dropdown Menu */}
							{showDropdownMenu && (
								<>
									<div className="fixed inset-0 z-40" onClick={() => setShowDropdownMenu(false)} />
									<div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
										<div className="py-1">
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Quick Billing clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Quick Billing
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Manage Logistic Payable clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Manage Logistic Payable
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Manage Logistic Receivable clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Manage Logistic Receivable
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Edit & View Customer Credit Note clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Edit & View Customer Credit Note
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Edit & View Supplier Credit Note clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Edit & View Supplier Credit Note
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Attachments clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Attachments
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Audit Trail clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Audit Trail
											</button>
											<button
												onClick={() => {
													setLinkedInternalOrdersOpen(true);
													setShowDropdownMenu(false);
													console.log("Linked Claims and IO clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Linked Claims and IO
											</button>
											<button
												onClick={() => {
													setShowDropdownMenu(false);
													console.log("Workflow clicked");
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
											>
												Workflow
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-auto px-6 pb-20 pt-3">
					{/* Claim & Reference Panel */}
					<DynamicPanel
						ref={formRef}
						panelId="claim-form-panel"
						panelIcon={<Banknote className="h-5 w-5 text-green-600" />}
						panelTitle="Claim & Reference"
						collapsible={true}
						panelConfig={claimPanelConfig}
						initialData={{}}
						badgeValue=""
					/>

					{/* Investigation Details Panel */}
					{apiResponse?.InvestigationDetails && (<div className="mt-4">
						<Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<div className="flex items-center justify-between px-4 py-3">
								{/* Left side: Icon and Title */}
								<div className="flex items-center">
									<div className="flex items-center justify-center w-10 h-10 rounded-lg">
										<FileSearch className="h-5 w-5 text-purple-600" />
									</div>
									<h3 className="text-sm font-medium text-gray-700">Investigation Details</h3>
								</div>

								{/* Right side: Badge and Edit Button */}
								<div className="flex items-center gap-3 cursor-pointer">
									{/* Count Badge */}
									<div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium text-center">
										{apiResponse?.InvestigationDetails.length} Nos
									</div>

									{/* Edit Button */}
									<Button
										variant="outline"
										size="icon"
										className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
										onClick={() => {
											// Handle edit action
											console.log("Edit Investigation Details clicked");
											setInvestigationDetailsOpen(true);
										}}
									>
										<SquarePen className="h-4 w-4 text-gray-600" />
									</Button>
								</div>
							</div>
						</Card>
					</div>)
					}
					{/* Claims Findings Panel */}
					{apiResponse?.ClaimFindings && (<div className="mt-4">
						<Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
							{/* Header Section */}
							<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
								{/* Left side: Icon and Title */}
								<div className="flex items-center">
									<div className="flex items-center justify-center w-10 h-10 rounded-md">
										<FileText className="h-5 w-5 text-red-400" />
									</div>
									<h3 className="text-sm font-semibold text-gray-800">Claims Findings</h3>
								</div>

								{/* Right side: Edit Button */}
								<Button
									variant="outline"
									size="icon"
									className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
									onClick={() => {
										// Handle edit action
										console.log("Edit Claims Findings clicked");
										setClaimFindingsOpen(true);
									}}
								>
									<SquarePen className="h-4 w-4 text-gray-600" />
								</Button>
							</div>

							{/* Content Section */}
							<div className="p-4">
								{/* First Row - 5 Key-Value Pairs */}
								<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
									{/* Ref. Doc. Type/ ID */}
									<div className="flex flex-col">
										<label className="text-xs text-muted-foreground mb-1">Ref. Doc. Type/ ID</label>
										<span className="text-sm font-semibold text-foreground">
											{pipedData(apiResponse?.ClaimFindings?.ReferenceDocType, apiResponse?.ClaimFindings?.ReferenceDocNo)}
										</span>
									</div>

									{/* Final Claim Amount */}
									<div className="flex flex-col">
										<label className="text-xs text-muted-foreground mb-1">Final Claim Amount</label>
										<span className="text-sm font-semibold text-foreground">
											{apiResponse?.ClaimFindings?.Currency} {apiResponse?.ClaimFindings?.FinalClaimAmount}
										</span>
									</div>

									{/* Usage ID/GL Account */}
									<div className="flex flex-col">
										<label className="text-xs text-muted-foreground mb-1">Usage ID/GL Account</label>
										<span className="text-sm font-semibold text-foreground">
											{apiResponse?.ClaimFindings?.UsageIDOrGLAccount || "--"}
										</span>
									</div>

									{/* Supplier Note No. */}
									<div className="flex flex-col">
										<label className="text-xs text-muted-foreground mb-1">Supplier Note No.</label>
										<span className="text-sm font-semibold text-foreground">
											{apiResponse?.ClaimFindings?.SupplierNoteNo || "--"}
										</span>
									</div>

									{/* Supplier Note Amount */}
									<div className="flex flex-col">
										<label className="text-xs text-muted-foreground mb-1">Supplier Note Amount</label>
										<span className="text-sm font-semibold text-foreground">
											{apiResponse?.ClaimFindings?.Currency} {apiResponse?.ClaimFindings?.SupplierNoteAmount}
										</span>
									</div>
								</div>

								{/* Second Row - Comments/Remarks (Full Width) */}
								<div className="flex flex-col">
									<label className="text-xs text-muted-foreground mb-1">Comments/Remarks</label>
									<span className="text-sm font-semibold text-foreground">
										{apiResponse?.ClaimFindings?.CommentRemark || "--"}
									</span>
								</div>
							</div>
						</Card>
					</div>)
					}
					{/* Document Details Panel */}
					{apiResponse?.Document.Details && (<div className="mt-4">
						<Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
							<Collapsible open={isDocumentDetailsOpen} onOpenChange={setIsDocumentDetailsOpen}>
								{/* Header Section */}
								<CollapsibleTrigger className="w-full">
									<div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
										{/* Left side: Icon and Title */}
										<div className="flex items-center">
											<div className="flex items-center justify-center w-10 h-10 rounded-md">
												<FileBarChart className="h-5 w-5 text-blue-600" />
											</div>
											<h3 className="text-sm font-semibold text-gray-800">Document Details</h3>
										</div>

										{/* Right side: Edit Button and Chevron */}
										<div className="flex items-center gap-2">
											<Button
												variant="outline"
												size="icon"
												className="h-9 w-9 rounded-md border-gray-300 hover:bg-gray-50"
												onClick={(e) => {
													e.stopPropagation();
													// Handle edit action
													console.log("Edit Document Details clicked");
												}}
											>
												<SquarePen className="h-4 w-4 text-gray-600" />
											</Button>
											{isDocumentDetailsOpen ? (
												<ChevronUp className="h-5 w-5 text-gray-600" />
											) : (
												<ChevronDown className="h-5 w-5 text-gray-600" />
											)}
										</div>
									</div>
								</CollapsibleTrigger>

								<CollapsibleContent>
									{/* Summary Boxes Section */}
									<div className="px-4 pb-4 mt-3">
										<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
											{/* Total Invoice Amount */}
											<div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
												<label className="text-xs text-gray-700 font-medium mb-1 block">Total Invoice Amount</label>
												<span className="text-lg font-semibold text-purple-600">
													€ {apiResponse?.Document?.Summary?.TotalInvoiceAmount?.toFixed(2)}
												</span>
											</div>

											{/* Total Claim Amount */}
											<div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
												<label className="text-xs text-gray-700 font-medium mb-1 block">Total Claim Amount</label>
												<span className="text-lg font-semibold text-pink-600">
													€ {apiResponse?.Document?.Summary?.TotalClaimAmount?.toFixed(2)}
												</span>
											</div>

											{/* Total Balance Amount */}
											<div className="bg-green-50 rounded-lg p-4 border border-green-200">
												<label className="text-xs text-gray-700 font-medium mb-1 block">Total Balance Amount</label>
												<span className="text-lg font-semibold text-green-600">
													€ {apiResponse?.Document?.Summary?.TotalBalanceAmount?.toFixed(2)}
												</span>
											</div>
										</div>
									</div>

									{/* SmartGrid Table Section */}
									<div className="px-4 pb-4">
										<SmartGrid
											columns={gridState.columns}
											data={gridState.gridData || []}
											hideToolbar={true}
											hideRightToolbar={true}
											hideCheckboxToggle={true}
											onLinkClick={(rowData: any, columnKey: string) => {
												console.log("Link clicked:", columnKey, rowData);
												// Handle link clicks for Credit Note No. and Supplier Note No.
											}}
											onInlineEdit={handleInlineEditDocumentDetails}
											gridId={gridId}
											gridTitle="Document Details"
											userId="user-1"
										/>
										{/* <SmartGridWithGrouping
											columns={documentDetailsColumns}
											data={apiResponse?.Document?.Details || []}
											groupableColumns={[]}
											showGroupingDropdown={false}
											paginationMode="pagination"
											customPageSize={500} // made 500 for infinte pagnation replication
											// selectedRows={selectedRows}
											// onSelectionChange={setSelectedRows}
											// onRowClick={handleRowClick}
											onLinkClick={
												(rowData: any, columnKey: string) => {
													console.log("Link clicked:", columnKey, rowData);
													// Handle link clicks for Credit Note No. and Supplier Note No.
												}
											}
											hideToolbar={true}
											// rowClassName={(row: any, index: number) => {
											// 	return selectedRowIds.has(row.ItemName) ? 'selected' : ''; // Row Selection based on ItemName
											// }}
											showDefaultConfigurableButton={false}
											gridTitle=""
											recordCount={formattedLineItems.length || 0}
											showCreateButton={false}
											userId="current-user"
											gridId="Claims-grid"
											onInlineEdit={handleInlineEditDocumentDetails}
										/> */}
									</div>
								</CollapsibleContent>
							</Collapsible>
						</Card>
					</div>)
					}

				</div>
			</div>

			{/* Investigation Details Section */}
			<InvestigationDetails
				isOpen={investigationDetailsOpen}
				onClose={() => setInvestigationDetailsOpen(false)}
			/>

			{/* Claim Findings Section */}
			<ClaimFindings
				isOpen={claimFindingsOpen}
				onClose={() => setClaimFindingsOpen(false)}
			/>
			{/* Linked Internal Orders Section */}
			<ClaimLinkedInternalOrders
				isOpen={linkedInternalOrdersOpen}
				onClose={() => setLinkedInternalOrdersOpen(false)}
				claimNo={searchQuery}
			/>
		</AppLayout>
	);
};

export default ClaimsForm;
