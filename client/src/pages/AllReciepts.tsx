import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
interface Item {
  name: string;
  price: string;
  quantity: number | null;
}

interface ReceiptData {
  total: string;
  business: string;
  address: string;
  items: Item[];
  date?: string;
}

interface Receipt {
  _id: {
    $oid: string;
  };
  data: ReceiptData;
  fileID: string;
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
  const navigate = useNavigate();
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        // Keep the original endpoint as specified
        const response = await api.get("reciepts/allEntries");

        // Check if response.data is an array or a single object
        const receiptData = Array.isArray(response.data)
          ? response.data
          : [response.data]; // Convert to array if it's a single object

        // Filter out any potentially invalid entries that don't have data property
        const validReceipts = receiptData.filter(
          (receipt) => receipt && receipt.data
        );

        setReceipts(validReceipts);
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
      {receipts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No receipts found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => {
            // Additional safety check before rendering
            if (!receipt || !receipt.data) {
              return null;
            }

            return (
              <div
                key={receipt._id.$oid}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-800 truncate">
                      {receipt.data.business}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      ${receipt.data.total}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {receipt.data.address}
                  </p>

                  {receipt.data.date && (
                    <p className="text-gray-500 text-sm mb-2">
                      <span className="font-medium">Date:</span>{" "}
                      {receipt.data.date}
                    </p>
                  )}

                  <div className="mt-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">
                      Items
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {receipt.data.items.map((item, index) => (
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
                      File ID: {receipt.fileID}
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() =>
                        navigate(`/dashboard/reciept_img/${receipt.fileID}`)
                      }
                    >
                      Reciept Image
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllReceipts;
