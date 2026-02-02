import React, { useRef, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AppLayout } from "@/components/AppLayout";
import { DynamicPanel, DynamicPanelRef } from "@/components/DynamicPanel";
import { PanelConfig } from "@/types/dynamicPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Settings, FileText, ChevronDown, ChevronUp, FileChartColumnIncreasingIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { receivablesAuthService } from "@/api/services/ReceivablesAuthService";


const loadLocalData = {
	Header: {
		InvoiceNo: "INVR_D23_0021",
		DocumentType: "RM_CMI",
		PaymentDate: "2023-05-19T10:05:35.433",
		PaymentStatus: "Pending",
		CustomerEmailID: "guillaume.binot@viseo.com",
		InclVATAmount: 5580,
		ExcVATAmount: 5580,
		InvoiceCreationDate: "2023-05-19T10:05:35.433",
		PurchaseOrderNo: 1234567890,
		BalanceAmount: 1200,
		Status: "Fresh",
		CustomerID: "46796531",
		CustomerName: "FRET SNCF",
		PrintedRemark: "Test Printed Remark",
		SecondaryRefNo: 345453,
		FinancialYear: "2026",
		Comment: null,
		TransferInvoiceNo: "TI/2021/00000838",
		TransferInvoiceDate: "2023-05-19T08:47:59.940",
		PayTerm: "ZB60",
		AnchorDate: "2023-05-19T00:00:00",
		NumberingType: "APLAN",
		Currency: "NOK",
		ExchangeRate: 0.085201,
		TotalAmountExclVAT_EUR: 55,
		AssignToUser: "ALA",
		InvoiceAuthorizationDate: "2025-09-02T10:05:35.433",
		DueDate: "2026-03-02T10:05:35.433",
		CreatedByUser: "John Smith",
		ModifiedByUser: "Jane Doe",
		CreationDateTime: "2023-05-19T10:05:35.433",
		ModificationDateTime: "2023-05-19T14:22:30.360",
		PrepaymentData: "Test Prepayment Data",
		PrepaymentAmount: 500,
		PrepaymentDocumentType: null,
		PrepaymentDocumentNo: null,
		Remark1: "Test Remark 1",
		Remark2: "Test Remark 2",
		Remark3: "Test Remark 3",
		QC1: "CQC1",
		QC2: "CQC2",
		QC3: "CQC3",
		QCValue1: "Test QC Value 1",
		QCValue2: "Test QC Value 2",
		QCValue3: "Test QC Value 3",
		InvoiceNumberingType: "INVOICE",
		ReversalNumberingType: "REVERSAL",
		TaxCodeCategory: "TAX_CODE_CATEGORY",
		ModeFlag: "NoChange",
	},
};

