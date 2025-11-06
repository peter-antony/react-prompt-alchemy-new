import React, { useState, useRef, useEffect } from "react";
import { User, FileText, Calendar, Bookmark, Search, Filter, Camera } from "lucide-react";
import { FilterDropdown } from "@/components/Common/FilterDropdown";
import jsonStore from "@/stores/jsonStore";
import { quickOrderService } from '@/api/services/quickOrderService';
import { format } from 'date-fns';

const orders = [
  {
    type: "C",
    typeColor: "bg-blue-100 text-blue-600",
    action: "Sell",
    id: "IO/0000000042",
    contract: "CON000000439",
    company: "XYZ Manufacturer Pvt. Ltd.",
    customerNo: "CUS4343200/01",
    amount: "€ 45595.00",
    orderNo: "QO0382000/32",
    date: "12-Mar-2025",
  },
  {
    type: "S",
    typeColor: "bg-rose-100 text-red-800",
    action: "Buy",
    id: "IO/0000000042",
    contract: "CON000000439",
    company: "XYZ Manufacturer Pvt. Ltd.",
    customerNo: "CUS4343200/01",
    amount: "€ 45595.00",
    orderNo: "QO0382000/32",
    date: "12-Mar-2025",
  },
  {
    type: "S",
    typeColor: "bg-rose-100 text-red-800",
    action: "Buy",
    id: "IO/0000000042",
    contract: "CON000000439",
    company: "XYZ Manufacturer Pvt. Ltd.",
    customerNo: "CUS4343200/01",
    amount: "€ 45595.00",
    orderNo: "QO0382000/32",
    date: "12-Mar-2025",
  },
  {
    type: "S",
    typeColor: "bg-rose-100 text-red-800",
    action: "Buy",
    id: "IO/0000000042",
    contract: "CON000000439",
    company: "XYZ Manufacturer Pvt. Ltd.",
    customerNo: "CUS4343200/01",
    amount: "€ 45595.00",
    orderNo: "QO0382000/32",
    date: "12-Mar-2025",
  },
  {
    type: "S",
    typeColor: "bg-blue-100 text-blue-800",
    action: "Sell",
    id: "IO/0000000042",
    contract: "CON000000439",
    company: "XYZ Manufacturer Pvt. Ltd.",
    customerNo: "CUS4343200/01",
    amount: "€ 45595.00",
    orderNo: "QO0382000/38",
    date: "15-Apr-2025",
  },
];

