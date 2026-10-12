export type Section =
  | "feed"
  | "services"
  | "ads"
  | "shops"
  | "search"
  | "assistant"
  | "city"
  | "exchange"
  | "cafes"
  | "cart"
  | "bonus"
  | "jobs"
  | "online"
  | "parks"
  | "malls"
  | "pharmacy"
  | "appointments";
export type Entry = {
  id: string;
  section: "feed" | "services" | "ads" | "shops" | "city";
  title: string;
  text: string;
  category: string;
  author: string;
  meta: string;
  price?: string;
  art?: string;
  rating?: string;
};
