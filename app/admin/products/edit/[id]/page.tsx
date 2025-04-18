import { ProductForm } from "@/components/admin/product-form"

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white glow-text-amber mb-8">Edit Product</h1>
      <ProductForm productId={params.id} />
    </div>
  )
}
