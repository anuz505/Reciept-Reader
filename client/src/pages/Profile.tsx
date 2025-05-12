import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/auth-slice";
import { useDispatch, UseDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  User as UserIcon,
  Mail,
  Loader,
  IdCard,
  Edit,
  Camera,
  ShieldAlert,
  History,
  X,
  Upload,
  LucideLogOut,
} from "lucide-react";
import Nav from "@/components/common/navbar";

interface User {
  _id: string;
  email: string;
  profile_pic: string;
}

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch<AppDispatch>();

  // Create API instance inside component to ensure token is current
  const getApi = () => {
    return axios.create({
      baseURL: "http://127.0.0.1:5000/profile",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileDetails();
    }
  }, [isAuthenticated]);

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const api = getApi();
      const res = await api.get("/");
      setUser(res.data);
      if (res.data.profile_pic) {
        setImg(`data:image/jpeg;base64,${res.data.profile_pic}`);
      }
    } catch (err) {
      setError("Failed to fetch profile details");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
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
    // Fix file type validation
    if (!file.type.startsWith("image/")) {
      setUploadStatus("Please select an image file");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("profile_pic", file);
    try {
      const api = getApi();
      await api.post("/profile_pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        withCredentials: true,
      });
      setUploadStatus("Profile pic uploaded successfully");
      // Fetch updated profile after successful upload
      fetchProfileDetails();
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setUploadStatus("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePhoto = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadStatus("");
  };

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      // dispatch(logoutUser());

      window.location.href = "/auth/login";
    }
  };
  return (
    <div className="m-0 p-0">
      <Nav />
      <div className="container mx-auto p-3 sm:p-4 max-w-3xl">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header - Responsive padding */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-6 text-white">
            <div className="flex items-center">
              <UserIcon size={24} className="mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold">User Profile</h1>
            </div>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              Manage your account information
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8 sm:p-16">
              <Loader className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-gray-600 font-medium text-sm sm:text-base">
                Loading profile data...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 sm:p-8 text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-6 rounded-lg">
                <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 mx-auto mb-2 sm:mb-3" />
                <p className="font-medium text-sm sm:text-base">{error}</p>
                <button
                  onClick={fetchProfileDetails}
                  className="mt-3 sm:mt-4 bg-red-600 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            user && (
              <div className="p-4 sm:p-8">
                {/* Profile section - Stack on mobile, side-by-side on larger screens */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-10">
                  {/* Profile image - Responsive sizing */}
                  <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 relative mx-auto md:mx-0">
                    {img ? (
                      <div className="relative group">
                        <img
                          src={img}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full border-4 border-gray-200 shadow-md group-hover:opacity-90 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black bg-opacity-50 rounded-full p-3">
                            <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-full border-4 border-gray-200">
                        <UserIcon className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
                          No image available
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleUpdatePhoto}
                      className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 border border-blue-200 px-3 py-1 sm:px-4 rounded-full text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm flex items-center"
                    >
                      <Camera size={12} className="mr-1 flex-shrink-0" />
                      Update Photo
                    </button>
                  </div>

                  {/* User details - Full width on all screens */}
                  <div className="flex-1 w-full mt-8 md:mt-0">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-5 flex items-center">
                        <IdCard className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                        Account Information
                      </h2>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap items-center p-2.5 sm:p-3 bg-white rounded-md border border-gray-100">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <span className="font-medium text-gray-600 text-sm sm:text-base mr-1">
                            Email:
                          </span>
                          <span className="text-gray-800 text-sm sm:text-base break-all">
                            {user.email}
                          </span>
                        </div>

                        <div className="p-2.5 sm:p-3 bg-white rounded-md border border-gray-100">
                          <div className="flex items-center">
                            <IdCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="font-medium text-gray-600 text-sm sm:text-base">
                              User ID:
                            </span>
                          </div>
                          <div className="ml-6 sm:ml-8 mt-1 text-xs sm:text-sm text-gray-500 break-all">
                            {user._id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Buttons - Responsive sizing and full-width on small screens */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                      <button className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start text-sm sm:text-base">
                        <Edit
                          size={16}
                          className="mr-1.5 sm:mr-2 flex-shrink-0"
                        />
                        Edit Profile
                      </button>
                      <button className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center sm:justify-start text-sm sm:text-base">
                        <LucideLogOut
                          onClick={handleLogout}
                          size={16}
                          className="mr-1.5 sm:mr-2 flex-shrink-0"
                        />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-300 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Upload Profile Picture
                  </h2>
                  <button
                    onClick={closeUploadModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
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
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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
      </div>
    </div>
  );
};

export default Profile;
