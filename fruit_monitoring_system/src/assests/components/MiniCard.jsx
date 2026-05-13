export default function MiniCard({ title, value, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className={`text-4xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}