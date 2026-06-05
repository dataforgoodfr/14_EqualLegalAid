export function StatCard({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="border-border bg-background rounded-xl border p-4 shadow-xs">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
    </div>
  )
}
