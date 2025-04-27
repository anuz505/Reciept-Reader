import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Receipt, Home, LogOut, User, BarChart2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  mobileNavContainerVariant,
  mobileNavListVariant,
  mobileNavExitProps,
} from "@/config/animationconfig.ts";

const activeClassName =
  "relative text-blue-600 font-medium px-3 py-2 navlink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-500 after:scale-x-100 after:transition-transform";
const inactiveClassName =
  "relative text-gray-600 hover:text-blue-500 transition-colors px-3 py-2 navlink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-500 after:scale-x-0 after:origin-left after:transition-transform hover:after:scale-x-100";

const activeStyleCallback = ({ isActive }: { isActive: boolean }) => {
  return isActive ? activeClassName : inactiveClassName;
};

const NavLinks = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <NavLink to="/mainDashboard" className={activeStyleCallback}>
        <div className="flex items-center gap-1.5">
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
      </NavLink>
      <NavLink to="/Dashboard" className={activeStyleCallback}>
        <div className="flex items-center gap-1.5">
          <Receipt className="w-4 h-4" />
          <span>Reciepts</span>
        </div>
      </NavLink>

      <NavLink to="/analytics" className={activeStyleCallback}>
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </div>
      </NavLink>

      {isAuthenticated ? (
        <NavLink to="/profile" className={activeStyleCallback}>
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </div>
        </NavLink>
      ) : (
        <NavLink to="/auth/login" className={activeStyleCallback}>
          <div className="flex items-center gap-1.5">
            <LogOut className="w-4 h-4" />
            <span>Login</span>
          </div>
        </NavLink>
      )}
    </>
  );
};

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Moved useNavigate inside the Nav component
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between mr-4">
          {/* Logo area */}
          <div className="flex items-center" onClick={() => navigate("/")}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex items-center gap-2"
            >
              <Receipt className="h-6 w-6 text-blue-500" />
              <span className="font-semibold text-xl bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent">
                ReceiptReader
              </span>
            </motion.div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-2 ">
            <NavLinks />
          </div>

          {/* Mobile Menu Button */}
          <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
            <button
              onClick={toggleNavbar}
              className={`p-2 rounded-full ${
                isOpen ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
              } 
          transition-colors duration-300 hover:shadow-md`}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </motion.div>
        </div>
      </motion.nav>
      {/* Mobile Navigation */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            layout="position"
            key="nav-links"
            variants={mobileNavContainerVariant}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mt-0 basis-full md:hidden bg-white/90 backdrop-blur-md shadow-lg rounded-b-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-2 p-4">
              <motion.div
                variants={mobileNavListVariant}
                {...mobileNavExitProps}
                className="hover:bg-blue-50 rounded-lg transition-colors"
              >
                <NavLink
                  to="/Dashboard"
                  className={({ isActive }) =>
                    isActive
                      ? "block font-medium text-blue-600 p-3"
                      : "block text-gray-600 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <span>Reciepts</span>
                  </div>
                </NavLink>
              </motion.div>

              <motion.div
                variants={mobileNavListVariant}
                {...mobileNavExitProps}
                className="hover:bg-blue-50 rounded-lg transition-colors"
              >
                <NavLink
                  to="/receipts"
                  className={({ isActive }) =>
                    isActive
                      ? "block font-medium text-blue-600 p-3"
                      : "block text-gray-600 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    <span>Dashboard</span>
                  </div>
                </NavLink>
              </motion.div>

              <motion.div
                variants={mobileNavListVariant}
                {...mobileNavExitProps}
                className="hover:bg-blue-50 rounded-lg transition-colors"
              >
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    isActive
                      ? "block font-medium text-blue-600 p-3"
                      : "block text-gray-600 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    <span>Analytics</span>
                  </div>
                </NavLink>
              </motion.div>

              <motion.div
                variants={mobileNavListVariant}
                {...mobileNavExitProps}
                className="hover:bg-blue-50 rounded-lg transition-colors"
              >
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive
                      ? "block font-medium text-blue-600 p-3"
                      : "block text-gray-600 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    <span>Profile</span>
                  </div>
                </NavLink>
              </motion.div>
              <motion.div
                variants={mobileNavListVariant}
                {...mobileNavExitProps}
                className="hover:bg-blue-50 rounded-lg transition-colors"
              >
                <NavLink
                  to="/auth/login"
                  className={({ isActive }) =>
                    isActive
                      ? "block font-medium text-blue-600 p-3"
                      : "block text-gray-600 p-3"
                  }
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    <span>Login</span>
                  </div>
                </NavLink>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
