import { test } from "node:test";
import assert from "node:assert/strict";
import { SqliteDatabase } from "./database";
import { ExperienceService } from "./experiences";
import { ApiError } from "./service";
function setup() {
  return new ExperienceService(new SqliteDatabase(":memory:"));
}
test("DEMO-билет: сервер пересчитывает места, защищает повтор и не выдаёт действительный билет", () => {
  const service = setup(),
    screeningId = service.catalog().screenings[0].id;
  const input = {
    screeningId,
    seats: [
      { row: 1, seat: 1 },
      { row: 3, seat: 1 },
    ],
    idempotencyKey: "test-key-123",
    totalMinor: 1,
  };
  const ticket = service.ticket("a", input);
  assert.equal(ticket.totalMinor, 80000);
  assert.equal(ticket.validForAdmission, false);
  assert.equal(ticket.mode, "DEMO");
  assert.equal(service.ticket("a", input).id, ticket.id);
  assert.equal(service.tickets("a").length, 1);
  assert.equal(service.tickets("b").length, 0);
  assert.throws(
    () => service.ticket("a", { ...input, seats: [{ row: 1, seat: 3 }] }),
    ApiError,
  );
  assert.throws(
    () =>
      service.ticket("a", {
        ...input,
        idempotencyKey: "other-key-123",
        seats: [{ row: 1, seat: 2 }],
      }),
    ApiError,
  );
  assert.throws(
    () =>
      service.ticket("a", {
        ...input,
        seats: [
          { row: 1, seat: 1 },
          { row: 1, seat: 1 },
        ],
      }),
    ApiError,
  );
  assert.throws(
    () => service.ticket("a", { ...input, seats: [{ row: 0, seat: 1 }] }),
    ApiError,
  );
  assert.equal(service.tickets("a").length, 1);
});
test("Биржа: чат и завершение требуют выбора, сессии изолированы", () => {
  const service = setup();
  assert.throws(
    () => service.updateExchange("a", { action: "complete" }),
    ApiError,
  );
  assert.throws(
    () => service.updateExchange("a", { action: "message", text: "test" }),
    ApiError,
  );
  assert.throws(
    () =>
      service.updateExchange("a", {
        action: "select",
        offerId: "real-company",
      }),
    ApiError,
  );
  assert.equal(
    service.updateExchange("a", { action: "select", offerId: "offer-2" })
      .status,
    "selected",
  );
  const chat = service.updateExchange("a", {
    action: "message",
    text: "Тестовое время",
  });
  assert.equal(chat.messages.length, 3);
  assert.equal(service.exchange("b").status, "open");
  assert.equal(
    service.updateExchange("a", { action: "complete" }).status,
    "completed",
  );
  assert.throws(
    () => service.updateExchange("a", { action: "message", text: "late" }),
    ApiError,
  );
  assert.equal(service.updateExchange("a", { action: "reset" }).status, "open");
});
test("DEMO-отклик не отправляется работодателю; неверная вакансия отклоняется", () => {
  const service = setup();
  const response = service.jobResponse("a", {
    jobId: "ueip-job",
    message: "Учебный отклик",
  });
  assert.equal(response.sentToEmployer, false);
  assert.throws(
    () => service.jobResponse("a", { jobId: "other", message: "test" }),
    ApiError,
  );
});
