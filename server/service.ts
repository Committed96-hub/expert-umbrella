import { randomUUID, createHash } from "node:crypto";
import type { Database } from "./database";
import { demo } from "./seed/catalog";
import { cityDemo } from "./seed/city";
import { commerceSeed, bonusSeed } from "./seed/commerce";
import type { Entry } from "../shared/models";
import type {
  BonusAccount,
  CartLine,
  Quote,
  DemoOrder,
  Booking,
  CommerceCatalog,
} from "../shared/commerce";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export class CityService {
  constructor(private db: Database) {
    if (!db.get("catalog")) db.put("catalog", [...demo, ...cityDemo]);
    if (!db.get("commerce")) db.put("commerce", commerceSeed);
    const commerce = db.get<CommerceCatalog>("commerce")!;
    if (!commerce.cafes.some((c) => c.id === "solo-demo")) {
      commerce.cafes.push(
        ...commerceSeed.cafes.filter((c) => c.id === "solo-demo"),
      );
      commerce.menu.push(
        ...commerceSeed.menu.filter((m) => m.cafeId === "solo-demo"),
      );
      db.put("commerce", commerce);
    }
  }
  catalog(session: string) {
    return [
      ...(this.db.get<Entry[]>(`ads:${session}`) || []),
      ...(this.db.get<Entry[]>("catalog") || []),
    ];
  }
  commerce() {
    return this.db.get<CommerceCatalog>("commerce")!;
  }
  bonus(session: string) {
    return (
      this.db.get<BonusAccount>(`bonus:${session}`) ||
      structuredClone(bonusSeed)
    );
  }
  addAd(session: string, input: Record<string, unknown>) {
    const legacyId =
      typeof input.legacyId === "string"
        ? input.legacyId.slice(0, 100)
        : undefined;
    const legacy = legacyId
      ? this.db.get<Entry>(`legacy-ad:${session}:${legacyId}`)
      : undefined;
    if (legacy) return legacy;
    const title = this.text(input.title, 100),
      text = this.text(input.text, 2000),
      category = this.text(input.category, 40),
      price = this.text(input.price || "По договорённости", 40);
    const entry: Entry = {
      id: randomUUID(),
      section: "ads",
      author: "Вы · demo",
      title,
      text,
      category,
      price,
      meta: "Только что · Новоуральск",
    };
    this.db.put(`ads:${session}`, [
      entry,
      ...(this.db.get<Entry[]>(`ads:${session}`) || []),
    ]);
    if (legacyId) this.db.put(`legacy-ad:${session}:${legacyId}`, entry);
    return entry;
  }
  private text(value: unknown, max: number) {
    if (typeof value !== "string" || !value.trim() || value.trim().length > max)
      throw new ApiError(400, "Проверьте заполнение полей");
    return value.trim();
  }
  quote(session: string, input: Record<string, unknown>): Quote {
    if (
      !Array.isArray(input.lines) ||
      !input.lines.length ||
      input.lines.length > 20
    )
      throw new ApiError(400, "Корзина пуста или слишком велика");
    const lines = (input.lines as CartLine[]).map((line) => {
      if (
        !line ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 20
      )
        throw new ApiError(400, "Количество должно быть от 1 до 20");
      const item = this.commerce().menu.find((x) => x.id === line.itemId);
      if (!item || !item.available)
        throw new ApiError(409, "Позиция больше недоступна");
      return {
        ...line,
        name: item.name,
        unitPriceMinor: item.priceMinor,
        cafeId: item.cafeId,
      };
    });
    if (new Set(lines.map((x) => x.itemId)).size !== lines.length)
      throw new ApiError(400, "Повторяющиеся позиции");
    if (new Set(lines.map((x) => x.cafeId)).size > 1)
      throw new ApiError(400, "Один заказ — одно кафе");
    const subtotalMinor = lines.reduce(
      (s, x) => s + x.unitPriceMinor * x.quantity,
      0,
    );
    const cafe = this.commerce().cafes.find((x) => x.id === lines[0].cafeId)!;
    if (!["pickup", "delivery"].includes(String(input.fulfilment)))
      throw new ApiError(400, "Выберите способ получения");
    const deliveryMinor =
      input.fulfilment === "delivery" ? cafe.deliveryMinor : 0;
    const account = this.bonus(session);
    const maxBonusPoints = Math.min(
      account.balance,
      Math.floor((subtotalMinor * account.maxPaymentPercent) / 100 / 100),
    );
    if (
      !Number.isInteger(input.bonusPoints) ||
      Number(input.bonusPoints) < 0 ||
      Number(input.bonusPoints) > maxBonusPoints
    )
      throw new ApiError(400, `Можно использовать до ${maxBonusPoints} баллов`);
    const bonusPoints = Number(input.bonusPoints),
      totalMinor = subtotalMinor + deliveryMinor - bonusPoints * 100;
    return {
      mode: "demo",
      lines: lines.map(({ cafeId, ...x }) => x),
      subtotalMinor,
      deliveryMinor,
      bonusPoints,
      maxBonusPoints,
      totalMinor,
      earnPoints: Math.floor(
        ((subtotalMinor - bonusPoints * 100) * 0.05) / 100,
      ),
    };
  }
  order(session: string, input: Record<string, unknown>): DemoOrder {
    const key = this.text(input.idempotencyKey, 100);
    const previous = this.db.get<DemoOrder>(`idempotency:${session}:${key}`);
    const signature = createHash("sha256")
      .update(
        JSON.stringify({
          lines: input.lines,
          fulfilment: input.fulfilment,
          bonusPoints: input.bonusPoints,
        }),
      )
      .digest("hex");
    if (previous) {
      if (this.db.get<string>(`signature:${session}:${key}`) !== signature)
        throw new ApiError(409, "Этот ключ уже использован для другого заказа");
      return previous;
    }
    return this.db.transaction(() => {
      const quote = this.quote(session, input);
      const order: DemoOrder = {
        id: `DEMO-${randomUUID().slice(0, 8)}`,
        status: "demo_created",
        createdAt: new Date().toISOString(),
        quote,
        payment: { mode: "demo", status: "not_charged" },
        idempotencyKey: key,
      };
      const account = this.bonus(session);
      if (quote.bonusPoints)
        account.transactions.unshift({
          id: randomUUID(),
          points: -quote.bonusPoints,
          reason: "Демо-списание за заказ",
          createdAt: order.createdAt,
          orderId: order.id,
        });
      if (quote.earnPoints)
        account.transactions.unshift({
          id: randomUUID(),
          points: quote.earnPoints,
          reason: "Демо-покупка у партнёра",
          createdAt: order.createdAt,
          orderId: order.id,
        });
      account.balance += quote.earnPoints - quote.bonusPoints;
      this.db.put(`bonus:${session}`, account);
      this.db.put(`orders:${session}`, [order, ...this.orders(session)]);
      this.db.put(`signature:${session}:${key}`, signature);
      this.db.put(`idempotency:${session}:${key}`, order);
      return order;
    });
  }
  orders(session: string) {
    return this.db.get<DemoOrder[]>(`orders:${session}`) || [];
  }
  book(session: string, input: Record<string, unknown>) {
    const providerId = this.text(input.providerId, 100),
      slot = this.text(input.slot, 80);
    const provider = this.catalog(session).find(
      (e) => e.id === providerId && e.section === "services",
    );
    if (
      !provider ||
      !this.commerce().slots.some(
        (x) => x.providerId === providerId && x.times.includes(slot),
      )
    )
      throw new ApiError(400, "Выберите доступный demo-слот");
    return this.db.transaction(() => {
      const existing = this.db.get<Booking[]>(`bookings:${session}`) || [];
      if (existing.some((x) => x.providerId === providerId && x.slot === slot))
        throw new ApiError(409, "Этот demo-слот уже выбран вами");
      const booking: Booking = {
        id: `DEMO-${randomUUID().slice(0, 8)}`,
        providerId,
        providerName: provider.title,
        slot,
        status: "demo_reserved",
        mode: "demo",
      };
      this.db.put(`bookings:${session}`, [booking, ...existing]);
      return booking;
    });
  }
  bookings(session: string) {
    return this.db.get<Booking[]>(`bookings:${session}`) || [];
  }
  comments(session: string) {
    return this.db.get<Record<string, string[]>>(`comments:${session}`) || {};
  }
  comment(session: string, input: Record<string, unknown>) {
    const legacyId =
      typeof input.legacyId === "string"
        ? input.legacyId.slice(0, 150)
        : undefined;
    if (legacyId && this.db.get(`legacy-comment:${session}:${legacyId}`))
      return this.comments(session);
    const entryId = this.text(input.entryId, 100),
      text = this.text(input.text, 1000);
    if (!this.catalog(session).some((x) => x.id === entryId))
      throw new ApiError(404, "Публикация не найдена");
    const value = this.comments(session);
    value[entryId] = [...(value[entryId] || []), text];
    this.db.put(`comments:${session}`, value);
    if (legacyId) this.db.put(`legacy-comment:${session}:${legacyId}`, true);
    return value;
  }
  respond(session: string, input: Record<string, unknown>) {
    const taskId = this.text(input.taskId, 80);
    if (!this.commerce().tasks.some((x) => x.id === taskId))
      throw new ApiError(404, "Задание не найдено");
    const responses = this.db.get<string[]>(`responses:${session}`) || [];
    if (!responses.includes(taskId))
      this.db.put(`responses:${session}`, [...responses, taskId]);
    return {
      mode: "demo",
      taskId,
      status: "demo_response_saved",
      message: "Демо-отклик сохранён. Никому не отправлен.",
    };
  }
}
