import {
  ArrowUpRight,
  Flame,
  Tag,
  Star,
  CalendarDays,
  Coffee,
  Stethoscope,
  MapPin,
  ScanSearch,
  Bookmark,
} from "lucide-react";
import type { Entry } from "../data";
import { EntryVisual } from "./EntryVisual";
import { isCityEntry } from "../city/source";
import type { Shortcut } from "./Hero";
export function HomeCollections({
  entries,
  onOpen,
  onShortcut,
  onAssistant,
  onAds,
  saved,
  onSave,
}: {
  entries: Entry[];
  onOpen: (entry: Entry) => void;
  onShortcut: (id: Shortcut) => void;
  onAssistant: () => void;
  onAds: () => void;
  saved: string[];
  onSave: (id: string) => void;
}) {
  const collections = [
    {
      id: "events",
      title: "Сейчас в городе",
      note: "Маленькие поводы выйти из дома",
      Icon: Flame,
      items: entries.filter((e) => isCityEntry(e) && e.kind === "events"),
    },
    {
      id: "deals",
      title: "Лучшие акции сегодня",
      note: "Приятные предложения от своих",
      Icon: Tag,
      items: entries.filter((e) => e.section === "shops"),
    },
    {
      id: "masters",
      title: "Лучшие мастера",
      note: "Люди, которым можно доверить дело",
      Icon: Star,
      items: entries.filter((e) => e.section === "services"),
    },
    {
      id: "events",
      title: "Куда сходить",
      note: "Вечер, который хочется запомнить",
      Icon: CalendarDays,
      items: entries.filter(
        (e) => isCityEntry(e) && ["events", "cinema"].includes(e.kind),
      ),
    },
    {
      id: "cafes",
      title: "Где поесть",
      note: "Тёплые встречи и любимый кофе",
      Icon: Coffee,
      items: entries.filter(
        (e) => e.section === "shops" && e.category === "Еда и кофе",
      ),
    },
    {
      id: "medical",
      title: "Запись к врачу",
      note: "Демонстрационные окна, без реальной записи",
      Icon: Stethoscope,
      items: entries.filter((e) => isCityEntry(e) && e.kind === "medical"),
    },
    {
      id: "nearby",
      title: "Рядом с вами",
      note: "Места в городском демокаталоге · без геолокации",
      Icon: MapPin,
      items: entries.filter((e) => isCityEntry(e) && e.kind === "addresses"),
    },
    {
      id: "lost",
      title: "Потери и находки",
      note: "Помогайте нужным вещам возвращаться домой",
      Icon: ScanSearch,
      items: entries.filter(
        (e) =>
          e.section === "ads" &&
          /потер|найден|находк/i.test(e.category + " " + e.title),
      ),
    },
  ] as const;
  return (
    <div id="discover" className="discover">
      <div className="discover-intro">
        <div>
          <span className="eyebrow">ГОРОД ЖИВЁТ. ВЫ — В ЦЕНТРЕ.</span>
          <h2>Ближе, чем кажется.</h2>
        </div>
        <span className="demo-pill">Подборки · demo</span>
      </div>
      {collections.map(({ id, title, note, Icon, items }, i) => (
        <section className="collection" key={`${id}-${i}`}>
          <div className="collection-heading">
            <div>
              <h2>
                <Icon size={21} />
                {title}
              </h2>
              <p>{note}</p>
            </div>
            <button onClick={() => onShortcut(id)}>
              Смотреть всё <ArrowUpRight size={17} />
            </button>
          </div>
          {items.length ? (
            <div className="collection-rail">
              {items.slice(0, 4).map((entry) => (
                <article className="discovery-card" key={entry.id}>
                  <button
                    className="discovery-photo"
                    onClick={() => onOpen(entry)}
                    aria-label={`Открыть: ${entry.title}`}
                  >
                    <EntryVisual entry={entry} />
                  </button>
                  <button
                    className={`discovery-save ${saved.includes(entry.id) ? "marked" : ""}`}
                    onClick={() => onSave(entry.id)}
                    aria-label={`Сохранить: ${entry.title}`}
                    aria-pressed={saved.includes(entry.id)}
                  >
                    <Bookmark size={18} />
                  </button>
                  <div className="discovery-body">
                    <div className="discovery-meta">
                      <span>{entry.category}</span>
                      {entry.rating && (
                        <span className="rating">
                          ★ {entry.rating.split(" · ")[0]}
                        </span>
                      )}
                    </div>
                    <button
                      className="title-button"
                      onClick={() => onOpen(entry)}
                    >
                      <h3>{entry.title}</h3>
                    </button>
                    <p>{isCityEntry(entry) ? entry.address : entry.meta}</p>
                    <div className="discovery-bottom">
                      <b>
                        {entry.price ||
                          (isCityEntry(entry) &&
                          entry.availability !== undefined
                            ? `${entry.availability} окна · demo`
                            : "Подробнее")}
                      </b>
                      <button
                        aria-label={`Подробнее: ${entry.title}`}
                        onClick={() => onOpen(entry)}
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="collection-empty">
              <ScanSearch size={25} />
              <p>Пока нет публикаций о потерях и находках.</p>
              <button onClick={() => onShortcut(id)}>
                Открыть поиск <ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </section>
      ))}
      <div className="home-community">
        <button onClick={onAds}>
          <div>
            <span className="eyebrow">ОТ СОСЕДЕЙ — СОСЕДЯМ</span>
            <h3>Объявления жителей</h3>
            <p>Находите нужное. Делитесь полезным.</p>
          </div>
          <ArrowUpRight size={24} />
        </button>
        <button onClick={onAssistant}>
          <div>
            <span className="eyebrow">ПОМОЩНИК · DEMO</span>
            <h3>С чего начать?</h3>
            <p>Спросите — подскажем, где искать.</p>
          </div>
          <ArrowUpRight size={24} />
        </button>
      </div>
    </div>
  );
}
