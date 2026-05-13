import SensorRow from "./SensorRow";

export default function FruitCard({
  fruit,
  fruitImages,
  getStatusColor,
  getBorderColor,
}) {
  return (
    <div
      className={`bg-gray-900 border ${getBorderColor(
        fruit.freshness_status
      )} rounded-3xl p-5 shadow-xl`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          {fruit.fruit_type}
        </h3>

        <div
          className={`${getStatusColor(
            fruit.freshness_status
          )} px-3 py-1 rounded-full text-sm`}
        >
          {fruit.freshness_status}
        </div>
      </div>

      <div className="flex justify-center mb-5">
        <img
          src={fruitImages[fruit.fruit_type]}
          alt={fruit.fruit_type}
          className="w-32 h-32 rounded-3xl object-cover"
        />
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span>Spoilage</span>
          <span>{fruit.spoilage_level}%</span>
        </div>

        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className={`${getStatusColor(
              fruit.freshness_status
            )} h-3 rounded-full`}
            style={{
              width: `${fruit.spoilage_level}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <SensorRow
          label="🌡 Temp"
          value={`${fruit.sensor_temperature}°C`}
        />

        <SensorRow
          label="💧 Humidity"
          value={`${fruit.sensor_humidity}%`}
        />

        <SensorRow
          label="🧪 TVOC"
          value={`${fruit.gas_tvoc} ppm`}
        />

        <SensorRow
          label="🫧 eCO2"
          value={`${fruit.eco2_level} ppm`}
        />
      </div>
    </div>
  );
}