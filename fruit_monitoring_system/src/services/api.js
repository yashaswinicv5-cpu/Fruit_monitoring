import { fetchFruitData as fetchFruitDataFirebase } from "./firebase";

export const fetchFruitData = async () => {
  return await fetchFruitDataFirebase();
};
