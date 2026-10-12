import { test } from "node:test";
import assert from "node:assert/strict";
import { SqliteDatabase } from "./database";
import { CityService, ApiError } from "./service";
function setup() {
  return new CityService(new SqliteDatabase(":memory:"));
}
const input = {
  lines: [{ itemId: "food1", quantity: 2 }],
  fulfilment: "pickup",
  bonusPoints: 0,
};
test("Сервер сам считает цену и ограничивает баллы, не доверяет клиентским ценам", () => {
  const s = setup();
  const q = s.quote("a", { ...input, totalMinor: 1 });
  assert.equal(q.subtotalMinor, 36000);
  assert.equal(q.maxBonusPoints, 72);
  assert.equal(q.totalMinor, 36000);
  assert.throws(() => s.quote("a", { ...input, bonusPoints: 73 }), ApiError);
  assert.throws(() => s.quote("a", { ...input, bonusPoints: -1 }), ApiError);
  assert.throws(
    () => s.quote("a", { ...input, lines: [{ itemId: "food6", quantity: 1 }] }),
    ApiError,
  );
  assert.throws(
    () =>
      s.quote("a", {
        ...input,
        lines: [
          { itemId: "food1", quantity: 1 },
          { itemId: "food4", quantity: 1 },
        ],
      }),
    ApiError,
  );
});
test("Заказ и бонусный ledger атомарны, повтор запроса не списывает дважды", () => {
  const s = setup();
  const request = { ...input, bonusPoints: 50, idempotencyKey: "first" };
  const a = s.order("a", request),
    b = s.order("a", request);
  assert.equal(a.id, b.id);
  assert.equal(s.orders("a").length, 1);
  assert.equal(s.bonus("a").balance, 465);
  assert.equal(
    s.bonus("a").transactions.filter((x) => x.orderId === a.id).length,
    2,
  );
  assert.equal(a.payment.status, "not_charged");
  assert.equal(s.orders("b").length, 0);
  assert.equal(s.bonus("b").balance, 500);
  assert.throws(() => s.order("a", { ...request, bonusPoints: 0 }), ApiError);
});
test("Валидация не изменяет баланс при ошибке", () => {
  const s = setup();
  assert.throws(() =>
    s.order("a", { ...input, lines: [], idempotencyKey: "bad" }),
  );
  assert.equal(s.orders("a").length, 0);
  assert.equal(s.bonus("a").balance, 500);
});
test("Записи валидируются и изолированы по демосессиям", () => {
  const s = setup();
  const req = { providerId: "s1", slot: "2026-10-20T10:00:00+05:00" };
  s.book("a", req);
  assert.throws(() => s.book("a", req), ApiError);
  assert.equal(s.bookings("b").length, 0);
  assert.throws(() => s.book("a", { ...req, slot: "fake" }), ApiError);
});
test("Объявления находятся на сервере, повтор миграции не дублирует их", () => {
  const s = setup();
  const request = {
    title: "Стул",
    text: "Отдам",
    category: "Вещи",
    legacyId: "old1",
  };
  const a = s.addAd("a", request),
    b = s.addAd("a", request);
  assert.equal(a.id, b.id);
  assert.ok(s.catalog("a").some((x) => x.id === a.id));
  assert.ok(!s.catalog("b").some((x) => x.id === a.id));
  assert.throws(
    () => s.addAd("a", { ...request, legacyId: "old2", title: " " }),
    ApiError,
  );
});
test("Комментарии сохраняются на сервере, миграция idempotent и сессии изолированы", () => {
  const s = setup();
  const request = { entryId: "n1", text: "Комментарий demo", legacyId: "n1-0" };
  s.comment("a", request);
  s.comment("a", request);
  assert.equal(s.comments("a").n1.length, 1);
  assert.deepEqual(s.comments("b"), {});
  assert.throws(
    () => s.comment("a", { entryId: "missing", text: "Комментарий" }),
    ApiError,
  );
});
