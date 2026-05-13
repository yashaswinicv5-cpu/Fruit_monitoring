export const fetchFruitData = async () => {
  const response = await fetch("http://localhost:5000/api/fruits");

  if (!response.ok) {
    throw new Error("Backend unavailable");
  }

  return await response.json();
};