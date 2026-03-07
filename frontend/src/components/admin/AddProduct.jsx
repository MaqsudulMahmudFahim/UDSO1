import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Header from "../Header";

const AddProduct = ({ user, isLoggedIn, setIsLoggedIn, setUser }) => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const editing = searchParams.get("editing") === "true";
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]); // new uploaded files
  const [existingPhotos, setExistingPhotos] = useState([]); // existing photos URLs
  const [loading, setLoading] = useState(editing);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [activeTab, setActiveTab] = useState("product");

  // Fetch product if editing
  useEffect(() => {
    if (!editing || !productId) {
      setProduct({
        name: "",
        category: "",
        description: "",
        price: "",
        discountPercent: 0,
        photos: [],
      });
      setExistingPhotos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(
      `http://localhost:3000/api/admin/add-product/${productId}?editing=${editing}`,
      { credentials: "include" },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          const prod = data.product;
          setExistingPhotos(prod.photos || []);
          setProduct({
            name: prod.name || "",
            category: prod.category?.[0] || "",
            description: prod.description || "",
            price: prod.price || "",
            discountPercent: prod.discountPercent || 0,
            photos: prod.photos?.map((p) => `http://localhost:3000${p}`) || [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [editing, productId]);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/admin/categories", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  if (loading || !product)
    return <p className="mt-20 text-center">Loading...</p>;

  // Handle form change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos" && files) {
      const newFiles = Array.from(files);
      setPhotoFiles([...photoFiles, ...newFiles]); // append new files
      setProduct({
        ...product,
        photos: [
          ...product.photos,
          ...newFiles.map((f) => URL.createObjectURL(f)),
        ],
      });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  // Remove photo preview
  const removePhoto = (index) => {
    const updatedPreviews = [...product.photos];
    updatedPreviews.splice(index, 1);
    setProduct({ ...product, photos: updatedPreviews });

    if (index < existingPhotos.length) {
      // Removing an existing photo
      const updatedExisting = [...existingPhotos];
      updatedExisting.splice(index, 1);
      setExistingPhotos(updatedExisting);
    } else {
      // Removing a newly uploaded file
      const newFilesIndex = index - existingPhotos.length;
      const updatedFiles = [...photoFiles];
      updatedFiles.splice(newFilesIndex, 1);
      setPhotoFiles(updatedFiles);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch("http://localhost:3000/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedRes = await fetch(
          "http://localhost:3000/api/admin/categories",
          {
            credentials: "include",
          },
        );
        const updatedData = await updatedRes.json();
        if (updatedData.success) setCategories(updatedData.categories);
        setNewCategory("");
        alert("Category added successfully!");
      } else {
        alert(data.message || "Failed to add category.");
      }
    } catch (err) {
      console.error("Add category error:", err);
      alert("Something went wrong while adding category.");
    }
  };

  // Delete category by _id
  const handleDeleteCategory = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/categories/${catId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter((c) => c._id !== catId));
        alert("Category deleted successfully!");
        if (
          product.category &&
          categories.find((c) => c._id === catId)?.name === product.category
        ) {
          setProduct({ ...product, category: "" });
        }
      } else {
        alert(data.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Delete category error:", err);
      alert("Something went wrong while deleting category.");
    }
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name.trim() || !product.category || !product.price) {
      alert("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("category", product.category);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("discountPercent", product.discountPercent);

    // Append new uploaded files
    photoFiles.forEach((file) => formData.append("photos", file));

    // Append existing photos URLs
    existingPhotos.forEach((url) => formData.append("existingPhotos", url));

    if (editing) formData.append("id", productId);

    const url = editing
      ? "http://localhost:3000/api/admin/edit-product"
      : "http://localhost:3000/api/admin/add-product";

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        if (editing) {
          // Fetch updated product from backend to sync images
          const resUpdated = await fetch(
            `http://localhost:3000/api/admin/add-product/${productId}?editing=true`,
            { credentials: "include" },
          );
          const updatedData = await resUpdated.json();

          if (updatedData.success && updatedData.product) {
            const prod = updatedData.product;
            setExistingPhotos(prod.photos || []);
            setProduct({
              name: prod.name || "",
              category: prod.category?.[0] || "",
              description: prod.description || "",
              price: prod.price || "",
              discountPercent: prod.discountPercent || 0,
              photos:
                prod.photos?.map((p) => `http://localhost:3000${p}`) || [],
            });
            setPhotoFiles([]); // clear new files after successful upload
          }
        }
        navigate("/product-success", { state: { editing } });
      } else {
        alert("Failed to submit product.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting the product.");
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
      <main className="flex justify-center items-start mt-10 mb-10 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab("product")}
              className={`px-6 py-2 font-semibold ${
                activeTab === "product"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              Add Product
            </button>
            <button
              onClick={() => setActiveTab("category")}
              className={`px-6 py-2 font-semibold ${
                activeTab === "category"
                  ? "border-b-4 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              Add Category
            </button>
          </div>

          {/* Add Product Tab */}
          {activeTab === "product" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-4">
                  {categories.map((cat) => (
                    <label key={cat._id} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat.name}
                        checked={product.category === cat.name}
                        onChange={handleChange}
                        className="mr-2"
                        required
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block font-medium text-gray-700">
                  Price (BDT)
                </label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block font-medium text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={product.discountPercent}
                  onChange={handleChange}
                  min={0}
                  max={100}
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Photo previews */}
              {product.photos && product.photos.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.photos.map((p, i) => (
                    <div key={i} className="relative">
                      <img
                        src={p}
                        alt={`Product ${i}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo upload */}
              <div>
                <label className="block font-medium text-gray-700">
                  Photo(s)
                </label>
                <input
                  type="file"
                  name="photos"
                  onChange={handleChange}
                  multiple
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700"
                >
                  {editing ? "Update" : "Add"} Product
                </button>
              </div>
            </form>
          )}

          {/* Add Category Tab */}
          {activeTab === "category" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter new category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600"
              >
                Add Category
              </button>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Existing Categories:
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {categories.map((cat) => (
                    <li
                      key={cat._id}
                      className="flex justify-between items-center"
                    >
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AddProduct;
