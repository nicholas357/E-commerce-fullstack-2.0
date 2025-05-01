import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"
import { ScrollToTop } from "@/components/scroll-to-top"
import { AuthDebugPanel } from "@/components/auth-debug-panel"
import { Suspense } from "react"
// Import the auth cookie debugger
import { AuthCookieDebugger } from "@/components/auth-cookie-debugger"
import { ToastProvider } from "@/components/ui/toast-provider"
import { ConnectionRecovery } from "@/components/connection-recovery"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TurGame - Digital Game Store",
  description: "Buy digital games, gift cards, and more",
  generator: "v0.dev",
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen animate-pulse px-4 py-6 space-y-6">
      <div className="h-12 bg-gray-200 rounded-md" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-64 bg-gray-200 rounded-md" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={<SkeletonLoader />}>
          <Providers>
            <ConnectionRecovery />
            <Header />
            <ToastProvider>
              <main className="min-h-screen">{children}</main>
              <AuthCookieDebugger />
            </ToastProvider>
            <Footer />
            <ScrollToTop />
            <AuthDebugPanel />
          </Providers>
        </Suspense>
      </body>
    </html>
  )
}
