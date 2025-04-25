import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaReceipt, FaHome } from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/store/auth-slice";

const Navbar: React.FC = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // const [showDropdown, setShowDropdown] = useState(false);
  // const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // useEffect(() => {
  //   setIsMenuOpen(false);
  //   setShowDropdown(false);
  // }, [location.pathname]);

  // const handleLogout = async () => {
  //   await logoutUser();
  // };
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md text-gray-800"
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center"></div>
        {/* Logo and brand */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <FaReceipt className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold">ReceiptReader</span>
          </Link>
        </div>
        {/* Desktop nav*/}
        <div className="hidden md:flex md:iems-center md:space-x-4">
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
              isActive("/dashboard")
                ? "bg-blue-500 text-white"
                : "hover:bg-blue-100 hover:text-blue-800"
            }`}
          >
            <FaHome className="mr-2" />
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
