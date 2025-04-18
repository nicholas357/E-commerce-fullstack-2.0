import { EnhancedProductForm } from "@/components/admin/enhanced-product-form"

export default function EditEnhancedProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white glow-text-amber mb-8">Edit Product (Enhanced)</h1>
      <EnhancedProductForm productId={params.id} />
    </div>
  )
}
