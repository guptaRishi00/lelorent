
import React, { useEffect, useState } from "react";
import { getProperties } from "../hooks/api";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  IndianRupee,
  Home,
  Crown,
  Eye,
  Phone,
  Building,
  Calendar,
  Users,
} from "lucide-react";

const PropertyCard = ({ property }) => {
  const { user } = useUser();
  const [imgIndex, setImgIndex] = useState(0);
  const images = property.picture || [];
  const hasMultiple = images.length > 1;

  // Check if user has premium access
  const isPremium = user?.publicMetadata?.isPremium === true;
  const premiumExpiresAt = user?.publicMetadata?.premiumExpiresAt;
  const isPremiumValid = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date();
  const isAdmin = user?.publicMetadata?.role === "admin";
  
  // Show location only to premium users or admins
  const canSeeLocation = isPremiumValid || isAdmin;

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Reset index if property changes
  React.useEffect(() => {
    setImgIndex(0);
  }, [property._id]);

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-slate-200/60 hover:border-emerald-200 transform hover:-translate-y-1">
      <Link to={`/property/${property._id}`} className="block">
        <div className="relative w-full h-72 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex]}
                alt={property.title}
                className="w-full h-72 object-cover transition-all duration-700 group-hover:scale-110"
              />
              
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {hasMultiple && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 rounded-full p-2.5 shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 rounded-full p-2.5 shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                  
                  {/* Enhanced image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`transition-all duration-300 rounded-full ${
                          i === imgIndex 
                            ? "w-3 h-3 bg-white shadow-lg scale-110" 
                            : "w-2.5 h-2.5 bg-white/70 hover:bg-white/90"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Image counter */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                    {imgIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Home size={40} className="mb-3" />
              <span className="text-sm font-medium">No image available</span>
            </div>
          )}
        </div>

        <div className="p-7">
          <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
            {property.title}
          </h3>

          {/* Location with premium blur */}
          <div className="flex items-center text-slate-600 mb-4">
            <MapPin size={18} className="mr-2 text-emerald-600 flex-shrink-0" />
            <div className="relative flex-1">
              {canSeeLocation ? (
                <span className="text-sm font-medium">{property.location}</span>
              ) : (
                <div className="relative">
                  <span className="text-sm blur-sm select-none font-medium">
                    {property.location}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-start">
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-700 border border-amber-200 shadow-sm">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Premium Required</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Property details row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Building size={14} className="text-slate-500" />
              <span>2BHK</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-slate-500" />
              <span>2-3 people</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-slate-500" />
              <span>Available</span>
            </div>
          </div>

          {/* Price and contact section - Fixed layout to prevent cropping */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-emerald-700 font-bold text-2xl">
              <IndianRupee size={22} className="mr-1" />
              <span>{property.monthlyRent?.toLocaleString("en-IN")}</span>
              <span className="text-sm font-medium text-slate-500 ml-2">
                /month
              </span>
            </div>
          </div>

          {/* Contact status indicator - Fixed to prevent cropping */}
          {(property.contactDetails?.phone || property.contactDetails?.email || property.contactDetails?.alternativeContact) && (
            <div className="mb-4">
              <div className={`inline-flex items-center text-sm px-3 py-2 rounded-full border ${
                canSeeLocation 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
                {canSeeLocation ? (
                  <>
                    <Phone size={14} className="mr-1.5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">Contact Available</span>
                  </>
                ) : (
                  <>
                    <Crown size={14} className="mr-1.5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">Contact Locked</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Enhanced CTA button */}
          <button className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl group-hover:shadow-emerald-500/25 flex items-center justify-center gap-2">
            <Eye size={18} />
            <span>View Details</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-200/60">
    <div className="w-full h-72 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse"></div>
    <div className="p-7">
      <div className="h-6 bg-slate-200 rounded-xl mb-4 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded-lg mb-4 w-3/4 animate-pulse"></div>
      <div className="flex gap-4 mb-4">
        <div className="h-4 bg-slate-200 rounded-lg w-16 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-20 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-18 animate-pulse"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded-lg mb-6 w-1/2 animate-pulse"></div>
      <div className="h-14 bg-slate-200 rounded-2xl animate-pulse"></div>
    </div>
  </div>
);

const Feed = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      setError(null);
      try {
        const props = await getProperties();
        setProperties(props);
      } catch (err) {
        setError("Failed to load properties. Please try again later.");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Home size={40} className="text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-emerald-100/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent mb-2">
                Green Properties
              </h1>
              <p className="text-slate-600 text-lg font-medium">Discover your perfect home sanctuary</p>
            </div>
            {!loading && !error && (
              <div className="text-right">
                <div className="text-sm text-slate-500 font-medium">
                  {properties.length > 0
                    ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`
                    : "No properties available"}
                </div>
                {properties.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1">Updated recently</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {properties.map((property, index) => (
                <div 
                  key={property._id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
            
            {/* Footer section */}
            <div className="text-center mt-16 pt-8 border-t border-slate-200">
              <p className="text-slate-500 font-medium">
                Showing all {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
              <div className="mt-4 text-sm text-slate-400">
                More properties coming soon • Updated daily
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Home size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              No Properties Found
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto leading-relaxed text-lg">
              We couldn't find any properties at the moment. Our team is working hard to add new listings. 
              Check back soon or contact us for more information.
            </p>
            <div className="mt-8">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Refresh Properties
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
