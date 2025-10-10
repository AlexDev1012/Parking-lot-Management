import React from "react";
import { useNavigate } from "react-router-dom";

const DisabledUserPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">Account Pending</h1>
      <p className="mt-4 text-lg text-gray-700">
        Your account is pending. If you have any questions or concerns, please
        contact us
      </p>
      <button
        className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        onClick={() => navigate("/contact-support")}
      >
        Contact Support
      </button>
    </div>
  );
};

export default DisabledUserPage;
