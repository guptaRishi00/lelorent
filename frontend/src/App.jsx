import "./App.css";
import Header from "./components/Header";

import { Routes, Route } from "react-router-dom";
import PricingSection from "./pages/PricingSection";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Feed from "./pages/Feed";
import PropertyDetail from "./pages/PropertyDetail";
import Profile from "./pages/Profile";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/pricing-section" element={<PricingSection />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/feed" element={<Feed />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/" element={<Feed />} />
        <Route
          path="/profile"
          element={
            <SignedIn>
              <Profile />
            </SignedIn>
          }
        />
      </Routes>
    </>
  );
}

export default App;
