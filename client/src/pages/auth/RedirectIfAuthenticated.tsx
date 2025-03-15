import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

const RedirectIfAuthenticated = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking authentication status, you can show a loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the login/register page
  return children;
};
export default RedirectIfAuthenticated;
