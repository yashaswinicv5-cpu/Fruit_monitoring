import { getFruitStatus } from "../../utils/status";
import SensorRow from "./SensorRow";

export default function FruitCard({ fruit, fruitImages, getStatusColor, getBorderColor, theme = "dark" }) {
  const imageSrc =
    fruit.image || fruitImages?.[fruit.fruit_type] ||
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop";

  const status = getFruitStatus(fruit);
  const displayName = fruit.fruit_type || fruit.name || fruit.id || "Fruit";

  const containerClass = theme === "light"
    ? `bg-white border ${getBorderColor(status)} rounded-3xl p-5 shadow-xl`
    : `bg-gray-900 border ${getBorderColor(status)} rounded-3xl p-5 shadow-xl`;

  const progressBg = theme === "light" ? "bg-slate-200" : "bg-gray-700";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{displayName}</h3>

        <div
          className={`${getStatusColor(status)} px-3 py-1 rounded-full text-sm`}
        >
          {status}
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <img
          src={imageSrc}
          alt={fruit.fruit_type || fruit.name}
          className="w-32 h-32 rounded-3xl object-cover"
        />
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span>Spoilage</span>
          <span>{fruit.spoilage_level ?? fruit.spoilage ?? 0}%</span>
        </div>

        <div className={`${progressBg} h-3 rounded-full overflow-hidden`}>
          <div
            className={`${getStatusColor(status)} h-3 rounded-full`}
            style={{
              width: `${fruit.spoilage_level ?? fruit.spoilage ?? 0}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <SensorRow
          label="🌡 Temp"
          value={`${fruit.sensor_temperature ?? fruit.temp ?? fruit.temperature ?? "--"}°C`}
        />

        <SensorRow
          label="💧 Humidity"
          value={`${fruit.sensor_humidity ?? fruit.humidity ?? "--"}%`}
        />

        <SensorRow
          label="🧪 TVOC"
          value={`${fruit.gas_tvoc ?? fruit.gas ?? fruit.tvoc ?? fruit.tvoc_ppm ?? fruit.gas_tvoc_ppm ?? "--"} ppm`}
        />

        <SensorRow
          label="🫧 eCO2"
          value={`${fruit.eco2_level ?? fruit.eco2_level_ppm ?? fruit.eco2 ?? fruit.eCO2 ?? fruit.co2 ?? "--"} ppm`}
        />
      </div>
    </div>
  );
}
