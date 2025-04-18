interface AdminPageHeaderProps {
  title: string
  description?: string
  icon?: string
}

export function AdminPageHeader({ title, description, icon }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {icon && (
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <span className="text-xl">
              {icon === "star" && "★"}
              {icon === "users" && "👥"}
              {icon === "settings" && "⚙️"}
              {icon === "dashboard" && "📊"}
              {!["star", "users", "settings", "dashboard"].includes(icon) && "📄"}
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
    </div>
  )
}
