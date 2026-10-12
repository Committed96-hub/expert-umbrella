import type { Entry } from "../data";
import { MapPin } from "lucide-react";
export function EntryVisual({ entry }: { entry: Entry }) {
  return <div className={`entry-visual neutral-${entry.section}`}><MapPin size={32} aria-hidden="true"/><span>Новоуральск</span><small>Фото объявления не добавлено · demo</small></div>;
}
