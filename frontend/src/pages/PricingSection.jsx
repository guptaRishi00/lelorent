import React from "react";
import axios from "axios";
import { Check, Zap, Star, Crown, CheckCircle, Settings } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";

const PricingSection = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  // Check if user has premium from Clerk metadata
  const isPremium = user?.publicMetadata?.isPremium === true;
  const premiumExpiresAt = user?.publicMetadata?.premiumExpiresAt;
  
  // Check if premium is still valid
  const isPremiumValid = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date();
  const isPremiumExpired = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) <= new Date();
  
  // Check if premium expires within 7 days
  const isPremiumExpiringSoon = isPremiumValid && premiumExpiresAt && 
    new Date(premiumExpiresAt) > new Date() && 
    new Date(premiumExpiresAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handlePayment = async (plan) => {
    const token = await getToken();
    try {
      const response = await axios.post(
        "http://localhost:4000/api/payment/create-order",
        { plan: plan.type }, // Send only the plan type string
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { order, key } = response.data;

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "Rent Lelo",
        description: `${plan.name} subscription`,
        order_id: order.id,
        handler: async function (response) {
          console.log("🔵 Razorpay payment completed:", response);
          try {
            console.log("🔵 Sending verification request to backend...");
            const verifyResponse = await axios.post(
              "http://localhost:4000/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan.type, // Send only the plan type string
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            console.log("✅ Backend verification response:", verifyResponse.data);
            
            // Refresh user data to get updated premium status
            if (typeof window !== 'undefined' && window.location) {
              window.location.reload();
            }
            
            alert("✅ Payment successful! Premium features are now activated.");
          } catch (error) {
            console.error("❌ Payment verification failed:", error);
            console.error("❌ Error response:", error.response?.data);
            alert(`Payment completed but verification failed: ${error.response?.data?.message || error.message}`);
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
        },
        theme: {
          color: "#00b894",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Payment failed. Please try again.";
      alert(`Payment failed: ${errorMessage}`);
    }
  };

  const plans = [
    {
      icon: Zap,
      name: "Monthly Plan",
      description: "Pay as you go, full flexibility",
      price: "₹199",
      period: "/mo",
      billedText: "Billed ₹199 every month",
      features: [
        "Unlimited Owner Numbers",
        "All features included",
        "Priority customer support",
        "Cancel anytime",
      ],
      buttonText: "Get Monthly Plan",
      popular: false,
      savings: null,
      amount: 19900,
      durationInDays: 30,
      type: "monthly",
    },
    {
      icon: Star,
      name: "Quarterly Plan",
      description: "Save 33% with quarterly billing",
      price: "₹399",
      period: "/3mo",
      billedText: "Billed ₹399 every 3 months",
      features: [
        "All features of Monthly Plan",
        "Priority feature requests",
        "Extended support",
      ],
      buttonText: "Get Quarterly Plan",
      popular: true,
      savings: "Save 33%",
      amount: 39900,
      durationInDays: 90,
      type: "quarterly",
    },
    {
      icon: Crown,
      name: "Half Yearly Plan",
      description: "Save 41% with half-yearly billing",
      price: "₹699",
      period: "/6mo",
      billedText: "Billed ₹699 every 6 months",
      features: [
        "All features of Quarterly Plan",
        "Premium support",
        "Early access to new features",
        "Dedicated account manager",
      ],
      buttonText: "Get Half Yearly Plan",
      popular: false,
      savings: "Save 41%",
      amount: 69900,
      durationInDays: 180,
      type: "yearly",
    },
  ];

  // Show loading state while Clerk data is loading
  if (!isLoaded) {
    return (
      <section className="py-16 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="w-full mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600">
            Select the plan that best fits your needs
          </p>
          {isPremiumValid && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold">
              <Crown className="w-4 h-4 mr-2" />
              Premium Active - Expires {new Date(premiumExpiresAt).toLocaleDateString()}
            </div>
          )}
          {isPremiumExpired && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold">
              <Crown className="w-4 h-4 mr-2" />
              Premium Expired - Renew to continue enjoying premium features
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-lg bg-white shadow-sm ${
                  plan.popular
                    ? "border-2 border-green-400 shadow-lg"
                    : "border border-gray-200 hover:border-green-300"
                }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Effective
                      </span>
                    </div>
                    {plan.savings && (
                      <div className="absolute -top-2 -right-2">
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
                          {plan.savings}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="text-center pb-4 p-6">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-lg text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500">{plan.billedText}</p>
                </div>

                <div className="p-6 pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isPremiumValid ? (
                    <div className="space-y-3">
                      <div className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Premium Active</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Your Premium Benefits:</p>
                        <div className="flex flex-wrap gap-2 justify-center mb-3">
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            Owner Contact
                          </span>
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            Exact Location
                          </span>
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <Check className="w-3 h-3 mr-1" />
                            Direct Visits
                          </span>
                        </div>
                        <div className="space-y-2">
                          {isPremiumExpiringSoon && (
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-orange-800 text-sm font-medium">
                                ⚠️ Premium expires on {new Date(premiumExpiresAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => window.location.href = '/feed'}
                            className="w-full py-2 text-white font-medium rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Crown className="w-4 h-4" />
                            <span>View Premium Properties</span>
                          </button>
                          <button
                            onClick={() => window.location.href = '/profile'}
                            className="w-full py-2 text-gray-700 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Manage Subscription</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : isPremiumExpired ? (
                    <button
                      onClick={() => handlePayment(plan)}
                      className="w-full py-3 text-white font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors"
                    >
                      Renew Premium
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayment(plan)}
                      className="w-full py-3 text-white font-semibold rounded-lg bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
