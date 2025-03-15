import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config/formcontrols";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Notification from "@/components/common/notification";
import { AppDispatch } from "@/store/store";

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
      </div>
      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign in"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onsubmit}
      />
    </div>
  );
}

export default LoginAuth;
