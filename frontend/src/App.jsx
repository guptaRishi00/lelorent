import "./App.css";
import Header from "./components/Header";

import { Routes, Route } from "react-router-dom";
import PricingSection from "./pages/PricingSection";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/pricing-section" element={<PricingSection />} />
      </Routes>
    </>
  );
}

export default App;
