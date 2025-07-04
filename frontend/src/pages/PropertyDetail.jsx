
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProperties } from "../hooks/api";
import { useUser } from "@clerk/clerk-react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Building,
  Compass,
  Wrench,
  Bus,
  GraduationCap,
  Crown,
  Eye,
  Phone,
  Home,
  IndianRupee,
} from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  // Check if user has premium access
  const isPremium = user?.publicMetadata?.isPremium === true;
  const premiumExpiresAt = user?.publicMetadata?.premiumExpiresAt;
  const isPremiumValid = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date();
  const isAdmin = user?.publicMetadata?.role === "admin";
  
  // Show location only to premium users or admins
  const canSeeLocation = isPremiumValid || isAdmin;

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const properties = await getProperties();
        const found = properties.find((p) => p._id === id);
        if (found) {
          setProperty(found);
        } else {
          setError("Property not found");
        }
        setImgIndex(0);
      } catch (err) {
        setError("Failed to load property details");
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setImgIndex((prev) =>
      prev === 0 ? property.picture.length - 1 : prev - 1
    );
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setImgIndex((prev) =>
      prev === property.picture.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link
            to="/"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 mb-8 transition-colors font-medium"
          >
            <ChevronLeft size={20} className="mr-1" />
            Back to Properties
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={40} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              {error || "Property not found"}
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = property.picture || [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-all duration-200 font-semibold text-lg group"
          >
            <ChevronLeft size={22} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Properties
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Image Gallery */}
          <div className="relative group">
          {images.length > 0 ? (
              <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-100">
                <img
                  src={images[imgIndex]}
                  alt={`${property.title} - Image ${imgIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {/* Enhanced overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"></div>

                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/95 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <ChevronRight size={22} />
                    </button>

                    {/* Enhanced image indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`transition-all duration-300 ${
                            i === imgIndex
                              ? "w-8 h-3 bg-white rounded-full shadow-lg"
                              : "w-3 h-3 bg-white/60 hover:bg-white/80 rounded-full"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Enhanced image counter */}
                    <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 text-white rounded-full text-sm font-semibold backdrop-blur-sm">
                      {imgIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Home size={64} className="mx-auto mb-4 text-slate-400" />
                  <p className="font-medium text-xl">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="p-8 md:p-12">
            {/* Title and Location */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
                {property.title}
              </h1>
              <div className="flex items-start text-slate-600 mb-6">
                <MapPin
                  size={24}
                  className="mr-3 text-emerald-600 flex-shrink-0 mt-1"
                />
                <div className="relative">
                  {canSeeLocation ? (
                    <span className="text-xl font-medium">{property.location}</span>
                  ) : (
                    <div className="relative">
                      <span className="text-xl font-medium blur-sm select-none">
                        {property.location}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-start">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-amber-200 shadow-sm">
                          <Crown className="w-5 h-5 text-amber-500" />
                          <span>Premium Required</span>
                          <Link
                            to="/pricing-section"
                            className="ml-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                          >
                            Upgrade
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center text-emerald-700 font-bold text-4xl md:text-5xl mb-3">
                <IndianRupee size={36} className="mr-2" />
                <span>{property.monthlyRent?.toLocaleString("en-IN")}</span>
                <span className="text-xl font-normal text-slate-500 ml-3">
                  /month
                </span>
              </div>
            </div>

            {/* Enhanced Key Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 text-center border border-emerald-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="font-bold text-slate-900 text-2xl mb-2">2BHK</div>
                <div className="text-sm text-slate-600 font-medium">Property Type</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="font-bold text-slate-900 text-2xl mb-2">2-3</div>
                <div className="text-sm text-slate-600 font-medium">Max Occupancy</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-purple-600" />
                </div>
                <div className="font-bold text-slate-900 text-2xl mb-2">East</div>
                <div className="text-sm text-slate-600 font-medium">Facing</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center border border-orange-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <div className="font-bold text-slate-900 text-2xl mb-2">Available</div>
                <div className="text-sm text-slate-600 font-medium">From Now</div>
              </div>
            </div>

            {/* Enhanced Property Information */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <Wrench className="w-6 h-6 text-emerald-600" />
                  </div>
                  Property Details
                </h3>

                <div className="space-y-5">
                  <div className="flex justify-between items-center py-4 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold">Furnishing</span>
                    <span className="font-bold text-slate-900 text-lg">Semi-Furnished</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold">Floor</span>
                    <span className="font-bold text-slate-900 text-lg">2/5</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold">Security Deposit</span>
                    <span className="font-bold text-slate-900 text-lg">₹50,000</span>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <span className="text-slate-600 font-semibold">Maintenance</span>
                    <span className="font-bold text-slate-900 text-lg">₹2,000</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Nearby Facilities */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  Nearby Facilities
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                        <Bus className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 font-semibold">Metro Station</span>
                    </div>
                    <span className="font-bold text-emerald-700 text-lg">0.5 km</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-slate-700 font-semibold">University</span>
                    </div>
                    <span className="font-bold text-blue-700 text-lg">1.2 km</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-slate-700 font-semibold">Shopping Mall</span>
                    </div>
                    <span className="font-bold text-purple-700 text-lg">0.8 km</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <Wrench className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="text-slate-700 font-semibold">Hospital</span>
                    </div>
                    <span className="font-bold text-orange-700 text-lg">2.0 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Contact Details Section */}
            {canSeeLocation ? (
              <div className="bg-white rounded-3xl p-8 mb-12 border border-slate-200 shadow-lg">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.contactDetails?.contactPerson && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Contact Person</p>
                        <p className="font-bold text-slate-900 text-lg">{property.contactDetails.contactPerson}</p>
                      </div>
                    </div>
                  )}

                  {property.contactDetails?.phone && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Phone Number</p>
                        <a 
                          href={`tel:${property.contactDetails.phone}`}
                          className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors"
                        >
                          {property.contactDetails.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {property.contactDetails?.email && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Email Address</p>
                        <a 
                          href={`mailto:${property.contactDetails.email}`}
                          className="font-bold text-slate-900 text-lg hover:text-purple-600 transition-colors"
                        >
                          {property.contactDetails.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {property.contactDetails?.alternativeContact && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Alternative Contact</p>
                        <p className="font-bold text-slate-900 text-lg">{property.contactDetails.alternativeContact}</p>
                      </div>
                    </div>
                  )}

                  {property.contactDetails?.preferredContactMethod && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Preferred Contact</p>
                        <p className="font-bold text-slate-900 text-lg capitalize">{property.contactDetails.preferredContactMethod}</p>
                      </div>
                    </div>
                  )}

                  {property.contactDetails?.availableHours && (
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Available Hours</p>
                        <p className="font-bold text-slate-900 text-lg">{property.contactDetails.availableHours}</p>
                      </div>
                    </div>
                  )}
                </div>

                {(!property.contactDetails?.phone && !property.contactDetails?.email && !property.contactDetails?.alternativeContact) && (
                  <div className="text-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-semibold mb-2">No contact information available</p>
                    <p className="text-sm">Contact details will be added soon</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 mb-12 border border-slate-200 shadow-lg">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Crown className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Contact Information</h3>
                  <p className="text-slate-600 mb-6 text-lg">Contact details are available for premium users</p>
                  <Link
                    to="/pricing-section"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </Link>
                </div>
              </div>
            )}

            {/* Enhanced Contact Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 text-center shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-4">
                Interested in this property?
              </h3>
              <p className="text-emerald-100 mb-8 text-lg">
                Contact the owner directly to schedule a visit or get more details.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {canSeeLocation ? (
                  <>
                    {property.contactDetails?.phone && (
                      <a 
                        href={`tel:${property.contactDetails.phone}`}
                        className="flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </a>
                    )}
                    {property.contactDetails?.email && (
                      <a 
                        href={`mailto:${property.contactDetails.email}`}
                        className="flex items-center justify-center px-8 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 shadow-lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Email
                      </a>
                    )}
                    {!property.contactDetails?.phone && !property.contactDetails?.email && (
                      <button className="flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        <Phone className="w-5 h-5 mr-2" />
                        Contact Owner
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    to="/pricing-section"
                    className="flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Contact Owner
                  </Link>
                )}
                <button className="flex items-center justify-center px-8 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-all duration-300 transform hover:scale-105 border-2 border-white/20 shadow-lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
