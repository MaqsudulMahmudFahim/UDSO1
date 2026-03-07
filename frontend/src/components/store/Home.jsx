// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { Link } from "react-router-dom";
// import Header from "../Header";
// import Banner from "./Banner";
// import feather from "feather-icons";

// const ADMIN_WHATSAPP_NUMBER = "8801715138268"; // Admin WhatsApp number

// const Home = () => {
//   const [user, setUser] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     feather.replace();
//   }, [products]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch products and user data
//         const resProducts = await fetch("http://localhost:3000/api/store/", {
//           credentials: "include",
//         });
//         const dataProducts = await resProducts.json();

//         setProducts(dataProducts.products || []);
//         setIsLoggedIn(dataProducts.isLoggedIn);
//         setUser(dataProducts.user || null);
//         setIsAdmin(dataProducts.user?.role === "admin");

//         // Fetch categories
//         const resCategories = await fetch(
//           "http://localhost:3000/api/store/categories",
//         );
//         const dataCategories = await resCategories.json();
//         if (dataCategories.success) {
//           setCategories(dataCategories.categories.map((c) => c.name));
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Add to Cart
//   const handleAddToCart = async (productId) => {
//     if (!isLoggedIn) {
//       window.location.href = "/login";
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:3000/api/store/cart/add", {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId }),
//       });

//       const data = await res.json();
//       if (data.redirect) window.location.href = data.redirect;
//       else if (data.message) toast.success(data.message);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // WhatsApp chat handler
//   const handleWhatsAppChat = (productName) => {
//     const message = `
// Hello, I am interested in this product:

// 📦 Product Name: ${productName}

// I have some questions:
// • Is this product available?
// • What is the delivery time?
// • Is there any discount?
// • What is the return policy?

// Thanks.
//     `.trim();

//     const isMobile = /android|iphone|ipad|iPod/i.test(navigator.userAgent);

//     const whatsappUrl = isMobile
//       ? `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
//           message,
//         )}`
//       : `https://web.whatsapp.com/send?phone=${ADMIN_WHATSAPP_NUMBER}&text=${encodeURIComponent(
//           message,
//         )}`;

//     window.open(whatsappUrl, "_blank");
//   };

//   if (isLoading) return <p className="text-center mt-10">Loading...</p>;

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <Header
//         user={user}
//         isLoggedIn={isLoggedIn}
//         setIsLoggedIn={setIsLoggedIn}
//         setUser={setUser}
//       />

//       {/* Banner */}
//       <Banner />
//       <main className="p-6 space-y-12">
//         {categories.map((section) => {
//           const sectionProducts = products.filter((p) =>
//             p.category.includes(section),
//           );

//           return (
//             <section
//               key={section}
//               className="bg-white p-6 rounded-3xl shadow-lg"
//             >
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-3xl font-bold">{section}</h2>
//                 <Link
//                   to={`/category/${encodeURIComponent(section)}`}
//                   className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
//                 >
//                   View All
//                 </Link>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {sectionProducts.length > 0 ? (
//                   sectionProducts.map((product) => {
//                     const price = Math.floor(Number(product.price) || 0); // floor original price
//                     const discount = Number(product.discountPercent) || 0;
//                     const finalPrice =
//                       discount > 0
//                         ? Math.ceil(price - (price * discount) / 100) // floor discounted price
//                         : price;

//                     return (
//                       <div
//                         key={product._id}
//                         className="bg-gray-50 rounded-2xl shadow-lg p-4 flex flex-col relative"
//                       >
//                         {/* Discount Badge */}
//                         {discount > 0 && (
//                           <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
//                             -{discount}%
//                           </span>
//                         )}

//                         <img
//                           src={`http://localhost:3000${product.photos?.[0]}`}
//                           alt={product.name}
//                           className="h-48 w-full object-cover rounded-lg mb-3"
//                         />

//                         <h3 className="font-bold text-lg mb-1">
//                           {product.name}
//                         </h3>

//                         {/* Price display */}
//                         <p className="text-yellow-600 font-bold mb-3">
//                           {discount > 0 ? (
//                             <>
//                               <span className="line-through text-red-500 mr-2">
//                                 {price} Tk
//                               </span>
//                               <span>{finalPrice} Tk</span>
//                             </>
//                           ) : (
//                             <span>{price} Tk</span>
//                           )}
//                         </p>

//                         {/* Details + Add to Cart */}
//                         <div className="flex gap-2 mb-2">
//                           <Link
//                             to={`/product-detail/${product._id}`}
//                             className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-center"
//                           >
//                             Details
//                           </Link>

