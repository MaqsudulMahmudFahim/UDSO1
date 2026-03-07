import React, { useState, useEffect } from "react";
import Header from "../Header";

const Cart = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: "",
    mobile: "",
    address: "",
  });

  // Fetch cart
  const fetchCart = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/store/cart", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      setCartItems(Array.isArray(data.cartItems) ? data.cartItems : []);
      setSubtotal(Number(data.subtotal) || 0);
      setDeliveryFee(Number(data.deliveryFee) || 0);
      setVat(Number(data.vat) || 0);
      setTotal(Number(data.total) || 0);

      setIsLoggedIn(data.isLoggedIn || false);
      setUser(data.user || null);
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove item
  const removeItem = async (productId) => {
    try {
      await fetch(
        `http://localhost:3000/api/store/cart/delete/${productId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
    }
  };

  // Checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/store/cart/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });

      if (res.ok) {
        setCheckoutModalOpen(false);
        setThankYouVisible(true);
        fetchCart();
        setCheckoutData({ name: "", mobile: "", address: "" });
      }
    } catch (err) {
      console.error("Checkout error", err);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setUser={setUser}
      />

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                if (!item.productId) return null;

                const price = Number(item.productId.price) || 0;
                const discount = Number(item.productId.discountPercent) || 0;
                const finalPrice =
                  discount > 0
                    ? price - (price * discount) / 100
                    : price;

                return (
                  <div
                    key={item.productId._id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://localhost:3000${item.productId.photos?.[0]}`}
                        alt={item.productId.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="w-48">
                        <h3 className="font-semibold">
                          {item.productId.name}
                        </h3>
                        <p className="text-gray-600">
                          Qty: {item.quantity}
                        </p>

                        {discount > 0 ? (
                          <>
                            <p className="text-sm line-through text-red-500">
                              {price.toFixed(2)} Tk
                            </p>
                            <p className="text-yellow-600 font-bold text-lg">
                              {finalPrice.toFixed(2)} Tk
                            </p>
                          </>
                        ) : (
                          <p className="text-yellow-600 font-bold text-lg">
                            {price.toFixed(2)} Tk
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Order Summary */}
        <section className="bg-white p-6 rounded-xl shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 text-gray-700">
            {cartItems.map((item) => {
              if (!item.productId) return null;

              const price = Number(item.productId.price) || 0;
              const discount = Number(item.productId.discountPercent) || 0;
              const finalPrice =
                discount > 0
                  ? price - (price * discount) / 100
                  : price;

              return (
                <div
                  key={item.productId._id}
                  className="flex justify-between items-center text-sm"
                >
                  <span>
                    {item.productId.name} × {item.quantity}
                  </span>

                  <div className="text-right">
                    {discount > 0 ? (
                      <>
                        <p className="line-through text-red-500 text-xs">
                          {(price * item.quantity).toFixed(2)} Tk
                        </p>
                        <p className="font-semibold text-yellow-600">
                          {(finalPrice * item.quantity).toFixed(2)} Tk
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold">
                        {(price * item.quantity).toFixed(2)} Tk
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <hr />
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} Tk</span>
            </p>
            <p className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee.toFixed(2)} Tk</span>
            </p>
            <p className="flex justify-between">
              <span>VAT (5%)</span>
              <span>{vat.toFixed(2)} Tk</span>
            </p>
            <hr />
            <p className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} Tk</span>
            </p>
          </div>

          <button
            onClick={() => setCheckoutModalOpen(true)}
            className="mt-6 w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600"
          >
            Place Order
          </button>
        </section>
      </main>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            <form onSubmit={handleCheckout} className="space-y-3">
              <input
                required
                placeholder="Full Name"
                className="border p-2 w-full rounded"
                value={checkoutData.name}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, name: e.target.value })
                }
              />
              <input
                required
                placeholder="Mobile Number"
                className="border p-2 w-full rounded"
                value={checkoutData.mobile}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, mobile: e.target.value })
                }
              />
              <textarea
                required
                placeholder="Address"
                className="border p-2 w-full rounded"
                value={checkoutData.address}
                onChange={(e) =>
                  setCheckoutData({ ...checkoutData, address: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thank You */}
      {thankYouVisible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Thank You!
            </h2>
            <p>Your order has been placed successfully.</p>
            <button
              onClick={() => setThankYouVisible(false)}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;


