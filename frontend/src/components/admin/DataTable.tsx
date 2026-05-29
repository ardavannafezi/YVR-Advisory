interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}

export function DataTable<T extends Record<string, any>>({ columns, data, keyField }: DataTableProps<T>) {
  if (!data.length) {
    return <p className="text-text-muted py-8 text-center">No records found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((c) => (
              <th key={c.key} className="text-left text-[10px] uppercase tracking-widest text-text-muted pb-3 pr-6 font-normal">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={String(row[keyField])} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              {columns.map((c) => (
                <td key={c.key} className="py-3 pr-6 text-text-muted">
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
