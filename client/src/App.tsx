import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import ProtectedRoute from "./components/layouts/Protected";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import NotFound from "./pages/NotFound";
import RedirectIfAuthenticated from "./pages/auth/RedirectIfAuthenticated";
import RegisterAuth from "./pages/auth/Register";
import AllReceipts from "./pages/AllReciepts";
import ImageReciept from "./pages/RecieptDetails";
import Profile from "./pages/Profile.tsx";
function App() {
  const { isAuthenticated, isLoading, verifyAuthentication } = useAuth();
  useEffect(() => {
    verifyAuthentication();
  }, []);
  if (isLoading) return <div>Loading</div>;
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}

        <Route
          path="/auth/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/auth/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterAuth />
            </RedirectIfAuthenticated>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AllReceipts />
              </ProtectedRoute>
            }
          />
          <Route path="reciept_img/:id" element={<ImageReciept />} />
        </Route>
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </ProtectedRoute>
          }
        ></Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
