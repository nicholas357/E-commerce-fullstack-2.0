"use client"

import { motion } from "framer-motion"
import { ArrowLeft, HelpCircle, CreditCard, Truck, RotateCcw, ShoppingCart, FileQuestion } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HelpCenterPage() {
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

  const helpCategories = [
    {
      title: "How to Order",
      icon: ShoppingCart,
      description: "Learn how to place an order on TurGame",
      link: "/help/how-to-order",
    },
    {
      title: "Payment Methods",
      icon: CreditCard,
      description: "Information about our accepted payment methods",
      link: "/help/payment-methods",
    },
    {
      title: "Shipping & Delivery",
      icon: Truck,
      description: "Details about our digital delivery process",
      link: "/help/shipping-delivery",
    },
    {
      title: "Return & Refund",
      icon: RotateCcw,
      description: "Our return and refund policy",
      link: "/help/refund-policy",
    },
    {
      title: "FAQs",
      icon: FileQuestion,
      description: "Frequently asked questions",
      link: "/help/how-to-order#faq",
    },
  ]

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center mb-12">
          <motion.div variants={itemVariants} className="inline-block mb-4">
            <HelpCircle className="h-16 w-16 text-amber-400 mx-auto" />
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl font-bold text-white mb-4">
            Help Center
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to your questions and get the support you need
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {helpCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-muted rounded-lg p-6 shadow-lg border border-border hover:border-amber-400/50 transition-colors"
            >
              <Link href={category.link} className="block h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-4">
                    <category.icon className="h-10 w-10 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{category.title}</h2>
                  <p className="text-gray-300 mb-4 flex-grow">{category.description}</p>
                  <span className="text-amber-400 inline-flex items-center">
                    Learn more
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 bg-muted rounded-lg p-6 md:p-8 shadow-lg"
        >
          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mb-6 text-center">
            Can't find what you're looking for?
          </motion.h2>
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold text-white mb-2">Contact Our Support Team</h3>
              <p className="text-gray-300 mb-4">
                Our dedicated support team is available to assist you with any questions or concerns.
              </p>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <span className="text-amber-400 mr-2">Email:</span> support@turgame.com
                </p>
                <p className="flex items-center">
                  <span className="text-amber-400 mr-2">Phone:</span> +977 1234567890
                </p>
                <p className="flex items-center">
                  <span className="text-amber-400 mr-2">Hours:</span> 24/7 Support
                </p>
              </div>
            </div>
            <div className="relative w-full max-w-xs h-48 md:h-64">
              <Image src="/gaming-setup-closeup.png" alt="Customer Support" fill className="object-cover rounded-lg" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
