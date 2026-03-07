import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // guest userId OR admin email
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "guest" or "admin"
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessages([]);

    if (password !== confirmPassword) {
      setErrorMessages(["Passwords do not match"]);
      return;
    }

    try {
      const bodyData =
        type === "guest"
          ? { userId: token, mobile: "guest", password, confirmPassword }
          : { email: token, otp, password, confirmPassword };

      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setErrorMessages(data.errorMessages || ["Something went wrong"]);
      }
    } catch (err) {
      setErrorMessages(["Network error"]);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Reset Your Password</h2>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}

        {errorMessages.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            <ul>{errorMessages.map((err, i) => <li key={i}>{err}</li>)}</ul>
          </div>
        )}

        {type === "admin" && (
          <div>
            <label className="block text-gray-700">Enter OTP sent to your email</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full border rounded-lg p-2 mt-2"
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg p-2 mt-2"
          />
        </div>

        <div>
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border rounded-lg p-2 mt-2"
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;




