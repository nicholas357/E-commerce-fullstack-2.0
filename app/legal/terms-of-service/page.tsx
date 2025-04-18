"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsOfServicePage() {
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
            Terms of Service
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-6 text-gray-300">
            <p>Last Updated: April 18, 2024</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
              <p>
                Welcome to TurGame. These terms and conditions outline the rules and regulations for the use of our
                website and services. By accessing this website, we assume you accept these terms and conditions in
                full. Do not continue to use TurGame if you do not accept all of the terms and conditions stated on this
                page.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. License to Use</h2>
              <p>
                Unless otherwise stated, TurGame and/or its licensors own the intellectual property rights for all
                material on TurGame. All intellectual property rights are reserved. You may view and/or print pages from
                our website for your own personal use subject to restrictions set in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Republish material from this website</li>
                <li>Sell, rent or sub-license material from this website</li>
                <li>Reproduce, duplicate or copy material from this website</li>
                <li>Redistribute content from TurGame (unless content is specifically made for redistribution)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. User Account</h2>
              <p>
                When you create an account with us, you guarantee that the information you provide is accurate,
                complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the
                immediate termination of your account on the Service.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account and password, including but not
                limited to the restriction of access to your computer and/or account. You agree to accept responsibility
                for any and all activities or actions that occur under your account and/or password.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. Products and Services</h2>
              <p>
                All products and services displayed on our website are subject to availability. We reserve the right to
                discontinue any product or service at any time. Prices for our products are subject to change without
                notice. We reserve the right to modify or discontinue the Service (or any part or content thereof)
                without notice at any time.
              </p>
              <p>
                We shall not be liable to you or to any third-party for any modification, price change, suspension or
                discontinuance of the Service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. Purchases</h2>
              <p>
                All purchases through our site are subject to our acceptance of your order. We may at any time after
                receipt of your order and without prior notice to you, refuse service, cancel or limit the quantity of
                any product or service ordered.
              </p>
              <p>
                You agree to provide current, complete and accurate purchase and account information for all purchases
                made at our store. You agree to promptly update your account and other information, including your email
                address and credit card numbers and expiration dates, so that we can complete your transactions and
                contact you as needed.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">6. Digital Content</h2>
              <p>
                Upon purchasing digital content, you will receive a license to use the content according to the terms
                specified at the time of purchase. This license is personal to you and may not be transferred to anyone
                else.
              </p>
              <p>
                We do not guarantee that the digital content will always be available or be uninterrupted, timely,
                secure or error-free. We may suspend, withdraw, discontinue or change all or any part of our digital
                content without notice.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">7. Prohibited Uses</h2>
              <p>You may use our website only for lawful purposes. You may not use our website:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>In any way that breaches any applicable local, national or international law or regulation</li>
                <li>In any way that is unlawful or fraudulent, or has any unlawful or fraudulent purpose or effect</li>
                <li>
                  To transmit, or procure the sending of, any unsolicited or unauthorized advertising or promotional
                  material
                </li>
                <li>
                  To knowingly transmit any data, send or upload any material that contains viruses, Trojan horses,
                  worms, time-bombs, keystroke loggers, spyware, adware or any other harmful programs
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">8. Limitation of Liability</h2>
              <p>
                In no event shall TurGame, nor its directors, employees, partners, agents, suppliers, or affiliates, be
                liable for any indirect, incidental, special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
                to or use of or inability to access or use the Service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">9. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of Nepal, without regard to its
                conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
                considered a waiver of those rights.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">10. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
                revision is material we will provide at least 30 days notice prior to any new terms taking effect. What
                constitutes a material change will be determined at our sole discretion.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">11. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
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
