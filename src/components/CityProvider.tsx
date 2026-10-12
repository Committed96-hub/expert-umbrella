import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRemote } from "../commerce/useRemote";
export type CityContextData = {
  city: string;
  timezone: string;
  serverTime: string;
  weather: { temperature: number; description: string; mode: string };
  media: { panorama: string; editorial: string };
  storage: { mode: string; persistent: boolean };
};
type RemoteCity = ReturnType<typeof useRemote<CityContextData>>;
const context = createContext<RemoteCity | null>(null);
export function CityProvider({ children }: { children: ReactNode }) {
  const state = useRemote<CityContextData>("/context");
  useEffect(() => {
    if (!state.data) return;
    for (const [name, url] of Object.entries(state.data.media))
      document.documentElement.style.setProperty(
        `--asset-${name}`,
        `url(${JSON.stringify(url)})`,
      );
  }, [state.data]);
  return <context.Provider value={state}>{children}</context.Provider>;
}
export function useCityContext() {
  const value = useContext(context);
  if (!value) throw new Error("CityProvider missing");
  return value;
}
