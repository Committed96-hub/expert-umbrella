import type { Entry } from "../data";
export const cityKinds = [
  "schedule",
  "addresses",
  "medical",
  "cinema",
  "events",
] as const;
export type CityKind = (typeof cityKinds)[number];
export type CityEntry = Entry & {
  section: "city";
  kind: CityKind;
  source: {
    mode: "demo" | "live";
    name: string;
    updatedAt: string;
    url?: string;
  };
  address: string;
  times: string[];
  availability?: number;
  date?: string;
};
export interface CitySource {
  list(signal?: AbortSignal): Promise<CityEntry[]>;
}
const source = {
  mode: "demo" as const,
  name: "Демонстрационный городской каталог",
  updatedAt: "2026-10-12T12:00:00+05:00",
};
function item(
  id: string,
  kind: CityKind,
  title: string,
  category: string,
  text: string,
  address: string,
  times: string[],
  extra: Partial<CityEntry> = {},
): CityEntry {
  return {
    id,
    kind,
    title,
    category,
    text,
    address,
    times,
    source,
    section: "city",
    author: "Городской каталог · demo",
    meta: `${address} · ${times.join(", ")}`,
    ...extra,
  };
}
export const cityDemo: CityEntry[] = [
  item(
    "t1",
    "schedule",
    "Автобус № 1 · Центр → Южный",
    "Автобусы",
    "Учебный пример маршрута: Площадь → Парк → Южный район. Не используйте для планирования поездки.",
    "Демоостановка «Площадь»",
    ["07:10", "07:35", "08:00", "08:25"],
    { price: "35 ₽ · demo" },
  ),
  item(
    "t2",
    "schedule",
    "Автобус № 4 · Вокзал → Парк",
    "Автобусы",
    "Пример расписания городского транспорта. Интервал 30 минут.",
    "Демоостановка «Вокзал»",
    ["09:00", "09:30", "10:00", "10:30"],
    { price: "35 ₽ · demo" },
  ),
  item(
    "t3",
    "schedule",
    "Пригородный маршрут · выезд из города",
    "Пригород",
    "Вымышленный пример пригородного сообщения. Актуальное расписание пока не подключено.",
    "Демоавтостанция",
    ["08:00", "13:00", "18:00"],
  ),
  item(
    "d1",
    "addresses",
    "Библиотека «Открытая книга»",
    "Культура",
    "Пример справочной карточки: читальный зал, абонемент и встречи читателей.",
    "Демоадрес: ул. Книжная, 12",
    ["Вт–Сб 10:00–18:00"],
  ),
  item(
    "d2",
    "addresses",
    "Центр городских услуг",
    "Городские службы",
    "Пример учреждения для поиска адресов и часов работы. Организация и адрес вымышлены.",
    "Демоадрес: ул. Городская, 8",
    ["Пн–Пт 09:00–17:00"],
  ),
  item(
    "d3",
    "addresses",
    "Спортивный центр «Движение»",
    "Спорт",
    "Пример спортивного учреждения: групповые занятия и открытые тренировки.",
    "Демоадрес: ул. Спортивная, 5",
    ["Ежедневно 08:00–21:00"],
  ),
  item(
    "m1",
    "medical",
    "Терапевт · пример доступных талонов",
    "Терапевт",
    "Показаны вымышленные окна приёма. Они не являются реальными свободными талонами. Запись в приложении недоступна.",
    "Демополиклиника № 1",
    ["09:20", "11:40", "15:00"],
    { date: "2026-10-19", availability: 3 },
  ),
  item(
    "m2",
    "medical",
    "Офтальмолог · пример доступных талонов",
    "Офтальмолог",
    "Демонстрация поиска специалиста и времени приёма. Для реальной записи нужен официальный сервис учреждения.",
    "Демополиклиника № 2",
    ["10:00", "14:20"],
    { date: "2026-10-20", availability: 2 },
  ),
  item(
    "m3",
    "medical",
    "Невролог · пример отсутствия талонов",
    "Невролог",
    "Пример состояния, когда свободных окон нет. Данные не связаны с реальной регистратурой.",
    "Демополиклиника № 1",
    [],
    { date: "2026-10-21", availability: 0 },
  ),
  item(
    "c1",
    "cinema",
    "Там, где начинается Урал",
    "Документальное",
    "Вымышленный фильм о природе и людях Урала. 12+ · 85 минут.",
    "Демокинотеатр · зал 1",
    ["12:30", "17:00", "20:00"],
    { date: "2026-10-17", price: "от 250 ₽ · demo", art: "landscape" },
  ),
  item(
    "c2",
    "cinema",
    "Приключения маленького лиса",
    "Семейное",
    "Вымышленная анимационная история. 6+ · 95 минут.",
    "Демокинотеатр · зал 2",
    ["11:00", "14:30", "18:00"],
    { date: "2026-10-18", price: "от 200 ₽ · demo", art: "workshop" },
  ),
  item(
    "e1",
    "events",
    "Осенняя прогулка с соседями",
    "Прогулки",
    "Пример события: спокойная прогулка и разговор о любимых местах. Событие вымышлено.",
    "Демоместо: вход в городской парк",
    ["11:00–13:00"],
    { date: "2026-10-17", price: "Бесплатно · demo", art: "landscape" },
  ),
  item(
    "e2",
    "events",
    "Книжный обмен",
    "Встречи",
    "Пример встречи читателей. Принесите любимую историю и найдите новую. Событие вымышлено.",
    "Демоадрес: ул. Книжная, 12",
    ["12:00–15:00"],
    { date: "2026-10-18", price: "Бесплатно · demo", art: "books" },
  ),
  item(
    "e3",
    "events",
    "Мастерская цвета",
    "Мастер-классы",
    "Пример творческого занятия для всей семьи. 6+. Реальная регистрация недоступна.",
    "Демоадрес: ул. Творческая, 3",
    ["15:00–16:30"],
    { date: "2026-10-18", price: "400 ₽ · demo", art: "workshop" },
  ),
];
export const demoCitySource: CitySource = {
  async list(signal) {
    signal?.throwIfAborted();
    return structuredClone(cityDemo);
  },
};
export function isCityEntry(entry: Entry): entry is CityEntry {
  return entry.section === "city" && "kind" in entry;
}
export function formatCityDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Yekaterinburg",
  }).format(new Date(`${date}T12:00:00+05:00`));
}
