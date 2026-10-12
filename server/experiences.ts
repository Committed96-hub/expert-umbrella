import { createHash, randomUUID } from "node:crypto";
import type { Database } from "./database";
import { ApiError } from "./service";
import { experienceSeed } from "./seed/experiences";
import type { DemoTicket, DemoExchange } from "../shared/experiences";
export class ExperienceService {
  constructor(private db: Database) {}
  catalog() {
    return experienceSeed();
  }
  tickets(session: string) {
    return this.db.get<DemoTicket[]>(`tickets:${session}`) || [];
  }
  ticket(session: string, input: Record<string, unknown>) {
    const key = input.idempotencyKey;
    if (typeof key !== "string" || !/^[a-zA-Z0-9-]{8,80}$/.test(key))
      throw new ApiError(400, "Некорректный ключ билета");
    const catalog = this.catalog();
    const screening = catalog.screenings.find(
      (s) => s.id === input.screeningId,
    );
    if (!screening)
      throw new ApiError(409, "Учебный сеанс изменился. Выберите заново.");
    if (
      !Array.isArray(input.seats) ||
      !input.seats.length ||
      input.seats.length > 6
    )
      throw new ApiError(400, "Выберите от 1 до 6 мест");
    const seats = input.seats
      .map((raw) => {
        const row = raw?.row,
          seat = raw?.seat;
        if (
          !Number.isInteger(row) ||
          !Number.isInteger(seat) ||
          row < 1 ||
          row > catalog.hall.rows ||
          seat < 1 ||
          seat > catalog.hall.seatsPerRow
        )
          throw new ApiError(400, "Место вне демонстрационной схемы");
        if (catalog.hall.unavailable.includes(`${row}-${seat}`))
          throw new ApiError(409, "Это место недоступно в DEMO-схеме");
        return {
          row,
          seat,
          priceMinor:
            row <= 2
              ? catalog.hall.prices.frontMinor
              : catalog.hall.prices.backMinor,
        };
      })
      .sort((a, b) => a.row - b.row || a.seat - b.seat);
    if (new Set(seats.map((s) => `${s.row}-${s.seat}`)).size !== seats.length)
      throw new ApiError(400, "Места не должны повторяться");
    const fingerprint = createHash("sha256")
      .update(JSON.stringify({ screening: screening.id, seats }))
      .digest("hex");
    return this.db.transaction(() => {
      const stored = this.db.get<{ fingerprint: string; ticket: DemoTicket }>(
        `ticket-key:${session}:${key}`,
      );
      if (stored) {
        if (stored.fingerprint !== fingerprint)
          throw new ApiError(409, "Ключ уже использован с другим выбором");
        return stored.ticket;
      }
      const ticket: DemoTicket = {
        id: `DEMO-${randomUUID()}`,
        mode: "DEMO",
        validForAdmission: false,
        screening,
        filmTitle: "Вышка 2",
        seats,
        totalMinor: seats.reduce((s, x) => s + x.priceMinor, 0),
        createdAt: new Date().toISOString(),
      };
      this.db.put(`ticket-key:${session}:${key}`, { fingerprint, ticket });
      this.db.put(
        `tickets:${session}`,
        [ticket, ...this.tickets(session)].slice(0, 30),
      );
      return ticket;
    });
  }
  exchange(session: string): DemoExchange {
    return (
      this.db.get<DemoExchange>(`experience-exchange:${session}`) || {
        id: "mixer-demo",
        mode: "DEMO",
        status: "open",
        messages: [],
      }
    );
  }
  updateExchange(session: string, input: Record<string, unknown>) {
    return this.db.transaction(() => {
      const state = this.exchange(session);
      if (input.action === "reset") {
        const reset: DemoExchange = {
          id: "mixer-demo",
          mode: "DEMO",
          status: "open",
          messages: [],
        };
        this.db.put(`experience-exchange:${session}`, reset);
        return reset;
      }
      if (input.action === "select") {
        const offer = this.catalog().offers.find((x) => x.id === input.offerId);
        if (!offer || state.status !== "open")
          throw new ApiError(
            409,
            "Сначала откройте заявку и выберите DEMO-предложение",
          );
        state.offerId = offer.id;
        state.status = "selected";
        state.messages.push({
          author: offer.name,
          text: "DEMO: выбор сохранён. Реальный исполнитель не уведомляется.",
        });
      } else if (input.action === "message") {
        if (state.status !== "selected")
          throw new ApiError(409, "Чат доступен после выбора исполнителя");
        if (
          typeof input.text !== "string" ||
          !input.text.trim() ||
          input.text.length > 500
        )
          throw new ApiError(
            400,
            "Сообщение должно содержать от 1 до 500 символов",
          );
        if (state.messages.length >= 40)
          throw new ApiError(429, "Достигнут лимит demo-чата. Начните заново.");
        state.messages.push(
          { author: "Вы · DEMO", text: input.text.trim() },
          {
            author: "DEMO-бот",
            text: "Учебный ответ: сообщение получено. Детали согласуем в выбранное время.",
          },
        );
      } else if (input.action === "complete") {
        if (state.status !== "selected")
          throw new ApiError(409, "Сначала выберите исполнителя");
        state.status = "completed";
        state.messages.push({
          author: "Система · DEMO",
          text: "Учебный заказ завершён. Денежных операций нет.",
        });
      } else throw new ApiError(400, "Неизвестное действие");
      this.db.put(`experience-exchange:${session}`, state);
      return state;
    });
  }
  jobResponse(session: string, input: Record<string, unknown>) {
    if (
      input.jobId !== "ueip-job" ||
      typeof input.message !== "string" ||
      !input.message.trim() ||
      input.message.length > 1000
    )
      throw new ApiError(
        400,
        "Проверьте вакансию и сообщение (до 1000 символов)",
      );
    const response = {
      id: `DEMO-${randomUUID()}`,
      mode: "DEMO",
      sentToEmployer: false,
      message: input.message.trim(),
      createdAt: new Date().toISOString(),
    };
    this.db.put(`job-draft:${session}`, response);
    return response;
  }
}
