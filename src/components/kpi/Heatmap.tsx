export function Heatmap({
  rows,
  columns,
  data,
}: {
  rows: string[];
  columns: string[];
  data: Record<string, Record<string, number>>;
}) {
  const max = Math.max(1, ...rows.flatMap((r) => columns.map((c) => data[r]?.[c] || 0)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left text-muted-foreground" />
            {columns.map((c) => (
              <th key={c} className="p-2 text-center font-medium text-muted-foreground">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="whitespace-nowrap p-2 font-medium">{r}</td>
              {columns.map((c) => {
                const value = data[r]?.[c] || 0;
                const intensity = value / max;
                return (
                  <td key={c} className="p-2 text-center font-medium" style={{ backgroundColor: `rgba(239, 68, 68, ${intensity * 0.8 + (value ? 0.1 : 0)})` }}>
                    {value || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
