import {
  Home,
  User,
  Heart,
  Crown,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useClerk,
} from "@clerk/clerk-react";
import { useState } from "react";

import { Link } from "react-router-dom";
import { useUserSync } from "../hooks/useUserSync";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();

  useUserSync();

  const fullName = user?.fullName || user?.username || "User";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isPremium = user?.publicMetadata?.isPremium === true;
  const isAdmin = user?.publicMetadata?.role === "admin";

  const navigationItems = [
    { icon: Home, label: "Feed", href: "#" },
    { icon: User, label: "Profile", href: "#" },
    { icon: Heart, label: "Favourites", href: "#" },
    { icon: HelpCircle, label: "Support", href: "#" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={"/"}>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-semibold text-gray-900">
                  Rent Lelo
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <SignedIn>
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              ))}
              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center space-x-2 text-sm text-blue-600 font-semibold hover:underline"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </a>
              )}
            </nav>
          </SignedIn>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="hidden lg:flex items-center space-x-3">
                {!isPremium && (
                  <Link
                    to="/pricing-section"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 shadow-md transition-all duration-200"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Upgrade</span>
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <SignedIn>
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {!isPremium && (
                <Link
                  to="/pricing-section"
                  className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </Link>
              )}

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
                {isAdmin && (
                  <a
                    href="/admin"
                    className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </a>
                )}
              </nav>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </SignedIn>
    </header>
  );
}
