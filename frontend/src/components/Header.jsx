import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import feather from "feather-icons";

const Header = ({ user, isLoggedIn, setIsLoggedIn, setUser }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  const headerRef = useRef(null);

  // Feather icons + fetch categories on mount
  useEffect(() => {
    feather.replace();

    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/store/categories");
        const data = await res.json();
        if (data.success && data.categories) {
          setProductCategories(data.categories.map((c) => c.name));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch pending orders for admin
  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (user && user.userType === "admin") {
        try {
          const res = await fetch("http://localhost:3000/api/admin/pending-count", {
            credentials: "include",
          });
          const data = await res.json();
          if (data.success) setPendingOrders(data.count);
        } catch (err) {
          console.error("Failed to fetch pending orders:", err);
        }
      }
    };
    fetchPendingOrders();
  }, [user]);

  // Highlight matched text in search
  const highlightMatch = (text) => {
    if (!text) return "";
    const str = text.toString();
    if (!searchQuery) return str;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return str.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  // Handle live search
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/store/search?q=${encodeURIComponent(value)}`
      );
      const data = await res.json();

      const matchedCategories = productCategories
        .filter((cat) => cat.toLowerCase().includes(value.toLowerCase()))
        .map((cat) => ({ _id: cat, name: `Category: ${cat}`, category: cat, isCategory: true }));

      const combinedResults = [...matchedCategories, ...(data.products || [])].slice(0, 10);

      setSearchResults(combinedResults);
      setShowSearchResults(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductClick = (product) => {
    if (product.isCategory) {
      navigate(`/category/${encodeURIComponent(product.category)}`);
    } else {
      navigate(`/product-detail/${product._id}`);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  const menuClass =
    "hover:text-blue-600 transition-colors duration-200 font-semibold";

  const adminLinks = (
    <>
      <Link to="/admin-home" onClick={() => setSidebarOpen(false)} className={menuClass}>Admin</Link>
      <Link to="/add-product" onClick={() => setSidebarOpen(false)} className={menuClass}>Add Product</Link>
      <Link
        to="/orders"
        onClick={() => setSidebarOpen(false)}
        className={`${menuClass} flex items-center justify-between`}
      >
        Orders
        {pendingOrders > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
            {pendingOrders}
          </span>
        )}
      </Link>
      <Link to="/archive-orders" onClick={() => setSidebarOpen(false)} className={menuClass}>Archived Orders</Link>
      <button onClick={handleLogout} className={menuClass}>Logout</button>
    </>
  );

  const guestLinks = (
    <>
      <Link to="/" onClick={() => setSidebarOpen(false)} className={menuClass}>Home</Link>
      <Link to="/cart" onClick={() => setSidebarOpen(false)} className={menuClass}>Cart</Link>
      <button onClick={handleLogout} className={menuClass}>Logout</button>
    </>
  );

  const publicLinks = (
    <>
      <Link to="/" onClick={() => setSidebarOpen(false)} className={menuClass}>Home</Link>
      <Link to="/login" onClick={() => setSidebarOpen(false)} className={menuClass}>Login</Link>
      <Link to="/signup" onClick={() => setSidebarOpen(false)} className={menuClass}>Signup</Link>
    </>
  );

  return (
    <header className="bg-white shadow-md relative" ref={headerRef}>
      {/* TOP ROW */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-16 py-4">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <img src="/logo1.png" alt="UDSO Logo" className="h-10 sm:h-12 md:h-14 w-auto object-contain"/>
          <div className="flex flex-col leading-tight">
            <span className="text-sm sm:text-xl font-bold text-blue-900">UDSO</span>
            <span className="text-[10px] sm:text-sm font-semibold text-green-600">Machinery Supply & Service</span>
          </div>
        </div>

        {/* CENTER: Desktop search */}
        <div className="hidden md:flex flex-1 px-10 relative">
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length && setShowSearchResults(true)}
            className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"></i>

          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-72 overflow-y-auto animate-slide-down">
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                  >
                    {!product.isCategory && product.photos?.[0] && (
                      <img
                        src={`http://localhost:3000${product.photos[0]}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <span className="text-gray-800">{highlightMatch(product.name)}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No products found</div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Menu + Hamburger */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-gray-700 font-semibold">Menu</span>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-800 focus:outline-none">
            <i data-feather="menu" className="w-8 h-8"></i>
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="flex md:hidden px-4 sm:px-6 lg:px-12 xl:px-16 pb-4 relative">
        <input
          type="text"
          placeholder="Search products or categories..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => searchResults.length && setShowSearchResults(true)}
          className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <i data-feather="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"></i>

        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1 max-h-72 overflow-y-auto animate-slide-down">
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer transition"
                >
                  {!product.isCategory && product.photos?.[0] && (
                    <img
                      src={`http://localhost:3000${product.photos[0]}`}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                  <span className="text-gray-800">{highlightMatch(product.name)}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No products found</div>
            )}
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-none" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white text-gray-800 z-50 shadow-lg p-6 flex flex-col overflow-y-auto">
            <button onClick={() => setSidebarOpen(false)} className="self-end mb-6">
              <i data-feather="x" className="w-6 h-6"></i>
            </button>

            <nav className="flex flex-col space-y-4 text-lg mt-4">
              {isLoggedIn ? (user && user.userType === "admin" ? adminLinks : guestLinks) : publicLinks}

              {/* Products Dropdown */}
              <div>
                <button
                  onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                  className="w-full text-left font-semibold hover:text-blue-600 flex justify-between items-center mt-2"
                >
                  Products <span className="text-xl font-bold">{productsDropdownOpen ? "-" : "+"}</span>
                </button>

                {productsDropdownOpen && (
                  <div className="ml-4 mt-2 flex flex-col gap-1">
                    {productCategories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/category/${encodeURIComponent(cat)}`}
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-blue-500"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;


