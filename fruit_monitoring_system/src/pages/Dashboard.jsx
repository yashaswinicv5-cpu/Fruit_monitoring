import { useState } from "react";

export default function Dashboard() {
  const [fruits, setFruits] = useState([
    {
      id: 1,
      name: "Apple",
      status: "Fresh",
      spoilage: 18,
      temp: 27,
      humidity: 62,
      gas: 103,
      image:
        "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=600",
    },

    {
      id: 2,
      name: "Banana",
      status: "Spoiling",
      spoilage: 55,
      temp: 31,
      humidity: 74,
      gas: 965,
      image:
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=600",
    },

    {
      id: 3,
      name: "Orange",
      status: "Fresh",
      spoilage: 24,
      temp: 26,
      humidity: 60,
      gas: 210,
      image:
        "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?q=80&w=600",
    },

    {
      id: 4,
      name: "Mango",
      status: "Spoiled",
      spoilage: 82,
      temp: 35,
      humidity: 78,
      gas: 1240,
      image:
        "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600",
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [newFruit, setNewFruit] = useState({
    name: "",
    status: "Fresh",
    spoilage: "",
    temp: "",
    humidity: "",
    gas: "",
    image: "",
  });

  const getBorder = (status) => {
    switch (status) {
      case "Fresh":
        return "border-green-500";

      case "Spoiling":
        return "border-yellow-500";

      case "Spoiled":
        return "border-red-500";

      default:
        return "border-gray-500";
    }
  };

  const getBadge = (status) => {
    switch (status) {
      case "Fresh":
        return "bg-green-500";

      case "Spoiling":
        return "bg-yellow-500";

      case "Spoiled":
        return "bg-red-500";

      default:
        return "bg-gray-500";
    }
  };

  const addFruit = () => {
    if (!newFruit.name) return;

    const fruit = {
      ...newFruit,
      id: Date.now(),
    };

    setFruits([...fruits, fruit]);

    setNewFruit({
      name: "",
      status: "Fresh",
      spoilage: "",
      temp: "",
      humidity: "",
      gas: "",
      image: "",
    });

    setShowModal(false);
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10">

          <div>
            <h1 className="text-3xl sm:text-5xl font-bold">
              Smart Fruit Spoilage Monitor
            </h1>

            <p className="text-gray-400 mt-3">
              Real-time IoT based spoilage detection
            </p>
          </div>

          <div className="flex gap-4 items-center flex-wrap">

            <div className="bg-green-700 px-4 py-2 rounded-2xl shadow-lg">
              Live Connected
            </div>

            <div className="bg-red-600 px-4 py-2 rounded-2xl shadow-lg animate-pulse">
              🔔 3 Alerts
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-2xl shadow-lg font-semibold transition-all duration-300"
            >
              + Add Fruit
            </button>

          </div>

        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          <div className="bg-gray-900 rounded-3xl p-6 border border-gray-700">
            <h2 className="text-gray-400 text-sm">Total Fruits</h2>

            <p className="text-5xl font-bold mt-3">
              {fruits.length}
            </p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-green-500">
            <h2 className="text-gray-400 text-sm">Fresh</h2>

            <p className="text-5xl font-bold text-green-400 mt-3">
              {
                fruits.filter(
                  (fruit) => fruit.status === "Fresh"
                ).length
              }
            </p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-yellow-500">
            <h2 className="text-gray-400 text-sm">Spoiling</h2>

            <p className="text-5xl font-bold text-yellow-400 mt-3">
              {
                fruits.filter(
                  (fruit) => fruit.status === "Spoiling"
                ).length
              }
            </p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 border border-red-500">
            <h2 className="text-gray-400 text-sm">Spoiled</h2>

            <p className="text-5xl font-bold text-red-400 mt-3">
              {
                fruits.filter(
                  (fruit) => fruit.status === "Spoiled"
                ).length
              }
            </p>
          </div>

        </div>

        {/* FRUIT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

          {fruits.map((fruit) => (

            <div
              key={fruit.id}
             className={`bg-gray-900 rounded-3xl p-5 border-2 ${getBorder(
  fruit.status
)} shadow-2xl hover:scale-105 transition-all duration-300`}
            >

            <div className="flex justify-between items-start mb-5">

  <div>
    <h2 className="text-2xl font-bold">
      {fruit.name}
    </h2>
  </div>

  <div className="flex items-center gap-2">

    <div
      className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadge(
        fruit.status
      )}`}
    >
      {fruit.status}
    </div>

    {/* DELETE BUTTON WITH CONFIRMATION */}
<button
  onClick={() => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${fruit.name}?`
    );

    if (confirmDelete) {
      setFruits(
        fruits.filter((item) => item.id !== fruit.id)
      );
    }
  }}
  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-sm font-bold"
>
  ✕
</button>
  </div>

</div>

              {/* SPOILAGE */}
              <div className="mb-5">

                <div className="flex justify-between mb-2 text-sm">
                  <span>Spoilage</span>
                  <span>{fruit.spoilage}%</span>
                </div>

                <div className="bg-gray-700 h-4 rounded-full overflow-hidden">

                  <div
                    className={`${getBadge(
                      fruit.status
                    )} h-4 rounded-full`}
                    style={{
                      width: `${fruit.spoilage}%`,
                    }}
                  />

                </div>

              </div>

              {/* SENSOR DETAILS */}
              <div className="space-y-3 text-gray-300">

                <div className="flex justify-between">
                  <span>🌡 Temperature</span>
                  <span>{fruit.temp}°C</span>
                </div>

                <div className="flex justify-between">
                  <span>💧 Humidity</span>
                  <span>{fruit.humidity}%</span>
                </div>

                <div className="flex justify-between">
                  <span>🧪 TVOC Gas</span>
                  <span>{fruit.gas} ppm</span>
                </div>

              </div>

            </div>

          ))}

        </div>

        {/* ALERT SECTION */}
        <div className="mt-14">

          <h2 className="text-4xl font-bold text-red-400 mb-8">
            Real-Time Alerts
          </h2>

          <div className="space-y-5">

            <div className="bg-red-950 border border-red-600 rounded-3xl p-6 text-xl">
              ⚠ Banana humidity increasing
            </div>

            <div className="bg-red-950 border border-red-600 rounded-3xl p-6 text-xl">
              ⚠ Mango already spoiled
            </div>

            <div className="bg-red-950 border border-red-600 rounded-3xl p-6 text-xl">
              ⚠ Apple may spoil in 12 hours
            </div>

          </div>

        </div>

        {/* MODAL */}
        {showModal && (

          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">

            <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-cyan-500">

              <h2 className="text-3xl font-bold mb-6">
                Add New Fruit
              </h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Fruit Name"
                  value={newFruit.name}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

                <select
                  value={newFruit.status}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                >
                  <option>Fresh</option>
                  <option>Spoiling</option>
                  <option>Spoiled</option>
                </select>

                <input
                  type="number"
                  placeholder="Spoilage %"
                  value={newFruit.spoilage}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      spoilage: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

                <input
                  type="number"
                  placeholder="Temperature"
                  value={newFruit.temp}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      temp: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

                <input
                  type="number"
                  placeholder="Humidity"
                  value={newFruit.humidity}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      humidity: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

                <input
                  type="number"
                  placeholder="TVOC Gas"
                  value={newFruit.gas}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      gas: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

                <input
                  type="text"
                  placeholder="Image URL"
                  value={newFruit.image}
                  onChange={(e) =>
                    setNewFruit({
                      ...newFruit,
                      image: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex gap-4 mt-6">

                <button
                  onClick={addFruit}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 py-3 rounded-2xl font-semibold"
                >
                  Add Fruit
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-2xl font-semibold"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        )}

        {/* FOOTER */}
        <div className="mt-16 text-center text-gray-500 text-lg">
          Smart IoT Fruit Monitoring System
        </div>

      </div>
    </div>
  );
}