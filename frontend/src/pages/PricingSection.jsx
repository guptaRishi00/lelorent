import React from "react";
import { Check, Zap, Star, Crown } from "lucide-react";

const PricingSection = () => {
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
    },
    {
      icon: Star,
      name: "Quarterly Plan",
      description: "Save 33% with quarterly billing",
      price: "₹133",
      period: "/mo",
      billedText: "Billed ₹399 every 3 months",
      features: [
        "All features of Monthly Plan",
        "Priority feature requests",
        "Extended support",
      ],
      buttonText: "Get Quarterly Plan",
      popular: true,
      savings: "Save 33%",
    },
    {
      icon: Crown,
      name: "Half Yearly Plan",
      description: "Save 41% with half-yearly billing",
      price: "₹117",
      period: "/mo",
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
    },
  ];

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
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

                {!plan.popular && plan.savings && (
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold border border-orange-200">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="text-center pb-4 p-6">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-gray-600" />
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

                  <button
                    className={`w-full py-3 text-white font-semibold rounded-lg transition-colors ${
                      plan.popular
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-green-500 hover:bg-green-600 border border-green-500 hover:border-green-600"
                    }`}
                  >
                    {plan.buttonText}
                  </button>
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
