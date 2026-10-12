import { useEffect, useState } from "react";
import { Cloud, Clock3, MapPin } from "lucide-react";
import { useCityContext } from "./CityProvider";
export function CityContext() {
  const { data, error, retry } = useCityContext();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="city-context">
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
      {data ? (
        <span>
          <Cloud size={16} />
          {data.weather.temperature > 0 ? "+" : ""}
          {data.weather.temperature}° · {data.weather.description} <b>demo</b>
        </span>
      ) : error ? (
        <button onClick={retry}>Погода недоступна · повторить</button>
      ) : (
        <span>Погода загружается…</span>
      )}
    </div>
  );
}
