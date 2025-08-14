import React, { useState, useEffect } from "react";
import { quickOrderService } from "@/api/services/quickOrderService";

const messageTypes = [
  "Wagon type Init",
  "Wagon id Init",
  "Orders"
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
        const data = await quickOrderService.getMasterCommonData({ messageType: selectedType });
        setApiData(data);
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
          borderRadius: "5px"
        }}>
          {JSON.stringify(apiData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default MockPage;