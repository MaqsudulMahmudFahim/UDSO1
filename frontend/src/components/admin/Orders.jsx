import React, { useEffect, useState } from "react";
import Header from "../Header";
import feather from "feather-icons";

const Orders = ({ user, isLoggedIn, setIsLoggedIn, setUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/orders", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Mark order as completed
  const handleComplete = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/orders/status/${orderId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Feather icons init
  useEffect(() => {
    feather.replace();
  }, [orders]);

  return (
    <>
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setUser={setUser}
        setIsLoggedIn={setIsLoggedIn}
      />

      <main className="p-6 space-y-12 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>

        {loading ? (
          <p className="text-gray-500 text-center py-4">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col"
              >
                {/* Customer Info + Status */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {order.name}
                    </h2>
                    <p className="text-gray-600">
                      {order.mobile} | {order.address}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ordered on:{" "}
                      {new Date(order.date).toLocaleString("en-GB")}
                    </p>
                  </div>

                  {order.status === "Pending" ? (
                    <button
                      onClick={() => handleComplete(order._id)}
                      className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition"
                    >
                      Mark as Completed
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-lg font-semibold text-white bg-green-500">
                      Completed
                    </span>
                  )}
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border text-left text-gray-700">
                          Product
                        </th>
                        <th className="px-4 py-2 border text-center text-gray-700">
                          Qty
                        </th>
                        <th className="px-4 py-2 border text-right text-gray-700">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => {
                        const price = Number(item.price) || 0;
                        const discount = Number(item.discountPercent) || 0;

                        const finalPrice =
                          discount > 0
                            ? price - (price * discount) / 100
                            : price;

                        const originalTotal = price * item.quantity;
                        const finalTotal = finalPrice * item.quantity;

                        return (
                          <tr
                            key={idx}
                            className="border-b last:border-b-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {discount > 0 ? (
                                <>
                                  <span className="line-through text-red-500 text-sm mr-2">
                                    {originalTotal.toFixed(2)} Tk
                                  </span>
                                  <span className="text-yellow-600 font-bold">
                                    {finalTotal.toFixed(2)} Tk
                                  </span>
                                </>
                              ) : (
                                <span>
                                  {originalTotal.toFixed(2)} Tk
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end items-center text-gray-900 font-bold text-lg">
                  Total:
                  <span className="ml-2 text-yellow-600">
                    {Math.ceil(order.total)} Tk
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
};

export default Orders;


