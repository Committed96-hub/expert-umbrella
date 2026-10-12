import type { Entry } from "../data";
import type { CityEntry } from "../../shared/city";
export { cityKinds } from "../../shared/city";
export type { CityEntry, CityKind, CitySource } from "../../shared/city";
export function isCityEntry(entry: Entry): entry is CityEntry {
  return entry.section === "city" && "kind" in entry;
}
export function formatCityDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Yekaterinburg",
  }).format(new Date(`${date}T12:00:00+05:00`));
}
