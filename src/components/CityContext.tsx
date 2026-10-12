import { useCityContext } from "./CityProvider";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { Cloud, Clock3, MapPin } from "lucide-react";
import { useRemote } from "../commerce/useRemote";
import type { CityWeather } from "../../shared/weather";
export function CityContext() {
  const city = useCityContext().data;
  const { data, error, retry } = useRemote<CityWeather>("/weather");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="city-context">
      <ThemeToggle />
      {city?.links.community && <a href={city.links.community} target="_blank" rel="noopener noreferrer">Подслушано Новоуральск ↗</a>}
      <span>
        <MapPin size={15} />
        Новоуральск
      </span>
      <span>
        <Clock3 size={15} />
        {new Intl.DateTimeFormat("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Yekaterinburg",
        }).format(now)}{" "}
        · Урал
      </span>
      {data?.mode === "live" ? (
        <span title={`Расчётная погода Open-Meteo · ${data.observedAt}`}>
          <Cloud size={16} />
          {(data.temperature ?? 0) > 0 ? "+" : ""}
          {data.temperature}° · {data.description} · {data.pressure} мм рт. ст.
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Open-Meteo</a>
        </span>
      ) : data ? <span>Источник погоды временно недоступен</span> : error ? (
        <button onClick={retry}>Погода недоступна · повторить</button>
      ) : (
        <span>Погода загружается…</span>
      )}
    </div>
  );
}
