import type { ProductProps } from "@/components/product-card"

export const software: ProductProps[] = [
  {
    id: "software-1",
    name: "Windows 11 Pro",
    image: "/placeholder.svg",
    price: 19999,
    rating: 4.6,
    reviewCount: 178,
    category: "Operating Systems",
    inStock: true,
  },
  {
    id: "software-2",
    name: "Microsoft Office 365",
    image: "/placeholder.svg",
    price: 6999,
    originalPrice: 9999,
    rating: 4.8,
    reviewCount: 245,
    category: "Office Suites",
    inStock: true,
    isNew: true,
  },
  {
    id: "software-3",
    name: "Adobe Creative Cloud",
    image: "/placeholder.svg",
    price: 5299,
    rating: 4.7,
    reviewCount: 189,
    category: "Design Software",
    inStock: true,
  },
  {
    id: "software-4",
    name: "Norton 360 Deluxe",
    image: "/placeholder.svg",
    price: 8999,
    rating: 4.3,
    reviewCount: 132,
    category: "Antivirus",
    inStock: true,
  },
  {
    id: "software-5",
    name: "McAfee Total Protection",
    image: "/placeholder.svg",
    price: 3999,
    originalPrice: 5999,
    rating: 4.2,
    reviewCount: 98,
    category: "Antivirus",
    inStock: true,
  },
  {
    id: "software-6",
    name: "Parallels Desktop",
    image: "/placeholder.svg",
    price: 7999,
    rating: 4.5,
    reviewCount: 156,
    category: "Virtualization",
    inStock: true,
  },
]
