import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import toast, { Toaster } from "react-hot-toast";

export default function AddOffer({ user, isLoggedIn }) {
  const navigate = useNavigate();
  const { offerId } = useParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [expiry, setExpiry] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch categories / offer
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = offerId
          ? `http://localhost:3000/api/admin/edit-offer/${offerId}`
          : "http://localhost:3000/api/admin/add-offer";

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        if (!data.success) {
          toast.error(data.message || "Failed to load data");
          return;
        }

        // ✅ Categories are OBJECTS
        setCategories(data.categories || []);

        // Editing offer
        if (offerId && data.offer) {
          setSelectedCategories(data.offer.categories || []);
          setDiscountPercent(data.offer.discountPercent || 0);

          // Fix datetime-local
          const expiryDate = new Date(data.offer.expiry);
          const tzOffset = expiryDate.getTimezoneOffset() * 60000;
          const localTime = new Date(expiryDate - tzOffset)
            .toISOString()
            .slice(0, 16);
          setExpiry(localTime);
        }
      } catch (err) {
        console.error(err);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offerId]);

  // Toggle category
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  // Submit offer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      return toast.error("Select at least one category");
    }

    try {
      const url = offerId
        ? "http://localhost:3000/api/admin/edit-offer"
        : "http://localhost:3000/api/admin/add-offer";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: offerId,
          categories: selectedCategories,
          discountPercent,
          expiry,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Offer saved successfully");
        navigate("/admin-home");
      } else {
        toast.error(data.message || "Failed to save offer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving offer");
    }
  };

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Toaster position="top-right" />
      <Header user={user} isLoggedIn={isLoggedIn} />

      <main className="flex justify-center items-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            {offerId ? "Edit Offer" : "Add Offer"}
          </h2>

          {/* Categories */}
          <div>
            <label className="block font-medium mb-2">
              Select Categories
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <label
                  key={cat._id} // ✅ UNIQUE KEY
                  className="inline-flex items-center px-3 py-1 border rounded-lg cursor-pointer hover:bg-yellow-100"
                >
                  <input
                    type="checkbox"
                    value={cat.name} // ✅ STRING
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => handleCategoryChange(cat.name)}
                    className="mr-2"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block font-medium mb-2">
              Discount Percentage
            </label>
            <select
              value={discountPercent}
              onChange={(e) =>
                setDiscountPercent(Number(e.target.value))
              }
              className="w-full border px-3 py-2 rounded-lg"
            >
              {[0, 10, 20, 30, 50, 70].map((d) => (
                <option key={d} value={d}>
                  {d}%
                </option>
              ))}
            </select>
          </div>

          {/* Expiry */}
          <div>
            <label className="block font-medium mb-2">
              Offer Expiry
            </label>
            <input
              type="datetime-local"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              {offerId ? "Update Offer" : "Add Offer"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

