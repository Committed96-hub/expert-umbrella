import type { CityWeather } from "../../shared/weather";
let cached: { expires: number; value: CityWeather } | undefined;
let inflight: Promise<CityWeather> | undefined;
// Free endpoint is for this non-commercial demo; use a paid licensed endpoint before monetisation.
export function cityWeather(): Promise<CityWeather> {
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.value);
  return inflight ||= load().finally(() => { inflight = undefined; });
}
async function load(): Promise<CityWeather> {
  const base = { source: "Open-Meteo", sourceUrl: "https://open-meteo.com/" };
  let value: CityWeather;
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=57.25&longitude=60.0833&current=temperature_2m,surface_pressure,weather_code&timezone=UTC", {signal: AbortSignal.timeout(3500)});
    if (!response.ok) throw new Error("Weather unavailable");
    const {current} = await response.json() as {current: {temperature_2m: number; surface_pressure: number; weather_code: number; time: string}};
    const observedAt = new Date(current.time + "Z").toISOString();
    if (!Number.isFinite(current.temperature_2m) || !Number.isFinite(current.surface_pressure) || current.surface_pressure < 500 || current.surface_pressure > 1100 || Math.abs(Date.now() - Date.parse(observedAt)) > 3600000) throw new Error("Invalid weather");
    const code = current.weather_code;
    value = {...base, mode: "live", temperature: Math.round(current.temperature_2m), pressure: Math.round(current.surface_pressure * 0.750062), observedAt,
      description: code === 0 ? "Ясно" : code <= 3 ? "Облачно" : code <= 48 ? "Туман" : code <= 67 ? "Дождь" : code <= 77 ? "Снег" : code <= 82 ? "Ливень" : code <= 86 ? "Снегопад" : "Гроза"};
  } catch { value = {...base, mode: "unavailable", description: "Источник погоды недоступен"}; }
  cached = {value, expires: Date.now() + (value.mode === "live" ? 300000 : 30000)};
  return value;
}
