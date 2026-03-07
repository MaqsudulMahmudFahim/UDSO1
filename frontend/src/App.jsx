import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/store/Home";
import Cart from "./components/store/Cart";
import Category from "./components/store/Category";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import VerifyEmail from "./components/auth/VerifyEmail";
import ProductDetail from "./components/store/ProductDetail";
import AdminHome from "./components/admin/AdminHome";
import AddProduct from "./components/admin/AddProduct";
import Submit from "./components/admin/Submit";
import Orders from "./components/admin/Orders";
import ArchiveOrders from "./components/admin/ArchiveOrders";
import AddOffer from "./components/admin/AddOffer";
import Footer from "./components/Footer";

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<Category />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product-detail/:productId" element={<ProductDetail />} />

        {/* Admin Routes */}
        <Route
          path="/admin-home"
          element={
            <AdminHome
              user={user}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />
        <Route
          path="/add-product/:productId?"
          element={
            <AddProduct
              user={user}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />
        <Route path="/product-success" element={<Submit />} />
        <Route
          path="/orders"
          element={
            <Orders
              user={user}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />

        <Route
          path="/archive-orders"
          element={
            <ArchiveOrders
              user={user}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />

        <Route
          path="/add-offer/:offerId?"
          element={
            <AddOffer
              user={user}
              isLoggedIn={isLoggedIn}
              setUser={setUser}
              setIsLoggedIn={setIsLoggedIn}
            />
          }
        />

        <Route
          path="/edit-offer/:offerId"
          element={<AddOffer user={user} isLoggedIn={isLoggedIn} />}
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={<Login setUser={setUser} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/signup"
          element={<Signup setUser={setUser} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
       <Footer />
    </BrowserRouter>
  );
}

export default App;
