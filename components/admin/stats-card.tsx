import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "text-amber-400",
  trend,
}: StatsCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Icon className={`mr-2 h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}

        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? "text-green-500" : "text-red-500"}`}>
            <span className="mr-1">{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
