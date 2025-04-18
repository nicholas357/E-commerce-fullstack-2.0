"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
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

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-muted rounded-lg p-6 md:p-8 shadow-lg"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white mb-6">
            Privacy Policy
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-6 text-gray-300">
            <p>Last Updated: April 18, 2024</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
              <p>
                Welcome to TurGame. We respect your privacy and are committed to protecting your personal data. This
                privacy policy will inform you about how we look after your personal data when you visit our website and
                tell you about your privacy rights and how the law protects you.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. The Data We Collect</h2>
              <p>
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped
                together as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-amber-400">Identity Data</span> includes first name, last name,
                  username or similar identifier.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Contact Data</span> includes billing address, delivery
                  address, email address and telephone numbers.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Financial Data</span> includes payment card details.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Transaction Data</span> includes details about payments
                  to and from you and other details of products you have purchased from us.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Technical Data</span> includes internet protocol (IP)
                  address, your login data, browser type and version, time zone setting and location, browser plug-in
                  types and versions, operating system and platform, and other technology on the devices you use to
                  access this website.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Profile Data</span> includes your username and password,
                  purchases or orders made by you, your interests, preferences, feedback and survey responses.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Usage Data</span> includes information about how you use
                  our website and services.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. How We Use Your Data</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal
                data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To register you as a new customer.</li>
                <li>To process and deliver your order.</li>
                <li>To manage your relationship with us.</li>
                <li>To improve our website, products/services, marketing or customer relationships.</li>
                <li>To recommend products or services that may be of interest to you.</li>
                <li>To comply with a legal or regulatory obligation.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally
                lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to
                your personal data to those employees, agents, contractors and other third parties who have a business
                need to know.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
              <p>
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it
                for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">6. Your Legal Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal
                data, including the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">7. Cookies</h2>
              <p>
                Our website uses cookies to distinguish you from other users of our website. This helps us to provide
                you with a good experience when you browse our website and also allows us to improve our site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">8. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                <br />
                <span className="text-amber-400">support@turgame.com</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
