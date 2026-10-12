import { createContext, useContext, type ReactNode } from "react";
import { useRemote } from "../commerce/useRemote";
import type { CityWeather } from "../../shared/weather";
export type CityContextData = {
  links: { community: string };
  city: string;
  timezone: string;
  serverTime: string;
  weather: CityWeather;
  media: { panorama: string; editorial: string };
  storage: { mode: string; persistent: boolean };
};
type RemoteCity = ReturnType<typeof useRemote<CityContextData>>;
const context = createContext<RemoteCity | null>(null);
export function CityProvider({ children }: { children: ReactNode }) {
  const state = useRemote<CityContextData>("/context");
  return <context.Provider value={state}>{children}</context.Provider>;
}
export function useCityContext() {
  const value = useContext(context);
  if (!value) throw new Error("CityProvider missing");
  return value;
}
