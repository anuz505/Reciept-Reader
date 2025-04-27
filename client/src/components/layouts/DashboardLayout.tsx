import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import Nav from "@/components/common/navbar";
export function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="dashboard">
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-grow p-4">
          <Outlet /> {/* This renders the nested routes */}
        </main>
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2023 Your Company</p>
        </footer>
      </div>
    </div>
  );
}
