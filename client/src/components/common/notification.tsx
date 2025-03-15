import React from "react";

interface NotificationProps {
  message: string;
  variant?: "success" | "error";
}

const Notification: React.FC<NotificationProps> = ({
  message,
  variant = "success",
}) => {
  const notificationStyle =
    variant === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded ${notificationStyle} text-white`}
    >
      {message}
    </div>
  );
};

export default Notification;
