"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="mb-4 text-lg font-bold text-white">About Turgame</h3>
            <p className="mb-4 text-sm text-gray-400">
              Turgame is your one-stop destination for digital gaming products, gift cards, and software at competitive
              prices.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 transition-colors hover:text-amber-400">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-amber-400">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-amber-400">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-amber-400">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="mb-4 text-lg font-bold text-white">Quick Links</h3>
            <ul className="grid grid-cols-1 gap-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 transition-colors hover:text-amber-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-400 transition-colors hover:text-amber-400">
                  Gift Cards
                </Link>
              </li>
              <li>
                <Link href="/xbox-games" className="text-gray-400 transition-colors hover:text-amber-400">
                  Xbox Games
                </Link>
              </li>
              <li>
                <Link href="/game-points" className="text-gray-400 transition-colors hover:text-amber-400">
                  Game Points
                </Link>
              </li>
              <li>
                <Link href="/software" className="text-gray-400 transition-colors hover:text-amber-400">
                  Software
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="mb-4 text-lg font-bold text-white">Customer Service</h3>
            <ul className="grid grid-cols-1 gap-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 transition-colors hover:text-amber-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help/how-to-order" className="text-gray-400 transition-colors hover:text-amber-400">
                  How to Order
                </Link>
              </li>
              <li>
                <Link href="/help/shipping-delivery" className="text-gray-400 transition-colors hover:text-amber-400">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/help/payment-methods" className="text-gray-400 transition-colors hover:text-amber-400">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/help/refund-policy" className="text-gray-400 transition-colors hover:text-amber-400">
                  Return & Refund Policy
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="mb-4 text-lg font-bold text-white">Contact Us</h3>
            <ul className="grid grid-cols-1 gap-3 text-sm">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-amber-400" />
                <span className="text-gray-400">Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-amber-400" />
                <span className="text-gray-400">+977 1234567890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-amber-400" />
                <span className="text-gray-400">support@turgame.com</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 border-t border-border pt-6"
        >
          <h3 className="mb-4 text-center text-lg font-bold text-white">Accepted Payment Methods</h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image src="/images/esewa-logo.png" alt="eSewa" fill className="object-contain" />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">eSewa</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image src="/images/connectips-logo.png" alt="Connect IPS" fill className="object-contain" />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">Connect IPS</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image src="/images/khalti-logo.png" alt="Khalti" fill className="object-contain" />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">Khalti</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image
                    src="/images/internet-banking-logo.png"
                    alt="Internet Banking"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">Internet Banking</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image src="/images/visa-logo.png" alt="Visa" fill className="object-contain" />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">Visa</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2">
                <div className="relative h-8 w-16">
                  <Image src="/images/mastercard-logo.png" alt="MasterCard" fill className="object-contain" />
                </div>
              </div>
              <span className="mt-1 text-xs text-gray-400">MasterCard</span>
            </div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 border-t border-border pt-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center justify-center md:justify-start">
              <CreditCard className="mr-3 h-6 w-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-medium text-white">Secure Payment</h4>
                <p className="text-xs text-gray-400">All transactions are secure and encrypted</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Shield className="mr-3 h-6 w-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-medium text-white">100% Authentic</h4>
                <p className="text-xs text-gray-400">All products are original and verified</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-end">
              <Mail className="mr-3 h-6 w-6 text-amber-400" />
              <div>
                <h4 className="text-sm font-medium text-white">24/7 Support</h4>
                <p className="text-xs text-gray-400">Get help whenever you need it</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border bg-muted py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Turgame. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:justify-end">
              <Link href="/legal/privacy-policy" className="text-gray-400 transition-colors hover:text-amber-400">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="text-gray-400 transition-colors hover:text-amber-400">
                Terms of Service
              </Link>
              <Link href="/legal/cookies-policy" className="text-gray-400 transition-colors hover:text-amber-400">
                Cookies Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
