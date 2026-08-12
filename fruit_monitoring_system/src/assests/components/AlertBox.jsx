export default function AlertBox({ alert, theme = "dark" }) {
  return (
    <div className={`rounded-2xl p-4 border ${theme === "light" ? "bg-red-50 border-red-200 text-red-900" : "bg-red-950 border-red-700 text-red-100"}`}>
      {alert}
    </div>
  );
}