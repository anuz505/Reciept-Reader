import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Home from "@/pages/Home";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
export function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="dashboard">
      <div className="flex flex-col min-h-screen">
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1
              className="text-2xl font-bold"
              onClick={() => navigate("/Dashboard")}
            >
              Dashboard
            </h1>

            <nav className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center px-3 py-2 rounded hover: bg-blue-700"
              >
                <span>Home</span>
              </Link>
            </nav>
          </div>
        </header>
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
