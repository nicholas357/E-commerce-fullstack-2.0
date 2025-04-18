import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white glow-text-amber mb-8">Add New Product</h1>
      <ProductForm />
    </div>
  )
}
