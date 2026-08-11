export default function AlertBox({ alert }) {
  return (
    <div className="bg-red-950 border border-red-700 rounded-2xl p-4">
      {alert}
    </div>
  );
}