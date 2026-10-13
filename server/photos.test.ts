import { test } from "node:test";
import assert from "node:assert/strict";
import { photoRegistry } from "./media/registry";
test("Адреса оригиналов соответствуют ссылкам Original file Wikimedia, а не заголовкам с пробелами", () => {
  const expected: Record<string, string> = {
    forest:
      "https://upload.wikimedia.org/wikipedia/commons/7/79/Novouralsk%2C_Sverdlovsk_Oblast%2C_Russia_-_panoramio_%28819%29.jpg",
    hospital:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Novouralsk%2C_Sverdlovsk_Oblast%2C_Russia_-_panoramio_%28113%29.jpg",
  };
  for (const [id, url] of Object.entries(expected))
    assert.equal(photoRegistry.photos.find((p) => p.id === id)?.original, url);
  assert.equal(
    decodeURIComponent(
      new URL(photoRegistry.photos.find((p) => p.id === "square")!.original)
        .pathname,
    ),
    "/wikipedia/commons/a/af/Театральная_площадь_в_Новоуральске.JPG",
  );
});
