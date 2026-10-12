import { createContext, useContext, useState, type ReactNode } from "react";
import { useRemote } from "../commerce/useRemote";
import type { CityPhoto, PhotoRegistry } from "../../shared/photos";
const Photos = createContext<PhotoRegistry | null>(null);
export function PhotoProvider({children}: {children: ReactNode}) {
  const {data} = useRemote<PhotoRegistry>("/photos");
  return <Photos.Provider value={data}>{children}</Photos.Provider>;
}
export function usePhoto(section: string) {
  const registry = useContext(Photos);
  return {photo: registry?.photos.find(p => p.id === registry.sections[section]?.photoId),
    missing: registry?.sections[section]?.missing};
}
export function VerifiedPhoto({photo, priority = false}: {photo: CityPhoto; priority?: boolean}) {
  const [failed, setFailed] = useState(false);
  return <figure className="verified-photo">
    {failed ? <div className="photo-unavailable" role="status">Фотография временно недоступна</div> :
      <img src={photo.original} alt={`${photo.object}, Новоуральск. Фото ${photo.author}`} loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} />}
    <figcaption><a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.object} · {photo.author}</a>
      {" · "}<a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a> · оригинал без ретуши · {photo.date.slice(0,4)}</figcaption>
  </figure>;
}
export function SectionPhoto({section}: {section: string}) {
  const {photo, missing} = usePhoto(section);
  return <section className={`section-photo section-photo-${section.split('/')[0]}`} aria-label="Место в Новоуральске">
    {photo ? <VerifiedPhoto key={photo.id} photo={photo}/> : <div className="photo-placeholder"><span>НОВОУРАЛЬСК · СВОИ МЕСТА</span>
      <p>{missing || "Фото для этого раздела ещё не подтверждено"}</p><small>Показываем только фотографии с установленным происхождением и правами.</small></div>}
  </section>;
}
export function PhotoSources() {
  const registry = useContext(Photos);
  return <details className="photo-sources"><summary>Фотографии города: авторы и права</summary>
    <p>Только реальные фотографии. Небо, здания, деревья и дороги не редактировались. Снимки исторические, не подтверждают сегодняшнее состояние города. Фотографии не являются снимками товаров или demo-заведений.</p>
    {registry?.photos.map(photo => <div key={photo.id}><a href={photo.source} target="_blank" rel="noopener noreferrer">{photo.object}</a> — {photo.author}; <a href={photo.licenseUrl}>{photo.license}</a>; {photo.date}. Без изменений.<p>{photo.evidence}</p></div>)}
  </details>;
}
