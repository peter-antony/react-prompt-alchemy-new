import React, { useState, useEffect } from "react";
import { quickOrderService } from "@/api/services/quickOrderService";

const messageTypes = [
  "Wagon type Init",
  "Wagon id Init",
  "Departure Init",
  "Arrival Init",
  "Cluster Init",
  "Contract Init",
  "Customer Init",
  "Consignor Init",
  "Consignee Init",
  "BR Location Init",
  "BR priority Init",
  "Payment type Init",
  "Source Init",
  "Ref doc type Init",
  "Service type Init",
  "Sub Service type Init",
  "Load type Init",
  "Route ID Init",
  "Leg ID Init",
  "NHM Init",
  "Product ID Init",
  "Product UOM Init",
  "Container Type Init",
  "Container ID Init",
  "Wagon Tare Weight UOM Init",
  "Wagon Length UOM Init",
  "Container Tare Weight UOM Init",
  "Container Load weight UOM Init",
  "Class Of Stores Init",
  "UN Code Init",
  "DG Class Init",
  "Hazardous Goods Init",
  "THU Init",
  "THU UOM Init",
  "THU Weight UOM Init",
  "Customer Order status Init",
  "Product category Init"
];

const MockPage = () => {
  const [selectedType, setSelectedType] = useState(messageTypes[0]);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: any = await quickOrderService.getMasterCommonData({ messageType: selectedType });
        const quickOrderScreenFetchData = await quickOrderService.screenFetchQuickOrder(110);
        console.log("Quick Order Screen Fetch Data:", quickOrderScreenFetchData);
        setApiData((data));
      } catch (err) {
        setError("Error fetching API data");
        setApiData(null);
      } finally {
        setLoading(false);
      }
    };
    if (selectedType) fetchData();
  }, [selectedType]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Common/Master API Data Viewer</h1>
      <select className="rounded-md bg-white py-1.5 pr-8 pl-3 text-gray-900 border border-gray-700 w-80 mt-[16px]"
        value={selectedType}
        onChange={e => setSelectedType(e.target.value)}
      >
        {messageTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      {loading && <div style={{ marginTop: 20 }}>Loading...</div>}
      {error && <div style={{ color: "red", marginTop: 20 }}>{error}</div>}
      {apiData && !loading && (
        <pre style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f4f4f4",
          borderRadius: "5px",
          maxHeight: "calc(100vh - 24px - 34px - 78px)",
          overflow: "auto"
        }}>
          {JSON.stringify(apiData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default MockPage;