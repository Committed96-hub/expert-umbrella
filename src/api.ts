export interface ApiTransport {
  request<T>(path: string, body?: unknown): Promise<T>;
}
const transport: ApiTransport = {
  async request<T>(path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`/api${path}`, {
        method: body === undefined ? "GET" : "POST",
        credentials: "same-origin",
        signal: controller.signal,
        ...(body === undefined
          ? {}
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            }),
      });
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error("API вернул некорректный ответ");
      }
      if (!response.ok)
        throw new Error(
          typeof (data as { error?: unknown })?.error === "string"
            ? (data as { error: string }).error
            : "Сервис временно недоступен",
        );
      return data as T;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError")
        throw new Error("Сервис не ответил вовремя. Повторите запрос.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },
};

let sessionBootstrap: Promise<unknown> | null = null;
export const httpApi: ApiTransport = {
  async request<T>(path: string, body?: unknown): Promise<T> {
    if (!sessionBootstrap)
      sessionBootstrap = transport.request("/context").catch((error) => {
        sessionBootstrap = null;
        throw error;
      });
    const context = await sessionBootstrap;
    if (path === "/context" && body === undefined) return context as T;
    return transport.request<T>(path, body);
  },
};
