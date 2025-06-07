import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config/formcontrols";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  handleOAuthCallback,
  loginUser,
  initiateOAuthLogin,
} from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Notification from "@/components/common/notification";
import { AppDispatch, RootState } from "@/store/store";

const initialState = {
  email: "",
  password: "",
};

function LoginAuth() {
  const [formData, setFormData] = useState<{ email: string; password: string }>(
    initialState
  );
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { oauthLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isOauthCallback = urlParams.get("oauth") == "callback";
    if (isOauthCallback) {
      dispatch(handleOAuthCallback())
        .unwrap()
        .then(() => {
          setNotification({
            message: "Oauth Login Successful",
            variant: "success",
          });
          navigate("/dashboard");
        })
        .catch((error) => {
          setNotification({
            message: error || "Oauth login failed",
            variant: "error",
          });
        });
    }
  }, [location, dispatch, navigate]);

  async function onsubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      if (
        result &&
        result.message &&
        result.access_token &&
        result.id &&
        result.username &&
        result.email
      ) {
        setNotification({ message: "Login successful", variant: "success" });
        navigate("/dashboard");
      } else {
        setNotification({
          message: "Login failed: Invalid response",
          variant: "error",
        });
      }
    } catch (error: any) {
      setNotification({
        message: error || "Login failed",
        variant: "error",
      });
    }
  }
  const handleOAuthLogin = async (provider: string) => {
    try {
      await dispatch(initiateOAuthLogin(provider)).unwrap();
    } catch (error: any) {
      setNotification({
        message: error || `${provider} login failed`,
        variant: "error",
      });
    }
  };
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {notification && (
        <Notification
          message={notification.message}
          variant={notification.variant}
        />
      )}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>{" "}
      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleOAuthLogin("google")}
          disabled={oauthLoading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {oauthLoading ? "Signing in..." : "Continue with Google"}
        </button>
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Sign in"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onsubmit}
        />
      </div>
    </div>
  );
}

export default LoginAuth;
