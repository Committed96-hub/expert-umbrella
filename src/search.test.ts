import { test } from "node:test";
import assert from "node:assert/strict";
import { demo } from "../server/seed/catalog";
import { searchEntries, assistant } from "./repository";
test("Поиск учитывает русский регистр и несколько слов", () => {
  assert.equal(searchEntries(demo, "  МАСТЕР дому ")[0].id, "s1");
  assert.equal(searchEntries(demo, "несуществующийзапрос").length, 0);
  assert.equal(searchEntries(demo, "").length, demo.length);
});
test("Помощник даёт подборку и явно обозначает деморежим", async () => {
  const answer = await assistant.reply("Где выпить кофе?", demo);
  assert.match(answer, /Тёплый хлеб/);
  assert.match(answer, /без подключения к языковой модели/);
});
