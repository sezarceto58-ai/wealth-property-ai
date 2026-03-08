import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

export function AdminTable<T extends Record<string, any>>({ columns, data, loading, onRowClick, emptyMessage = "No data found" }: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-[#2a2d3a]" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#6b7280]">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#2a2d3a]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[#1a1d27] border-b border-[#2a2d3a]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3 text-[#6b7280] font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)} className={`border-b border-[#2a2d3a] hover:bg-[#2a2d3a]/50 transition-colors ${onRowClick ? "cursor-pointer" : ""} ${i % 2 === 0 ? "bg-[#0f1117]" : "bg-[#1a1d27]/50"}`}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-white">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
