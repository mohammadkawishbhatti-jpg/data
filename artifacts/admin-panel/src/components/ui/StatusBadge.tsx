import React from "react"
import { cn } from "../../lib/utils"

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()
  let colorClass = "bg-gray-100 text-gray-800"

  if (["new", "draft"].includes(normalized)) colorClass = "bg-blue-100 text-blue-800"
  else if (["in progress", "read"].includes(normalized)) colorClass = "bg-purple-100 text-purple-800"
  else if (["quoted", "replied", "published"].includes(normalized)) colorClass = "bg-green-100 text-green-800"
  else if (["won"].includes(normalized)) colorClass = "bg-emerald-100 text-emerald-800"
  else if (["lost"].includes(normalized)) colorClass = "bg-red-100 text-red-800"

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", colorClass)}>
      {status}
    </span>
  )
}
