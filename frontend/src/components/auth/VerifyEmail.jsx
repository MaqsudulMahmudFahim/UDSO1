import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [infoMessage, setInfoMessage] = useState(
    "OTP has been sent to the admin email for verification."
  );
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages([]);

    try {
      const res = await fetch("http://localhost:3000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        navigate(data.redirect); // redirect to login
      } else {
        setErrorMessages(data.errorMessages || ["Invalid OTP"]);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMessages(["Something went wrong"]);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleVerify}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Verify Your Admin Account
        </h2>

        {/* Info Message */}
        {infoMessage && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded text-center">
            {infoMessage}
          </div>
        )}

        {/* Error Messages */}
        {errorMessages.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <ul className="list-disc pl-5">
              {errorMessages.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block font-medium text-gray-700">
            Enter OTP from Admin Email
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            required
            className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : null}
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;



