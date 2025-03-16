// TODO
import CommonForm from "@/components/common/form";
import { registerFormControls } from "@/config/formcontrols";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Notification from "@/components/common/notification";
import { AppDispatch } from "@/store/store";

const initialState = {
  username: "",
  email: "",
  password: "",
};

function RegisterAuth() {
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
  }>(initialState);
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  async function onsubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await dispatch(registerUser(formData)).unwrap();
      if (result.message == "User registered sucessfullly") {
        setNotification({
          message: "Registered successfully",
          variant: "success",
        });
        navigate("/auth/login");
      } else {
        setNotification({
          message: "Registration failed: Invalid response",
          variant: "error",
        });
      }
    } catch (error: any) {
      setNotification({
        message: error || "Registration failed",
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
          Sign Up For a New Account
        </h1>
        <p className="mt-2">
          Already have an account?
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onsubmit}
      />
    </div>
  );
}

export default RegisterAuth;
