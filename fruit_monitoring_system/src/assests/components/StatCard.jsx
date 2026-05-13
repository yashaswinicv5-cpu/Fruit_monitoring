export default function StatCard({
  title,
  value,
  color = "text-white",
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4 sm:p-6">
      <h2 className="text-gray-400 text-sm">{title}</h2>

      <p className={`text-3xl sm:text-4xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}