"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter Plan",
    description:
      "Great for individuals, small businesses and startups looking to get started with AI",
    price: 39.99,
    yearlyPrice: 319,
    buttonText: "Start Now",
    buttonVariant: "outline" as const,
    features: [
      "50 tokens per month",
      "Core Features (1 token per run)",
      "Suite Analyzer",
      "Demand Planner",
      "Spec Generator",
      "Design Analyzer",
      "Unlimited Packaging Chat AI"
    ],
    includes: [
      "Starter includes:",
      "50 tokens per month",
      "Core Features (1 token per run):",
      "Suite Analyzer",
      "Demand Planner", 
      "Spec Generator",
      "Design Analyzer",
      "Unlimited Packaging Chat AI"
    ],
  },
  {
    name: "Professional Plan",
    description:
      "Best value for individuals and businesses that need more capacity for frequent use and greater flexibility",
    price: 99.99,
    yearlyPrice: 799,
    buttonText: "Start Now",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      "150 tokens per month",
      "Core Features (1 token per run)",
      "Suite Analyzer",
      "Demand Planner",
      "Spec Generator",
      "Design Analyzer",
      "Unlimited Packaging Chat AI"
    ],
    includes: [
      "Professional includes:",
      "150 tokens per month",
      "Core Features (1 token per run):",
      "Suite Analyzer",
      "Demand Planner",
      "Spec Generator", 
      "Design Analyzer",
      "Unlimited Packaging Chat AI"
    ],
  },
  {
    name: "Enterprise Plan",
    description:
      "Custom pricing for a tailored solution built around your business needs",
    price: null,
    yearlyPrice: null,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    features: [
      "Flexible (custom allocation)",
      "Core Features (1 token per run)",
      "Suite Analyzer",
      "Demand Planner",
      "Spec Generator",
      "Design Analyzer",
      "Unlimited Packaging Chat AI",
      "In-app integrations",
      "Custom features tailored to your needs",
      "Multiple accounts / team access"
    ],
    includes: [
      "Enterprise includes:",
      "Flexible tokens (custom allocation)",
      "Core Features (1 token per run):",
      "Suite Analyzer",
      "Demand Planner",
      "Spec Generator",
      "Design Analyzer", 
      "Unlimited Packaging Chat AI",
      "Enterprise Exclusives:",
      "In-app integrations",
      "Custom features tailored to your needs",
      "Multiple accounts / team access"
    ],
  },
];

const PricingSwitch = ({
  onSwitch,
  className,
}: {
  onSwitch: (value: string) => void;
  className?: string;
}) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className="relative z-10 mx-auto flex w-fit rounded-3xl bg-neutral-50 border border-gray-200 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 rounded-3xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "0"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "0" && (
            <span
              className="absolute top-0 left-0 h-12 w-full rounded-3xl border-4 border-[#767AFA] bg-[#767AFA]"
            />
          )}
          <span className="relative">Monthly Billing</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit cursor-pointer h-12 flex-shrink-0 rounded-3xl sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors sm:text-base text-sm",
            selected === "1"
              ? "text-white"
              : "text-muted-foreground hover:text-black",
          )}
        >
          {selected === "1" && (
            <span
              className="absolute top-0 left-0 h-12 w-full rounded-3xl border-4 border-[#767AFA] bg-[#767AFA]"
            />
          )}
          <span className="relative flex items-center gap-2">
            Yearly Billing
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              Save 20%
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, token-based plans for any scale
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every plan includes all core features (Suite Analyzer, Demand Planner, Spec Generator, Design Analyzer). 
            Each run of a core feature uses one token, while Packaging Chat AI is unlimited. Choose the token bundle that fits your needs.
          </p>

          <div className="w-fit mx-auto">
            <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit mx-auto" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 py-6">
          {plans.map((plan, index) => (
            <div key={plan.name}>
              <Card
                className={`relative border rounded-3xl ${
                  plan.popular
                    ? "ring-2 ring-[#767AFA] bg-purple-50"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader className="text-left">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    {plan.popular && (
                      <div className="">
                        <span className="bg-[#767AFA] text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline">
                    {plan.price ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">
                          ${isYearly ? plan.yearlyPrice! : plan.price}
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{isYearly ? "year" : "month"}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        Contact Us
                      </span>
                    )}
                  </div>
                  {plan.price && (
                    <p className="font-semibold mt-2 text-[#767AFA]">
                      {plan.features[0]}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <Link to={plan.buttonText === "Contact Sales" ? "/contact" : "/sign-up"} className="block mb-6">
                    <button
                      className={`w-full p-4 text-lg rounded-3xl font-medium transition-all ${
                        plan.popular
                          ? "bg-[#767AFA] hover:opacity-90 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </Link>

                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-2">
                      {/* Tokens */}
                      <li className="flex items-start">
                        <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                          <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                        </span>
                        <span className="text-sm text-gray-700">{plan.includes[1]}</span>
                      </li>
                      
                      {/* Core Features Section */}
                      <li className="pt-2">
                        <h5 className="font-semibold text-gray-900 text-sm mb-2">{plan.includes[2]}</h5>
                        <ul className="space-y-2 ml-2">
                          {plan.includes.slice(3, 7).map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                                <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                              </span>
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                      
                      {/* Unlimited Section */}
                      <li className="pt-2">
                        <h5 className="font-semibold text-gray-900 text-sm mb-2">Unlimited</h5>
                        <ul className="space-y-2 ml-2">
                          <li className="flex items-start">
                            <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                              <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                            </span>
                            <span className="text-sm text-gray-700">{plan.includes[7]}</span>
                          </li>
                        </ul>
                      </li>
                      
                      {/* Enterprise Exclusives (if exists) */}
                      {plan.includes.length > 8 && (
                        <li className="pt-2">
                          <h5 className="font-semibold text-gray-900 text-sm mb-2">{plan.includes[8]}</h5>
                          <ul className="space-y-2 ml-2">
                            {plan.includes.slice(9).map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start">
                                <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                                  <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                                </span>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}