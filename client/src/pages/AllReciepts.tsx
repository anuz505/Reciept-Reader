import React, { useEffect, useState } from "react";
import axios from "axios";

interface Item {
  name: string;
  price: string;
  quantity: number | null;
}

interface Receipt {
  _id: {
    $oid: string;
  };
  total: string;
  business: string;
  address: string;
  items: Item[];
  date?: string;
  amount?: number;
}

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const AllReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get("reciepts/allEntries");
        setReceipts(response.data);
      } catch (err) {
        setError("Failed to fetch receipts");
        console.error("Error fetching receipts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 my-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Receipts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receipts.map((receipt) => (
          <div
            key={receipt._id.$oid}
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-800 truncate">
                  {receipt.business}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  ${receipt.total}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{receipt.address}</p>

              {receipt.date && (
                <p className="text-gray-500 text-sm mb-2">
                  <span className="font-medium">Date:</span> {receipt.date}
                </p>
              )}

              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Items
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {receipt.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-medium">
                        ${item.price}
                        {item.quantity !== null && ` x ${item.quantity}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between">
                <span className="text-xs text-gray-500">
                  ID: {receipt._id.$oid.substring(0, 8)}...
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllReceipts;
