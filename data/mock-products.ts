export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  featured: boolean
  stock: number
  createdAt: string
  updatedAt: string
}

export interface StreamingPlan {
  id: string
  name: string
}

export interface StreamingDuration {
  id: string
  name: string
  months: number
}

// Mock streaming plans
export const streamingPlans: StreamingPlan[] = [
  { id: "1", name: "Basic" },
  { id: "2", name: "Standard" },
  { id: "3", name: "Premium" },
]

// Mock streaming durations
export const streamingDurations: StreamingDuration[] = [
  { id: "1", name: "1 Month", months: 1 },
  { id: "2", name: "3 Months", months: 3 },
  { id: "3", name: "6 Months", months: 6 },
  { id: "4", name: "12 Months", months: 12 },
]

// Mock products data
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Netflix Premium",
    description: "Netflix Premium subscription",
    price: 15.99,
    image: "/images/streaming/netflix.png",
    category: "streaming",
    featured: true,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Disney+ Standard",
    description: "Disney+ Standard subscription",
    price: 9.99,
    image: "/images/streaming/disney.png",
    category: "streaming",
    featured: true,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Hulu Basic",
    description: "Hulu Basic subscription",
    price: 7.99,
    image: "/images/streaming/hulu.png",
    category: "streaming",
    featured: false,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Amazon Prime Video",
    description: "Amazon Prime Video subscription",
    price: 8.99,
    image: "/images/streaming/prime.png",
    category: "streaming",
    featured: true,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "HBO Max",
    description: "HBO Max subscription",
    price: 14.99,
    image: "/images/streaming/hbo.png",
    category: "streaming",
    featured: false,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Apple TV+",
    description: "Apple TV+ subscription",
    price: 6.99,
    image: "/images/streaming/apple.png",
    category: "streaming",
    featured: false,
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock API functions
export const mockProductsApi = {
  getProducts: async (): Promise<Product[]> => {
    return mockProducts
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const product = mockProducts.find((p) => p.id === id)
    return product || null
  },

  createProduct: async (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
    const newProduct = {
      ...product,
      id: `${mockProducts.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProducts.push(newProduct)
    return newProduct
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product | null> => {
    const index = mockProducts.findIndex((p) => p.id === id)

    if (index === -1) {
      return null
    }

    mockProducts[index] = {
      ...mockProducts[index],
      ...product,
      updatedAt: new Date().toISOString(),
    }

    return mockProducts[index]
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const index = mockProducts.findIndex((p) => p.id === id)

    if (index === -1) {
      return false
    }

    mockProducts.splice(index, 1)
    return true
  },

  getStreamingPlans: async (): Promise<StreamingPlan[]> => {
    return streamingPlans
  },

  getStreamingDurations: async (): Promise<StreamingDuration[]> => {
    return streamingDurations
  },
}
