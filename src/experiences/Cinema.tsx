import { useRef, useState } from "react";
import { useRemote, RemoteState } from "../commerce/useRemote";
import { httpApi } from "../api";
import { money } from "../commerce/Commerce";
import { useRealCity } from "../real/RealCity";
import type {
  DemoExperienceCatalog,
  DemoTicket,
} from "../../shared/experiences";
const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Yekaterinburg",
  }).format(new Date(date + "T12:00:00+05:00"));
export function Cinema() {
  const catalog = useRemote<DemoExperienceCatalog>("/experiences");
  const real = useRealCity();
  const [date, setDate] = useState(""),
    [screeningId, setScreening] = useState(""),
    [seats, setSeats] = useState<string[]>([]),
    [step, setStep] = useState<"film" | "hall" | "cart" | "ticket">("film");
  const [ticket, setTicket] = useState<DemoTicket | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const key = useRef(crypto.randomUUID());
  if (catalog.loading || catalog.error) return <RemoteState {...catalog} />;
  if (real.loading || real.error) return <RemoteState {...real} />;
  const data = catalog.data!;
  const film = real.data?.objects.find((o) => o.id === "fall2");
  const days = [...new Set(data.screenings.map((s) => s.date))];
  const selectedDate = days.includes(date) ? date : days[0];
  const screening = data.screenings.find((s) => s.id === screeningId);
  const unitPrice = (key: string) =>
    Number(key.split("-")[0]) <= 2
      ? data.hall.prices.frontMinor
      : data.hall.prices.backMinor;
  const total = seats.reduce((sum, key) => sum + unitPrice(key), 0);
  function reset() {
    setStep("film");
    setSeats([]);
    setTicket(null);
    setScreening("");
    setError("");
    key.current = crypto.randomUUID();
  }
  async function issue() {
    if (!screening || !seats.length) return;
    setBusy(true);
    setError("");
    try {
      const created = await httpApi.request<DemoTicket>("/tickets", {
        screeningId: screening.id,
        seats: seats.map((key) => {
          const [row, seat] = key.split("-").map(Number);
          return { row, seat };
        }),
        idempotencyKey: key.current,
      });
      setTicket(created);
      setStep("ticket");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось выпустить DEMO-билет",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="experience-module cinema-demo"
      aria-label="Демонстрационная покупка кинобилета"
    >
      <div className="demo-banner">
        <b>DEMO — учебная покупка</b>
        <p>
          Киноцентр и сведения о фильме реальные. Даты, время, цены, схема зала
          и занятость мест ниже вымышлены. Ничего не бронируем в «Нейве».
        </p>
      </div>
      <ol className="experience-steps" aria-label="Этапы покупки">
        {["Фильм и сеанс", "Ряд и место", "Корзина", "DEMO-билет"].map(
          (label, i) => (
            <li
              key={label}
              aria-current={
                ["film", "hall", "cart", "ticket"][i] === step
                  ? "step"
                  : undefined
              }
            >
              {i + 1}. {label}
            </li>
          ),
        )}
      </ol>
      {step === "film" && (
        <div className="experience-card">
          <span className="tag">Киноцентр «Нейва» · реальный объект</span>
          <h2>{film?.title || "Информация о фильме уточняется"}</h2>
          <p>
            {film?.fields.Жанр} · {film?.fields.Продолжительность} ·{" "}
            {film?.fields.Возраст}
          </p>
          <p>{film?.summary}</p>
          <p>Постер не опубликован: права не подтверждены.</p>
          <fieldset>
            <legend>Выберите DEMO-дату</legend>
            <div className="choice-row">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={day === selectedDate}
                  onClick={() => {
                    setDate(day);
                    setScreening("");
                    setSeats([]);
                  }}
                >
                  {dateLabel(day)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Выберите DEMO-сеанс</legend>
            <div className="choice-row">
              {data.screenings
                .filter((s) => s.date === selectedDate)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={s.id === screeningId}
                    onClick={() => {
                      setScreening(s.id);
                      setSeats([]);
                      key.current = crypto.randomUUID();
                    }}
                  >
                    {s.time} · DEMO
                  </button>
                ))}
            </div>
          </fieldset>
          <button
            className="primary"
            disabled={!screening}
            onClick={() => setStep("hall")}
          >
            Выбрать места в DEMO-зале
          </button>
        </div>
      )}
      {step === "hall" && (
        <div className="experience-card">
          <h2>DEMO-схема зала</h2>
          <p>
            Это не схема реального киноцентра.{" "}
            {screening && `${dateLabel(screening.date)}, ${screening.time}`} ·
            до 6 мест.
          </p>
          <div className="cinema-screen">ЭКРАН · DEMO</div>
          <div
            className="seat-map"
            role="group"
            aria-label="Выбор ряда и места"
          >
            {Array.from({ length: data.hall.rows }, (_, r) => (
              <div className="seat-row" key={r}>
                <span aria-hidden="true">{r + 1}</span>
                {Array.from({ length: data.hall.seatsPerRow }, (_, s) => {
                  const id = `${r + 1}-${s + 1}`,
                    unavailable = data.hall.unavailable.includes(id);
                  return (
                    <button
                      key={id}
                      disabled={
                        unavailable ||
                        (!seats.includes(id) && seats.length >= 6)
                      }
                      aria-label={`Ряд ${r + 1}, место ${s + 1}, ${money(unitPrice(id))}${unavailable ? ", недоступно" : ""}`}
                      aria-pressed={seats.includes(id)}
                      onClick={() => {
                        setSeats((prev) =>
                          prev.includes(id)
                            ? prev.filter((v) => v !== id)
                            : [...prev, id],
                        );
                        key.current = crypto.randomUUID();
                      }}
                    >
                      {s + 1}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <p>
            Серые места недоступны в DEMO. Выбранные места отмечены и доступны
            для снятия выбора.
          </p>
          <ul className="seat-selection">
            {seats.map((id) => (
              <li key={id}>
                Ряд {id.split("-")[0]}, место {id.split("-")[1]} —{" "}
                {money(unitPrice(id))}
              </li>
            ))}
          </ul>
          <p role="status">
            Учебная сумма: <b>{money(total)}</b>
          </p>
          <div className="choice-row">
            <button className="secondary" onClick={() => setStep("film")}>
              Назад к сеансу
            </button>
            <button
              className="primary"
              disabled={!seats.length}
              onClick={() => setStep("cart")}
            >
              В корзину билетов
            </button>
          </div>
        </div>
      )}
      {step === "cart" && (
        <div className="experience-card">
          <h2>Корзина DEMO-билетов</h2>
          <p>
            {film?.title} ·{" "}
            {screening && `${dateLabel(screening.date)}, ${screening.time}`}
          </p>
          {seats.map((id) => (
            <p key={id}>
              Ряд {id.split("-")[0]}, место {id.split("-")[1]} —{" "}
              {money(unitPrice(id))}
            </p>
          ))}
          <h3>Итого DEMO: {money(total)}</h3>
          <p>
            Сумма пересчитывается на сервере. Оплаты и реального бронирования
            нет.
          </p>
          <div className="choice-row">
            <button
              className="secondary"
              disabled={busy}
              onClick={() => setStep("hall")}
            >
              Изменить места
            </button>
            <button className="primary" disabled={busy} onClick={issue}>
              {busy ? "Формируем…" : "Получить DEMO-билет"}
            </button>
          </div>
        </div>
      )}
      {step === "ticket" && ticket && (
        <article className="demo-ticket">
          <span className="real-badge">НОВИК 24 · УЧЕБНЫЙ БИЛЕТ</span>
          <h2>{ticket.filmTitle}</h2>
          <p>
            {dateLabel(ticket.screening.date)}, {ticket.screening.time} · DEMO
          </p>
          <div className="ticket-seats">
            {ticket.seats.map((s) => (
              <b key={`${s.row}-${s.seat}`}>
                Ряд {s.row} · место {s.seat}
              </b>
            ))}
          </div>
          <p>Учебная сумма: {money(ticket.totalMinor)}</p>
          <p className="ticket-invalid">DEMO — не действителен для прохода</p>
          <small>{ticket.id}</small>
          <p>Киноцентр не получил заказ. Этот билет не подтверждает покупку.</p>
          <div className="choice-row">
            <button
              className="secondary"
              onClick={() => {
                const text = `НОВИК 24 — DEMO\nНЕ ДЕЙСТВИТЕЛЕН ДЛЯ ПРОХОДА\n${ticket.filmTitle}\n${ticket.screening.date} ${ticket.screening.time}\n${ticket.seats.map((s) => `Ряд ${s.row}, место ${s.seat}`).join("\n")}\nУчебная сумма: ${money(ticket.totalMinor)}\n${ticket.id}\nРеальный заказ не создавался.`;
                const url = URL.createObjectURL(
                  new Blob([text], { type: "text/plain;charset=utf-8" }),
                );
                const link = document.createElement("a");
                link.href = url;
                link.download = "novik24-DEMO-ticket.txt";
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              Скачать DEMO-билет
            </button>
            <button className="primary" onClick={reset}>
              Начать заново
            </button>
          </div>
        </article>
      )}
      {!!error && (
        <div className="error-state" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}
