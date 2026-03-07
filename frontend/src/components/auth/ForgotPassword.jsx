import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [mobile, setMobile] = useState(""); // guest
  const [email, setEmail] = useState("");   // admin
  const [message, setMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessages([]);

    if (!mobile && !email) {
      setErrorMessages(["Enter mobile (guest) or email (admin)"]);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, email }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage(data.message || "Check your mobile/email");
        
        // Navigate to reset password page
        if (data.type === "guest") {
          navigate(`/reset-password/${data.userId}?type=guest`);
        } else if (data.type === "admin") {
          navigate(`/reset-password/${email}?type=admin`);
        }
      } else {
        setErrorMessages(data.errorMessages || ["Something went wrong"]);
      }
    } catch (err) {
      setErrorMessages(["Network error"]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password</h2>

        {message && <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>}

        {errorMessages.length > 0 && (
          <div className="bg-red-100 text-red-700 p-3 rounded">
            <ul>{errorMessages.map((err, i) => <li key={i}>{err}</li>)}</ul>
          </div>
        )}

        <div>
          <label className="block text-gray-700">Guest Mobile (if you are guest)</label>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border rounded-lg p-2 mt-2"
            placeholder="Enter mobile number"
          />
        </div>

        <div>
          <label className="block text-gray-700">Admin Email (if you are admin)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2 mt-2"
            placeholder="Enter email"
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg">
          Send Reset Link / OTP
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;


