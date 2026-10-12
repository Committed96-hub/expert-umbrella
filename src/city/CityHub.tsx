import { useMemo, useState } from "react";
import {
  Bus,
  MapPin,
  Stethoscope,
  Clapperboard,
  CalendarDays,
  Search,
  Bookmark,
  ArrowUpRight,
} from "lucide-react";
import { type CityEntry, type CityKind, formatCityDate } from "./source";
export const cityTabs = [
  { id: "schedule", label: "Расписание", Icon: Bus },
  { id: "addresses", label: "Адреса", Icon: MapPin },
  { id: "medical", label: "Медицинские талоны", Icon: Stethoscope },
  { id: "cinema", label: "Киносеансы", Icon: Clapperboard },
  { id: "events", label: "События", Icon: CalendarDays },
] as const;
export function CityDetails({ entry }: { entry: CityEntry }) {
  return (
    <div className="city-details">
      <div className="source-label">
        {entry.source.mode} · {entry.source.name}
      </div>
      <p>
        <MapPin size={15} /> {entry.address}
      </p>
      {entry.date && (
        <p>
          <CalendarDays size={15} /> {formatCityDate(entry.date)}
        </p>
      )}
      <div className="time-slots" aria-label="Время">
        {entry.times.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {entry.availability !== undefined && (
        <p>
          {entry.availability
            ? `${entry.availability} демонстрационных окна`
            : "Свободных окон в примере нет"}
          . Реальная запись недоступна.
        </p>
      )}
      <small>
        Обновление источника:{" "}
        {new Intl.DateTimeFormat("ru-RU", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Yekaterinburg",
        }).format(new Date(entry.source.updatedAt))}{" "}
        · время Урала
      </small>
    </div>
  );
}
export function CityHub({
  entries,
  kind,
  onKindChange,
  onOpen,
  onSave,
  saved,
}: {
  entries: CityEntry[];
  kind: CityKind;
  onKindChange: (kind: CityKind) => void;
  onOpen: (entry: CityEntry) => void;
  onSave: (id: string) => void;
  saved: string[];
}) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Все"),
    [date, setDate] = useState(""),
    [available, setAvailable] = useState(false);
  const base = useMemo(
    () => entries.filter((e) => e.kind === kind),
    [entries, kind],
  );
  const categories = ["Все", ...new Set(base.map((e) => e.category))];
  const results = base.filter(
    (e) =>
      (category === "Все" || category === e.category) &&
      (!date || e.date === date) &&
      (!available || (e.availability ?? 0) > 0) &&
      query
        .toLocaleLowerCase("ru")
        .trim()
        .split(/\s+/)
        .every((q) =>
          `${e.title} ${e.category} ${e.address} ${e.text}`
            .toLocaleLowerCase("ru")
            .includes(q),
        ),
  );
  function change(next: CityKind) {
    setQuery("");
    setCategory("Все");
    setDate("");
    setAvailable(false);
    onKindChange(next);
  }
  return (
    <section className="city-hub" aria-label="Городские сервисы">
      <div className="city-tabs" aria-label="Разделы городских сервисов">
        {cityTabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={id === kind ? "selected" : ""}
            aria-current={id === kind ? "page" : undefined}
            onClick={() => change(id)}
          >
            <Icon size={19} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="source-banner">
        <b>demo · Демонстрационные данные</b>
        <p>
          Расписания, адреса, талоны, фильмы и события вымышлены. Актуальные
          источники пока не подключены.
          {kind === "medical"
            ? " Это не реальные свободные талоны; запись к врачу недоступна."
            : ""}
        </p>
      </div>
      <div className="local-search">
        <Search size={18} />
        <input
          aria-label="Поиск городских сервисов"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название, адрес или категория"
        />
      </div>
      <div className="filters">
        {categories.map((c) => (
          <button
            key={c}
            className={c === category ? "selected" : ""}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {["medical", "cinema", "events"].includes(kind) && (
        <div className="city-filter-row">
          <label>
            Дата{" "}
            <input
              type="date"
              aria-label="Дата"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          {kind === "medical" && (
            <label>
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />{" "}
              Только с окнами · demo
            </label>
          )}
          {date && <button onClick={() => setDate("")}>Все даты</button>}
        </div>
      )}
      <p className="result-count" role="status">
        Найдено: {results.length}
      </p>
      <div className="catalog-grid">
        {results.map((e) => (
          <article className="card city-service-card" key={e.id}>
            <div className="card-body">
              <div className="card-tag-row">
                <span className="tag">{e.category}</span>
                <span className="demo-badge">{e.source.mode}</span>
                <button
                  className={`icon-button ${saved.includes(e.id) ? "marked" : ""}`}
                  aria-label={`Сохранить: ${e.title}`}
                  aria-pressed={saved.includes(e.id)}
                  onClick={() => onSave(e.id)}
                >
                  <Bookmark size={18} />
                </button>
              </div>
              <button className="title-button" onClick={() => onOpen(e)}>
                <h2>{e.title}</h2>
              </button>
              <p>{e.address}</p>
              {e.date && <p>{formatCityDate(e.date)}</p>}
              <div className="time-slots">
                {e.times.slice(0, 4).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {e.availability === 0 && <p>Свободных окон в примере нет</p>}
              <div className="catalog-bottom">
                <b>{e.price || "Данные demo"}</b>
                <button
                  aria-label={`Подробнее: ${e.title}`}
                  onClick={() => onOpen(e)}
                >
                  <ArrowUpRight size={19} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!results.length && (
        <div className="empty">
          <Search size={28} />
          <h3>Ничего не найдено</h3>
          <p>Измените запрос или дату.</p>
          <button
            className="primary"
            onClick={() => {
              setQuery("");
              setCategory("Все");
              setDate("");
              setAvailable(false);
            }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </section>
  );
}
