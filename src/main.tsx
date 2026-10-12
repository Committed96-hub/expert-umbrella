import { CityModules } from "./components/CityModules";
import { PhotoProvider, SectionPhoto, PhotoSources } from "./components/CityPhotos";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  House,
  Wrench,
  ShoppingBag,
  Store,
  Search,
  Sparkles,
  MapPin,
  ArrowUpRight,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  X,
  ArrowRight,
  Send,
  ChevronRight,
  Leaf,
  Bell,
  CalendarDays,
  UserRound,
  Grid2X2,
  UtensilsCrossed,
  BriefcaseBusiness,
  Gift,
  Pill,
} from "lucide-react";
import { type Entry, type Section } from "./data";
import { repository, readStored, searchEntries, assistant } from "./repository";
import "./style.css";
import { AssistantPanel } from "./components/AssistantPanel";
import { Hero, type Shortcut } from "./components/Hero";
import { HomeCollections } from "./components/HomeCollections";
import { EntryVisual } from "./components/EntryVisual";
import { CityHub, CityDetails } from "./city/CityHub";
import { isCityEntry, type CityKind } from "./city/source";
import { Commerce } from "./commerce/Commerce";
import { httpApi } from "./api";
import { CityProvider } from "./components/CityProvider";
import { CityContext } from "./components/CityContext";
import { resolveRoute } from "./routes";
const nav = [
  { id: "jobs", label: "Работа", Icon: BriefcaseBusiness },
  { id: "online", label: "Город онлайн", Icon: MapPin },
  { id: "parks", label: "Парки и отдых", Icon: Leaf },
  { id: "malls", label: "Торговые центры", Icon: Store },
  { id: "feed", label: "Городская лента", Icon: House },
  { id: "services", label: "Услуги и мастера", Icon: Wrench },
  { id: "ads", label: "Объявления", Icon: ShoppingBag },
  { id: "shops", label: "Магазины и акции", Icon: Store },
  { id: "city", label: "Городские сервисы", Icon: CalendarDays },
  { id: "search", label: "Городской поиск", Icon: Search },
  { id: "assistant", label: "ИИ-помощник", Icon: Sparkles },
  { id: "exchange", label: "Биржа", Icon: BriefcaseBusiness },
  { id: "appointments", label: "Услуги и запись", Icon: CalendarDays },
  { id: "cafes", label: "Кафе и меню", Icon: UtensilsCrossed },
  { id: "cart", label: "Корзина", Icon: ShoppingBag },
  { id: "bonus", label: "Новик Бонус", Icon: Gift },
  { id: "pharmacy", label: "Аптеки", Icon: Pill },
] as const;
const titles: Record<Section, string> = {
  jobs: "Работа в своём городе", online: "Город онлайн", parks: "Время для прогулки", malls: "Торговые центры Новоуральска",
  feed: "Город рядом. Люди рядом.",
  services: "Нужный мастер — рядом",
  ads: "Вещи, возможности, соседи",
  shops: "Поддержите своих",
  search: "Весь город в одном поиске",
  assistant: "Спросите о городе",
  city: "Ваш город — под рукой",
  exchange: "Биржа городских дел",
  appointments: "Время для ваших планов",
  cafes: "Любимые вкусы рядом",
  cart: "Ваша корзина",
  bonus: "Новик Бонус",
  pharmacy: "Аптеки рядом",
};
const subtitles: Record<Section, string> = {
  jobs: "Проверенные предложения — после подключения источника.", online: "Только разрешённые публичные камеры.", parks: "Реальные парки и аллеи.", malls: "Комсомол и Кедр — будущие подтверждённые карточки.",
  feed: "Всё, чем живёт Новоуральск, в одном месте.",
  services: "Найдите помощь для дома, семьи и повседневных дел.",
  ads: "Покупайте, отдавайте и знакомьтесь с жителями города.",
  shops: "Открывайте местные магазины и приятные предложения.",
  search: "Новости, мастера, объявления и магазины.",
  assistant: "Поможем сориентироваться в демокаталоге Новоуральска.",
  city: "Расписание, адреса, здоровье и досуг в одном пространстве.",
  exchange: "Задания от соседей и демо-отклики.",
  appointments: "Выберите специалиста и демонстрационное время.",
  cafes: "Кафе, меню и демо-заказ без оплаты.",
  cart: "Проверьте demo-заказ — он не отправляется в кафе.",
  bonus: "Будущая программа привилегий. Все баллы demo.",
  pharmacy: "Будущий модуль. Реальная продажа лекарств отключена.",
};

