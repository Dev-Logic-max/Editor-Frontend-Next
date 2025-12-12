'use client';

import { motion } from 'framer-motion';
import { Check, X, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: 0,
    description: 'Perfect for trying out our platform',
    gradient: 'from-gray-400 to-gray-600',
    features: [
      { text: 'Up to 3 documents', included: true },
      { text: 'Basic AI suggestions', included: true },
      { text: 'Real-time collaboration (2 users)', included: true },
      { text: '100MB storage', included: true },
      { text: 'Advanced AI features', included: false },
      { text: 'Priority support', included: false },
      { text: 'Custom branding', included: false },
    ],
    popular: false,
  },
  {
    name: 'Pro',
    icon: Crown,
    price: 19,
    description: 'For professionals and small teams',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      { text: 'Unlimited documents', included: true },
      { text: 'Advanced AI suggestions', included: true },
      { text: 'Unlimited collaboration', included: true },
      { text: '10GB storage', included: true },
      { text: 'Version history', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom templates', included: true },
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Rocket,
    price: 'Custom',
    description: 'For large teams and organizations',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom AI training', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Unlimited storage', included: true },
      { text: 'SSO & SAML', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-24 bg-linear-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <div className={`px-6 py-2 bg-linear-to-r ${plan.gradient} text-white rounded-full text-sm font-bold shadow-lg`}>
                    ⭐ Most Popular
                  </div>
                </div>
              )}

              <div className={`relative bg-white rounded-3xl shadow-xl p-8 border-2 ${
                plan.popular ? 'border-purple-300' : 'border-gray-200'
              } ${plan.popular ? 'ring-4 ring-purple-100' : ''}`}>
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-linear-to-br ${plan.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <plan.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black bg-linear-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                          ${plan.price}
                        </span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      {plan.price > 0 && (
                        <p className="text-sm text-gray-500 mt-2">Billed annually or ${plan.price + 5}/mo monthly</p>
                      )}
                    </>
                  ) : (
                    <div className={`text-5xl font-black bg-linear-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all mb-8 group ${
                  plan.popular
                    ? `bg-linear-to-r ${plan.gradient} text-white hover:shadow-xl hover:scale-105`
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-start gap-3">
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        feature.included
                          ? `bg-linear-to-br ${plan.gradient}`
                          : 'bg-gray-200'
                      }`}>
                        {feature.included ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600">
            Have questions?{' '}
            <a href="#faq" className="text-purple-600 font-semibold hover:text-purple-700 underline">
              Check our FAQ
            </a>{' '}
            or{' '}
            <a href="#contact" className="text-purple-600 font-semibold hover:text-purple-700 underline">
              contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}