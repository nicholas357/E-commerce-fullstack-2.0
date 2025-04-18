"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/product-card"
import { streamingServices } from "@/data/streaming-services"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Users, Award } from "lucide-react"

export default function StreamingServicesPage() {
  const [activeTab, setActiveTab] = useState("all")

  // Filter services based on active tab
  const filteredServices =
    activeTab === "all"
      ? streamingServices
      : streamingServices.filter((service) => {
          if (activeTab === "basic") {
            return service.streamingPlans?.some((plan) => plan.screens <= 2)
          } else if (activeTab === "premium") {
            return service.streamingPlans?.some((plan) => plan.quality === "UHD")
          } else if (activeTab === "family") {
            return service.streamingPlans?.some((plan) => plan.screens >= 3)
          }
          return true
        })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-4 text-3xl font-bold glow-text-amber">Streaming Services</h1>
        <p className="mx-auto max-w-2xl text-gray-400">
          Get instant access to your favorite streaming platforms with our digital subscription codes. Choose from
          various plans and durations to suit your entertainment needs.
        </p>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12 grid gap-6 md:grid-cols-3"
      >
        <div className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center">
          <Monitor className="mb-4 h-12 w-12 text-amber-400" />
          <h3 className="mb-2 text-lg font-bold text-white">Multiple Devices</h3>
          <p className="text-sm text-gray-400">
            Stream on your TV, computer, tablet, and smartphone, all with a single subscription.
          </p>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center">
          <Users className="mb-4 h-12 w-12 text-amber-400" />
          <h3 className="mb-2 text-lg font-bold text-white">Family Sharing</h3>
          <p className="text-sm text-gray-400">
            Create multiple profiles and share your subscription with family members.
          </p>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center">
          <Award className="mb-4 h-12 w-12 text-amber-400" />
          <h3 className="mb-2 text-lg font-bold text-white">Premium Content</h3>
          <p className="text-sm text-gray-400">
            Access exclusive shows, movies, and documentaries not available anywhere else.
          </p>
        </div>
      </motion.div>

      {/* Filtering tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="basic">Basic Plans</TabsTrigger>
            <TabsTrigger value="premium">Premium Quality</TabsTrigger>
            <TabsTrigger value="family">Family Sharing</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Products grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredServices.map((service, index) => (
          <ProductCard key={service.id} product={service} index={index} />
        ))}
      </div>
    </motion.div>
  )
}
