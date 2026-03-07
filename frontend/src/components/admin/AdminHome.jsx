import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import feather from "feather-icons";
import Header from "../Header"; // Import your Header component

export default function AdminHome({
  user,
  isLoggedIn,
  setIsLoggedIn,
  setUser,
}) {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ Dynamic categories
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({}); // Size selection

  useEffect(() => {
    feather.replace();
  }, []);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => {
      if (prev[productId] === size) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: size };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch current user
        const userRes = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.user);
          setIsLoggedIn(true);
        } else {
          window.location.href = "/login";
          return;
        }

        // 2️⃣ Fetch categories dynamically
        const catRes = await fetch(
          "http://localhost:3000/api/store/categories",
        );
        const catData = await catRes.json();
        if (catData.success && catData.categories) {
          setCategories(catData.categories.map((c) => c.name));
        }

        // 3️⃣ Fetch products + offers
        const res = await fetch("http://localhost:3000/api/admin/admin-home", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setProducts(data.arr || []);
          setOffers(data.offers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setUser={setUser}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main className="p-6 space-y-12">
        {/* Offers Section */}
        <section className="mb-12 bg-white p-6 rounded-3xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Current Offers</h2>
            <Link
              to="/add-offer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
            >
              Add / Edit Offer
            </Link>
          </div>

          {offers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border">Categories</th>
                    <th className="px-4 py-2 border">Discount %</th>
                    <th className="px-4 py-2 border">Expiry</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o._id} className="text-center border-b">
                      <td className="px-4 py-2 border">
                        {o.categories.join(", ")}
                      </td>
                      <td className="px-4 py-2 border">{o.discountPercent}%</td>
                      <td className="px-4 py-2 border">
                        {new Date(o.expiry).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        <Link
                          to={`/edit-offer/${o._id}`}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No active offers.</p>
          )}
        </section>

        {/* Products Sections dynamically */}
        {categories.map((cat) => {
          // ✅ Correct array filtering
          const sectionProducts = products.filter((p) =>
            p.category.includes(cat),
          );

          return (
            <section
              key={cat}
              className="mb-12 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-3xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 relative after:block after:w-20 after:h-1 after:rounded mt-1">
                  {cat}
                </h2>
                <Link
                  to={`/category/${encodeURIComponent(cat)}?admin=true`}
                  className="bg-yellow-400 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-yellow-500 hover:shadow-xl transition transform hover:-translate-y-1"
                >
                  View All
                </Link>
              </div>

              {sectionProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No products available.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sectionProducts.map((product) => {
                    const price = Number(product.price) || 0;
                    const discount = Number(product.discountPercent) || 0;
                    const discountedPrice =
                      discount > 0
                        ? Math.floor(price - (price * discount) / 100) // Floor discounted price
                        : price;

                    return (
                      <div
                        key={product._id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-105 duration-300 relative flex flex-col h-full"
                      >
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
                            -{discount}%
                          </span>
                        )}

                        <div className="w-full h-64 overflow-hidden rounded-t-2xl">
                          <img
                            src={`http://localhost:3000${product.photos?.[0]}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300"
                          />
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                            {product.name}
                          </h3>

                          <div className="mb-3">
                            {discount > 0 ? (
                              <>
                                <p className="text-red-500 font-semibold line-through text-lg">
                                  {price.toFixed(2)} Tk
                                </p>
                                <p className="text-yellow-600 font-bold text-xl">
                                  {discountedPrice} Tk
                                </p>
                              </>
                            ) : (
                              <p className="text-yellow-600 font-bold text-xl">
                                {price.toFixed(2)} Tk
                              </p>
                            )}
                          </div>

                          {/* Size selection */}
                          {product.sizes?.length > 0 && (
                            <div className="mb-3">
                              <label className="block text-gray-700 font-medium mb-1">
                                Sizes:
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {product.sizes.map((sizeObj) => (
                                  <button
                                    key={sizeObj.size}
                                    type="button"
                                    className={`px-3 py-1 border rounded-lg text-sm ${
                                      sizeObj.stock <= 0
                                        ? "bg-gray-200 cursor-not-allowed"
                                        : selectedSizes[product._id] ===
                                            sizeObj.size
                                          ? "bg-yellow-400 text-white"
                                          : "bg-white hover:bg-yellow-200"
                                    }`}
                                    disabled={sizeObj.stock <= 0}
                                    onClick={() =>
                                      handleSizeSelect(
                                        product._id,
                                        sizeObj.size,
                                      )
                                    }
                                  >
                                    {sizeObj.size}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-3 mt-auto">
                            <Link
                              to={`/add-product/${product._id}?editing=true`}
                              className="flex-1 bg-yellow-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-yellow-600 text-center"
                            >
                              Edit
                            </Link>

                            <button
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    "Are you sure you want to delete this product?",
                                  )
                                )
                                  return;

                                try {
                                  const res = await fetch(
                                    `http://localhost:3000/api/admin/delete-product/${product._id}`,
                                    {
                                      method: "DELETE",
                                      credentials: "include",
                                    },
                                  );
                                  const data = await res.json();
                                  if (data.success) {
                                    alert("Product deleted successfully!");
                                    // Remove product from local state so UI updates immediately
                                    setProducts((prev) =>
                                      prev.filter((p) => p._id !== product._id),
                                    );
                                  } else {
                                    alert("Failed to delete product");
                                  }
                                } catch (err) {
                                  console.error(err);
                                  alert("Server error");
                                }
                              }}
                              className="flex-1 w-full bg-red-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
