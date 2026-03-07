import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Header";

const ADMIN_WHATSAPP_NUMBER = "8801715138268";

export default function ProductDetail() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/store/product-detail/${productId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        setProduct(data.product);
        setMainImage(data.product?.photos?.[0] || "");
        setIsLoggedIn(data.isLoggedIn);
        setUser(data.user);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (isLoading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

  const price = Number(product.price) || 0;
  const discount = Number(product.discountPercent) || 0;
  const discountedPrice = (price - (price * discount) / 100).toFixed(2);

  const handleWhatsAppChat = () => {
    const message = `
Hello, I am interested in this product:

📦 Product Name: ${product.name}

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

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setUser={setUser}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main className="max-w-6xl mx-auto p-6 mt-10 mb-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col md:flex-row gap-8">
          {/* LEFT SIDE - Product Info */}
          <div className="md:w-1/3 flex flex-col gap-4">
            <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="text-lg text-gray-700 space-y-2">
              <p>
                <span className="font-semibold">Price: </span>
                {discount > 0 ? (
                  <>
                    <span className="line-through text-red-500">{price.toFixed(2)} Tk</span>{" "}
                    <span className="text-yellow-600 font-bold">{discountedPrice} Tk</span>
                  </>
                ) : (
                  <span className="text-yellow-600 font-bold">{price.toFixed(2)} Tk</span>
                )}
              </p>
              {product.sizes && product.sizes.length > 0 && (
                <p>
                  <span className="font-semibold">Available Sizes: </span>
                  {product.sizes.map((s) => s.size).join(", ")}
                </p>
              )}
              <p>
                <span className="font-semibold">Category: </span>
                {product.category?.join(", ") || "N/A"}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - Images */}
          <div className="md:w-2/3 flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl">
              {mainImage ? (
                <img
                  src={`http://localhost:3000${mainImage}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400">No image available</div>
              )}
            </div>

            {/* Thumbnails */}
            {product.photos && product.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.photos.map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:3000${img}`}
                    alt={`thumbnail-${index}`}
                    onClick={() => setMainImage(img)}
                    className={`h-24 w-24 object-cover rounded-lg cursor-pointer border-2 transition ${
                      mainImage === img
                        ? "border-yellow-500"
                        : "border-gray-300 hover:border-yellow-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-600 leading-relaxed">{product.description || "No description available."}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
          <button
            onClick={handleWhatsAppChat}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow flex items-center gap-2 hover:bg-green-600 transition"
          >
            <i className="fas fa-whatsapp"></i>
            Chat on WhatsApp
          </button>
        </div>
      </main>
    </div>
  );
}

