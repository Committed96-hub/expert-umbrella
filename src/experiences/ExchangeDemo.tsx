import { useState } from "react";
import type {
  DemoExperienceCatalog,
  DemoExchange,
} from "../../shared/experiences";
import { useRemote, RemoteState } from "../commerce/useRemote";
import { httpApi } from "../api";
import { money } from "../commerce/Commerce";
export function ExchangeDemo() {
  const catalog = useRemote<DemoExperienceCatalog>("/experiences"),
    state = useRemote<DemoExchange>("/exchange-demo");
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (catalog.loading || catalog.error) return <RemoteState {...catalog} />;
  if (state.loading || state.error) return <RemoteState {...state} />;
  const data = catalog.data!,
    order = state.data!;
  async function act(action: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      state.setData(
        await httpApi.request<DemoExchange>("/exchange-demo", {
          action,
          ...body,
        }),
      );
      if (action === "message") setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка DEMO-заказа");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="experience-module"
      aria-label="Демонстрация заказа услуги"
    >
      <div className="demo-banner">
        <b>DEMO · ни одного реального исполнителя</b>
        <p>
          Тестовые предложения, цены, сроки и чат. Никаких платежей и внешних
          уведомлений.
        </p>
      </div>
      <div className="experience-card">
        <h2>{data.request.title}</h2>
        <p>{data.request.description}</p>
        <p>
          {data.request.district} · {data.request.desiredTime}
        </p>
        <p role="status">
          Статус:{" "}
          {order.status === "open"
            ? "Открыта · DEMO"
            : order.status === "selected"
              ? "Исполнитель выбран · DEMO"
              : "Завершена · DEMO"}
        </p>
      </div>
      <div
        className="comparison"
        role="region"
        aria-label="Сравнение DEMO-предложений"
        tabIndex={0}
      >
        <table>
          <caption>Сравните предложения DEMO-исполнителей</caption>
          <thead>
            <tr>
              <th scope="col">Исполнитель</th>
              <th scope="col">Цена</th>
              <th scope="col">Когда</th>
              <th scope="col">Что входит</th>
              <th scope="col">Выбор</th>
            </tr>
          </thead>
          <tbody>
            {data.offers.map((o) => (
              <tr key={o.id}>
                <th scope="row">{o.name}</th>
                <td>{money(o.priceMinor)} · DEMO</td>
                <td>{o.timing}</td>
                <td>{o.note}</td>
                <td>
                  <button
                    className="secondary"
                    disabled={busy || order.status !== "open"}
                    onClick={() => act("select", { offerId: o.id })}
                  >
                    {order.offerId === o.id ? "Выбран" : "Выбрать " + o.name}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {order.status !== "open" && (
        <div className="experience-card">
          <h3>Демонстрационный чат</h3>
          <div className="messages" aria-live="polite">
            {order.messages.map((m, i) => (
              <p key={i}>
                <b>{m.author}:</b> {m.text}
              </p>
            ))}
          </div>
          {order.status === "selected" && (
            <>
              <form
                className="job-demo"
                onSubmit={(e) => {
                  e.preventDefault();
                  act("message", { text: message });
                }}
              >
                <label>
                  Сообщение в DEMO-чат
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    required
                    placeholder="Используйте тестовый текст"
                  />
                </label>
                <button className="primary" disabled={busy || !message.trim()}>
                  Отправить в DEMO-чат
                </button>
              </form>
              <button
                className="primary journey-next"
                disabled={busy}
                onClick={() => act("complete")}
              >
                Завершить DEMO-заказ услуги
              </button>
            </>
          )}
        </div>
      )}
      {order.status !== "open" && (
        <button
          className="secondary"
          disabled={busy}
          onClick={() => act("reset")}
        >
          Новая DEMO-заявка
        </button>
      )}
      {!!error && (
        <p role="alert" className="error-state">
          {error}
        </p>
      )}
    </section>
  );
}
