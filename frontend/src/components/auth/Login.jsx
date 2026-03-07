import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";

const Login = ({ setUser, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("guest");
  const [email, setEmail] = useState(""); // only for admin
  const [mobile, setMobile] = useState(""); // only for guest
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    setLoading(true);

    // Frontend validation
    if (loginType === "guest") {
      if (!/^\d+$/.test(mobile)) {
        setErrorMessages(["Mobile number must contain digits only"]);
        setLoading(false);
        return;
      }
      if (mobile.length < 10 || mobile.length > 11) {
        setErrorMessages(["Enter a valid mobile number"]);
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare body
      const bodyData =
        loginType === "admin"
          ? { email, password, userType: "admin" }
          : { mobile, password, userType: "guest" };

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        setUser(data.user);
        setIsLoggedIn(true);
        navigate(data.redirect || "/");
      } else {
        setErrorMessages(data.errorMessages || [data.message || "Login failed"]);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setErrorMessages(["Server error. Please try again later."]);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header isLoggedIn={false} />

      <main className="flex justify-center items-center mt-16">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">Login</h2>

          {/* Tabs */}
          <div className="flex justify-center border-b">
            <button
              type="button"
              onClick={() => setLoginType("guest")}
              className={`px-6 py-2 ${
                loginType === "guest"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : ""
              }`}
            >
              Guest
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`px-6 py-2 ${
                loginType === "admin"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : ""
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error Messages */}
          {errorMessages.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2 rounded">
              {errorMessages.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          {/* Admin: Email input */}
          {loginType === "admin" && (
            <div>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border p-2 rounded mt-1"
                placeholder="Enter admin email"
              />
            </div>
          )}

          {/* Guest: Mobile input */}
          {loginType === "guest" && (
            <div>
              <label>Mobile Number</label>
              <input
                type="text"
                value={mobile}
                maxLength={11} // max length for BD mobile
                onChange={(e) => {
                  const val = e.target.value;
                  // allow digits only
                  if (/^\d*$/.test(val)) setMobile(val);
                }}
                required
                className="w-full border p-2 rounded mt-1"
                placeholder="Enter mobile number"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border p-2 rounded mt-1"
              placeholder="Enter your password"
            />
          </div>

          {/* Forgot Password */}
          <p className="text-right text-sm mt-1">
            <Link
              to="/forgot-password"
              className="text-indigo-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-2">
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Login;
