export type OrderStatus =
  | "pending"
  | "payment_verification"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"

export type PaymentStatus =
  | "pending"
  | "verification_required"
  | "verification_submitted"
  | "verified"
  | "failed"
  | "refunded"

export type PaymentMethod = "credit_card" | "esewa" | "khalti" | "connectips" | "bank_transfer" | "cash_on_delivery"

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_type: "gift_card" | "game_points" | "xbox_game" | "streaming_service" | "software"
  quantity: number
  unit_price: number
  subtotal: number
  code?: string
  activation_instructions?: string
}

export interface ShippingAddress {
  id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code?: string
  country: string
}

export interface PaymentProof {
  id: string
  file_url: string
  payment_method: string
  transaction_id?: string
  amount: number
  uploaded_at: string
  verified: boolean
  verified_at?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  user?: {
    id: string
    email: string
    full_name: string
  }
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  subtotal: number
  shipping_fee: number
  tax: number
  discount: number
  total: number
  shipping_address?: ShippingAddress
  billing_address?: ShippingAddress
  items?: OrderItem[]
  payment_proof?: PaymentProof
  notes?: string
  admin_notes?: string
  created_at: string
  updated_at?: string
}

export const mockOrders: Order[] = [
  {
    id: "1",
    order_number: "ORD-20240412-001",
    user_id: "101",
    user: {
      id: "101",
      email: "john.doe@example.com",
      full_name: "John Doe",
    },
    status: "pending",
    payment_status: "verification_required",
    payment_method: "bank_transfer",
    subtotal: 5000,
    shipping_fee: 0,
    tax: 0,
    discount: 0,
    total: 5000,
    shipping_address: {
      id: "201",
      full_name: "John Doe",
      phone: "+977 9812345678",
      address_line1: "123 Main St",
      city: "Kathmandu",
      country: "Nepal",
    },
    items: [
      {
        id: "301",
        product_id: "401",
        product_name: "Xbox Game Pass Ultimate - 3 Months",
        product_type: "xbox_game",
        quantity: 1,
        unit_price: 5000,
        subtotal: 5000,
      },
    ],
    payment_proof: {
      id: "501",
      file_url: "/detailed-payment-receipt.png",
      payment_method: "bank_transfer",
      amount: 5000,
      uploaded_at: "2024-04-12T08:30:00Z",
      verified: false,
    },
    created_at: "2024-04-12T08:00:00Z",
  },
  {
    id: "2",
    order_number: "ORD-20240411-002",
    user_id: "102",
    user: {
      id: "102",
      email: "jane.smith@example.com",
      full_name: "Jane Smith",
    },
    status: "processing",
    payment_status: "verified",
    payment_method: "esewa",
    subtotal: 3500,
    shipping_fee: 0,
    tax: 0,
    discount: 500,
    total: 3000,
    shipping_address: {
      id: "202",
      full_name: "Jane Smith",
      phone: "+977 9876543210",
      address_line1: "456 Park Avenue",
      city: "Pokhara",
      country: "Nepal",
    },
    items: [
      {
        id: "302",
        product_id: "402",
        product_name: "Netflix Premium - 1 Month",
        product_type: "streaming_service",
        quantity: 1,
        unit_price: 3500,
        subtotal: 3500,
      },
    ],
    created_at: "2024-04-11T14:20:00Z",
  },
  {
    id: "3",
    order_number: "ORD-20240410-003",
    user_id: "103",
    user: {
      id: "103",
      email: "robert.johnson@example.com",
      full_name: "Robert Johnson",
    },
    status: "completed",
    payment_status: "verified",
    payment_method: "khalti",
    subtotal: 12000,
    shipping_fee: 0,
    tax: 0,
    discount: 0,
    total: 12000,
    shipping_address: {
      id: "203",
      full_name: "Robert Johnson",
      phone: "+977 9845678901",
      address_line1: "789 Broadway",
      city: "Biratnagar",
      country: "Nepal",
    },
    items: [
      {
        id: "303",
        product_id: "403",
        product_name: "Microsoft Office 365 - 1 Year",
        product_type: "software",
        quantity: 1,
        unit_price: 12000,
        subtotal: 12000,
        code: "XXXX-XXXX-XXXX-XXXX",
        activation_instructions: "Go to office.com/setup and enter your code to activate your subscription.",
      },
    ],
    created_at: "2024-04-10T09:15:00Z",
    updated_at: "2024-04-10T10:30:00Z",
  },
  {
    id: "4",
    order_number: "ORD-20240409-004",
    user_id: "104",
    user: {
      id: "104",
      email: "sarah.williams@example.com",
      full_name: "Sarah Williams",
    },
    status: "cancelled",
    payment_status: "refunded",
    payment_method: "credit_card",
    subtotal: 2000,
    shipping_fee: 0,
    tax: 0,
    discount: 0,
    total: 2000,
    shipping_address: {
      id: "204",
      full_name: "Sarah Williams",
      phone: "+977 9801234567",
      address_line1: "101 Oak Street",
      city: "Lalitpur",
      country: "Nepal",
    },
    items: [
      {
        id: "304",
        product_id: "404",
        product_name: "Steam Gift Card - $20",
        product_type: "gift_card",
        quantity: 1,
        unit_price: 2000,
        subtotal: 2000,
      },
    ],
    notes: "Customer requested cancellation due to purchase error.",
    admin_notes: "Refund processed on 2024-04-10.",
    created_at: "2024-04-09T16:45:00Z",
    updated_at: "2024-04-10T11:20:00Z",
  },
  {
    id: "5",
    order_number: "ORD-20240408-005",
    user_id: "105",
    user: {
      id: "105",
      email: "michael.brown@example.com",
      full_name: "Michael Brown",
    },
    status: "delivered",
    payment_status: "verified",
    payment_method: "connectips",
    subtotal: 8500,
    shipping_fee: 0,
    tax: 0,
    discount: 1000,
    total: 7500,
    shipping_address: {
      id: "205",
      full_name: "Michael Brown",
      phone: "+977 9865432109",
      address_line1: "202 Pine Road",
      city: "Bhaktapur",
      country: "Nepal",
    },
    items: [
      {
        id: "305",
        product_id: "405",
        product_name: "PUBG Mobile UC - 1800 Points",
        product_type: "game_points",
        quantity: 1,
        unit_price: 8500,
        subtotal: 8500,
        code: "UC-1800-XXXX-XXXX",
        activation_instructions: "Open PUBG Mobile, go to UC Purchase, select Redeem Code and enter your code.",
      },
    ],
    created_at: "2024-04-08T12:30:00Z",
    updated_at: "2024-04-08T14:15:00Z",
  },
]
