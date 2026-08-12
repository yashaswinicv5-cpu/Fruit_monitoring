export default function TrendChart({ title, data, color = "cyan", type = "line", theme = "dark" }) {
  const borderColor = {
    cyan: "border-cyan-400/40",
    emerald: "border-emerald-400/40",
    amber: "border-amber-400/40",
    red: "border-red-400/40",
  }[color] || "border-slate-500/40";

  const barColor = {
    cyan: "bg-cyan-400/80",
    emerald: "bg-emerald-400/80",
    amber: "bg-amber-400/80",
    red: "bg-red-400/80",
  }[color] || "bg-slate-400/80";

  const wrapperClass = theme === "light"
    ? `rounded-3xl border ${borderColor} bg-white text-slate-900 p-5 shadow-sm`
    : `rounded-3xl border ${borderColor} bg-slate-950/90 text-slate-100 p-5 shadow-sm dark:bg-slate-900/90`;

  const innerClass = theme === "light"
    ? "rounded-3xl bg-slate-50 p-4 text-slate-900"
    : "rounded-3xl bg-slate-900 p-4 text-slate-300";

  const labelClass = theme === "light" ? "text-slate-500" : "text-slate-400";

  return (
    <div className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{data.length ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0}</p>
        </div>
      </div>

      {type === "bar" ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${labelClass}`}>
                <span>{item.name}</span>
                <span>{item.value}</span>
              </div>
              <div className={`h-3 w-full rounded-full ${theme === "light" ? "bg-slate-200" : "bg-slate-800"}`}>
                <div className={`${barColor} h-full rounded-full`} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={innerClass}>
          <div className="flex items-end gap-2">
            {data.map((item) => (
              <div key={item.label} className="flex-1 text-center">
                <div className={`mx-auto mb-2 h-28 w-full rounded-2xl ${barColor}`} style={{ height: `${Math.max(item.value, 6)}%` }} />
                <div className={`text-xs ${labelClass}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
