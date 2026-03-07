import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "../Header";

const ArchiveOrders = ({ user, isLoggedIn, setIsLoggedIn, setUser }) => {
  const [orders, setOrders] = useState([]);

  // Fetch archived orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/admin/archive-orders",
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Error fetching orders");

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load archived orders");
      }
    };

    fetchOrders();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order permanently?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/archive-orders/delete/${id}`,
        {
          credentials: "include",
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Order deleted permanently!");
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  return (
    <>
      <Header
        user={user}
        isLoggedIn={isLoggedIn}
        setUser={setUser}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="p-6 space-y-12 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Archived Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No archived orders yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col"
              >
                {/* Customer Info */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {order.name}
                    </h2>
                    <p className="text-gray-600">
                      {order.mobile} | {order.address}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Ordered on: {new Date(order.date).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Archived at: {new Date(order.archivedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border text-left">Product</th>
                        <th className="px-4 py-2 border text-center">Size</th>
                        <th className="px-4 py-2 border text-center">Qty</th>
                        <th className="px-4 py-2 border text-right">Price</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map((item, idx) => {
                        const price = Math.floor(Number(item.price) || 0);
                        const discount = Number(item.discountPercent) || 0;
                        const finalPrice =
                          discount > 0
                            ? Math.ceil(price - (price * discount) / 100)
                            : price;

                        return (
                          <tr
                            key={idx}
                            className="border-b last:border-b-0 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 text-center">{item.size}</td>
                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">
                              {discount > 0 ? (
                                <>
                                  <span className="line-through text-red-500 mr-2">
                                    {price} Tk
                                  </span>
                                  <span className="text-yellow-600 font-bold">
                                    {finalPrice} Tk
                                  </span>
                                </>
                              ) : (
                                <span>{price} Tk</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end font-bold text-lg text-gray-900">
                  Total:
                  <span className="ml-2 text-yellow-600">
                    {Math.ceil(order.total)} Tk
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ArchiveOrders;
