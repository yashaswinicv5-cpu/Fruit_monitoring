export default function StatCard({
  title,
  value,
  color = "text-white",
  theme = "dark",
}) {
  const cardClass = theme === "light"
    ? "bg-slate-50 border border-slate-200 text-slate-900"
    : "bg-gray-900 border border-gray-800 text-slate-100";

  const titleClass = theme === "light" ? "text-slate-500" : "text-gray-400";

  return (
    <div className={`${cardClass} rounded-3xl p-4 sm:p-6`}>
      <h2 className={`${titleClass} text-sm`}>{title}</h2>

      <p className={`text-3xl sm:text-4xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}