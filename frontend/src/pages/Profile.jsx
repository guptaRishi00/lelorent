
import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Toaster, toast } from "react-hot-toast";
import { Crown, ShieldCheck, User, Mail, Hash, Settings, ExternalLink } from "lucide-react";

const Profile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-lg font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    toast.error("User not found. Please sign in.");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <span className="text-red-600 text-lg font-semibold">User not found</span>
          <p className="text-gray-500 mt-2">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const fullName = user.fullName || user.username || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const email = user.primaryEmailAddress?.emailAddress || "-";
  const role = user.publicMetadata?.role || "user";
  const isPremium = user.publicMetadata?.isPremium === true;
  const premiumExpiresAt = user.publicMetadata?.premiumExpiresAt;
  const premiumPlan = user.publicMetadata?.premiumPlan;
  
  // Check if premium is still valid
  const isPremiumValid = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date();
  const isPremiumExpired = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) <= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'bg-white shadow-lg border',
          duration: 4000,
        }}
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          {/* Background Pattern */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          </div>
          
          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-100"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl ring-4 ring-blue-100">
                    {initials}
                  </div>
                )}
                
                {/* Status badges */}
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  {isPremium && (
                    <div className="bg-yellow-400 rounded-full p-2 shadow-lg border-2 border-white">
                      <Crown className="w-4 h-4 text-yellow-800" />
                    </div>
                  )}
                  {role === "admin" && (
                    <div className="bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white">
                      <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* User Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h1>
              <div className="flex items-center justify-center text-gray-600 mb-4">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-lg">{email}</span>
              </div>
              
              {/* Role & Premium Badges */}
              <div className="flex flex-wrap gap-3 justify-center">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  role === "admin" 
                    ? "bg-blue-100 text-blue-800 border border-blue-200" 
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {role === "admin" ? "Administrator" : "User"}
                </span>
                
                {isPremiumValid && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium Active
                  </span>
                )}
                {isPremiumExpired && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                    <Crown className="w-4 h-4 mr-2" />
                    Premium Expired
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
          </div>
          
          <div className="grid gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Hash className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600 font-medium">User ID</span>
              </div>
              <span className="text-gray-900 font-mono text-sm bg-white px-3 py-1 rounded-lg border">
                {user.id.slice(0, 8)}...
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <ShieldCheck className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600 font-medium">Account Role</span>
              </div>
              <span className="text-gray-900 font-semibold capitalize">{role}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-600 font-medium">Premium Status</span>
              </div>
              <div className="text-right">
                <span className={`font-semibold block ${isPremiumValid ? 'text-yellow-600' : isPremiumExpired ? 'text-orange-600' : 'text-gray-500'}`}>
                  {isPremiumValid ? "Active" : isPremiumExpired ? "Expired" : "Not Active"}
                </span>
                {premiumExpiresAt && (
                  <span className="text-xs text-gray-500 block">
                    {isPremiumValid ? "Expires" : "Expired"} {new Date(premiumExpiresAt).toLocaleDateString()}
                  </span>
                )}
                {premiumPlan && (
                  <span className="text-xs text-gray-500 block capitalize">
                    {premiumPlan} Plan
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        {Object.keys(user.publicMetadata || {}).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
              <pre className="text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {JSON.stringify(user.publicMetadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action Card */}
        
      </div>
    </div>
  );
};

export default Profile;
