import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render for admin users
 * @param {string} [props.fallbackPath="/pricing-section"] - Path to redirect non-admin users to
 */
export default function AdminRoute({
  children,
  fallbackPath = "/pricing-section",
}) {
  const { user, isLoaded, isSignedIn } = useUser();

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Redirect if user is not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check admin role from user metadata
  const userRole = user?.publicMetadata?.role;
  const isAdmin = userRole === "admin";

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render protected content for admin users
  return <>{children}</>;
}

// Type checking with JSDoc comments for better IDE support
/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render for admin users
 * @param {string} [props.fallbackPath="/pricing-section"] - Path to redirect non-admin users to
 */