export default function LinkedOrders() {

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ supplier: true, customer: true });
  const filterBtnRef = useRef<HTMLButtonElement>(null);

  // Example counts
  const supplierCount = 5;
  const customerCount = 1;

  const filterOptions = [
    {
      key: "supplier",
      checked: filters.supplier, // boolean
      count: supplierCount,      // number
      name: "Supplier",          // string
      button: "Apply",           // string or could be a function/action
      // color: '#ffffff', // Emerald green background
      className: "px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-red-800" // Dark emerald text
    },
    {
      key: "customer",
      checked: filters.customer,
      count: customerCount,
      name: "Customer",
      button: "Apply",
      // color: '#10b981', // Emerald green background
      className: "px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" // Dark emerald text
    },
    // Add more filters as needed
  ];

  const handleFilterChange = (key, checked) => {
    setFilters(prev => ({ ...prev, [key]: checked }));
  };

  function handleApply(): void {
    throw new Error("Function not implemented.");
  }

  function handleReset(): void {
    throw new Error("Function not implemented.");
  }

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedOrderArr, setLinkedOrderArray] = useState<any>([]);
  const [totalNetAmount, setTotalNetAmount] = useState<number>(0);
  const [totalCustomerNetAmount, setTotalCustomerNetAmount] = useState<number>(0);
  const [totalSupplierNetAmount, setTotalSupplierNetAmount] = useState<number>(0);

  useEffect(() => {
    fetchAll();
    console.log("LinkedOrders loaded", jsonStore.getQuickOrder());
  }, []);

  const fetchData = async () => {
    setLoading(false);
    setError(null);
    // console.log("Loading API data Type", OrderType);
    const OrderNo = jsonStore.getQuickOrder().QuickOrderNo;
    const OrderType = jsonStore.getQuickOrder().OrderType;
    try {
      const data: any = await quickOrderService.getLinkedOrdersData({ OrderType: OrderType, OrderNo: OrderNo });
      setApiData(data);

      // Parse the main response object
      const responseObj = JSON.parse(data?.data?.ResponseData);
      // Extract TotalNetAmount from the response object, if present
      setTotalNetAmount(responseObj?.TotalNetAmount ?? 0);

      // Find the property that is an array (the LinkedOrders array)
      let linkedOrdersArr = [];
      for (const key in responseObj) {
        if (Array.isArray(responseObj[key])) {
          linkedOrdersArr = responseObj[key];
          break;
        }
      }
      let totalCustomerAmount = 0;

      for (const item of linkedOrdersArr) {
        if (item.LinkedOrderType === "SELL") {
          totalCustomerAmount += Number(item.LinkedTotalNetAmount || 0);
        }
      }
      setTotalCustomerNetAmount(totalCustomerAmount);
      let totalSupplierAmount = 0;

      for (const item of linkedOrdersArr) {
        if (item.LinkedOrderType === "BUY") {
          totalSupplierAmount += Number(item.LinkedTotalNetAmount || 0);
        }
      }
      setTotalSupplierNetAmount(totalSupplierAmount);
      setLinkedOrderArray(linkedOrdersArr);
    } catch (err) {
      setError(`Error fetching API data`);
      // setApiData(data);
    }
    finally {
      setLoading(true);
    }
  };
  // Iterate through all messageTypes
  const fetchAll = async () => {
    setLoading(false);
    await fetchData();
  };

  return (
    <div className="bg-[#f8fafd] min-h-screen p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
        <div>
          <span className="text-lg font-semibold text-gray-800">Total Net Amount</span>
          <span className="ml-4 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 text-sm font-medium cursor-pointer" style={{ fontSize: "11px" }}>
            Customer <span className="font-bold  rounded-full bg-white">€ {totalCustomerNetAmount}</span>
          </span>
          <span className="ml-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 text-sm font-medium cursor-pointer" style={{ fontSize: "11px" }}>
            Supplier <span className="font-bold  rounded-full bg-white">€ {totalSupplierNetAmount}</span>
          </span>
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
          <div className="relative">
            <button
              ref={filterBtnRef}
              className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
              onClick={() => setFilterOpen((open) => !open)}
            >
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
            <FilterDropdown
              open={filterOpen}
              anchorRef={filterBtnRef}
              onClose={() => setFilterOpen(false)}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              onApply={handleApply}
            />
          </div>
        </div>
      </div>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {linkedOrderArr.map((order, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border p-3 min-h-[150px] flex flex-col gap-4">
            <div className="flex items-center justify-between gap-1">
              {/* <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${order.typeColor}`}> */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-blue-100 text-blue-600`}>
                {order.LinkedOrderType === 'SELL' ? 'S' : 'B'}
              </div>
              <div className="ml-2 flex-1">
                <span className="font-semibold text-gray-800 text-sm">{order.LinkedQuickOrderNo}</span>
                <div className="text-xs text-gray-400">
                  {order.LinkedQuickOrderDate ? format(order.LinkedQuickOrderDate, "dd-MMM-yyyy") : ''}
                </div>
              </div>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-300 text-xs font-medium">{order.LinkedQuickOrderStatus}</span>
            </div>
            {/* <div className="flex items-center gap-2 text-sm text-gray-700">
              
            </div> */}
            <div className="flex items-center gap-6 w-full text-sm text-gray-700">
              <div className="flex items-center gap-1 w-1/2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{order.LinkedPartyID} - {order.LinkedPartyName}</span>
              </div>
              <div className="flex items-center gap-1 w-1/2">
                <Camera className="w-4 h-4 text-gray-400" />
                <span> € {order.LinkedTotalNetAmount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 w-full text-sm text-gray-700">
              {/* <div className="flex items-center gap-1 w-1/2"> */}
              <Bookmark className="w-4 h-4 text-gray-400" />
              <span>{order.LinkedQuickOrderContract} - {order.LinkedContractName}</span>
              {/* </div> */}
              {/* <div className="flex items-center gap-1 w-1/2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{order.LinkedQuickOrderDate ? format(order.LinkedQuickOrderDate, "dd-MMM-yyyy") : ''}</span>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 