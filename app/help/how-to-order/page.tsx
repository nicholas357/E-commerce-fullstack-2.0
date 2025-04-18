"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, Search, CreditCard, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HowToOrderPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const steps = [
    {
      icon: Search,
      title: "Browse Products",
      description: "Search for your desired digital products or browse through our categories.",
    },
    {
      icon: ShoppingCart,
      title: "Add to Cart",
      description: "Select the product you want and add it to your shopping cart.",
    },
    {
      icon: CreditCard,
      title: "Checkout",
      description: "Proceed to checkout, review your order, and enter your payment information.",
    },
    {
      icon: Mail,
      title: "Receive Your Product",
      description: "After payment confirmation, you'll receive your digital product codes via email.",
    },
  ]

  const faqs = [
    {
      question: "How long does it take to receive my digital product?",
      answer:
        "Most digital products are delivered instantly after payment confirmation. In some cases, it might take up to 30 minutes. If you haven't received your product after 1 hour, please contact our support team.",
    },
    {
      question: "Can I purchase products if I don't have an account?",
      answer:
        "Yes, you can make purchases as a guest. However, creating an account allows you to track your order history and makes future purchases faster.",
    },
    {
      question: "What if the product code doesn't work?",
      answer:
        "If you encounter any issues with your product code, please contact our support team immediately with your order number. We'll verify and resolve the issue as quickly as possible.",
    },
    {
      question: "Can I buy products as gifts for others?",
      answer:
        "Yes! During checkout, you can specify that the purchase is a gift and provide the recipient's email address. They will receive the product code directly.",
    },
    {
      question: "Are there any region restrictions for the products?",
      answer:
        "Some digital products may have regional restrictions. The product description will clearly indicate if there are any limitations. Please check before purchasing to ensure compatibility with your region.",
    },
    {
      question: "How do I redeem my product code?",
      answer:
        "Redemption instructions are included in the delivery email. Generally, you'll need to log into the respective platform (Steam, Xbox, etc.) and enter the code in the redemption section.",
    },
  ]

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <Link href="/help" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Help Center
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-muted rounded-lg p-6 md:p-8 shadow-lg"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <ShoppingCart className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">How to Order</h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-gray-300 mb-8">
              Ordering from TurGame is quick and easy. Follow these simple steps to purchase your favorite digital
              products:
            </p>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div key={index} variants={itemVariants} className="flex items-start gap-4 relative">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      Step {index + 1}: {step.title}
                    </h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-amber-400/20"></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image src="/high-stakes-tournament.png" alt="Gaming Setup" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Start Gaming?</h3>
                  <p className="text-gray-200">Browse our extensive collection of games, gift cards, and software.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} id="faq" className="pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-border rounded-lg p-4 hover:border-amber-400/50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 text-center">
            <p className="text-gray-300 mb-4">Still have questions about ordering?</p>
            <Link
              href="mailto:support@turgame.com"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
            >
              Contact Support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
