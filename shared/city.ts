import type { Entry } from "./models";
export const cityKinds = [
  "schedule",
  "addresses",
  "medical",
  "cinema",
  "events",
] as const;
export type CityKind = (typeof cityKinds)[number];
export type CityEntry = Entry & {
  section: "city";
  kind: CityKind;
  source: {
    mode: "demo" | "live";
    name: string;
    updatedAt: string;
    url?: string;
  };
  address: string;
  times: string[];
  availability?: number;
  date?: string;
};
export interface CitySource {
  list(signal?: AbortSignal): Promise<CityEntry[]>;
}
