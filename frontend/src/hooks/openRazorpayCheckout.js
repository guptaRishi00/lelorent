import axios from "axios";

export const openRazorpayCheckout = async (planType, userId) => {
  const { data } = await axios.post("/api/payment/create-order", { planType });

  const options = {
    key: "YOUR_RAZORPAY_KEY_ID",
    amount: data.order.amount,
    currency: "INR",
    name: "Rent Lelo",
    description: `${planType} Premium Plan`,
    order_id: data.order.id,
    handler: async (response) => {
      // call backend to update premium status
      await axios.post("/api/user/set-role-premium", {
        userId,
        planType,
      });
      alert("✅ Payment successful!");
    },
    prefill: {
      name: "User",
      email: "user@example.com",
    },
    theme: { color: "#4f46e5" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
