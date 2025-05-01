import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ToastProvider } from "@/components/ui/toast-provider"
import { AuthCookieDebugger } from "@/components/auth-cookie-debugger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TurGame - Digital Gaming Store",
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
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ScrollToTop />
            <AuthCookieDebugger />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}
