import { useEffect, useState } from "react";
import AlertBox from "../assests/components/AlertBox";
import FruitCard from "../assests/components/FruitCard";
import StatCard from "../assests/components/StatCard";
import { fetchFruitData } from "../services/api";
import { requestFirebaseNotificationPermission, onForegroundMessage } from "../services/firebase";

const fruitImages = {
  Apple: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600&auto=format&fit=crop",
  Banana: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600&auto=format&fit=crop",
  Orange: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=600&auto=format&fit=crop",
  Mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600&auto=format&fit=crop",
};

const buildAlerts = (fruitList) => {
  const alerts = [];

  fruitList.forEach((fruit) => {
    const name = fruit.fruit_type || fruit.name || fruit.id || "Fruit";
    const status = fruit.freshness_status || fruit.Freshness_status || fruit.status || "Unknown";
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

  return [...new Set(alerts)].slice(0, 5);
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

  useEffect(() => {
    const loadFruits = async () => {
      try {
        const data = await fetchFruitData();

        if (Array.isArray(data) && data.length > 0) {
          setFruits(data);
          setAlerts(buildAlerts(data));
          setError("");
        } else {
          setFruits([]);
          setAlerts([]);
          setError("No live data available.");
        }
      } catch (err) {
        setFruits([]);
        setAlerts([]);
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
        setAlerts((currentAlerts) => [`📩 ${title}: ${body}`, ...currentAlerts].slice(0, 5));
      });
    } catch (err) {
      console.warn("FCM foreground listener unavailable:", err);
    }

    return unsubscribe;
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Fresh":
        return "bg-emerald-500";
      case "Spoiling":
        return "bg-yellow-400 text-black";
      case "Spoiled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBorderColor = (status) => {
    switch (status) {
      case "Fresh":
        return "border-emerald-500";
      case "Spoiling":
        return "border-yellow-400";
      case "Spoiled":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  const liveStatus = loading
    ? "Loading live data..."
    : error
    ? "No live data"
    : "Live telemetry connected";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold">Smart Fruit Monitor</h1>
            <p className="text-gray-400 mt-2">Live IoT fruit telemetry from your backend.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-sm text-gray-300">Logged in as {user.email}</div>
            <button
              onClick={onLogout}
              className="rounded-2xl bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard title="Total Fruits" value={fruits.length} color="text-cyan-300" />
          <StatCard
            title="Fresh"
            value={fruits.filter((fruit) => {
              const status = fruit.freshness_status || fruit.Freshness_status || fruit.status;
              return status === "Fresh";
            }).length}
            color="text-emerald-400"
          />
          <StatCard
            title="Spoiling"
            value={fruits.filter((fruit) => {
              const status = fruit.freshness_status || fruit.Freshness_status || fruit.status;
              return status === "Spoiling";
            }).length}
            color="text-yellow-400"
          />
          <StatCard
            title="Spoiled"
            value={fruits.filter((fruit) => {
              const status = fruit.freshness_status || fruit.Freshness_status || fruit.status;
              return status === "Spoiled";
            }).length}
            color="text-red-400"
          />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Alerts</h2>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="text-gray-400">Loading alerts...</div>
              ) : alerts.length > 0 ? (
                alerts.map((alert, index) => <AlertBox key={index} alert={alert} />)
              ) : (
                <div className="text-gray-400">No live alerts found.</div>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <h2 className="text-lg font-semibold mb-4">Data Status</h2>
            <p className="text-gray-300 mb-2">{liveStatus}</p>
            <p className="text-gray-300 mb-2">{pushStatus}</p>
            <button
              onClick={handleEnablePushNotifications}
              disabled={isEnablingPush}
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isEnablingPush ? "Enabling..." : "Enable push"}
            </button>
            {error && <p className="text-sm text-amber-300 mt-3">{error}</p>}
          </div>
        </div>

        {error && !loading ? (
          <div className="mb-8 rounded-3xl border border-red-700 bg-red-950 p-6 text-red-200">
            <p className="font-semibold">No live data is available.</p>
            <p className="text-gray-400 mt-2">Please confirm your backend and Firebase setup, or check your IoT data source.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {fruits.map((fruit) => (
            <FruitCard
              key={fruit.id}
              fruit={fruit}
              fruitImages={fruitImages}
              getStatusColor={getStatusColor}
              getBorderColor={getBorderColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