function App() {
  const [section, setSection] = useState<Section>(
    () => resolveRoute(location.hash).section,
  );
  const [cityKind, setCityKind] = useState<CityKind>(
    () => resolveRoute(location.hash).cityKind,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Все");
  const [saved, setSaved] = useState<string[]>(() => {
    const v = readStored<unknown>("novik24.saved", []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  });
  const [liked, setLiked] = useState<string[]>([]);
  const [detail, setDetail] = useState<Entry | null>(null);
  const [create, setCreate] = useState(false);
  const [toast, setToast] = useState("");
  const [onlySaved, setOnlySaved] = useState(
    () => resolveRoute(location.hash).saved,
  );
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [comment, setComment] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const loaded = await repository.list();
      setEntries(loaded);
      const oldComments = readStored<Record<string, string[]>>(
        "novik24.comments",
        {},
      );
      if (
        oldComments &&
        typeof oldComments === "object" &&
        !Array.isArray(oldComments)
      ) {
        for (const [entryId, texts] of Object.entries(oldComments)) {
          if (Array.isArray(texts) && loaded.some((e) => e.id === entryId)) {
            for (const [index, text] of texts.entries())
              if (typeof text === "string" && text.trim())
                await httpApi.request("/comments", {
                  entryId,
                  text,
                  legacyId: `${entryId}-${index}`,
                });
          }
        }
        try {
          localStorage.removeItem("novik24.comments");
        } catch {}
      }
      setComments(await httpApi.request<Record<string, string[]>>("/comments"));
    } catch {
      setError("Не удалось загрузить каталог. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const handler = () => {
      const route = resolveRoute(location.hash);
      setSection(route.section);
      setCityKind(route.cityKind);
      setFilter("Все");
      setOnlySaved(route.saved);
      if (route.section !== "search" || route.saved) setQuery("");
      setDetail(null);
      setCreate(false);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!detail && !create) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previousFocus = document.activeElement as HTMLElement | null;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetail(null);
        setCreate(false);
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button:not(:disabled),.modal input,.modal textarea,.modal select",
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", close);
      previousFocus?.focus();
    };
  }, [detail, create]);
  function go(id: Section) {
    location.hash = id;
    setSection(id);
    setFilter("Все");
    setOnlySaved(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function bookmark(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("novik24.saved", JSON.stringify(next));
    } catch {
      setToast("Браузер не разрешил сохранить избранное");
    }
  }
  const base =
    section === "search"
      ? entries
      : entries.filter((x) => x.section === section);
  const categories = ["Все", ...new Set(base.map((x) => x.category))];
  const filtered = searchEntries(base, query).filter(
    (x) =>
      (filter === "Все" || x.category === filter) &&
      (!onlySaved || saved.includes(x.id)),
  );
  function searchCity(value: string) {
    location.hash = "search";
    setSection("search");
    setQuery(value);
    setFilter("Все");
    setOnlySaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function shortcut(id: Shortcut) {
    if (id === "masters") go("services");
    else if (id === "deals") go("shops");
    else if (id === "cafes") go("cafes");
    else if (id === "lost") searchCity("находки");
    else {
      const kind =
        id === "medical" ? "medical" : id === "nearby" ? "addresses" : "events";
      go("city");
      setCityKind(kind);
      location.hash = `city/${kind}`;
    }
  }
  return (
    <div
      className={`app-shell ${section === "feed" ? "home-screen" : ""} ${["exchange", "appointments", "cafes", "cart", "bonus", "pharmacy"].includes(section) ? "commerce-screen" : ""}`}
    >
      <header>
        <button
          className="brand"
          onClick={() => go("feed")}
          aria-label="Новик 24, главная"
        >
          новик<span>24</span>
          <i />
        </button>
        <nav className="desktop-top-nav" aria-label="Разделы">
          {nav
            .filter((n) =>
              ["feed", "services", "shops", "city", "ads"].includes(n.id),
            )
            .map(({ id, label }) => (
              <button
                key={id}
                className={section === id ? "active" : ""}
                onClick={() => go(id)}
              >
                {id === "feed"
                  ? "Главная"
                  : id === "services"
                    ? "Мастера"
                    : id === "shops"
                      ? "Места и акции"
                      : id === "city"
                        ? "Сервисы"
                        : label}
              </button>
            ))}
        </nav>
        <div className="location">
          <MapPin size={15} /> Новоуральск <span>⌄</span>
        </div>
        <form
          className="top-search"
          onSubmit={(e) => {
            e.preventDefault();
            location.hash = "search";
            setSection("search");
            setFilter("Все");
          }}
        >
          <Search size={18} />
          <input
            aria-label="Поиск по городу"
            placeholder="Что ищем в городе?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>↵</kbd>
        </form>
        <button
          className="icon-button"
          aria-label="Информация о деморежиме"
          onClick={() =>
            setToast(
              "Деморежим: уведомления появятся после подключения аккаунта.",
            )
          }
        >
          <Bell size={20} />
        </button>
        <button
          className="profile"
          onClick={() =>
            setToast("Вы в деморежиме. Авторизация — следующий этап.")
          }
          aria-label="Демопрофиль"
        >
          Д
        </button>
      </header>
      <CityContext />
      {section === "feed" && (
        <Hero onSearch={searchCity} onShortcut={shortcut} />
      )}
      <div className="layout">
        <aside className="sidebar">
          <div className="nav-caption">ВАШ ГОРОД</div>
          <nav aria-label="Главная навигация">
            {nav.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={section === id ? "active" : ""}
                aria-current={section === id ? "page" : undefined}
                onClick={() => go(id)}
              >
                <Icon size={20} />
                {label}
                {id === "assistant" && <span className="new">ДЕМО</span>}
              </button>
            ))}
          </nav>
          <button
            className="saved-nav"
            onClick={() => {
              location.hash = "search/saved";
              setSection("search");
              setQuery("");
              setFilter("Все");
              setOnlySaved(true);
            }}
          >
            <Bookmark size={19} />
            Избранное <span>{saved.length}</span>
          </button>
          <div className="neighbor">
            <div className="neighbor-icon">
              <Leaf size={23} />
            </div>
            <h3>Город начинается с нас</h3>
            <p>
              Поделитесь полезным.
              <br />
              Найдите своих. Будьте рядом.
            </p>
            <button onClick={() => setCreate(true)}>
              Добавить объявление <Plus size={16} />
            </button>
          </div>
          <div className="side-footer">
            Новоуральск, Свердловская область
            <br />
            Сделано для нашего города <Heart size={12} />
            <p>Первая версия · Все данные демонстрационные</p>
          </div>
        </aside>
        <main>
          <SectionPhoto section={section === "city" ? `city/${cityKind}` : section} />
          <div className="page-intro">
            <nav className="section-switcher" aria-label="Все разделы">
              {nav
                .filter(
                  (n) =>
                    n.id !== "feed" &&
                    ![
                      "exchange",
                      "appointments",
                      "cafes",
                      "cart",
                      "bonus",
                      "pharmacy",
                    ].includes(n.id),
                )
                .map(({ id, label }) => (
                  <button
                    key={id}
                    className={section === id ? "selected" : ""}
                    onClick={() => go(id)}
                  >
                    {label}
                  </button>
                ))}
            </nav>
            <div className="eyebrow">
              <span /> НОВОУРАЛЬСК · ДЕМОПЛАТФОРМА
            </div>
            <div className="title-row">
              <div>
                <h1>{titles[section]}</h1>
                <p className="subtitle">{subtitles[section]}</p>
              </div>
              <button
                className="primary add-desktop"
                onClick={() => setCreate(true)}
              >
                <Plus size={17} />
                Добавить
              </button>
            </div>
          </div>
          <nav className="journey-nav" aria-label="Городской путь">
            {[
              { id: "feed", label: "Город" },
              { id: "ads", label: "Объявления" },
              { id: "exchange", label: "Биржа" },
              { id: "appointments", label: "Услуги и запись" },
              { id: "cafes", label: "Кафе и меню" },
              { id: "cart", label: "Корзина" },
              { id: "bonus", label: "Новик Бонус" },
            ].map((x) => (
              <button
                key={x.id}
                className={section === x.id ? "selected" : ""}
                onClick={() => go(x.id as Section)}
              >
                {x.label}
              </button>
            ))}
          </nav>
          {section === "feed" && !loading && !error && (
            <HomeCollections
              entries={entries}
              onOpen={setDetail}
              onShortcut={shortcut}
              onAssistant={() => go("assistant")}
              onAds={() => go("ads")}
              saved={saved}
              onSave={bookmark}
            />
          )}
          {loading ? (
            <div className="empty" role="status" aria-live="polite">
              <h3>Загружаем город…</h3>
              <p>Собираем полезное в одном месте.</p>
            </div>
          ) : error ? (
            <div className="empty" role="alert">
              <h3>Город пока недоступен</h3>
              <p>{error}</p>
              <button className="primary" onClick={load}>
                Повторить загрузку
              </button>
            </div>
          ) : [
              "exchange",
              "cafes",
              "cart",
              "bonus",
              "pharmacy",
              "appointments",
            ].includes(section) ? (
            <Commerce section={section} entries={entries} go={go} />
          ) : ["jobs", "online", "parks", "malls"].includes(section) ? (
            <CityModules section={section} />
          ) : section === "city" ? (
            <CityHub
              key={cityKind}
              entries={entries.filter(isCityEntry)}
              kind={cityKind}
              onKindChange={(kind) => {
                setCityKind(kind);
                location.hash = `city/${kind}`;
              }}
              onOpen={setDetail}
              onSave={bookmark}
              saved={saved}
            />
          ) : section === "assistant" ? (
            <AssistantPanel entries={entries} notify={setToast} />
          ) : (
            <>
              <div className="section-heading">
                <h2>
                  {section === "feed"
                    ? "Городская лента"
                    : section === "search"
                      ? onlySaved
                        ? "Избранное"
                        : "Результаты поиска"
                      : nav.find((x) => x.id === section)?.label}
                </h2>
                <span>
                  {filtered.length}{" "}
                  {section === "feed" ? "публикации" : "найдено"}
                </span>
              </div>
              {section !== "feed" && (
                <div className="local-search">
                  <Search size={19} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      section === "search"
                        ? "Название, категория или ключевое слово"
                        : "Поиск в разделе"
                    }
                    aria-label="Поиск в разделе"
                  />
                  {query && (
                    <button
                      aria-label="Очистить поиск"
                      onClick={() => setQuery("")}
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>
              )}
              <div className="filters">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={filter === c ? "selected" : ""}
                    onClick={() => setFilter(c)}
                  >
                    {c}
                  </button>
                ))}
                {section === "search" && (
                  <button
                    className={onlySaved ? "selected" : ""}
                    onClick={() => setOnlySaved(!onlySaved)}
                  >
                    <Bookmark size={14} />
                    Избранное
                  </button>
                )}
              </div>
              <div
                className={section === "feed" ? "feed-cards" : "catalog-grid"}
              >
                {filtered.map((entry) => (
                  <article className="card" key={entry.id}>
                    {section === "feed" ? (
                      <>
                        <div className="post-top">
                          <div className="avatar">
                            {entry.author.slice(0, 1)}
                          </div>
                          <div>
                            <b>{entry.author}</b>
                            <small>{entry.meta}</small>
                          </div>
                          <button
                            className={`icon-button ${saved.includes(entry.id) ? "marked" : ""}`}
                            aria-label="Сохранить публикацию"
                            aria-pressed={saved.includes(entry.id)}
                            onClick={() => bookmark(entry.id)}
                          >
                            <Bookmark size={18} />
                          </button>
                        </div>
                        {(entry.section !== "feed" || entry.art) && (
                          <button
                            className="art-button"
                            onClick={() => {
                              setDetail(entry);
                              setComment("");
                            }}
                            aria-label={`Читать: ${entry.title}`}
                          >
                            <EntryVisual entry={entry} />
                          </button>
                        )}
                        <div className="card-body">
                          <span className="tag">{entry.category}</span>
                          {isCityEntry(entry) && (
                            <span className="demo-badge">
                              {entry.source.mode}
                            </span>
                          )}
                          <button
                            className="title-button"
                            onClick={() => {
                              setDetail(entry);
                              setComment("");
                            }}
                          >
                            <h2>{entry.title}</h2>
                          </button>
                          <p>{entry.text}</p>
                        </div>
                        <div className="post-bottom">
                          <button
                            className={liked.includes(entry.id) ? "marked" : ""}
                            aria-pressed={liked.includes(entry.id)}
                            onClick={() =>
                              setLiked((l) =>
                                l.includes(entry.id)
                                  ? l.filter((x) => x !== entry.id)
                                  : [...l, entry.id],
                              )
                            }
                          >
                            <Heart size={17} />
                            {12 + (liked.includes(entry.id) ? 1 : 0)}
                          </button>
                          <button
                            onClick={() => {
                              setDetail(entry);
                              setComment("");
                            }}
                          >
                            <MessageCircle size={17} />
                            {(comments[entry.id] || []).length} комментариев
                          </button>
                          <span>Демопубликация</span>
                        </div>
                      </>
                    ) : (
                      <>
                        {(entry.section !== "feed" || entry.art) && (
                          <button
                            className="art-button"
                            onClick={() => setDetail(entry)}
                            aria-label={entry.title}
                          >
                            <EntryVisual entry={entry} />
                          </button>
                        )}
                        <div className="card-body">
                          <div className="card-tag-row">
                            <span className="tag">{entry.category}</span>
                            {isCityEntry(entry) && (
                              <span className="demo-badge">
                                {entry.source.mode}
                              </span>
                            )}
                            <button
                              className={`icon-button ${saved.includes(entry.id) ? "marked" : ""}`}
                              onClick={() => bookmark(entry.id)}
                              aria-label="Сохранить"
                              aria-pressed={saved.includes(entry.id)}
                            >
                              <Bookmark size={18} />
                            </button>
                          </div>
                          <button
                            className="title-button"
                            onClick={() => setDetail(entry)}
                          >
                            <h2>{entry.title}</h2>
                          </button>
                          {entry.rating && (
                            <div className="rating">★ {entry.rating}</div>
                          )}
                          <p>{entry.text}</p>
                          <small>{entry.meta}</small>
                          <div className="catalog-bottom">
                            <b>{entry.price || "Узнать больше"}</b>
                            <button
                              aria-label={`Подробнее: ${entry.title}`}
                              onClick={() => setDetail(entry)}
                            >
                              <span>Подробнее</span>
                              <ArrowUpRight size={19} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="empty">
                  <Search size={30} />
                  <h3>Пока ничего не найдено</h3>
                  <p>Попробуйте другое слово или сбросьте фильтры.</p>
                  <button
                    className="primary"
                    onClick={() => {
                      setQuery("");
                      setFilter("Все");
                      setOnlySaved(false);
                    }}
                  >
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </>
          )}
          <PhotoSources />
        </main>
        <aside className="rightbar">
          <div className="city-card">
            <div className="city-top">
              <span>Наш Новоуральск</span>
              <Leaf size={19} />
            </div>
            <h3>
              Маленький город.
              <br />
              Большое сообщество.
            </h3>
            <p>Полезное, интересное и важное — от людей рядом.</p>
            <div className="city-lines" />
            <span className="city-label">
              <MapPin size={13} /> Урал · дом, который объединяет
            </span>
          </div>
          <div className="widget">
            <div className="widget-title">
              <h3>На этой неделе</h3>
              <span className="tag">Демо</span>
            </div>
            {[
              {
                day: "17",
                month: "ОКТ",
                title: "Прогулка по осеннему лесу",
                text: "Суббота · 11:00",
              },
              {
                day: "18",
                month: "ОКТ",
                title: "Книжный обмен",
                text: "Воскресенье · 12:00",
              },
            ].map((x) => (
              <button
                className="event"
                key={x.day}
                onClick={() => {
                  go("city");
                  setCityKind("events");
                  location.hash = "city/events";
                }}
              >
                <div className="date">
                  <b>{x.day}</b>
                  <small>{x.month}</small>
                </div>
                <div>
                  <b>{x.title}</b>
                  <small>{x.text}</small>
                </div>
                <ChevronRight size={15} />
              </button>
            ))}
            <p className="widget-note">Примеры событий, не реальная афиша</p>
          </div>
          <div className="ai-card">
            <Sparkles size={23} />
            <h3>Не знаете, где искать?</h3>
            <p>
              Помощник подберёт варианты
              <br />
              из городского демокаталога.
            </p>
            <button onClick={() => go("assistant")}>
              Задать вопрос <ArrowRight size={17} />
            </button>
          </div>
          <div className="widget">
            <h3>Быть хорошим соседом просто</h3>
            <p className="rules">
              Уважайте друг друга, делитесь полезным и проверяйте информацию.
            </p>
            <span className="tag">Добро пожаловать в город</span>
          </div>
        </aside>
      </div>
      <nav className="mobile-nav" aria-label="Мобильная навигация">
        {[
          {
            id: "feed",
            label: "Главная",
            Icon: House,
            action: () => go("feed"),
          },
          {
            id: "search",
            label: "Поиск",
            Icon: Search,
            action: () => go("search"),
          },
          {
            id: "nearby",
            label: "Рядом",
            Icon: MapPin,
            action: () => shortcut("nearby"),
          },
          {
            id: "city",
            label: "Сервисы",
            Icon: Grid2X2,
            action: () => go("city"),
          },
          {
            id: "profile",
            label: "Профиль",
            Icon: UserRound,
            action: () =>
              setToast("Вы в деморежиме. Авторизация — следующий этап."),
          },
        ].map(({ id, label, Icon, action }) => (
          <button
            key={id}
            className={
              (section === id &&
                !(id === "city" && cityKind === "addresses")) ||
              (id === "nearby" &&
                section === "city" &&
                cityKind === "addresses")
                ? "active"
                : ""
            }
            onClick={action}
            aria-label={label}
          >
            <Icon size={21} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {(detail || create) && (
        <div
          className="overlay"
          onClick={() => {
            setDetail(null);
            setCreate(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              autoFocus
              aria-label="Закрыть"
              onClick={() => {
                setDetail(null);
                setCreate(false);
              }}
            >
              <X />
            </button>
            {create ? (
              <>
                <span className="tag">От соседей — соседям</span>
                <h2 id="modal-title">Добавить объявление</h2>
                <p>
                  Демо-объявление сохранится на сервере для вашей демосессии.
                </p>
                <form
                  className="create-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const title = String(f.get("title")).trim(),
                      text = String(f.get("text")).trim();
                    if (!title || !text) {
                      setToast("Заполните название и описание");
                      return;
                    }
                    try {
                      const entry = await repository.createAd({
                        title,
                        text,
                        category: String(f.get("category")),
                        price:
                          String(f.get("price")).trim() || "По договорённости",
                      });
                      setEntries((v) => [entry, ...v]);
                      setCreate(false);
                      go("ads");
                      setToast("Объявление добавлено на демо-сервер");
                    } catch {
                      setToast(
                        "Не удалось сохранить объявление на сервере. Повторите запрос.",
                      );
                    }
                  }}
                >
                  <label>
                    Название
                    <input
                      name="title"
                      required
                      maxLength={100}
                      placeholder="Например, отдам детский велосипед"
                    />
                  </label>
                  <label>
                    Категория
                    <select name="category">
                      {[
                        "Вещи",
                        "Отдам даром",
                        "Знакомства",
                        "Недвижимость",
                        "Работа",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Описание
                    <textarea
                      name="text"
                      required
                      maxLength={2000}
                      rows={4}
                      placeholder="Расскажите подробнее"
                    />
                  </label>
                  <label>
                    Цена
                    <input
                      name="price"
                      maxLength={40}
                      placeholder="Например, 2 000 ₽ или бесплатно"
                    />
                  </label>
                  <button className="primary">Добавить объявление</button>
                </form>
              </>
            ) : (
              detail && (
                <>
                  <span className="tag">{detail.category}</span>
                  <h2 id="modal-title">{detail.title}</h2>
                  <p className="detail-meta">
                    {detail.author} · {detail.meta}
                  </p>
                  {<EntryVisual entry={detail} />}
                  <p>{detail.text}</p>
                  {detail.section === "services" && (
                    <button
                      className="primary journey-next"
                      onClick={() => {
                        setDetail(null);
                        go("appointments");
                        location.hash = `appointments/${detail.id}`;
                      }}
                    >
                      Выбрать demo-время
                    </button>
                  )}
                  {isCityEntry(detail) && <CityDetails entry={detail} />}{" "}
                  {detail.price && <h3>{detail.price}</h3>}
                  <p className="demo-note">
                    Демонстрационные данные. Контакты и адреса вымышлены;
                    реальные сделки недоступны.
                  </p>
                  <button
                    className="secondary"
                    onClick={() => bookmark(detail.id)}
                  >
                    <Bookmark size={17} />
                    {saved.includes(detail.id)
                      ? "Убрать из избранного"
                      : "Сохранить в избранное"}
                  </button>
                  {detail.section === "feed" && (
                    <div className="comments">
                      <h3>Обсуждение</h3>
                      {(comments[detail.id] || []).map((c, i) => (
                        <p key={i}>
                          <b>Вы:</b> {c}
                        </p>
                      ))}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!comment.trim()) return;
                          try {
                            setComments(
                              await httpApi.request<Record<string, string[]>>(
                                "/comments",
                                { entryId: detail.id, text: comment.trim() },
                              ),
                            );
                            setComment("");
                          } catch (error) {
                            setToast(
                              error instanceof Error
                                ? error.message
                                : "Не удалось сохранить комментарий",
                            );
                          }
                        }}
                      >
                        <input
                          aria-label="Комментарий"
                          placeholder="Поделитесь своим мнением"
                          maxLength={1000}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                          className="primary"
                          disabled={!comment.trim()}
                          aria-label="Добавить комментарий"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CityProvider>
      <PhotoProvider><App /></PhotoProvider>
    </CityProvider>
  </React.StrictMode>,
);
