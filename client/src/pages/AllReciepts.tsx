import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Trash, X } from "lucide-react";
import SearchBar from "@/components/app/searchbar.tsx";

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
  fileID: { $oid: string };
}

const getApi = () => {
  return axios.create({
    baseURL: "http://127.0.0.1:5000",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });
};

const AllReceipts: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteShowModal, setDeleteShowModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [recieptToDelte, setReceiptToDelete] = useState<string | null>("");
  const [searchResults, setSearchResults] = useState<Receipt[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchReceipts();
    }
  }, [isAuthenticated]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const api = getApi();
      const response = await api.get("reciepts/allEntries");

      // Check if response.data is an array or a single object
      const receiptData = Array.isArray(response.data)
        ? response.data
        : [response.data]; // Convert to array if it's a single object

      if (receiptData.length === 0) {
        console.warn("No receipts found in the response.");
      }

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.match("image.*")) {
      setUploadStatus("Please select an image file");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post("http://127.0.0.1:5000/reciepts/newEntry", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        withCredentials: true,
      });

      setUploadStatus("Receipt uploaded successfully!");
      fetchReceipts(); // Refresh the receipts list

      // Close the modal after a brief delay to show success message
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus("");
      }, 2000);
    } catch (err) {
      console.error("Error uploading receipt:", err);
      setUploadStatus("Failed to upload receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (reciept_id: string) => {
    setIsDeleting(true);
    try {
      const api = getApi();
      await api.delete(`reciepts/deleteEntry?id=${reciept_id}`);
      setReceipts((prevReceipts) =>
        prevReceipts.filter((receipt) => receipt._id.$oid !== reciept_id)
      );
    } catch (err) {
      setDeleteError("Failed to delete receipt. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = async (query: string, filter: string = "all") => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const api = getApi();
      const response = await api.get(
        `reciepts/search?query=${encodeURIComponent(query)}&filter=${filter}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("search failed", error);
      setError("Search Failed. Please try again.");
    }
  };
  const clearSearch = () => {
    setSearchResults(null);
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

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
  const displayedReceipts = searchResults !== null ? searchResults : receipts;
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">All Receipts</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-500 hover:bg-blue-600 flex text-white font-medium py-2 px-5 rounded-lg duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Receipt
        </button>
      </div>

      {/*Search Bar*/}
      <SearchBar onSearch={handleSearch} className="mb-6" />
      {/* Show search info if results are being shown */}
      {searchResults !== null && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing {searchResults.length} search results
          </p>
          <button
            onClick={clearSearch}
            className="text-sm text-blue-500 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
      {displayedReceipts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {searchResults !== null
            ? "No matching receipts found"
            : "No receipts found"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReceipts.map((receipt) => {
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
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Items
                      </h3>
                      <button
                        className="bg-red-400 text-white hover:bg-red-500 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 tran flex items-center px-1 py-1 rounded mb-5"
                        onClick={() => {
                          setDeleteShowModal(true);
                          setReceiptToDelete(receipt._id.$oid);
                        }}
                      >
                        <Trash className="mr-1 " />
                      </button>
                    </div>
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
                      File ID: {receipt.fileID.$oid}
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() =>
                        navigate(
                          `/dashboard/reciept_img/${receipt.fileID.$oid}`
                        )
                      }
                    >
                      Receipt Image
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          )
          {deleteShowModal && (
            <div
              className={`fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${
                deleteShowModal
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={() => {
                setDeleteShowModal(false);
                setReceiptToDelete(null);
              }}
            >
              {/* Delete Modal */}
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg transition delay-150 duration-500 ease-in-out">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Confirm Deletion
                  </h2>
                  <button
                    onClick={() => {
                      setDeleteShowModal(false);
                      setReceiptToDelete(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this receipt? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      if (recieptToDelte) {
                        handleDelete(recieptToDelte);
                        setDeleteShowModal(false);
                      }
                    }}
                    className="bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setDeleteShowModal(false);
                      setReceiptToDelete(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  {deleteError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                      {deleteError}
                    </div>
                  )}
                  {isDeleting && (
                    <div className="mt-2 flex justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showUploadModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-300 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Upload Receipt
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadStatus("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">Image files only</p>

              <button
                onClick={onButtonClick}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                disabled={isUploading}
              >
                Select File
              </button>
            </div>

            {uploadStatus && (
              <div
                className={`p-3 rounded text-sm mb-4 ${
                  uploadStatus === "Uploading..."
                    ? "bg-blue-50 text-blue-700"
                    : uploadStatus.includes("successfully")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {uploadStatus}
                {isUploading && (
                  <div className="mt-2 flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReceipts;
