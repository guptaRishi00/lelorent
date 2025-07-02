import "./App.css";
import Header from "./components/Header";

import { Routes, Route } from "react-router-dom";
import PricingSection from "./pages/PricingSection";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

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
      </Routes>
    </>
  );
}

export default App;
