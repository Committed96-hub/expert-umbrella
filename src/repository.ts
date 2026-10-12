import type { Entry } from "./data";
import { httpApi, type ApiTransport } from "./api";
export interface CityRepository {
  list(): Promise<Entry[]>;
  createAd(
    input: Pick<Entry, "title" | "text" | "category" | "price">,
  ): Promise<Entry>;
}
export function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function createRepository(api: ApiTransport = httpApi): CityRepository {
  return {
    async list() {
      const legacy = readStored<Entry[]>("novik24.ads.v1", []);
      if (Array.isArray(legacy) && legacy.length) {
        for (const entry of legacy) {
          if (
            entry &&
            typeof entry.title === "string" &&
            typeof entry.text === "string"
          )
            await api.request("/ads", {
              legacyId: entry.id,
              title: entry.title,
              text: entry.text,
              category: entry.category || "Вещи",
              price: entry.price || "По договорённости",
            });
        }
        try {
          localStorage.removeItem("novik24.ads.v1");
        } catch {}
      }
      return api.request<Entry[]>("/catalog");
    },
    createAd(input) {
      return api.request<Entry>("/ads", input);
    },
  };
}
export const repository = createRepository();
export function searchEntries(entries: Entry[], query: string) {
  const terms = query
    .toLocaleLowerCase("ru")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return entries.filter((x) =>
    terms.every((term) =>
      `${x.title} ${x.text} ${x.category} ${x.author} ${x.meta}`
        .toLocaleLowerCase("ru")
        .includes(term),
    ),
  );
}
export interface AssistantGateway {
  reply(query: string, entries: Entry[]): Promise<string>;
}
export const assistant: AssistantGateway = {
  async reply(query, entries) {
    let q = query.toLowerCase();
    let matches = searchEntries(entries, query);
    if (!matches.length) {
      const section = /расписани|автобус|адрес|талон|врач|кино|событи/.test(q)
        ? "city"
        : /мастер|ремонт|сантех|репетитор|услуг/.test(q)
          ? "services"
          : /магазин|кофе|хлеб|акци|цвет/.test(q)
            ? "shops"
            : /купить|отдам|велосипед|объявлен/.test(q)
              ? "ads"
              : "feed";
      matches = entries.filter((x) => x.section === section);
      if (section === "city") {
        const kind = /талон|врач|медицин/.test(q)
          ? "medical"
          : /кино|сеанс/.test(q)
            ? "cinema"
            : /событи|афиш/.test(q)
              ? "events"
              : /адрес/.test(q)
                ? "addresses"
                : "schedule";
        matches = matches.filter((x) => "kind" in x && x.kind === kind);
      }
    }
    return `В демокаталоге нашёл: ${matches
      .slice(0, 3)
      .map((x) => `${x.title}${x.price ? " — " + x.price : ""}`)
      .join(
        "; ",
      )}. Откройте соответствующий раздел для подробностей. Это подборка из вымышленных демоданных, без подключения к языковой модели и актуальным городским источникам.`;
  },
};
