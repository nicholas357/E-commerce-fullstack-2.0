"use client"

import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RefundPolicyPage() {
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

  const eligibleCases = [
    "Product code doesn't work or is invalid",
    "Received the wrong product",
    "Technical issues preventing product activation",
    "Double-charged for the same product",
    "Product not delivered within 24 hours of payment confirmation",
  ]

  const ineligibleCases = [
    "Change of mind after code redemption",
    "Accidental purchase (after code has been revealed)",
    "Compatibility issues with your system (if specified in product description)",
    "Dissatisfaction with the product after redemption",
    "Requests made more than 7 days after purchase",
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
            <RotateCcw className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Return & Refund Policy</h1>
            <p className="text-gray-300 mt-2">Our policy regarding returns and refunds for digital products</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-5 mb-8">
              <p className="text-gray-300">
                <span className="font-semibold text-white">Last Updated:</span> April 18, 2024
              </p>
              <p className="text-gray-300 mt-2">
                Due to the nature of digital products, all sales are generally final. However, we understand that issues
                can arise, and we're committed to ensuring customer satisfaction. This policy outlines the circumstances
                under which we may offer refunds or replacements.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">Refund Eligibility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">Eligible for Refund</h3>
                </div>
                <ul className="space-y-2">
                  {eligibleCases.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-border rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-white">Not Eligible for Refund</h3>
                </div>
                <ul className="space-y-2">
                  {ineligibleCases.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">Refund Process</h2>
            <div className="space-y-4 mb-8">
              <p className="text-gray-300">To request a refund, please follow these steps:</p>
              <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li>
                  <span className="font-medium text-white">Contact Customer Support:</span> Email us at{" "}
                  <a href="mailto:support@turgame.com" className="text-amber-400 hover:underline">
                    support@turgame.com
                  </a>{" "}
                  with your order number and details of the issue.
                </li>
                <li>
                  <span className="font-medium text-white">Provide Evidence:</span> Include any relevant screenshots or
                  information that demonstrates the issue you're experiencing.
                </li>
                <li>
                  <span className="font-medium text-white">Verification:</span> Our team will verify your claim and may
                  request additional information if needed.
                </li>
                <li>
                  <span className="font-medium text-white">Resolution:</span> If your refund request is approved, we'll
                  process it within 5-7 business days. The refund will be issued to the original payment method used for
                  the purchase.
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">Replacement Option</h2>
            <div className="mb-8 text-gray-300">
              <p>
                In some cases, we may offer a replacement product instead of a refund. This is typically for situations
                where:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The original product code is invalid or already redeemed</li>
                <li>There are technical issues with the specific product</li>
                <li>The customer prefers an exchange for another product of equal value</li>
              </ul>
            </div>

            <div className="border border-border rounded-lg p-5 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Important Note</h3>
                  <p className="text-gray-300">
                    For digital products where the code has been revealed or redeemed, refunds are generally not
                    possible. This is because once a digital code is revealed, we cannot verify whether it has been used
                    or not.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">Timeframe for Refund Requests</h2>
            <div className="mb-8 text-gray-300">
              <p>
                Refund requests must be submitted within 7 days of purchase. Requests made after this period will be
                evaluated on a case-by-case basis and are not guaranteed to be approved.
              </p>
              <p className="mt-3">
                Once a refund is approved, please allow 5-7 business days for the refund to be processed and reflected
                in your account.
              </p>
            </div>

            <motion.div variants={itemVariants} className="border-t border-border pt-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Need to Request a Refund?</h3>
                <p className="text-gray-300 mb-6">
                  If you're experiencing issues with your purchase, please contact our support team with your order
                  details.
                </p>
                <Link
                  href="mailto:support@turgame.com"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
