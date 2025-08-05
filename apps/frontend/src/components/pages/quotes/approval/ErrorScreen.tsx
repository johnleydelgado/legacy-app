"use client";

interface Props {
  message?: string;
}

const ErrorScreen = ({ message }: Props) => (
  <div className="flex items-center justify-center min-h-screen text-center px-6">
    <p className="text-red-600">
      {message ||
        "Sorry, we couldn't load the approval details. Please try again later."}
    </p>
  </div>
);

export default ErrorScreen;
