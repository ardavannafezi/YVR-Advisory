interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="card-surface p-6">
      <p className="text-text-dim text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="font-serif text-4xl text-text-primary">{value}</p>
      {sub && <p className="text-text-muted text-sm mt-1">{sub}</p>}
    </div>
  );
}
