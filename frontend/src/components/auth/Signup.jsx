import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "", // only for admin
    mobile: "",
    password: "",
    confirmPassword: "",
    userType: "guest",
  });

  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const handleTab = (type) => {
    setFormData((prev) => ({
      ...prev,
      userType: type,
      email: type === "guest" ? "" : prev.email, // clear email for guest
    }));
    setErrorMessages([]);
    setInfoMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    setInfoMessage("");
    setLoading(true);

    const errors = [];

    // ==========================
    // Frontend validation
    // ==========================
    if (!formData.name.trim()) errors.push("Name is required");

    if (formData.userType === "admin" && !formData.email.trim()) {
      errors.push("Email is required for admin");
    }

    if (!formData.mobile.trim()) errors.push("Mobile is required");
    else if (!/^01[0-9]{9}$/.test(formData.mobile.trim())) {
      errors.push("Enter valid 11-digit mobile number (01XXXXXXXXX)");
    }

    if (!formData.password) errors.push("Password is required");
    if (formData.password !== formData.confirmPassword)
      errors.push("Passwords do not match");

    if (errors.length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    // ==========================
    // Prepare body for server
    // ==========================
    const bodyData = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      userType: formData.userType,
    };

    // Include email only for admin
    if (formData.userType === "admin") {
      bodyData.email = formData.email.trim();
    }

    try {
      const res = await fetch(
        "http://localhost:3000/api/auth/signup-with-verification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
          credentials: "include",
        }
      );

      const data = await res.json();
      setLoading(false);

      if (data.ok) {
        navigate(data.redirect);
      } else {
        setErrorMessages(data.errorMessages || ["Signup failed"]);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMessages(["Server error"]);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Header isLoggedIn={false} />

      <main className="flex-1 flex justify-center items-center px-4 sm:px-6 md:px-8 py-10 md:py-16">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Create Your Account
          </h2>

          {errorMessages.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <ul className="list-disc pl-5">
                {errorMessages.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {infoMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded text-center">
              {infoMessage}
            </div>
          )}

          {/* Role Tabs */}
          <div className="flex justify-center border-b">
            <button
              type="button"
              onClick={() => handleTab("guest")}
              className={`px-6 py-2 font-medium border-b-2 ${
                formData.userType === "guest"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              Guest
            </button>
            <button
              type="button"
              onClick={() => handleTab("admin")}
              className={`px-6 py-2 font-medium border-b-2 ${
                formData.userType === "admin"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              Admin
            </button>
          </div>

          {formData.userType === "admin" && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-center">
              Email is required. OTP will be sent to admin email.
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email → only admin */}
          {formData.userType === "admin" && (
            <div>
              <label className="block font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Mobile */}
          <div>
            <label className="block font-medium text-gray-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength={11}
              className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Signup;



