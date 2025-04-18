import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
// Make sure the Footer import is correct
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { ScrollToTop } from "@/components/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TurGame - Digital Game Store",
  description: "Buy digital games, gift cards, and more",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
