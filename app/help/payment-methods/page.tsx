"use client"

import { motion } from "framer-motion"
import { ArrowLeft, CreditCard, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PaymentMethodsPage() {
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

  const paymentMethods = [
    {
      name: "eSewa",
      logo: "/images/esewa-logo.png",
      description: "Nepal's leading digital wallet service. Fast, secure, and convenient.",
      instructions: [
        "Select eSewa as your payment method during checkout",
        "You'll be redirected to the eSewa payment page",
        "Log in to your eSewa account and confirm the payment",
        "Once payment is confirmed, you'll be redirected back to TurGame",
      ],
    },
    {
      name: "Khalti",
      logo: "/images/khalti-logo.png",
      description: "Digital wallet and payment gateway for easy online transactions.",
      instructions: [
        "Choose Khalti as your payment method",
        "Enter your Khalti registered mobile number",
        "Verify with the OTP sent to your mobile",
        "Confirm the payment using your Khalti PIN",
      ],
    },
    {
      name: "Connect IPS",
      logo: "/images/connectips-logo.png",
      description: "Direct bank transfer service operated by Nepal Clearing House.",
      instructions: [
        "Select Connect IPS as your payment method",
        "You'll be redirected to the Connect IPS portal",
        "Log in with your bank credentials",
        "Authorize the payment to complete your purchase",
      ],
    },
    {
      name: "Internet Banking",
      logo: "/images/internet-banking-logo.png",
      description: "Direct payment through your bank's online banking service.",
      instructions: [
        "Choose Internet Banking during checkout",
        "Select your bank from the available options",
        "Log in to your bank's online portal",
        "Authorize the transaction to complete your purchase",
      ],
    },
    {
      name: "Visa/MasterCard",
      logo: "/images/visa-logo.png",
      secondLogo: "/images/mastercard-logo.png",
      description: "International credit and debit cards for secure online payments.",
      instructions: [
        "Select Credit/Debit Card as your payment method",
        "Enter your card details (number, expiry date, CVV)",
        "Complete any additional verification required by your bank",
        "Your payment will be processed securely",
      ],
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
            <CreditCard className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
            <p className="text-gray-300 mt-2">We offer multiple secure payment options for your convenience</p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/30 rounded-lg p-4 mb-8">
              <Shield className="h-6 w-6 text-amber-400 flex-shrink-0" />
              <p className="text-gray-300">
                All payment transactions on TurGame are secured with industry-standard encryption to protect your
                financial information.
              </p>
            </div>

            <div className="space-y-8">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="border border-border rounded-lg p-6 hover:border-amber-400/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 w-32 h-20 flex items-center justify-center">
                        <div className="relative w-24 h-12">
                          <Image
                            src={method.logo || "/placeholder.svg"}
                            alt={method.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      {method.secondLogo && (
                        <div className="bg-white rounded-lg p-4 w-32 h-20 flex items-center justify-center ml-4">
                          <div className="relative w-24 h-12">
                            <Image
                              src={method.secondLogo || "/placeholder.svg"}
                              alt={method.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-white mb-2">{method.name}</h3>
                      <p className="text-gray-300 mb-4">{method.description}</p>
                      <h4 className="text-lg font-medium text-white mb-2">How to pay:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-300">
                        {method.instructions.map((instruction, idx) => (
                          <li key={idx}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="border-t border-border pt-8 mt-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Important Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>All prices on TurGame are in Nepalese Rupees (NPR) unless otherwise stated.</li>
                  <li>International transactions may incur additional fees from your bank or card issuer.</li>
                  <li>For security reasons, some payment methods may require additional verification steps.</li>
                  <li>
                    If you encounter any issues with payment, please contact our support team at{" "}
                    <a href="mailto:support@turgame.com" className="text-amber-400 hover:underline">
                      support@turgame.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