//                           <button
//                             onClick={() => handleAddToCart(product._id)}
//                             className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
//                           >
//                             Add to Cart
//                           </button>
//                         </div>

//                         {/* WhatsApp Chat Button */}
//                         {!isAdmin && (
//                           <button
//                             onClick={() => handleWhatsAppChat(product.name)}
//                             className="mt-2 bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"
//                           >
//                             <i data-feather="message-circle"></i>
//                             Chat on WhatsApp
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="col-span-full bg-gray-50 rounded-2xl shadow-lg p-10 flex items-center justify-center text-gray-500 font-semibold text-lg">
//                     No products available in {section}
//                   </div>
//                 )}
//               </div>
//             </section>
//           );
//         })}
//       </main>
//     </div>
//   );
// };

// export default Home;

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Header from "../Header";
import Banner from "./Banner";
import feather from "feather-icons";

const ADMIN_WHATSAPP_NUMBER = "8801715138268"; // Admin WhatsApp number

const Home = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    feather.replace();
  }, [products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProducts = await fetch("http://localhost:3000/api/store/", {
          credentials: "include",
        });
        const dataProducts = await resProducts.json();

        setProducts(dataProducts.products || []);
        setIsLoggedIn(dataProducts.isLoggedIn);
        setUser(dataProducts.user || null);
        setIsAdmin(dataProducts.user?.role === "admin");

        const resCategories = await fetch(
          "http://localhost:3000/api/store/categories"
        );
        const dataCategories = await resCategories.json();
        if (dataCategories.success) {
          setCategories(dataCategories.categories.map((c) => c.name));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      console.error(err);
    }
  };

  // WhatsApp chat handler
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
      ? `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
          message
        )}`
      : `https://web.whatsapp.com/send?phone=${ADMIN_WHATSAPP_NUMBER}&text=${encodeURIComponent(
          message
        )}`;

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

      {/* Banner */}
      <Banner />

      <main className="p-4 md:p-6 space-y-10 md:space-y-12">
        {categories.map((section) => {
          const sectionProducts = products.filter((p) =>
            p.category.includes(section)
          );

          return (
            <section
              key={section}
              className="bg-white p-4 md:p-6 rounded-3xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold">{section}</h2>
                <Link
                  to={`/category/${encodeURIComponent(section)}`}
                  className="bg-yellow-500 text-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] sm:text-xs md:text-base rounded-lg"
                >
                  View All
                </Link>
              </div>

              {/* ===== Grid Updated: 2 on mobile ===== */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {sectionProducts.length > 0 ? (
                  sectionProducts.map((product) => {
                    const price = Math.floor(Number(product.price) || 0);
                    const discount = Number(product.discountPercent) || 0;
                    const finalPrice =
                      discount > 0
                        ? Math.ceil(price - (price * discount) / 100)
                        : price;

                    return (
                      <div
                        key={product._id}
                        className="bg-gray-50 rounded-2xl shadow-lg p-2 md:p-4 flex flex-col relative"
                      >
                        {/* Discount Badge */}
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-lg z-10">
                            -{discount}%
                          </span>
                        )}

                        {/* Image smaller on mobile */}
                        <img
                          src={`http://localhost:3000${product.photos?.[0]}`}
                          alt={product.name}
                          className="h-28 sm:h-36 md:h-48 w-full object-cover rounded-lg mb-2"
                        />

                        {/* Product Name */}
                        <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <p className="text-yellow-600 font-bold text-sm sm:text-base mb-2">
                          {discount > 0 ? (
                            <>
                              <span className="line-through text-red-500 mr-1 text-xs md:text-sm">
                                {price} Tk
                              </span>
                              <span>{finalPrice} Tk</span>
                            </>
                          ) : (
                            <span>{price} Tk</span>
                          )}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-1 md:gap-2 mb-1">
                          <Link
                            to={`/product-detail/${product._id}`}
                            className="flex-1 bg-gray-700 text-white py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-lg text-center"
                          >
                            Details
                          </Link>

                          <button
                            onClick={() => handleAddToCart(product._id)}
                            className="flex-1 bg-yellow-500 text-white py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-lg"
                          >
                            Add to Cart
                          </button>
                        </div>

                        {/* WhatsApp */}
                        {!isAdmin && (
                          <button
                            onClick={() => handleWhatsAppChat(product.name)}
                            className="mt-1 bg-green-500 text-white py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm rounded-lg flex items-center justify-center gap-1 hover:bg-green-600"
                          >
                            <i data-feather="message-circle"></i>
                            Chat on WhatsApp
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full bg-gray-50 rounded-2xl shadow-lg p-10 flex items-center justify-center text-gray-500 font-semibold text-lg">
                    No products available in {section}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default Home;
