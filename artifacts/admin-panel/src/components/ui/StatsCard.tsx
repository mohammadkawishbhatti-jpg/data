import React from "react"

export function StatsCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-muted-foreground/50">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
