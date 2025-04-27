import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import {
  User as UserIcon,
  Mail,
  Loader,
  IdCard,
  Edit,
  Camera,
  ShieldAlert,
  History,
} from "lucide-react";
import Nav from "@/components/common/navbar";

interface User {
  _id: string;
  email: string;
  profile_pic: string;
}

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/profile",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

const Profile: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [img, setImg] = useState<string | null>();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileDetails();
    }
  }, [isAuthenticated]);

  const fetchProfileDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/");
      setUser(res.data);
      setImg(`data:image/jpeg;base64,${res.data.profile_pic}`);
    } catch (err) {
      setError("Failed to fetch profile details");
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
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
                    <button className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 border border-blue-200 px-3 py-1 sm:px-4 rounded-full text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-sm flex items-center">
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
                        <History
                          size={16}
                          className="mr-1.5 sm:mr-2 flex-shrink-0"
                        />
                        View Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
