import { useState } from "react";
import { httpApi } from "../api";
export function Pharmacy() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="pharmacy-future">
      <h2>Аптеки · будущий модуль</h2>
      <p>
        Местные аптеки, поиск препарата, наличие, цены и сравнение предложений
        будут доступны после официальных интеграций.
      </p>
      <form
        className="local-search"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await httpApi.request("/pharmacy?q=" + encodeURIComponent(query));
            setSearched(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка API");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          aria-label="Название препарата"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearched(false);
          }}
          placeholder="Название препарата"
          required
          maxLength={100}
        />
        <button className="primary" disabled={busy}>
          {busy ? "Проверяем…" : "Поиск"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {searched && (
        <div className="empty">
          <h3>Источник аптечных предложений не подключён</h3>
          <p>Мы не показываем вымышленное наличие и цены лекарств.</p>
        </div>
      )}
      <div className="source-banner">
        <b>Заказы и доставка отключены</b>
        <p>
          Бронирование, продажа и доставка появятся только с лицензированными
          партнёрами и там, где это юридически разрешено. Сейчас лекарство
          нельзя купить, забронировать или заказать.
        </p>
      </div>
    </div>
  );
}