const ReceivablesAuthorisation = () => {
	const [searchParams] = useSearchParams();
	const invoiceNoFromUrl = searchParams.get("invoiceNo") ?? searchParams.get("id") ?? "";
	const formRef = useRef<DynamicPanelRef>(null);
	const [invoiceSearch, setInvoiceSearch] = useState(invoiceNoFromUrl);
	const [moreDetailsExpanded, setMoreDetailsExpanded] = useState(true);
	const [apiResponse, setApiResponse] = useState<Record<string, unknown> | null>(null);
	const [header, setHeader] = useState<Record<string, unknown>>();
	const [isLoadingReceivables, setIsLoadingReceivables] = useState(false);

    const formatDateTime = (val: string | null | undefined): string => {
        if (!val) return "";
        try {
            const d = typeof val === "string" ? parseISO(val) : val;
            return format(d, "dd-MMM-yyyy HH:mm:ss");
        } catch {
            return String(val ?? "");
        }
    };
    const formatDate = (val: string | null | undefined): string => {
        if (!val) return "";
        try {
            const d = typeof val === "string" ? parseISO(val) : val;
            return format(d, "dd-MMM-yyyy");
        } catch {
            return String(val ?? "");
        }
    };

    // Format date-time string to time only (e.g. for CreationDateTime)
	const formatTime = (val: string | null | undefined): string => {
		if (!val) return '';
		try {
			const d = typeof val === 'string' ? parseISO(val) : new Date(val);
			return format(d, 'HH:mm:ss');
		} catch {
			return String(val ?? '');
		}
	};
    
	const breadcrumbItems = [
		{ label: "Home", href: "/", active: false },
		{
			label: "Receivables and Customer Credit Note Management",
			href: "/receivables",
			active: false,
		},
		{ label: "Receivables Authorization", active: true },
	];

	const formDataToApplyRef = useRef<Record<string, unknown> | null>(null);

	const fetchReceivablesData = async (invoiceNo?: string) => {
		setIsLoadingReceivables(true);
		try {
			const response: any = await receivablesAuthService.getInvoiceData({ invoiceNo });
			const parsed = JSON.parse(response?.data?.ResponseData || "{}");
			const record = Array.isArray(parsed?.ResultSet) && parsed.ResultSet.length > 0
				? parsed.ResultSet[0]
				: parsed;
            console.log("record ", record);
			setApiResponse(record.Header);
			const Header = (record.Header || {}) as Record<string, unknown>;
			if (Object.keys(Header).length > 0) {
				const mapped: Record<string, any> = {
					...Header,
					DueDate: Header?.DueDate != null ? formatDate(String(Header.DueDate)) : "",
					CreationDate: Header?.CreationDateTime != null ? formatDate(String(Header.CreationDateTime)) : "",
					CreationDateTime: Header?.CreationDateTime != null ? formatTime(String(Header.CreationDateTime)) : "",
					CreationDateTimeFull: Header?.CreationDateTime != null ? formatDateTime(String(Header.CreationDateTime)) : "",
					LastModifiedDate: Header?.ModificationDateTime != null ? formatDate(String(Header.ModificationDateTime)) : "",
					ModificationDateTime: Header?.ModificationDateTime != null ? formatTime(String(Header.ModificationDateTime)) : "",
					// Form field IDs are QCUserDefined1/2/3 (inputdropdown expects { dropdown, input })
					QCUserDefined1: Header?.QC1 != null || Header?.QCValue1 != null
						? { dropdown: Header?.QC1 ?? "", input: Header?.QCValue1 ?? "" }
						: { dropdown: "", input: "" },
					QCUserDefined2: Header?.QC2 != null || Header?.QCValue2 != null
						? { dropdown: Header?.QC2 ?? "", input: Header?.QCValue2 ?? "" }
						: { dropdown: "", input: "" },
					QCUserDefined3: Header?.QC3 != null || Header?.QCValue3 != null
						? { dropdown: Header?.QC3 ?? "", input: Header?.QCValue3 ?? "" }
						: { dropdown: "", input: "" },
				};
				setHeader(mapped);
				formDataToApplyRef.current = mapped;
                console.log("Header?.InvoiceNo ", Header?.InvoiceNo);
				if (Header?.InvoiceNo != null && Header?.InvoiceNo !== "") {
					setInvoiceSearch(String(Header.InvoiceNo));
				}
			}
		} catch (err) {
			console.error("Failed to fetch receivables invoice data:", err);
		} finally {
			setIsLoadingReceivables(false);
		}
	};

	// Sync invoiceSearch from URL when invoiceNo param is present
	useEffect(() => {
		if (invoiceNoFromUrl) {
            console.log("invoiceNoFromUrl ", invoiceNoFromUrl);
			setInvoiceSearch(invoiceNoFromUrl);
		}
	}, [invoiceNoFromUrl]);

	useEffect(() => {
		const initialInvoiceNo = invoiceNoFromUrl || (loadLocalData.Header.InvoiceNo ?? "");
		fetchReceivablesData(initialInvoiceNo || undefined);
	}, [invoiceNoFromUrl]);

	// Apply API data to DynamicPanel after it has mounted and we have data (fixes ref timing)
	useEffect(() => {
		if (!apiResponse || !formDataToApplyRef.current) return;
		const data = formDataToApplyRef.current;
		const apply = () => {
			if (formRef.current && data) {
				formRef.current.setFormValues(data as Record<string, any>);
				formDataToApplyRef.current = null;
			}
		};
		// Defer so DynamicPanel has finished mounting and initializing
		const t = setTimeout(apply, 50);
		return () => clearTimeout(t);
	}, [apiResponse]);

	const initialData = useMemo(() => ({ ...header }), [header]);

    const [qcList1, setqcList1] = useState<any>();
    const [qcList2, setqcList2] = useState<any>();
    const [qcList3, setqcList3] = useState<any>();
    
    useEffect(() => {
		const loadQcMasters = async () => {
			try {
				const [res1, res2, res3, currencyList]: any = await Promise.all([
					receivablesAuthService.getMasterCommonData({
						messageType: "Claim QC1 Init",
					}),
					receivablesAuthService.getMasterCommonData({
						messageType: "Claim QC2 Init",
					}),
					receivablesAuthService.getMasterCommonData({
						messageType: "Claim QC3 Init",
					})
				]);
				console.log("res1?.data?.ResponseData", JSON.parse(res1?.data?.ResponseData))
				setqcList1(JSON.parse(res1?.data?.ResponseData || "[]"));
				setqcList2(JSON.parse(res2?.data?.ResponseData || "[]"));
				setqcList3(JSON.parse(res3?.data?.ResponseData || "[]"));
			} catch (err) {
				console.error("QC API failed", err);
			}
		};
		loadQcMasters();
	}, []);

    const getQcOptions = (list: any[]) =>
		list
			?.filter((qc) => qc.id)
			.map((qc) => ({
				label: `${qc.id} || ${qc.name}`,
				value: qc.id,
				name: qc.name
			})) || [];

    // Dummy fetcher for lazyselect fields
	const fetchMaster = (
		messageType: string,
		// additionalFilter?: { FilterName: string; FilterValue: string }[]
		extraParams?: Record<string, any>
	) => {
		return async ({ searchTerm, offset, limit }) => {
			try {
				const response = await receivablesAuthService.getMasterCommonData({
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

	// Single combined panel config with all fields
	const invoicePanelConfig: PanelConfig = useMemo(() => {
		const moreDetailsFields = [
			"FinancialYear",
			"TransferInvoiceNo",
			"TransferInvoiceDate",
			"PayTerm",
			"NumberingType",
			"AnchorDate",
			"Currency",
			"ExchangeRate",
			"TotalAmountExclVAT_EUR",
			"InvoiceAuthorizationDate",
			"AssignToUser",
			"DueDate",
			"TaxCodeCategory",
			"InvoiceNumberingType",
			"ReversalNumberingType",
			"QC1",
			"QCValue1",
			"QC2",
			"QCValue2",
			"QC3",
			"QCValue3",
			"Remark1",
			"Remark2",
			"Remark3",
		];

		const config: PanelConfig = {
			// Initial fields (always visible)
			PurchaseOrderNo: {
				id: "PurchaseOrderNo",
				label: "Purchase Order No.",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: true,
				editable: true,
				order: 1,
				placeholder: "Enter Purchase Order No.",
			},
			SecondaryRefNo: {
				id: "SecondaryRefNo",
				label: "Secondary Ref. No.",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: true,
				editable: true,
				order: 2,
				placeholder: "Enter Secondary Ref. No.",
			},
			PrintedRemark: {
				id: "PrintedRemark",
				label: "Printed Remark",
				fieldType: "textarea",
				width: "full",
				value: "",
				mandatory: false,
				visible: true,
				editable: true,
				order: 3,
				placeholder: "Enter Printed Remark",
			},

			// More Details header (collapsible)
			MoreDetailsHeader: {
				id: "MoreDetailsHeader",
				label: "More Details",
				fieldType: "header",
				width: "full",
				value: "",
				mandatory: false,
				visible: true,
				editable: true,
				order: 4,
				icon: moreDetailsExpanded ? (
					<ChevronUp className="h-4 w-4 text-gray-600" />
				) : (
					<ChevronDown className="h-4 w-4 text-gray-600" />
				),
				events: {
					onClick: () => {
						setMoreDetailsExpanded(!moreDetailsExpanded);
					},
				},
			},

			// More Details fields (visibility controlled by state)
			FinancialYear: {
				id: "FinancialYear",
				label: "Financial Year",
				fieldType: "lazyselect",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 5,
				fetchOptions: fetchMaster("Financial Year Init"),
				placeholder: "Select year",
			},
			TransferInvoiceNo: {
				id: "TransferInvoiceNo",
				label: "Transfer Invoice No.",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 6,
				placeholder: "Enter Transfer Invoice No.",
			},
			TransferInvoiceDate: {
				id: "TransferInvoiceDate",
				label: "Transfer Invoice Date",
				fieldType: "date",
				width: "half",
				value: null,
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 7,
				placeholder: "-",
			},
			PayTerm: {
				id: "PayTerm",
				label: "Pay Term",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 8,
				fetchOptions: fetchMaster("Pay Term Init"),
				placeholder: "Select pay term",
			},
			NumberingType: {
				id: "NumberingType",
				label: "Numbering Type",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 9,
				fetchOptions: fetchMaster("Numbering Type Init"),
				placeholder: "Select numbering type",
			},
			AnchorDate: {
				id: "AnchorDate",
				label: "Anchor Date",
				fieldType: "date",
				width: "half",
				value: null,
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 10,
				dateFormat: "dd-MMM-yyyy",
				placeholder: "dd-mm-yyyy",
			},
			Currency: {
				id: "Currency",
				label: "Currency",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 11,
				fetchOptions: fetchMaster("Currency Init"),
				placeholder: "Select currency",
			},
			ExchangeRate: {
				id: "ExchangeRate",
				label: "Exchange Rate",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 12,
				placeholder: "",
			},
			TotalAmountExclVAT_EUR: {
				id: "TotalAmountExclVAT_EUR",
				label: "Total amount excl VAT (EUR)",
				fieldType: "currency",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 13,
				placeholder: "€ 0.00",
			},
			InvoiceAuthorizationDate: {
				id: "InvoiceAuthorizationDate",
				label: "Invoice Authorization Date",
				fieldType: "date",
				width: "half",
				value: null,
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 14,
				dateFormat: "dd-MMM-yyyy",
				placeholder: "dd-mm-yyyy",
			},
			AssignToUser: {
				id: "AssignToUser",
				label: "Assign to user",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 15,
				fetchOptions: fetchMaster("Createdby Init"),
				placeholder: "Select user",
			},
			DueDate: {
				id: "DueDate",
				label: "Due Date",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 16,
				placeholder: "dd-mm-yyyy",
			},
			TaxCodeCategory: {
				id: "TaxCodeCategory",
				label: "Tax code",
				fieldType: "select",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 17,
				options: [{ label: "Select tax code", value: "" }],
				placeholder: "Select tax code",
			},
			InvoiceNumberingType: {
				id: "InvoiceNumberingType",
				label: "Invoice Numbering Type",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 18,
				fetchOptions: fetchMaster("Numbering Type Init"),
				placeholder: "Select type",
			},
			ReversalNumberingType: {
				id: "ReversalNumberingType",
				label: "Reversal Numbering Type",
				fieldType: "lazyselect",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 19,
				fetchOptions: fetchMaster("Numbering Type Init"),
				placeholder: "Select type",
			},
			QCUserDefined1: {
                id: "QCUserDefined1",
                label: "QC Userdefined 1",
                fieldType: "inputdropdown",
                width: "full",
                mandatory: false,
                visible: true,
                editable: true,
                value: {
                    dropdown: "",
                    input: "",
                },
                options: getQcOptions(qcList1),
                order: 20,
            },
            QCUserDefined2: {
                id: "QCUserDefined2",
                label: "QC Userdefined 2",
                fieldType: "inputdropdown",
                width: "full",
                mandatory: false,
                visible: true,
                editable: true,
                value: {
                    dropdown: "",
                    input: "",
                },
                options: getQcOptions(qcList2),
                order: 21,
            },
            QCUserDefined3: {
                id: "QCUserDefined3",
                label: "QC Userdefined 3",
                fieldType: "inputdropdown",
                width: "full",
                mandatory: false,
                visible: true,
                editable: true,
                value: {
                    dropdown: "",
                    input: "",
                },
                options: getQcOptions(qcList3),
                order: 22,
            },
			Remark1: {
				id: "Remark1",
				label: "Remark 1",
				fieldType: "text",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 26,
				placeholder: "Enter Remark 1",
			},
			Remark2: {
				id: "Remark2",
				label: "Remark 2",
				fieldType: "text",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 27,
				placeholder: "Enter Remark 2",
			},
			Remark3: {
				id: "Remark3",
				label: "Remark 3",
				fieldType: "text",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 28,
				placeholder: "Enter Remark 3",
			},

			// Audit & Traceability header
			AuditHeader: {
				id: "AuditHeader",
				label: "Audit & Traceability",
				fieldType: "header",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 29,
			},

			// Audit & Traceability fields
			CreatedByUser: {
				id: "CreatedByUser",
				label: "Created By",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 30,
			},
			CreationDateTime: {
				id: "CreationDateTime",
				label: "Creation Time",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 31,
			},
			CreationDate: {
				id: "CreationDate",
				label: "Creation Date",
				fieldType: "date",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 32,
			},
			CreationDateTimeFull: {
				id: "CreationDateTimeFull",
				label: "Creation Date & Time",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 33,
			},
			ModifiedByUser: {
				id: "ModifiedByUser",
				label: "Last Modified By",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 34,
			},
			ModificationDateTime: {
				id: "ModificationDateTime",
				label: "Last Modified Time",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 35,
			},
			LastModifiedDate: {
				id: "LastModifiedDate",
				label: "Last Modified Date",
				fieldType: "text",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 36,
			},

			// Payment Information header
			PaymentHeader: {
				id: "PaymentHeader",
				label: "Payment Information",
				fieldType: "header",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 37,
			},

			// Payment Information fields
			PaymentDate: {
				id: "PaymentDate",
				label: "Payment Date",
				fieldType: "date",
				width: "half",
				value: null,
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 38,
				dateFormat: "dd-MMM-yyyy",
				placeholder: "dd-mm-yyyy",
			},
			PaymentStatus: {
				id: "PaymentStatus",
				label: "Payment Status",
				fieldType: "select",
				width: "half",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 39,
				options: [{ label: "Paid", value: "PAID" }, { label: "Pending", value: "PENDING" }, { label: "Partially Paid", value: "PARTIALLY_PAID" }],
				placeholder: "Select status",
			},

			// Customer Information header
			CustomerHeader: {
				id: "CustomerHeader",
				label: "Customer Information",
				fieldType: "header",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 40,
			},

			// Customer Information fields
			CustomerEmailID: {
				id: "CustomerEmailID",
				label: "Customer Email ID",
				fieldType: "text",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 41,
				placeholder: "",
			},

			// Financial Fields header
			FinancialHeader: {
				id: "FinancialHeader",
				label: "Financial Fields",
				fieldType: "header",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: true,
				order: 42,
			},

			// Financial Fields
			PrepaymentAmount: {
				id: "PrepaymentAmount",
				label: "Prepayment Amount",
				fieldType: "currency",
				width: "full",
				value: "",
				mandatory: false,
				visible: moreDetailsExpanded,
				editable: false,
				order: 43,
				placeholder: "€ 500.00",
			},
		};

		return config;
	}, [header, moreDetailsExpanded]);

	const inclVAT = header?.InclVATAmount != null ? Number(header?.InclVATAmount).toFixed(2) : "0.00";
	const excVAT = header?.ExcVATAmount != null ? Number(header?.ExcVATAmount).toFixed(2) : "0.00";
	const balance = header?.BalanceAmount != null ? Number(header?.BalanceAmount).toFixed(2) : "0.00";
	const subtitle = [header?.CustomerName, header?.InvoiceCreationDate ? formatDate(String(header?.InvoiceCreationDate)) : ""].filter(Boolean).join(" | ");

    const [showDropdownMenu, setShowDropdownMenu] = useState(false);

    const handleSaveReceivablesAuthorisation = () => {
        console.log("Save Receivables Authorisation");
    };

    const handleCreateClaimReceivablesAuthorisation = () => {
        console.log("Create Claim Receivables Authorisation");
    };
    
    const handleReverseReceivablesAuthorisation = () => {
        console.log("Reverse Receivables Authorisation");
    };
    
    const handleHoldReceivablesAuthorisation = () => {
        console.log("Hold Receivables Authorisation");
    };
    
    const handleAuthorizeReceivablesAuthorisation = () => {
        console.log("Authorize Receivables Authorisation");
    };

    const handleDeleteReceivablesAuthorisation = () => {
        console.log("Delete Receivables Authorisation");
    };

	return (
		<AppLayout>
			<div className="min-h-screen bg-gray-50">
				<div className="px-6 pt-4">
					<Breadcrumb items={breadcrumbItems} />
				</div>

				<div className="flex gap-6 px-6 py-4">
					{/* Left section - Customer Invoice Details panel (full content scrolls) */}
					<div className="flex-1 min-w-0 max-w-[550px] flex flex-col min-h-0 border border-gray-200 rounded-lg bg-white shadow-sm overflow-auto max-h-[calc(100vh-120px)] no-scrollbar">
						{/* Header: search, title, subtitle, badge, settings */}
						<div className="p-4 pb-1 space-y-3 shrink-0">
							<div className="relative flex-1 w-full bg-gray-50 p-4 border border-gray-100 rounded-lg">
								<Input
									value={invoiceSearch}
									onChange={(e) => setInvoiceSearch(e.target.value)}
									placeholder="Invoice No."
									className="h-9 bg-white border-gray-300 rounded-md text-sm pr-9"
								/>
								<Search className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
							</div>
							<div className="flex items-center justify-between flex-wrap gap-2 mt-4">
								<div>
									<h2 className="text-lg font-semibold text-gray-800">Customer Invoice Details</h2>
									{subtitle && <p className="text-sm text-gray-600 mt-1.5">{subtitle}</p>}
								</div>
								<div className="flex items-center gap-2">
									{header?.Status != null && header?.Status !== "" && (
										<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
											{String(header?.Status)}
										</span>
									)}
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-gray-500 hover:text-gray-700"
										onClick={() => formRef.current?.openConfigModal?.()}
										title="Panel configuration"
									>
										<Settings className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>

						{/* Monetary summary cards */}
						<div className="grid grid-cols-3 gap-3 p-4 shrink-0">
							<div className="rounded-lg border border-blue-200 bg-blue-50/80 p-4">
								<p className="text-sm font-medium text-gray-600">Incl. VAT Amount</p>
								<p className="text-base font-semibold text-blue-700 mt-2">€ {inclVAT}</p>
							</div>
							<div className="rounded-lg border border-red-200 bg-red-50/80 p-4">
								<p className="text-sm font-medium text-gray-600">Exc. VAT Amount</p>
								<p className="text-base font-semibold text-red-700 mt-2">€ {excVAT}</p>
							</div>
							<div className="rounded-lg border border-green-200 bg-green-50/80 p-4">
								<p className="text-sm font-medium text-gray-600">Balance Amount</p>
								<p className="text-base font-semibold text-green-700 mt-2">€ {balance}</p>
							</div>
						</div>

						{/* Single DynamicPanel with all form fields (no inner scroll, no border for this page) */}
						<div className="">
							<DynamicPanel
								ref={formRef}
								panelId="receivables-invoice-details"
								panelTitle=""
								panelIcon={null}
								panelConfig={invoicePanelConfig}
								initialData={initialData}
								collapsible={false}
								showHeader={false}
								hideSettingsButton={true}
								className="!border-0 !shadow-none mt-3"
							/>
						</div>
					</div>

					{/* Right section - placeholder */}
					<div className="flex-1 min-w-0 border border-gray-200 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 text-sm">
						Right section
					</div>
				</div>

			</div>
            {/* Custom footer button */}
			<div className="h-15 fixed bottom-0 right-0 left-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end items-center gap-3 z-40 shadow-lg">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap hover:bg-red-100 hover:text-red-600 bg-white text-red-400 font-semibold transition-colors px-4 py-2 h-8 text-[13px] rounded-sm" onClick={handleDeleteReceivablesAuthorisation}>
                    Delete
                </button>
                <div className="inline-flex items-center border border-blue-600 rounded-sm overflow-hidden">
                    {/* Save Button - Clickable */}
                    <Button
                        onClick={handleSaveReceivablesAuthorisation}
                        className="inline-flex items-center justify-center whitespace-nowrap bg-white text-blue-600 hover:bg-blue-100 font-semibold transition-colors h-8 px-3 text-[13px] rounded-none border-0 border-r border-blue-600"
                    >
                        Save
                    </Button>
                    {/* Dropdown Arrow - Only this triggers the dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="inline-flex items-center justify-center whitespace-nowrap bg-white text-blue-600 hover:bg-blue-100 font-semibold transition-colors h-8 px-2 text-[13px] rounded-none border-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleCreateClaimReceivablesAuthorisation}>
                                Create Claim
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleReverseReceivablesAuthorisation}>
                                Reverse
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleHoldReceivablesAuthorisation}>
                                Hold
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <button className="inline-flex items-center justify-center whitespace-nowrap bg-white text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 font-semibold transition-colors h-8 px-3 text-[13px] rounded-sm" onClick={handleAuthorizeReceivablesAuthorisation}>
                    Authorize
                </button>
			</div>
		</AppLayout>
	);
};

export default ReceivablesAuthorisation;
