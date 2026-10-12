import { test } from "node:test";
import assert from "node:assert/strict";
import { cityDemo, demoCitySource } from "../server/seed/city";
import { cityKinds } from "./city/source";
import { createRepository, searchEntries } from "./repository";
import { resolveRoute } from "./routes";
test("Все городские разделы содержат явный demo-источник", () => {
  for (const kind of cityKinds) {
    const records = cityDemo.filter((x) => x.kind === kind);
    assert.ok(records.length >= 2);
    assert.ok(
      records.every(
        (x) => x.source.mode === "demo" && x.address && x.source.updatedAt,
      ),
    );
  }
  assert.ok(cityDemo.some((x) => x.availability === 0));
});
test("Замена источника не меняет контракт репозитория", async () => {
  const live = {
    ...cityDemo[0],
    id: "official",
    source: {
      mode: "live" as const,
      name: "Официальный API",
      updatedAt: "2026-10-12T00:00:00Z",
    },
  };
  const entries = await createRepository({
    async request<T>() {
      return [live] as T;
    },
  }).list();
  assert.equal(entries.filter((x) => x.section === "city").length, 1);
  assert.equal(searchEntries(entries, "официальный").length, 0);
  assert.equal(searchEntries(entries, "автобус")[0].id, "official");
});
test("Источник поддерживает отмену и возвращает независимые записи", async () => {
  const c = new AbortController();
  c.abort();
  await assert.rejects(demoCitySource.list(c.signal));
  const a = await demoCitySource.list();
  a[0].title = "Изменено";
  assert.notEqual((await demoCitySource.list())[0].title, "Изменено");
});
test("Прямые маршруты, избранное и неизвестный URL", () => {
  assert.equal(resolveRoute("#city/medical").cityKind, "medical");
  assert.equal(resolveRoute("#city/events").section, "city");
  assert.equal(resolveRoute("#search/saved").saved, true);
  assert.equal(resolveRoute("#missing").section, "feed");
  assert.equal(resolveRoute("#city/missing").cityKind, "schedule");
});
