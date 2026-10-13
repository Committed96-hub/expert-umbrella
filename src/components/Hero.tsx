import { usePhoto } from "./CityPhotos";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Wrench,
  Tag,
  CalendarDays,
  Stethoscope,
  Coffee,
  ScanSearch,
  MapPin,
  ArrowDown,
} from "lucide-react";
export type Shortcut =
  | "masters"
  | "deals"
  | "events"
  | "medical"
  | "cafes"
  | "lost"
  | "nearby";
export function Hero({
  onSearch,
  onShortcut,
}: {
  onSearch: (query: string) => void;
  onShortcut: (shortcut: Shortcut) => void;
}) {
  const { photo } = usePhoto("home");
  const [query, setQuery] = useState("");
  const shortcuts = [
    { id: "masters", label: "Мастера", Icon: Wrench },
    { id: "deals", label: "Акции", Icon: Tag },
    { id: "events", label: "Куда сходить", Icon: CalendarDays },
    { id: "medical", label: "Запись к врачу", Icon: Stethoscope },
    { id: "cafes", label: "Кафе", Icon: Coffee },
    { id: "lost", label: "Потери и находки", Icon: ScanSearch },
    { id: "nearby", label: "Рядом", Icon: MapPin },
  ] as const;
  return (
    <section className="hero" aria-label="Добро пожаловать в Новик 24">
      {photo && (
        <img
          className="hero-panorama"
          src={photo.original}
          alt={`${photo.object}, Новоуральск. Фото ${photo.author}`}
          fetchPriority="high"
          decoding="async"
        />
      )}
      <div className="hero-shade" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span /> НОВОУРАЛЬСК. ВАШ ГОРОД.
        </div>
        <p className="hero-wordmark">
          НОВИК <span>24</span>
        </p>
        <h1>
          Весь город.
          <br />
          <em>В одном месте.</em>
        </h1>
        <p className="hero-description">
          Знакомые места. Нужные люди. Новые возможности.
          <br />
          Всё, что рядом — теперь ближе.
        </p>
        <a className="hero-photo-link" href="#photos">
          Фотографии настоящего Новоуральска <ArrowUpRight size={16} />
        </a>
        <form
          className="hero-search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(query);
          }}
        >
          <label className="hero-search-caption" htmlFor="hero-city-query">
            Что вы хотите найти в Новоуральске?
          </label>
          <Search size={24} />
          <input
            id="hero-city-query"
            aria-label="Поиск на главной"
            placeholder="Что вы хотите найти в Новоуральске?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button aria-label="Найти в городе">
            <ArrowUpRight size={23} />
          </button>
        </form>
        <div className="hero-shortcuts">
          {shortcuts.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => onShortcut(id)}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="hero-bottom">
          <span>
            <MapPin size={14} /> На своём месте. Среди своих.
          </span>
          <a
            href="#discover"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("discover")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Открыть город <ArrowDown size={16} />
          </a>
        </div>
      </div>
      <span className="panorama-credit">Реальный Новоуральск · без ретуши</span>
    </section>
  );
}
