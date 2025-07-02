import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building,
  MapPin,
  Calendar,

} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import { usePropertyUpload, updateProperty, deleteProperty, getProperties } from "../hooks/api";
import { useAuth } from "@clerk/clerk-react";

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Property form state
  const { getToken } = useAuth();
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    location: "",
    monthlyRent: "",
    securityDeposit: "",
    maintenance: "0",
    propertyType: "1BHK",
    furnishing: "Furnished",
    availableFrom: "",
    maxOccupancy: "1",
    floor: { number: "0", total: "1" },
    facing: "North",
    transportFacilities: [{ type: "MetroStation", distance: "0" }],
    amenities: [{ type: "Grocery", distance: "0" }],
    educationFacilities: [{ type: "School", distance: "0" }],
    isPremium: false,
    premiumFeatures: {
      exactLocation: false,
      ownerContact: false,
      directVisits: false,
    },
    images: [],
    existingImages: [],
  });
  const { uploadProperty } = usePropertyUpload();
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setPropertyForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setPropertyForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = await getToken();
    const formData = {
      ...propertyForm,
      monthlyRent: parseInt(propertyForm.monthlyRent),
      securityDeposit: parseInt(propertyForm.securityDeposit),
      maintenance: parseInt(propertyForm.maintenance),
      maxOccupancy: parseInt(propertyForm.maxOccupancy),
      floor: {
        number: parseInt(propertyForm.floor.number),
        total: parseInt(propertyForm.floor.total),
      },
      images: propertyForm.images,
      existingImages: propertyForm.existingImages,
    };
    try {
      if (editingProperty) {
        await updateProperty(editingProperty._id, formData, token);
        toast.success("Property updated successfully!");
        await fetchProperties();
      } else {
        await uploadProperty(propertyForm);
        toast.success("Property added successfully!");
        await fetchProperties();
      }
      setShowAddForm(false);
      resetForm();
      setEditingProperty(null);
    } catch (error) {
      console.error("❌ Failed to update property:", error.message);
      toast.error("Failed to update/add property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setPropertyForm((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setPropertyForm((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setPropertyForm((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  const MAX_IMAGES = 10;
  const [previewImage, setPreviewImage] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    const totalImages = (propertyForm.existingImages?.length || 0) + (propertyForm.images?.length || 0) + files.length;
    if (totalImages > MAX_IMAGES) {
      toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }
    setPropertyForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (indexToRemove, type = "new") => {
    if (type === "existing") {
      if (!window.confirm("Are you sure you want to remove this image? This cannot be undone.")) return;
      setPropertyForm((prev) => ({
        ...prev,
        existingImages: prev.existingImages.filter((_, index) => index !== indexToRemove),
      }));
    } else {
      setPropertyForm((prev) => ({
        ...prev,
        images: prev.images && Array.isArray(prev.images)
          ? prev.images.filter((_, index) => index !== indexToRemove)
          : [],
      }));
    }
  };

  const resetForm = () => {
    setPropertyForm({
      title: "",
      location: "",
      monthlyRent: "",
      securityDeposit: "",
      maintenance: "0",
      propertyType: "1BHK",
      furnishing: "Furnished",
      availableFrom: "",
      maxOccupancy: "1",
      floor: { number: "0", total: "1" },
      facing: "North",
      transportFacilities: [{ type: "MetroStation", distance: "0" }],
      amenities: [{ type: "Grocery", distance: "0" }],
      educationFacilities: [{ type: "School", distance: "0" }],
      isPremium: false,
      premiumFeatures: {
        exactLocation: false,
        ownerContact: false,
        directVisits: false,
      },
      images: [],
      existingImages: [],
    });
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      ...property,
      monthlyRent: property.monthlyRent.toString(),
      securityDeposit: property.securityDeposit.toString(),
      maintenance: property.maintenance.toString(),
      maxOccupancy: property.maxOccupancy.toString(),
      floor: {
        number: property.floor.number.toString(),
        total: property.floor.total.toString(),
      },
      availableFrom: property.availableFrom ? property.availableFrom.slice(0, 10) : "",
      transportFacilities: property.transportFacilities || [
        { type: "MetroStation", distance: "0" },
      ],
      amenities: property.amenities || [{ type: "Grocery", distance: "0" }],
      educationFacilities: property.educationFacilities || [
        { type: "School", distance: "0" },
      ],
      premiumFeatures: property.premiumFeatures || {
        exactLocation: false,
        ownerContact: false,
        directVisits: false,
      },
      images: [],
      existingImages: property.picture || [],
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this property?");
    if (!confirm) return;
    const token = await getToken();
    try {
      await deleteProperty(id, token);
      toast.success("Property deleted successfully!");
      await fetchProperties();
    } catch (err) {
      console.error("❌ Failed to delete property:", err.message);
      toast.error("Failed to delete property.");
    }
  };

  const filteredProperties = properties
    .filter(
      (property) =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (property) => filterType === "all" || property.propertyType === filterType
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Fetch properties function (so it can be reused)
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const props = await getProperties();
      setProperties(props);
    } catch (err) {
      console.error("❌ Failed to load properties:", err.message);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Login Screen

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.filter((p) => p.isPremium).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {properties.length > 0
                    ? Math.round(
                        properties.reduce((acc, p) => acc + p.monthlyRent, 0) /
                          properties.length
                      ).toLocaleString("en-IN")
                    : "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    properties.filter(
                      (p) => new Date(p.availableFrom) <= new Date()
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="Studio">Studio</option>
                <option value="Independent House">Independent House</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="monthlyRent-desc">Highest Rent</option>
                <option value="monthlyRent-asc">Lowest Rent</option>
                <option value="title-asc">Name A-Z</option>
                <option value="title-desc">Name Z-A</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingProperty(null);
                resetForm();
              }}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* Properties Table */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Filter: {filterType === "all" ? "All Types" : filterType}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            Sort: {
              sortBy === "createdAt"
                ? sortOrder === "desc"
                  ? "Newest First"
                  : "Oldest First"
                : sortBy === "monthlyRent"
                ? sortOrder === "desc"
                  ? "Highest Rent"
                  : "Lowest Rent"
                : sortBy === "title"
                ? sortOrder === "asc"
                  ? "Name A-Z"
                  : "Name Z-A"
                : `${sortBy} (${sortOrder})`
            }
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading && (
              <div className="text-center py-12 text-gray-500">Loading properties...</div>
            )}
            {error && (
              <div className="text-center py-12 text-red-500">{error}</div>
            )}
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProperties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.furnishing}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {property.location}
                      </div>
                      <div className="text-sm text-gray-500">
                        Floor {property.floor.number}/{property.floor.total}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{property.monthlyRent.toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm text-gray-500">
                        +₹{property.maintenance.toLocaleString("en-IN")}{" "}
                        maintenance
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {property.propertyType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {property.isPremium && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Premium
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            new Date(property.availableFrom) <= new Date()
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {new Date(property.availableFrom) <= new Date()
                            ? "Available"
                            : "Upcoming"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(property)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProperties.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <Building className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No properties found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Property Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title
                  </label>
                  <input
                    type="text"
                    value={propertyForm.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={propertyForm.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    value={propertyForm.monthlyRent}
                    onChange={(e) =>
                      handleInputChange("monthlyRent", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={propertyForm.securityDeposit}
                    onChange={(e) =>
                      handleInputChange("securityDeposit", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance (₹)
                  </label>
                  <input
                    type="number"
                    value={propertyForm.maintenance}
                    onChange={(e) =>
                      handleInputChange("maintenance", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyForm.propertyType}
                    onChange={(e) =>
                      handleInputChange("propertyType", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="Studio">Studio</option>
                    <option value="Independent House">Independent House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    value={propertyForm.furnishing}
                    onChange={(e) =>
                      handleInputChange("furnishing", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={propertyForm.availableFrom}
                    onChange={(e) =>
                      handleInputChange("availableFrom", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Occupancy
                  </label>
                  <input
                    type="number"
                    value={propertyForm.maxOccupancy}
                    onChange={(e) =>
                      handleInputChange("maxOccupancy", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facing
                  </label>
                  <select
                    value={propertyForm.facing}
                    onChange={(e) =>
                      handleInputChange("facing", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                  </select>
                </div>
              </div>

              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Property Images
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    type="file"
                    id="propertyImages"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        const totalImages = (propertyForm.existingImages?.length || 0) + (propertyForm.images?.length || 0) + files.length;
                        if (totalImages > MAX_IMAGES) {
                          toast.error(`You can only upload up to ${MAX_IMAGES} images.`);
                          return;
                        }
                        setPropertyForm((prev) => ({
                          ...prev,
                          images: [...(prev.images || []), ...files],
                        }));
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="propertyImages"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB each (Max 10 images)
                    </span>
                  </label>
                </div>

                {/* Image Preview */}
                {propertyForm.existingImages && propertyForm.existingImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {propertyForm.existingImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Property existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
                          onClick={() => setPreviewImage(url)}
                        />
                        <span className="absolute left-1 top-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">Existing</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index, "existing")}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {propertyForm.images && propertyForm.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from(propertyForm.images).map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Property new ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
                          onClick={() => setPreviewImage(URL.createObjectURL(file))}
                        />
                        <span className="absolute left-1 top-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">New</span>
                        <button
                          type="button"
                          onClick={() => removeImage(index, "new")}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Number
                  </label>
                  <input
                    type="number"
                    value={propertyForm.floor.number}
                    onChange={(e) =>
                      handleInputChange("floor.number", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    value={propertyForm.floor.total}
                    onChange={(e) =>
                      handleInputChange("floor.total", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* Transport Facilities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Transport Facilities
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("transportFacilities", {
                        type: "MetroStation",
                        distance: "0",
                      })
                    }
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    + Add Transport
                  </button>
                </div>
                <div className="space-y-3">
                  {propertyForm.transportFacilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        value={facility.type}
                        onChange={(e) =>
                          handleArrayChange(
                            "transportFacilities",
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="MetroStation">Metro Station</option>
                        <option value="BusStop">Bus Stop</option>
                        <option value="RailwayStation">Railway Station</option>
                        <option value="Airport">Airport</option>
                        <option value="TaxiStand">Taxi Stand</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={facility.distance}
                          onChange={(e) =>
                            handleArrayChange(
                              "transportFacilities",
                              index,
                              "distance",
                              e.target.value
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          step="0.1"
                        />
                        <span className="text-sm text-gray-500">km</span>
                      </div>
                      {propertyForm.transportFacilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("transportFacilities", index)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Amenities
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("amenities", {
                        type: "Grocery",
                        distance: "0",
                      })
                    }
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    + Add Amenity
                  </button>
                </div>
                <div className="space-y-3">
                  {propertyForm.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        value={amenity.type}
                        onChange={(e) =>
                          handleArrayChange(
                            "amenities",
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Grocery">Grocery Store</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Bank">Bank</option>
                        <option value="ATM">ATM</option>
                        <option value="Gym">Gym</option>
                        <option value="Park">Park</option>
                        <option value="ShoppingMall">Shopping Mall</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={amenity.distance}
                          onChange={(e) =>
                            handleArrayChange(
                              "amenities",
                              index,
                              "distance",
                              e.target.value
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          step="0.1"
                        />
                        <span className="text-sm text-gray-500">km</span>
                      </div>
                      {propertyForm.amenities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("amenities", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Facilities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700">
                    Education Facilities
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addArrayItem("educationFacilities", {
                        type: "School",
                        distance: "0",
                      })
                    }
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    + Add Education
                  </button>
                </div>
                <div className="space-y-3">
                  {propertyForm.educationFacilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <select
                        value={facility.type}
                        onChange={(e) =>
                          handleArrayChange(
                            "educationFacilities",
                            index,
                            "type",
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="School">School</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                        <option value="Library">Library</option>
                        <option value="CoachingCenter">Coaching Center</option>
                        <option value="PlaySchool">Play School</option>
                      </select>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={facility.distance}
                          onChange={(e) =>
                            handleArrayChange(
                              "educationFacilities",
                              index,
                              "distance",
                              e.target.value
                            )
                          }
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          min="0"
                          step="0.1"
                        />
                        <span className="text-sm text-gray-500">km</span>
                      </div>
                      {propertyForm.educationFacilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("educationFacilities", index)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Settings */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={propertyForm.isPremium}
                    onChange={(e) =>
                      handleInputChange("isPremium", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="isPremium"
                    className="text-sm font-medium text-gray-700"
                  >
                    Premium Property
                  </label>
                </div>

                {propertyForm.isPremium && (
                  <div className="ml-7 space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="exactLocation"
                        checked={propertyForm.premiumFeatures.exactLocation}
                        onChange={(e) =>
                          handleInputChange(
                            "premiumFeatures.exactLocation",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="exactLocation"
                        className="text-sm text-gray-700"
                      >
                        Show exact location
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ownerContact"
                        checked={propertyForm.premiumFeatures.ownerContact}
                        onChange={(e) =>
                          handleInputChange(
                            "premiumFeatures.ownerContact",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="ownerContact"
                        className="text-sm text-gray-700"
                      >
                        Direct owner contact
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="directVisits"
                        checked={propertyForm.premiumFeatures.directVisits}
                        onChange={(e) =>
                          handleInputChange(
                            "premiumFeatures.directVisits",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="directVisits"
                        className="text-sm text-gray-700"
                      >
                        Allow direct visits
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProperty(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isSubmitting ? (editingProperty ? "Updating..." : "Adding...") : (editingProperty ? "Update Property" : "Add Property")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Preview" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg border-4 border-white" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
