"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import {VerticalCutReveal} from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { CheckCheck } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    description:
      "Great for small businesses and startups looking to get started with AI",
    price: 39.99,
    yearlyPrice: 319,
    buttonText: "Start Now",
    buttonVariant: "outline" as const,
    features: [
      "50 tokens per month",
      "All applications included", 
      "Email support",
      "Basic analytics",
      "CSV export"
    ],
    includes: [
      "Free includes:",
      "Unlimited CSV uploads",
      "Basic reporting & analytics",
      "Email support",
      "Up to 1 organization",
      "Standard templates"
    ],
  },
  {
    name: "Professional",
    description:
      "Best value for growing businesses that need more advanced features",
    price: 99.99,
    yearlyPrice: 799,
    buttonText: "Start Now",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      "150 tokens per month",
      "All applications included",
      "Priority support", 
      "Advanced analytics",
      "API access",
      "Custom reports"
    ],
    includes: [
      "Everything in Starter, plus:",
      "Advanced analytics dashboard",
      "Custom report generation",
      "Priority email support",
      "API access for integrations",
      "Up to 5 organizations",
      "Advanced templates"
    ],
  },
  {
    name: "Enterprise",
    description:
      "Advanced plan with enhanced security and unlimited access for large teams",
    price: null,
    yearlyPrice: null,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    features: [
      "Flexible token bundle and pricing",
      "All applications included",
      "Dedicated success manager",
      "API access and advanced support", 
      "Custom integrations",
      "Training and onboarding"
    ],
    includes: [
      "Everything in Professional, plus:",
      "Unlimited organizations",
      "Dedicated success manager",
      "Custom integrations",
      "Priority phone support",
      "Advanced security features",
      "Custom training sessions"
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
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-3xl border-4 border-[#767AFA] bg-[#767AFA]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
            <motion.span
              layoutId={"switch"}
              className="absolute top-0 left-0 h-12 w-full rounded-3xl border-4 border-[#767AFA] bg-[#767AFA]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'transparent' }}>
      <div
        className="max-w-7xl mx-auto relative"
        ref={pricingRef}
      >
        <article className="text-center mb-16 space-y-4 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.15}
              staggerFrom="first"
              reverse={true}
              containerClassName="justify-center"
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 40,
                delay: 0,
              }}
            >
              Simple, token-based plans for any scale
            </VerticalCutReveal>
          </h2>

          <TimelineContent
            as="p"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Every feature is included. Each time you run an application (Suite Analyzer, Demand Planner, 
            Spec Generator, Design Analyzer, Chatbot), it uses one token. Choose the token bundle that fits your needs.
          </TimelineContent>

          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
          >
            <PricingSwitch onSwitch={togglePricingPeriod} className="w-fit mx-auto" />
          </TimelineContent>
        </article>

        <div className="grid md:grid-cols-3 gap-8 py-6">
          {plans.map((plan, index) => (
            <TimelineContent
              key={plan.name}
              as="div"
              animationNum={2 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
            >
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
                          $<NumberFlow
                            format={{
                              currency: "USD",
                            }}
                            value={isYearly ? plan.yearlyPrice! : plan.price}
                            className="text-4xl font-bold"
                          />
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
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="h-5 w-5 bg-white border border-[#767AFA] rounded-full grid place-content-center mt-0.5 mr-3 flex-shrink-0">
                            <CheckCheck className="h-3 w-3 text-[#767AFA]" />
                          </span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          ))}
        </div>
      </div>
    </section>
  );
}