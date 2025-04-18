"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Truck, Clock, Mail, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ShippingDeliveryPage() {
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

  const deliveryInfo = [
    {
      icon: Mail,
      title: "Email Delivery",
      description: "All digital products are delivered via email to the address provided during checkout.",
    },
    {
      icon: Clock,
      title: "Delivery Time",
      description: "Most products are delivered instantly after payment confirmation. Some may take up to 30 minutes.",
    },
    {
      icon: CheckCircle,
      title: "Delivery Confirmation",
      description: "You'll receive a confirmation email once your product has been successfully delivered.",
    },
    {
      icon: AlertTriangle,
      title: "Delivery Issues",
      description:
        "If you haven't received your product within 1 hour, please check your spam folder or contact support.",
    },
  ]

  const productTypes = [
    {
      title: "Game Codes",
      deliveryMethod: "Email with redemption instructions",
      timeframe: "Instant to 30 minutes after payment confirmation",
    },
    {
      title: "Gift Cards",
      deliveryMethod: "Email with card code and redemption instructions",
      timeframe: "Instant to 30 minutes after payment confirmation",
    },
    {
      title: "Game Points",
      deliveryMethod: "Email with code and account crediting instructions",
      timeframe: "Instant to 30 minutes after payment confirmation",
    },
    {
      title: "Software Keys",
      deliveryMethod: "Email with product key and download instructions",
      timeframe: "Instant to 30 minutes after payment confirmation",
    },
    {
      title: "Subscription Codes",
      deliveryMethod: "Email with subscription activation instructions",
      timeframe: "Instant to 30 minutes after payment confirmation",
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
            <Truck className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Shipping & Delivery</h1>
            <p className="text-gray-300 mt-2">Information about our digital product delivery process</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Digital Delivery Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveryInfo.map((info, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-border rounded-lg p-5 hover:border-amber-400/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <info.icon className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                      <p className="text-gray-300">{info.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Delivery by Product Type</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left text-white">Product Type</th>
                    <th className="py-3 px-4 text-left text-white">Delivery Method</th>
                    <th className="py-3 px-4 text-left text-white">Timeframe</th>
                  </tr>
                </thead>
                <tbody>
                  {productTypes.map((product, index) => (
                    <tr key={index} className={`border-b border-border ${index % 2 === 0 ? "bg-muted/50" : ""}`}>
                      <td className="py-3 px-4 text-white font-medium">{product.title}</td>
                      <td className="py-3 px-4 text-gray-300">{product.deliveryMethod}</td>
                      <td className="py-3 px-4 text-gray-300">{product.timeframe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-6">Delivery FAQs</h2>
            <div className="space-y-6">
              <div className="border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-2">What if I don't receive my product?</h3>
                <p className="text-gray-300">
                  If you haven't received your product within 1 hour after payment confirmation, please:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-300">
                  <li>Check your spam/junk folder</li>
                  <li>Verify that the email address you provided during checkout is correct</li>
                  <li>
                    Contact our support team at{" "}
                    <a href="mailto:support@turgame.com" className="text-amber-400 hover:underline">
                      support@turgame.com
                    </a>{" "}
                    with your order number
                  </li>
                </ol>
              </div>

              <div className="border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-2">Can I change my delivery email address?</h3>
                <p className="text-gray-300">
                  If you need to change the email address for delivery after placing an order, please contact our
                  support team immediately with your order number and the new email address. We'll do our best to update
                  it before the product is delivered.
                </p>
              </div>

              <div className="border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-white mb-2">Are there any delivery delays?</h3>
                <p className="text-gray-300">
                  While most deliveries are instant, there might be occasional delays due to payment verification or
                  system maintenance. If there are any known issues affecting delivery times, we'll post a notice on our
                  website and social media channels.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="border-t border-border pt-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Need More Help?</h3>
              <p className="text-gray-300 mb-6">
                If you have any other questions about our delivery process, please don't hesitate to contact us.
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
      </div>
    </div>
  )
}
