import { useEffect, useMemo, useState } from "react";
import AlertBox from "../assests/components/AlertBox";
import FruitCard from "../assests/components/FruitCard";
import StatCard from "../assests/components/StatCard";
import TrendChart from "../assests/components/TrendChart";
import { fetchFruitData } from "../services/api";
import { requestFirebaseNotificationPermission, onForegroundMessage } from "../services/firebase";
import { getFruitStatus } from "../utils/status";

const fruitImages = {
  Apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop",
  Banana: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600&auto=format&fit=crop",
  Orange: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=600&auto=format&fit=crop",
  Mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
};

const navItems = [
  { key: "overview", label: "Home" },
  { key: "details", label: "Fruit Details" },
  { key: "analytics", label: "Analytics" },
  { key: "profile", label: "Profile" },
  { key: "settings", label: "Settings" },
];

const themeClasses = (theme) => ({
  page: theme === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-100",
  sidebar: theme === "light" ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900/95 border-slate-800 text-slate-100",
  panel: theme === "light" ? "bg-white border-slate-200 text-slate-900" : "bg-slate-950/80 border-slate-800/80 text-slate-100",
  card: theme === "light" ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-slate-900/90 border-slate-800/80 text-slate-100",
  muted: theme === "light" ? "text-slate-500" : "text-slate-400",
  button: theme === "light" ? "text-slate-900" : "text-slate-100",
});

const buildAlerts = (fruitList) => {
  const alerts = [];

  fruitList.forEach((fruit) => {
    const name = fruit.fruit_type || fruit.name || fruit.id || "Fruit";
    const status = getFruitStatus(fruit);
    const spoilage = Number(fruit.spoilage_level ?? fruit.spoilage ?? 0);
    const humidity = Number(fruit.sensor_humidity ?? fruit.humidity ?? 0);
    const gas = Number(fruit.gas_tvoc ?? fruit.gas ?? fruit.gas_tvoc_ppm ?? 0);

    if (status === "Spoiling") {
      alerts.push(`⚠ ${name} is spoiling`);
    }

    if (status === "Spoiled") {
      alerts.push(`⚠ ${name} is spoiled`);
    }

    if (spoilage >= 70) {
      alerts.push(`⚠ ${name} spoilage is ${spoilage}%`);
    }

    if (humidity > 75) {
      alerts.push(`⚠ ${name} humidity is high (${humidity}%)`);
    }

    if (gas > 900) {
      alerts.push(`⚠ ${name} gas level is high (${gas} ppm)`);
    }
  });

  return [...new Set(alerts)].slice(0, 6);
};

