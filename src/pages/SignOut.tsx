import React from "react";
import { useNavigate } from "react-router-dom";

const SignOut: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className=" p-8 text-center">
          {/* <svg className="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg> */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You have been successfully logged out</h2>
          <p className="text-gray-600 mb-6">Your session has ended successfully. You can log back in at any time.</p>
          <a className="px-6 py-2 text-orange-600 cursor-pointer hover:text-orange-700 transition-colors"
            onClick={() => navigate("/signin")}>
            Back to Login
          </a>
        </div>
      </div>
    </>
  );
};

export default SignOut;
