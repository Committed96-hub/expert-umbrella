import { cityModules } from "./media/modules";
import { cityWeather } from "./adapters/weather";
import { photoRegistry } from "./media/registry";
import { randomUUID } from "node:crypto";
import { SqliteDatabase } from "./database";
import { CityService, ApiError } from "./service";
import { pharmacy, monetization, storage } from "./adapters/integrations";
let instance: CityService;
function service() {
  return (instance ||= new CityService(
    new SqliteDatabase(
      process.env.NOVIK_DB_PATH ||
        (process.env.VERCEL
          ? "/tmp/novik-demo.sqlite"
          : ".data/novik-demo.sqlite"),
    ),
  ));
}
export async function handleRequest(request: Request): Promise<Response> {
  let session =
    /novik_demo=([a-f0-9-]{36})(?:;|$)/.exec(
      request.headers.get("cookie") || "",
    )?.[1] || randomUUID();
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Set-Cookie": `novik_demo=${session}; HttpOnly; SameSite=Lax; Path=/${process.env.VERCEL ? "; Secure" : ""}`,
  };
  const respond = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), { status, headers });
  try {
    const url = new URL(request.url);
    const route = (
      url.searchParams.get("route") || url.pathname.replace(/^\/api\//, "")
    ).replace(/^\//, "");
    const s = service();
    if (request.method === "GET") {
      if (route === "weather") return respond(await cityWeather());
      if (route === "city-modules") return respond(cityModules);
      if (route === "photos") return respond(photoRegistry);
      if (route === "catalog") return respond(s.catalog(session));
      if (route === "city")
        return respond(s.catalog(session).filter((x) => x.section === "city"));
      if (route === "commerce") return respond(s.commerce());
      if (route === "comments") return respond(s.comments(session));
      if (route === "bonus") return respond(s.bonus(session));
      if (route === "orders") return respond(s.orders(session));
      if (route === "appointments") return respond(s.bookings(session));
      if (route === "context")
        return respond({
          city: "Новоуральск",
          timezone: "Asia/Yekaterinburg",
          links: { community: "https://vk.com/public170182912" },
          serverTime: new Date().toISOString(),
          weather: { mode: "unavailable", description: "Погода загружается", source: "Open-Meteo", sourceUrl: "https://open-meteo.com/" },
          storage: { mode: "demo", persistent: !process.env.VERCEL },
          monetization,
          media: {
            panorama: storage.resolve("panorama"),
            editorial: storage.resolve("editorial"),
          },
        });
      if (route === "pharmacy")
        return respond(await pharmacy.search(url.searchParams.get("q") || ""));
      throw new ApiError(404, "API-маршрут не найден");
    }
    if (request.method !== "POST")
      throw new ApiError(405, "Метод не поддерживается");
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== url.host)
      throw new ApiError(403, "Недопустимый источник запроса");
    if (!request.headers.get("content-type")?.includes("application/json"))
      throw new ApiError(415, "Требуется JSON");
    const text = await request.text();
    if (text.length > 16000) throw new ApiError(413, "Запрос слишком большой");
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiError(400, "Некорректный JSON");
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new ApiError(400, "Некорректное тело запроса");
    if (route === "ads") return respond(s.addAd(session, body), 201);
    if (route === "comments") return respond(s.comment(session, body), 201);
    if (route === "quote") return respond(s.quote(session, body));
    if (route === "orders") return respond(s.order(session, body), 201);
    if (route === "appointments") return respond(s.book(session, body), 201);
    if (route === "exchange") return respond(s.respond(session, body));
    throw new ApiError(404, "API-маршрут не найден");
  } catch (error) {
    if (error instanceof ApiError)
      return respond({ error: error.message }, error.status);
    console.error(
      "Novik API failure",
      error instanceof Error ? error.name : "Unknown",
    );
    return respond(
      { error: "Сервис временно недоступен. Повторите запрос." },
      500,
    );
  }
}
