import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Camera, ArrowUpRight, Expand, RefreshCw, MapPin } from "lucide-react";
import { useRemote, RemoteState } from "../commerce/useRemote";
import type { CityPhoto, PhotoRegistry } from "../../shared/photos";
const Photos = createContext<ReturnType<
  typeof useRemote<PhotoRegistry>
> | null>(null);
export function PhotoProvider({ children }: { children: ReactNode }) {
  const state = useRemote<PhotoRegistry>("/photos");
  return <Photos.Provider value={state}>{children}</Photos.Provider>;
}
function useRegistry() {
  const state = useContext(Photos);
  if (!state) throw new Error("PhotoProvider missing");
  return state;
}
export function usePhoto(section: string) {
  const state = useRegistry();
  return {
    photo: state.data?.photos.find(
      (p) => p.id === state.data?.sections[section]?.photoId,
    ),
    missing: state.data?.sections[section]?.missing,
    loading: state.loading,
    error: state.error,
    retry: state.retry,
  };
}
export function usePhotoById(id?: string) {
  return useRegistry().data?.photos.find((photo) => photo.id === id);
}
export function VerifiedPhoto({
  photo,
  priority = false,
}: {
  photo: CityPhoto;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false),
    [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    dialog.current?.close();
    setExpanded(false);
    trigger.current?.focus();
  }
  return (
    <figure
      className={`verified-photo ${loading && !failed ? "photo-is-loading" : ""}`}
    >
      <div className="photo-stage">
        <div className="photo-place-label">
          <MapPin size={12} /> НОВОУРАЛЬСК · {photo.date.slice(0, 4)}
        </div>
        {failed ? (
          <div className="photo-unavailable" role="status">
            <Camera size={30} />
            <b>Снимок временно недоступен</b>
            <p>Откройте источник или повторите загрузку.</p>
            <button
              className="secondary"
              onClick={() => {
                setFailed(false);
                setLoading(true);
              }}
            >
              <RefreshCw size={14} />
              Повторить загрузку фото
            </button>
          </div>
        ) : (
          <>
            {loading && (
              <span className="photo-loading" role="status">
                Загружаем фотографию…
              </span>
            )}
            <img
              src={photo.original}
              alt={`${photo.object}, Новоуральск. Фото ${photo.author}`}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              onLoad={() => setLoading(false)}
              onError={() => {
                setFailed(true);
                setLoading(false);
              }}
            />
            <button
              ref={trigger}
              className="photo-expand"
              aria-label={`Рассмотреть фото: ${photo.object}`}
              disabled={loading}
              onClick={() => {
                setExpanded(true);
                dialog.current?.showModal();
              }}
            >
              <Expand size={17} />
              <span>Рассмотреть</span>
            </button>
          </>
        )}
      </div>
      <figcaption>
        <div>
          <strong>{photo.object}</strong>
          <span>Фото {photo.author} · исторический оригинал без ретуши</span>
        </div>
        <a href={photo.source} target="_blank" rel="noopener noreferrer">
          Источник <ArrowUpRight size={13} />
        </a>
        <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">
          {photo.license}
        </a>
      </figcaption>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label={`Оригинальная фотография: ${photo.object}`}
        onCancel={() => {
          setExpanded(false);
          trigger.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        {expanded && (
          <>
            <button
              className="secondary photo-dialog-close"
              autoFocus
              onClick={close}
            >
              Закрыть фотографию
            </button>
            <img
              src={photo.original}
              alt={`${photo.object}, Новоуральск — оригинал без обработки`}
            />
            <p>
              {photo.object} · {photo.author} · {photo.license}
            </p>
            <a href={photo.source} target="_blank" rel="noopener noreferrer">
              Открыть источник ↗
            </a>
          </>
        )}
      </dialog>
    </figure>
  );
}
const headings: Record<string, string> = {
  cafes: "Вкус знакомого города",
  malls: "Местные магазины. Свои маршруты.",
  shops: "Находки рядом с домом",
  services: "Люди, на которых можно положиться",
  jobs: "Возможности в своём городе",
  cinema: "Большой экран. Вечер в городе.",
  cars: "Новые маршруты начинаются здесь",
  exchange: "Город помогает своим",
  appointments: "Время для важных дел",
  cart: "Всё выбранное — в одном месте",
  bonus: "Больше приятных поводов",
  pharmacy: "Забота рядом",
  search: "Найдётся всё, что рядом",
  assistant: "С городом проще разобраться",
  "city/addresses": "Знакомые адреса",
  "city/schedule": "Город в движении",
  "city/cinema": "Вечер начинается с кино",
};
export function SectionPhoto({ section }: { section: string }) {
  const { photo, loading, error, retry } = usePhoto(section);
  return (
    <section
      className={`section-photo section-photo-${section.split("/")[0]}`}
      aria-label="Место в Новоуральске"
    >
      {photo ? (
        <VerifiedPhoto key={photo.id} photo={photo} />
      ) : (
        <div className="photo-placeholder">
          <span>
            <Camera size={15} /> НОВОУРАЛЬСК · СВОИ МЕСТА
          </span>
          <p>{headings[section] || "Настоящий город. Знакомые места."}</p>
          {loading ? (
            <small role="status">Подбираем городской кадр…</small>
          ) : error ? (
            <button className="secondary" onClick={retry}>
              Повторить загрузку фотографий
            </button>
          ) : (
            <small>
              Фотография этого места пока недоступна.{" "}
              <a href="#photos">Посмотреть городскую галерею ↗</a>
            </small>
          )}
        </div>
      )}
    </section>
  );
}
export function PhotoGallery() {
  const state = useRegistry();
  if (state.loading || state.error) return <RemoteState {...state} />;
  return (
    <section
      className="photo-gallery"
      aria-label="Галерея реального Новоуральска"
    >
      <div className="gallery-intro">
        <span>СВОЙ ГОРОД · В ДЕТАЛЯХ</span>
        <h2>Места, которые остаются с нами</h2>
        <p>
          Озеро, городские площади, театр и лес. Каждая фотография — реальный
          Новоуральск, с указанным автором и лицензией. Снимки исторические, без
          изменения архитектуры и природы.
        </p>
      </div>
      <div className="photo-gallery-grid">
        {state.data?.photos.map((photo) => (
          <VerifiedPhoto key={photo.id} photo={photo} />
        ))}
      </div>
      <p className="gallery-note">
        Права на снимки отдельных кафе, ТЦ, предприятий и товаров пока не
        подтверждены. Их фотографии не подменяем чужими или вымышленными
        изображениями.
      </p>
    </section>
  );
}
export function PhotoSources() {
  const state = useRegistry();
  return (
    <details className="photo-sources">
      <summary>Фотографии города: авторы и права</summary>
      <p>
        Только реальные фотографии. Небо, здания, деревья и дороги не
        редактировались. Снимки исторические, не подтверждают сегодняшнее
        состояние города. Фотографии не являются снимками товаров или
        demo-заведений.
      </p>
      {state.error && (
        <button className="secondary" onClick={state.retry}>
          Повторить загрузку источников фото
        </button>
      )}
      {state.data?.photos.map((photo) => (
        <div key={photo.id}>
          <a href={photo.source} target="_blank" rel="noopener noreferrer">
            {photo.object}
          </a>{" "}
          — {photo.author}; <a href={photo.licenseUrl}>{photo.license}</a>;{" "}
          {photo.date}. Без изменений.<p>{photo.evidence}</p>
        </div>
      ))}
    </details>
  );
}
