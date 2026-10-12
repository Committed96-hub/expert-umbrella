import { createContext, useContext, useState, type ReactNode } from "react";
import { ArrowUpRight, Bookmark, CheckCircle2, Search } from "lucide-react";
import type { RealSnapshot, RealObject } from "../../shared/real";
import { useRemote, RemoteState } from "../commerce/useRemote";
import { readStored } from "../repository";
import { httpApi } from "../api";
import { usePhotoById, VerifiedPhoto } from "../components/CityPhotos";
const Context = createContext<ReturnType<
  typeof useRemote<RealSnapshot>
> | null>(null);
export function RealCityProvider({ children }: { children: ReactNode }) {
  const remote = useRemote<RealSnapshot>("/real-city");
  return <Context.Provider value={remote}>{children}</Context.Provider>;
}
export function useRealCity() {
  const state = useContext(Context);
  if (!state) throw new Error("RealCityProvider missing");
  return state;
}
function ObjectPhoto({ object }: { object: RealObject }) {
  const photo = usePhotoById(object.photoId);
  return photo && object.photoStatus === "licensed" ? (
    <VerifiedPhoto photo={photo} />
  ) : (
    <div className="real-no-photo">
      Фото не опубликовано: разрешение не подтверждено
    </div>
  );
}
function SourceDetails({ object }: { object: RealObject }) {
  return (
    <details className="source-details">
      <summary>Источники и достоверность</summary>
      <p>
        Проверка источника: {object.verifiedAt}. Дата сведений:{" "}
        {object.validAt || "Не опубликована"}. Автоматическое обновление не
        подключено. Перед покупкой или посещением уточняйте сведения у
        источника.
      </p>
      {object.sources.map((source) => (
        <div key={source.url}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            {source.name} ↗
          </a>
          <p>
            {source.method === "search_index"
              ? "Подтверждено индексом поиска; прямая страница при проверке недоступна."
              : "Проверена публичная страница."}{" "}
            Поля: {source.covers.join(", ")}.
          </p>
          <small>{source.terms}</small>
        </div>
      ))}
    </details>
  );
}
function JobDemo({ object }: { object: RealObject }) {
  const [message, setMessage] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="job-demo"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setNotice("");
        try {
          const response = await httpApi.request<{ id: string }>("/job-demo", {
            jobId: object.id,
            message,
          });
          setNotice(
            `DEMO-отклик ${response.id} сохранён. Работодателю ничего не отправлено.`,
          );
          setMessage("");
        } catch (e) {
          setNotice(e instanceof Error ? e.message : "Ошибка сохранения");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h4>DEMO-отклик</h4>
      <p>
        Учебный черновик, без отправки работодателю. Используйте тестовый текст.
      </p>
      <label>
        Тестовое сообщение
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={1000}
        />
      </label>
      <button className="primary" disabled={busy || !message.trim()}>
        Сохранить DEMO-отклик
      </button>
      <p role="status">{notice}</p>
    </form>
  );
}
export function RealCatalog({
  section,
  query = "",
  initialSaved = false,
}: {
  section: string;
  query?: string;
  initialSaved?: boolean;
}) {
  const remote = useRealCity();
  const [local, setLocal] = useState(""),
    [category, setCategory] = useState("Все"),
    [onlySaved, setOnlySaved] = useState(initialSaved);
  const [saved, setSaved] = useState<string[]>(() => {
    const v = readStored<unknown>("novik24.real.saved.v1", []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  });
  const [compare, setCompare] = useState<string[]>([]),
    [storageError, setStorageError] = useState("");
  const general = section === "search" || section === "assistant";
  const all = (remote.data?.objects || []).filter(
    (o) => general || o.sections.includes(section),
  );
  if (!all.length && !remote.loading && !remote.error) return null;
  const terms = (query + " " + local)
    .toLocaleLowerCase("ru")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const list = all.filter(
    (o) =>
      (category === "Все" || o.category === category) &&
      (!onlySaved || saved.includes(o.id)) &&
      terms.every((t) =>
        `${o.title} ${o.summary} ${Object.values(o.fields).join(" ")}`
          .toLocaleLowerCase("ru")
          .includes(t),
      ),
  );
  function save(id: string) {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    window.dispatchEvent(
      new CustomEvent("novik24-real-saved", { detail: next.length }),
    );
    try {
      localStorage.setItem("novik24.real.saved.v1", JSON.stringify(next));
    } catch {
      setStorageError(
        "Избранное сохранено только до закрытия страницы. Хранилище браузера недоступно.",
      );
    }
  }
  const compared = (remote.data?.objects || []).filter((o) =>
    compare.includes(o.id),
  );
  return (
    <section
      className="real-panel"
      aria-label="Проверяемые сведения о Новоуральске"
    >
      <div className="real-panel-title">
        <div>
          <span className="real-badge">
            <CheckCircle2 size={14} /> REAL · ИСТОЧНИКИ
          </span>
          <h2>
            {section === "cars"
              ? "Автомобили Новоуральска"
              : "Реальный Новоуральск"}
          </h2>
        </div>
        <span>Снимок сведений · {remote.data?.version || "загрузка"}</span>
      </div>
      <p className="real-intro">
        Реальные объекты и опубликованные сведения. Неизвестные поля не
        заполняем. Учебные заказы и цены отдельно помечены DEMO.
      </p>
      {remote.loading || remote.error ? (
        <RemoteState {...remote} />
      ) : (
        <>
          <div className="real-toolbar">
            <label>
              <Search size={17} />
              <input
                aria-label="Поиск реальных объектов"
                placeholder="Найти реальный объект"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </label>
            <label className="real-check">
              <input
                type="checkbox"
                checked={onlySaved}
                onChange={(e) => setOnlySaved(e.target.checked)}
              />
              Моё избранное
            </label>
          </div>
          <div
            className="real-filters"
            aria-label="Категории реальных объектов"
          >
            {["Все", ...new Set(all.map((o) => o.category))].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                className={category === c ? "selected" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {!!storageError && <p role="status">{storageError}</p>}
          {!list.length && (
            <div className="empty">
              <p>Совпадений среди реальных объектов нет.</p>
              <button
                onClick={() => {
                  setLocal("");
                  setCategory("Все");
                  setOnlySaved(false);
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
          <div className="real-grid">
            {list.map((object) => (
              <article
                className="real-card"
                key={object.id}
                data-real-id={object.id}
              >
                <div className="real-card-head">
                  <span className="tag">{object.category}</span>
                  <button
                    className="icon-button"
                    aria-label={`Сохранить ${object.title}`}
                    aria-pressed={saved.includes(object.id)}
                    onClick={() => save(object.id)}
                  >
                    <Bookmark size={18} />
                  </button>
                </div>
                <h3>{object.title}</h3>
                <span className={`reliability reliability-${object.status}`}>
                  {object.status === "archived"
                    ? "АРХИВ · не актуальная продажа"
                    : object.status === "partial"
                      ? "Часть информации уточняется"
                      : "Подтверждено источником"}
                </span>
                <p>{object.summary}</p>
                <details className="real-details">
                  <summary>Подробнее: {object.title}</summary>
                  <ObjectPhoto object={object} />
                  <dl className="real-fields">
                    {Object.entries(object.fields).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value ?? "Информация уточняется"}</dd>
                      </div>
                    ))}
                  </dl>
                  <SourceDetails object={object} />
                  {object.demoAction === "job" && <JobDemo object={object} />}
                  {object.relatedIds && (
                    <div className="real-related">
                      <h4>Объекты и магазины</h4>
                      {object.relatedIds.map((id) => {
                        const child = remote.data?.objects.find(
                          (o) => o.id === id,
                        );
                        return child ? (
                          <details key={id}>
                            <summary>{child.title}</summary>
                            <p>{child.summary}</p>
                            <dl className="real-fields">
                              {Object.entries(child.fields).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <dt>{key}</dt>
                                    <dd>{value ?? "Информация уточняется"}</dd>
                                  </div>
                                ),
                              )}
                            </dl>
                            <SourceDetails object={child} />
                            {child.actionUrl && (
                              <a
                                href={child.actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {child.actionLabel} ↗
                              </a>
                            )}
                          </details>
                        ) : null;
                      })}
                    </div>
                  )}
                </details>
                <div className="real-actions">
                  {object.actionUrl && (
                    <a
                      className="secondary"
                      href={object.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {object.actionLabel}
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                  {object.demoAction === "cinema" && (
                    <a className="primary" href="#cinema">
                      Пройти DEMO-покупку билета
                    </a>
                  )}
                  {object.demoAction === "solo" && (
                    <a className="primary" href="#cafes/solo-demo">
                      Открыть отдельное DEMO-меню
                    </a>
                  )}
                </div>
                {object.category === "Автомобили" && (
                  <label className="real-check">
                    <input
                      type="checkbox"
                      aria-label={`Сравнить ${object.title}`}
                      checked={compare.includes(object.id)}
                      onChange={(e) =>
                        setCompare((c) =>
                          e.target.checked
                            ? [...c, object.id]
                            : c.filter((id) => id !== object.id),
                        )
                      }
                    />
                    Добавить в сравнение · DEMO-функция
                  </label>
                )}
              </article>
            ))}
          </div>
          {compared.length > 0 && (
            <div
              className="comparison"
              role="region"
              aria-label="Сравнение автомобилей"
              tabIndex={0}
            >
              <table>
                <caption>Сравнение опубликованных характеристик</caption>
                <thead>
                  <tr>
                    <th scope="col">Параметр</th>
                    {compared.map((o) => (
                      <th scope="col" key={o.id}>
                        {o.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    "Год",
                    "Цена",
                    "Пробег",
                    "Двигатель",
                    "Мощность",
                    "Коробка",
                    "Привод",
                    "Кузов",
                  ].map((field) => (
                    <tr key={field}>
                      <th scope="row">{field}</th>
                      {compared.map((o) => (
                        <td key={o.id}>
                          {o.fields[field] || "Информация уточняется"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
