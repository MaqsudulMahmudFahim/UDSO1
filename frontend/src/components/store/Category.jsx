import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../Header";

const ADMIN_WHATSAPP_NUMBER = "8801715138268"; // Admin WhatsApp number

const Category = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories and products
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const resCategories = await fetch("http://localhost:3000/api/admin/categories", {
  //         credentials: "include",
  //       });
  //       const dataCategories = await resCategories.json();
  //       if (dataCategories.success) {
  //         setCategories(dataCategories.categories.map((c) => c.name));
  //       }

  //       const resProducts = await fetch(
  //         `http://localhost:3000/api/store/category/${encodeURIComponent(categoryName)}`,
  //         { credentials: "include" }
  //       );
  //       const dataProducts = await resProducts.json();

  //       setProducts(dataProducts.products || []);
  //       setIsLoggedIn(dataProducts.isLoggedIn || false);
  //       setUser(dataProducts.user || null);

  //       const queryAdmin = searchParams.get("admin") === "true";
  //       setIsAdmin(queryAdmin || dataProducts.user?.role === "admin");
  //     } catch (err) {
  //       console.error(err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [categoryName, searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // PUBLIC categories (no admin route)
        const resCategories = await fetch(
          "http://localhost:3000/api/store/categories",
        );
        const dataCategories = await resCategories.json();

        if (dataCategories.success) {
          setCategories(dataCategories.categories.map((c) => c.name));
        }

        // Products of this category
        const resProducts = await fetch(
          `http://localhost:3000/api/store/category/${encodeURIComponent(categoryName)}`,
          { credentials: "include" },
        );

        const dataProducts = await resProducts.json();

        setProducts(dataProducts.products || []);
        setIsLoggedIn(dataProducts.isLoggedIn || false);
        setUser(dataProducts.user || null);

        const queryAdmin = searchParams.get("admin") === "true";
        setIsAdmin(queryAdmin || dataProducts.user?.role === "admin");
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryName, searchParams]);

  // Add to Cart
  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/store/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.redirect) window.location.href = data.redirect;
      else if (data.message) toast.success(data.message);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  // Delete Product (Admin)
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/delete-product/${productId}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success("Product deleted successfully!");
      } else toast.error("Failed to delete product.");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Something went wrong.");
    }
  };

  // WhatsApp chat handler (like Home)
  const handleWhatsAppChat = (productName) => {
    const message = `
Hello, I am interested in this product:

📦 Product Name: ${productName}

I have some questions:
• Is this product available?
• What is the delivery time?
• Is there any discount?
• What is the return policy?

Thanks.
    `.trim();

    const isMobile = /android|iphone|ipad|iPod/i.test(navigator.userAgent);

    const whatsappUrl = isMobile
      ? `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
      : `https://web.whatsapp.com/send?phone=${ADMIN_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
      />

      <main className="p-6">
        {/* Dynamic category navigation */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/category/${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-full border ${
                cat === categoryName
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <h3 className="text-center text-gray-500 text-lg font-medium">
            No Products Available in {categoryName}
          </h3>
        ) : (
          <>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              {categoryName} Collection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const price = Number(product.price) || 0;
                const discount = Number(product.discountPercent) || 0;
                const discountedPrice = (
                  price -
                  (price * discount) / 100
                ).toFixed(2);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1 w-full relative flex flex-col"
                  >
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
                        -{discount}%
                      </span>
                    )}

                    <img
                      src={`http://localhost:3000${product.photos?.[0]}`}
                      alt={product.name}
                      className="w-full h-80 object-cover rounded-t-2xl"
                    />

                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-2 truncate">
                        {product.name}
                      </h2>

                      <div className="mb-4">
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

                      <div className="flex gap-3 mt-auto">
                        {isAdmin ? (
                          <>
                            <Link
                              to={`/add-product/${product._id}?editing=true`}
                              className="flex-1 bg-yellow-500 text-white font-semibold py-2 rounded-lg shadow hover:bg-yellow-600 text-center"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product._id)}
                              className="w-[50%] bg-red-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/product-detail/${product._id}`}
                              className="flex-1 bg-gray-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:bg-gray-900 hover:shadow-xl transition duration-300 text-center"
                            >
                              Details
                            </Link>

                            <button
                              onClick={() => handleAddToCart(product._id)}
                              className="flex-1 bg-yellow-500 text-white font-semibold py-2 rounded-lg shadow-lg hover:bg-yellow-600 hover:shadow-xl transition duration-300"
                            >
                              Add to Cart
                            </button>
                          </>
                        )}
                      </div>

                      {/* WhatsApp button for non-admins */}
                      {!isAdmin && (
                        <button
                          onClick={() => handleWhatsAppChat(product.name)}
                          className="mt-3 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
                        >
                          <i data-feather="message-circle"></i>
                          Chat on WhatsApp
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Category;
