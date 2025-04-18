"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CookiesPolicyPage() {
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
            Cookies Policy
          </motion.h1>

          <motion.div variants={itemVariants} className="space-y-6 text-gray-300">
            <p>Last Updated: April 18, 2024</p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. What Are Cookies</h2>
              <p>
                Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is
                stored in your web browser and allows the Service or a third-party to recognize you and make your next
                visit easier and the Service more useful to you.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. How TurGame Uses Cookies</h2>
              <p>
                When you use and access our Service, we may place a number of cookie files in your web browser. We use
                cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-medium text-amber-400">Essential cookies:</span> These are cookies that are
                  required for the operation of our website. They include, for example, cookies that enable you to log
                  into secure areas of our website, use a shopping cart or make use of e-billing services.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Analytical/performance cookies:</span> They allow us to
                  recognize and count the number of visitors and to see how visitors move around our website when they
                  are using it. This helps us to improve the way our website works, for example, by ensuring that users
                  are finding what they are looking for easily.
                </li>
                <li>
                  <span className="font-medium text-amber-400">Functionality cookies:</span> These are used to recognize
                  you when you return to our website. This enables us to personalize our content for you, greet you by
                  name and remember your preferences (for example, your choice of language or region).
                </li>
                <li>
                  <span className="font-medium text-amber-400">Targeting cookies:</span> These cookies record your visit
                  to our website, the pages you have visited and the links you have followed. We will use this
                  information to make our website and the advertising displayed on it more relevant to your interests.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics
                of the Service, deliver advertisements on and through the Service, and so on.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. What Are Your Choices Regarding Cookies</h2>
              <p>
                If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit
                the help pages of your web browser.
              </p>
              <p>
                Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use
                all of the features we offer, you may not be able to store your preferences, and some of our pages might
                not display properly.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. Where Can You Find More Information About Cookies</h2>
              <p>You can learn more about cookies and the following third-party websites:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  AllAboutCookies: <span className="text-amber-400">http://www.allaboutcookies.org/</span>
                </li>
                <li>
                  Network Advertising Initiative:{" "}
                  <span className="text-amber-400">http://www.networkadvertising.org/</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">6. Changes to This Cookie Policy</h2>
              <p>
                We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new
                Cookie Policy on this page. You are advised to review this Cookie Policy periodically for any changes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">7. Contact Us</h2>
              <p>
                If you have any questions about our Cookie Policy, please contact us at:
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
