import type { Section } from "./data";
import { cityKinds, type CityKind } from "./city/source";
const sections: Section[] = [
  "feed",
  "services",
  "ads",
  "shops",
  "city",
  "search",
  "assistant",
  "exchange",
  "cafes",
  "cart",
  "bonus",
  "pharmacy",
  "appointments",
];
export function resolveRoute(hash: string): {
  section: Section;
  cityKind: CityKind;
  saved: boolean;
} {
  const [section, child] = hash.replace(/^#\/?/, "").split("/");
  return {
    section: sections.includes(section as Section)
      ? (section as Section)
      : "feed",
    cityKind: cityKinds.includes(child as CityKind)
      ? (child as CityKind)
      : "schedule",
    saved: section === "search" && child === "saved",
  };
}
