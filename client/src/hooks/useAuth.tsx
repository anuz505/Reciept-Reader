import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { checkAuth, loginUser } from "@/store/auth-slice";

interface Credentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, status, error } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = !!user;
  const isLoading = status === "loading";

  // Login function
  const login = (credentials: Credentials) => {
    return dispatch(loginUser(credentials));
  };

  // Check authentication function - rename this to be less confusing
  const verifyAuthentication = () => {
    return dispatch(checkAuth());
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    status,
    login,
    verifyAuthentication, // Use a clearly different name
  };
};
