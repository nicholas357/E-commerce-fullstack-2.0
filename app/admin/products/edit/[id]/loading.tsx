import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex items-center justify-center p-6 min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}
