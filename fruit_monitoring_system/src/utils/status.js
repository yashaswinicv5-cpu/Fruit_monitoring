export const getFruitStatus = (fruit) => {
  const raw = String(fruit.freshness_status || fruit.Freshness_status || fruit.status || "").trim();
  const spoilage = Number(fruit.spoilage_level ?? fruit.spoilage ?? 0);
  const humidity = Number(fruit.sensor_humidity ?? fruit.humidity ?? 0);
  const gas = Number(fruit.gas_tvoc ?? fruit.gas ?? fruit.tvoc ?? fruit.tvoc_ppm ?? fruit.gas_tvoc_ppm ?? 0);

  if (raw === "Spoiled" || spoilage >= 90) {
    return "Spoiled";
  }

  if (raw === "Spoiling" || spoilage >= 70 || humidity > 80 || gas > 1000) {
    return "Spoiling";
  }

  if (raw === "Warning" || spoilage >= 40 || humidity > 65 || gas > 700) {
    return "Warning";
  }

  return "Fresh";
};
