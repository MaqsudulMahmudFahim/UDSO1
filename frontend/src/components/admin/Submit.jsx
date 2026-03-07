import React from "react";
import { Link } from "react-router-dom";

const Submit = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-4">
          🎉 Congratulations!
        </h2>
        <p className="text-gray-700 mb-6">
          Your product has been successfully added for sale. Wait for customer
          response.
        </p>
        <Link
          to="/admin-home"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default Submit;

