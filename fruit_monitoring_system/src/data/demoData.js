export const defaultFruits = [
  {
    id: "AP_0001",
    fruit_type: "Apple",
    freshness_status: "Fresh",
    spoilage_level: 18.1,
    gas_tvoc: 103.14,
    eco2_level: 670.79,
    sensor_temperature: 27.14,
    sensor_humidity: 62.55,
    sensor_density: 0.889,
    time_exposure: 1.29,
  },

  {
    id: "BA_0002",
    fruit_type: "Banana",
    freshness_status: "Spoiling",
    spoilage_level: 52.76,
    gas_tvoc: 965.2,
    eco2_level: 1891.89,
    sensor_temperature: 31.83,
    sensor_humidity: 74.38,
    sensor_density: 1.014,
    time_exposure: 86.33,
  },

  {
    id: "OR_0003",
    fruit_type: "Orange",
    freshness_status: "Fresh",
    spoilage_level: 26.4,
    gas_tvoc: 210.45,
    eco2_level: 880.2,
    sensor_temperature: 26.7,
    sensor_humidity: 60.4,
    sensor_density: 0.934,
    time_exposure: 12.8,
  },

  {
    id: "MA_0004",
    fruit_type: "Mango",
    freshness_status: "Spoiled",
    spoilage_level: 80.89,
    gas_tvoc: 1237.23,
    eco2_level: 2180.75,
    sensor_temperature: 34.88,
    sensor_humidity: 77.36,
    sensor_density: 0.87,
    time_exposure: 117.27,
  },
];

export const defaultAlerts = [
  "⚠ Banana humidity increasing",
  "⚠ Apple may spoil in 12 hours",
  "⚠ Orange gas level rising",
  "⚠ Mango already spoiled",
];

export const fruitImages = {
  Apple:
    "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop",

  Banana:
    "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600&auto=format&fit=crop",

  Orange:
    "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=600&auto=format&fit=crop",

  Mango:
    "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
};