const getStatusColor = (status) => {
  switch (status) {
    case "Fresh":
      return "bg-emerald-500";
    case "Warning":
      return "bg-amber-300 text-slate-950";
    case "Spoiling":
      return "bg-yellow-400 text-black";
    case "Spoiled":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
};

const getBorderColor = (status) => {
  switch (status) {
    case "Fresh":
      return "border-emerald-500";
    case "Warning":
      return "border-amber-300";
    case "Spoiling":
      return "border-yellow-400";
    case "Spoiled":
      return "border-red-500";
    default:
      return "border-gray-500";
  }
};

export default function Dashboard({ user, onLogout }) {
  const [fruits, setFruits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pushStatus, setPushStatus] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission === "granted"
        ? "Push notifications enabled"
        : Notification.permission === "denied"
        ? "Push notifications blocked"
        : "Push notifications not enabled"
      : "Push notifications not enabled"
  );
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [theme, setTheme] = useState(() => localStorage.getItem("fruit-theme") || "dark");
  const [selectedFruitId, setSelectedFruitId] = useState(null);

  useEffect(() => {
    const loadFruits = async () => {
      try {
        const data = await fetchFruitData();

        if (Array.isArray(data) && data.length > 0) {
          setFruits(data);
          setAlerts(buildAlerts(data));
          setSelectedFruitId(data[0]?.id ?? null);
          setError("");
        } else {
          setFruits([]);
          setAlerts([]);
          setSelectedFruitId(null);
          setError("No live data available.");
        }
      } catch (err) {
        setFruits([]);
        setAlerts([]);
        setSelectedFruitId(null);
        setError("Unable to load live data. Please check the backend or Firebase configuration.");
      } finally {
        setLoading(false);
      }
    };

    loadFruits();
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        setPushStatus("Push notifications enabled");
      } else if (Notification.permission === "denied") {
        setPushStatus("Push notifications blocked");
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("fruit-theme", theme);
  }, [theme]);

  const handleEnablePushNotifications = async () => {
    setIsEnablingPush(true);
    setPushStatus("Enabling push notifications...");

    try {
      const token = await requestFirebaseNotificationPermission();
      console.log("FCM token:", token);
      setPushStatus("Push notifications enabled");
    } catch (err) {
      console.warn("FCM setup failed:", err);
      setPushStatus(err.message || "Notification permission was not granted. Please allow notifications in your browser and try again.");
    } finally {
      setIsEnablingPush(false);
    }
  };

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onForegroundMessage((payload) => {
        const title = payload.notification?.title || payload.data?.title || "Notification";
        const body = payload.notification?.body || payload.data?.body || payload.data?.message || "";
        setAlerts((currentAlerts) => [`📩 ${title}: ${body}`, ...currentAlerts].slice(0, 6));
      });
    } catch (err) {
      console.warn("FCM foreground listener unavailable:", err);
    }

    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    const fresh = fruits.filter((fruit) => getFruitStatus(fruit) === "Fresh").length;

    const warning = fruits.filter((fruit) => getFruitStatus(fruit) === "Warning").length;

    const spoiling = fruits.filter((fruit) => getFruitStatus(fruit) === "Spoiling").length;

    const spoiled = fruits.filter((fruit) => getFruitStatus(fruit) === "Spoiled").length;

    const average = (field) => {
      const values = fruits.map((fruit) => Number(fruit[field] ?? 0)).filter((value) => !Number.isNaN(value));
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
    };

    return {
      total: fruits.length,
      fresh,
      warning,
      spoiling,
      spoiled,
      avgHumidity: average("sensor_humidity") || average("humidity"),
      avgTemperature: average("sensor_temperature") || average("temp") || average("temperature"),
      avgGas: average("gas_tvoc") || average("gas") || average("tvoc") || average("tvoc_ppm"),
      selectedFruit: fruits.find((fruit) => fruit.id === selectedFruitId) || fruits[0] || null,
    };
  }, [fruits, selectedFruitId]);

  const spoilageTrend = useMemo(
    () => fruits.slice(0, 8).map((fruit, index) => ({
      label: fruit.fruit_type || fruit.name || `Fruit ${index + 1}`,
      value: Number(fruit.spoilage_level ?? fruit.spoilage ?? 0),
    })),
    [fruits]
  );

  const humidityTrend = useMemo(
    () => fruits.slice(0, 8).map((fruit, index) => ({
      label: fruit.fruit_type || fruit.name || `Fruit ${index + 1}`,
      value: Number(fruit.sensor_humidity ?? fruit.humidity ?? 0),
    })),
    [fruits]
  );

  const statusDistribution = useMemo(() => {
    const counts = { Fresh: 0, Warning: 0, Spoiling: 0, Spoiled: 0, Unknown: 0 };
    fruits.forEach((fruit) => {
      const status = getFruitStatus(fruit) || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [fruits]);

  const liveStatus = loading
    ? "Connecting to live telemetry..."
    : error
    ? "Not receiving live data"
    : "Live telemetry connected";

  const styles = themeClasses(theme);

  return (
    <div className={`${styles.page} min-h-screen transition-colors duration-500`}>
      <div className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className={`${styles.sidebar} sticky top-6 z-10 rounded-3xl border p-5 shadow-glow`}>
            <div className="mb-6">
              <div className="inline-flex rounded-3xl bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300 ring-1 ring-cyan-500/20">
                IoT Dashboard
              </div>
              <h1 className="mt-6 text-3xl font-semibold">FruitHub</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400 dark:text-slate-400">
                Deep analytics, device status, and fruit condition insights in one place.
              </p>
            </div>

            <div className={`space-y-2 rounded-3xl border ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-900" : "border-slate-800/70 bg-slate-950/80 text-slate-300"} p-4`}>
              <div className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>Connected User</div>
              <div className={`mt-3 rounded-3xl p-4 ${theme === "light" ? "bg-white" : "bg-slate-900"}`}>
                <div className={`text-sm ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Email</div>
                <div className="mt-1 font-medium">{user.email}</div>
              </div>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === item.key
                      ? theme === "light"
                        ? "bg-cyan-500/15 text-cyan-900 ring-1 ring-cyan-400/35"
                        : "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/35"
                      : theme === "light"
                        ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className={`mt-8 rounded-3xl border p-4 ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-900" : "border-slate-800/70 bg-slate-950/80 text-slate-300"}`}>
              <div className="flex items-center justify-between text-sm">
                <span>Theme</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`rounded-full border px-3 py-1 text-xs transition ${theme === "light" ? "border-slate-300 bg-slate-100 text-slate-900" : "border-slate-700 bg-slate-900 text-slate-100"}`}
                >
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>
              <p className={`mt-3 text-xs ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                Your preferred theme is saved for future visits.
              </p>
            </div>
          </aside>

          <main className="space-y-6">
            <section className={`rounded-3xl border p-6 shadow-glow transition-colors duration-500 ${theme === "light" ? "border-slate-200 bg-white/90" : "border-slate-800/80 bg-slate-950/80 dark:bg-slate-900/90"}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">Dashboard</p>
                  <h2 className="mt-3 text-3xl font-semibold">{activeSection === "overview" ? "Overview" : activeSection === "details" ? "Fruit Details" : activeSection === "analytics" ? "Analytics" : activeSection === "profile" ? "Profile" : "Settings"}</h2>
                  <p className={`mt-2 max-w-2xl text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                    {activeSection === "overview" && "A live summary of current fruit telemetry, health signals, and quick actions."}
                    {activeSection === "details" && "Inspect each fruit sensor reading and condition in a rich detail view."}
                    {activeSection === "analytics" && "Visual performance charts and trend data to help you optimize storage."}
                    {activeSection === "profile" && "Account details, logout, and quick status information."}
                    {activeSection === "settings" && "Control theme, notifications, and dashboard preferences."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-3xl px-4 py-3 text-sm ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-900/90 text-slate-300"}`}>
                    <div className={`text-xs uppercase tracking-[0.2em] ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>Status</div>
                    <div className="mt-2 font-semibold">{liveStatus}</div>
                  </div>
                  <div className={`rounded-3xl px-4 py-3 text-sm ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-900/90 text-slate-300"}`}>
                    <div className={`text-xs uppercase tracking-[0.2em] ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>Push</div>
                    <div className="mt-2 font-semibold">{pushStatus}</div>
                  </div>
                </div>
              </div>
            </section>

            {activeSection === "overview" && (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <StatCard title="Total fruits" value={stats.total} color="text-cyan-300" theme={theme} />
                    <StatCard title="Fresh" value={stats.fresh} color="text-emerald-400" theme={theme} />
                    <StatCard title="Warning" value={stats.warning} color="text-amber-300" theme={theme} />
                    <StatCard title="Spoiling" value={stats.spoiling} color="text-yellow-400" theme={theme} />
                    <StatCard title="Spoiled" value={stats.spoiled} color="text-red-400" theme={theme} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <TrendChart title="Spoilage Trend" data={spoilageTrend} color="cyan" theme={theme} />
                    <TrendChart title="Humidity Trend" data={humidityTrend} color="emerald" theme={theme} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className={`rounded-3xl border p-5 shadow-sm ${styles.card}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Recent Alerts</h3>
                      <span className={`text-xs uppercase tracking-[0.2em] ${theme === "light" ? "text-slate-500" : "text-slate-500"}`}>Live</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {loading ? (
                        <p className={theme === "light" ? "text-slate-600" : "text-slate-400"}>Waiting for live signals...</p>
                      ) : alerts.length > 0 ? (
                        alerts.map((alert, index) => <AlertBox key={index} alert={alert} theme={theme} />)
                      ) : (
                        <p className={theme === "light" ? "text-slate-600" : "text-slate-400"}>No alerts detected.</p>
                      )}
                    </div>
                  </div>

                  <div className={`rounded-3xl border p-5 shadow-sm ${styles.card}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Quick Overview</h3>
                      <button
                        onClick={() => setActiveSection("analytics")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${theme === "light" ? "bg-cyan-500/15 text-cyan-900 hover:bg-cyan-500/20" : "bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/20"}`}
                      >
                        Open Analytics
                      </button>
                    </div>
                    <div className={`mt-5 space-y-3 text-sm ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                      <p>Average humidity: <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{stats.avgHumidity}%</span></p>
                      <p>Average temperature: <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{stats.avgTemperature}°C</span></p>
                      <p>Average gas level: <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{stats.avgGas} ppm</span></p>
                      <p>Selected fruit: <span className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>{stats.selectedFruit?.fruit_type || stats.selectedFruit?.name || "None"}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "details" && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_0.9fr]">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {fruits.map((fruit) => (
                      <button
                        key={fruit.id}
                        onClick={() => setSelectedFruitId(fruit.id)}
                        className={`rounded-3xl border p-4 text-left transition ${
                          selectedFruitId === fruit.id
                            ? "border-cyan-400/50 bg-cyan-500/10 text-slate-900"
                            : theme === "light"
                              ? "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-900"
                              : "border-slate-800 bg-slate-900/80 hover:border-slate-600 text-slate-300"
                        }`}
                      >
                        <h3 className="text-lg font-semibold">{fruit.fruit_type || fruit.name || "Fruit"}</h3>
                        <p className="mt-2 text-sm text-slate-500">Spoilage: {fruit.spoilage_level ?? fruit.spoilage ?? 0}%</p>
                        <p className="mt-1 text-sm text-slate-500">Humidity: {fruit.sensor_humidity ?? fruit.humidity ?? 0}%</p>
                      </button>
                    ))}
                  </div>

                  <div className={`rounded-3xl border p-6 ${styles.card}`}>
                    <h3 className="text-xl font-semibold">Fruit list</h3>
                    <p className={`mt-2 text-sm ${theme === "light" ? "text-slate-600" : "text-slate-400"}`}>
                      Tap any card to reveal its sensor snapshot.
                    </p>
                    <div className="mt-5 space-y-4">
                      {fruits.map((fruit) => (
                        <div key={fruit.id} className={`rounded-3xl border p-4 ${theme === "light" ? "border-slate-200 bg-slate-50 text-slate-900" : "border-slate-800 bg-slate-950/80 text-slate-300"}`}>
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold">{fruit.fruit_type || fruit.name || "Fruit"}</p>
                              <p className={theme === "light" ? "text-slate-600 text-sm" : "text-slate-500 text-sm"}>Status: {fruit.freshness_status || fruit.status || "Unknown"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs ${theme === "light" ? "bg-slate-200 text-slate-900" : "bg-slate-800 text-slate-300"}`}>Spoilage {fruit.spoilage_level ?? fruit.spoilage ?? 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-6 ${styles.card}`}>
                  <h3 className="text-xl font-semibold">Details for {stats.selectedFruit?.fruit_type || stats.selectedFruit?.name || "Selected fruit"}</h3>
                  <div className={`mt-5 space-y-4 text-sm ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                    <p><span className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Humidity:</span> {stats.selectedFruit?.sensor_humidity ?? stats.selectedFruit?.humidity ?? "--"}%</p>
                    <p><span className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Temperature:</span> {stats.selectedFruit?.sensor_temperature ?? stats.selectedFruit?.temp ?? stats.selectedFruit?.temperature ?? "--"}°C</p>
                    <p><span className={theme === "light" ? "text-slate-500" : "text-slate-400"}>TVOC:</span> {stats.selectedFruit?.gas_tvoc ?? stats.selectedFruit?.gas ?? stats.selectedFruit?.tvoc ?? stats.selectedFruit?.tvoc_ppm ?? stats.selectedFruit?.gas_tvoc_ppm ?? "--"} ppm</p>
                    <p><span className={theme === "light" ? "text-slate-500" : "text-slate-400"}>eCO2:</span> {stats.selectedFruit?.eco2_level ?? stats.selectedFruit?.eco2_level_ppm ?? stats.selectedFruit?.eco2 ?? stats.selectedFruit?.eCO2 ?? stats.selectedFruit?.co2 ?? "--"} ppm</p>
                    <p><span className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Spoilage Rating:</span> {stats.selectedFruit?.spoilage_level ?? stats.selectedFruit?.spoilage ?? 0}%</p>
                    <div className={`rounded-3xl p-4 text-sm ${theme === "light" ? "bg-slate-100 text-slate-900" : "bg-slate-950 text-slate-400"}`}>
                      <p className={`font-semibold ${theme === "light" ? "text-slate-900" : "text-slate-100"}`}>Action</p>
                      <p className="mt-2">Monitor the fruit closely and consider moving items that are repeating high humidity or gas events.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className={`rounded-3xl border p-5 ${styles.card}`}>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Avg humidity</p>
                    <p className={`mt-4 text-3xl font-semibold ${theme === "light" ? "text-cyan-700" : "text-cyan-100"}`}>{stats.avgHumidity}%</p>
                  </div>
                  <div className={`rounded-3xl border p-5 ${styles.card}`}>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Avg temp</p>
                    <p className={`mt-4 text-3xl font-semibold ${theme === "light" ? "text-emerald-700" : "text-emerald-200"}`}>{stats.avgTemperature}°C</p>
                  </div>
                  <div className={`rounded-3xl border p-5 ${styles.card}`}>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Avg gas</p>
                    <p className={`mt-4 text-3xl font-semibold ${theme === "light" ? "text-amber-700" : "text-amber-200"}`}>{stats.avgGas} ppm</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <TrendChart title="Spoilage Trend" data={spoilageTrend} color="cyan" theme={theme} />
                  <TrendChart title="Humidity Trend" data={humidityTrend} color="emerald" theme={theme} />
                </div>

                <TrendChart title="Status Distribution" data={statusDistribution} type="bar" color="amber" theme={theme} />
              </div>
            )}

            {activeSection === "profile" && (
              <div className="grid gap-6 lg:grid-cols-[0.9fr_0.9fr]">
                <div className={`rounded-3xl border p-6 ${styles.card}`}>
                  <h3 className="text-xl font-semibold">Profile</h3>
                  <p className={theme === "light" ? "mt-3 text-slate-600" : "mt-3 text-slate-400"}>This is the signed-in account for secure fruit monitoring.</p>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Email</div>
                      <div className="mt-1 font-medium">{user.email}</div>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Saved preferences</div>
                      <div className="mt-1 font-medium capitalize">{theme} mode</div>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className={theme === "light" ? "text-slate-500" : "text-slate-400"}>Last connected</div>
                      <div className="mt-1 font-medium">{loading ? "Syncing..." : "Live"}</div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-6 ${styles.card}`}>
                  <h3 className="text-xl font-semibold">Account Actions</h3>
                  <div className="mt-5 space-y-4">
                    <button
                      onClick={onLogout}
                      className="w-full rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                    >
                      Sign out of dashboard
                    </button>
                    <button
                      onClick={() => setActiveSection("settings")}
                      className={`w-full rounded-3xl border px-5 py-3 text-sm font-semibold transition ${theme === "light" ? "border-slate-300 text-slate-900 bg-slate-100 hover:bg-slate-200" : "border-slate-700 text-slate-100 hover:bg-slate-800"}`}
                    >
                      Open settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "settings" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className={`rounded-3xl border p-6 ${styles.card}`}>
                  <h3 className="text-xl font-semibold">Interface Settings</h3>
                  <div className="mt-6 space-y-4 text-sm">
                    <div className={`flex items-center justify-between rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div>
                        <div className="font-semibold">Theme mode</div>
                        <div className={theme === "light" ? "text-slate-500" : "text-slate-500"}>Switch between light and dark.</div>
                      </div>
                      <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={`rounded-full border px-4 py-2 text-sm ${theme === "light" ? "border-slate-300 text-slate-900 bg-slate-100" : "border-slate-700 text-slate-100 bg-slate-900"}`}
                      >
                        {theme === "dark" ? "Light" : "Dark"}
                      </button>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className="font-semibold">Data refresh</div>
                      <p className={theme === "light" ? "text-slate-600" : "text-slate-500"}>Live sensor data refreshes automatically when your backend pushes updates.</p>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className="font-semibold">Notifications</div>
                      <p className={theme === "light" ? "text-slate-600" : "text-slate-500"}>Manage browser notifications and status alerts.</p>
                      <button
                        onClick={handleEnablePushNotifications}
                        disabled={isEnablingPush}
                        className="mt-3 rounded-3xl bg-cyan-500 px-4 py-2 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
                      >
                        {isEnablingPush ? "Requesting..." : "Enable push notifications"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-6 ${styles.card}`}>
                  <h3 className="text-xl font-semibold">System Settings</h3>
                  <div className={`mt-6 space-y-4 text-sm ${theme === "light" ? "text-slate-700" : "text-slate-300"}`}>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className="font-semibold">Dashboard layout</div>
                      <p className={theme === "light" ? "text-slate-600" : "text-slate-500"}>Use the sidebar to switch between views and keep metrics visible at a glance.</p>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className="font-semibold">Alerts</div>
                      <p className={theme === "light" ? "text-slate-600" : "text-slate-500"}>Alerts appear as soon as conditions are detected or FCM notifications arrive.</p>
                    </div>
                    <div className={`rounded-3xl p-4 ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-300"}`}>
                      <div className="font-semibold">Profile</div>
                      <p className={theme === "light" ? "text-slate-600" : "text-slate-500"}>Edit user information in your auth provider if connected.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
