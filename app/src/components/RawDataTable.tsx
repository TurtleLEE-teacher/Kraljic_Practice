interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}

interface RawDataTableProps {
  title: string;
  subtitle?: string;
  columns: Column[];
  rows: Record<string, string | number>[];
  note?: string;
}

export default function RawDataTable({
  title,
  subtitle,
  columns,
  rows,
  note,
}: RawDataTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-semibold text-gray-600 whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 text-gray-700 whitespace-nowrap font-mono
                      ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      {note && (
        <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <span className="font-bold">산출 힌트: </span>{note}
          </p>
        </div>
      )}
    </div>
  );
}
