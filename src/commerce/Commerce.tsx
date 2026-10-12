import { useEffect, useRef, useState } from "react";
import { Plus, Minus, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Pharmacy } from "../pharmacy/Pharmacy";
import { httpApi } from "../api";
import { readStored } from "../repository";
import type { Section, Entry } from "../data";
import type {
  CommerceCatalog,
  CartLine,
  Quote,
  DemoOrder,
  BonusAccount,
  Booking,
} from "../../shared/commerce";
import { useRemote, RemoteState } from "./useRemote";
export const money = (minor: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(minor / 100);
const date = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Yekaterinburg",
  }).format(new Date(iso));
export function Commerce({
  section,
  entries,
  go,
}: {
  section: Section;
  entries: Entry[];
  go: (section: Section) => void;
}) {
  const catalog = useRemote<CommerceCatalog>("/commerce");
  const bonus = useRemote<BonusAccount>("/bonus");
  const orders = useRemote<DemoOrder[]>("/orders");
  const bookings = useRemote<Booking[]>("/appointments");
  const [cart, setCart] = useState<CartLine[]>(() => {
    const v = readStored<unknown>("novik24.cart.v1", []);
    return Array.isArray(v)
      ? v.filter(
          (x) =>
            x &&
            typeof x.itemId === "string" &&
            Number.isInteger(x.quantity) &&
            x.quantity > 0 &&
            x.quantity <= 20,
        )
      : [];
  });
  const [cafeId, setCafeId] = useState("");
  const [filter, setFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const [fulfilment, setFulfilment] = useState("pickup");
  const [points, setPoints] = useState(0);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [created, setCreated] = useState<DemoOrder | null>(null);
  const [provider, setProvider] = useState(
    () => location.hash.split("/")[1] || "s1",
  );
  const [slot, setSlot] = useState("");
  const orderKey = useRef(crypto.randomUUID());
  useEffect(() => {
    try {
      localStorage.setItem("novik24.cart.v1", JSON.stringify(cart));
    } catch {
      setError("Не удалось сохранить черновик корзины");
    }
  }, [cart]);
  useEffect(() => {
    setQuery("");
    setFilter("Все");
    setError("");
    setNotice("");
  }, [section]);
  useEffect(() => {
    if (section !== "cart" || !cart.length) {
      setQuote(null);
      return;
    }
    let active = true;
    setQuoting(true);
    setError("");
    httpApi
      .request<Quote>("/quote", {
        lines: cart,
        fulfilment,
        bonusPoints: points,
      })
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setQuote(null);
        }
      })
      .finally(() => {
        if (active) setQuoting(false);
      });
    return () => {
      active = false;
    };
  }, [section, cart, points, fulfilment]);
  function add(itemId: string) {
    const item = catalog.data?.menu.find((x) => x.id === itemId);
    if (!item || !item.available) return;
    const oldCafe = catalog.data?.menu.find(
      (x) => x.id === cart[0]?.itemId,
    )?.cafeId;
    if (oldCafe && oldCafe !== item.cafeId) {
      setError("В корзине другое кафе. Очистите корзину перед сменой кафе.");
      return;
    }
    setCreated(null);
    setError("");
    setCart((previous) =>
      previous.some((x) => x.itemId === itemId)
        ? previous.map((x) =>
            x.itemId === itemId
              ? { ...x, quantity: Math.min(20, x.quantity + 1) }
              : x,
          )
        : [...previous, { itemId, quantity: 1 }],
    );
    setNotice("Добавлено в demo-корзину");
  }
  function quantity(id: string, delta: number) {
    setPoints(0);
    setCart((c) =>
      c
        .map((x) =>
          x.itemId === id
            ? { ...x, quantity: Math.min(20, x.quantity + delta) }
            : x,
        )
        .filter((x) => x.quantity > 0),
    );
  }
  async function submitOrder() {
    if (busy || quoting || !quote) return;
    setBusy(true);
    setError("");
    try {
      const value = await httpApi.request<DemoOrder>("/orders", {
        lines: cart,
        fulfilment,
        bonusPoints: points,
        idempotencyKey: orderKey.current,
      });
      setCreated(value);
      setCart([]);
      setPoints(0);
      orderKey.current = crypto.randomUUID();
      bonus.retry();
      orders.retry();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось создать demo-заказ",
      );
    } finally {
      setBusy(false);
    }
  }
  async function book() {
    setBusy(true);
    setError("");
    try {
      const b = await httpApi.request<Booking>("/appointments", {
        providerId: provider,
        slot,
      });
      setNotice(`Демо-запись ${b.id} создана. Исполнитель не уведомлён.`);
      bookings.retry();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка записи");
    } finally {
      setBusy(false);
    }
  }
  if (catalog.loading || catalog.error) return <RemoteState {...catalog} />;
  const data = catalog.data!;
  const cafe = data.cafes.find((x) => x.id === cafeId) || data.cafes[0];
  const tasks = data.tasks.filter(
    (x) =>
      (filter === "Все" || x.category === filter) &&
      `${x.title} ${x.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const menu = data.menu.filter(
    (x) =>
      x.cafeId === cafe.id &&
      (filter === "Все" || x.category === filter) &&
      `${x.name} ${x.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const serviceProviders = entries.filter((e) => e.section === "services");
  const availableSlots =
    data.slots.find((x) => x.providerId === provider)?.times || [];
  return (
    <section className="commerce-module">
      <div className="commerce-links">
        {[
          { id: "exchange", label: "Биржа" },
          { id: "appointments", label: "Услуги и запись" },
          { id: "cafes", label: "Кафе и меню" },
          {
            id: "cart",
            label: `Корзина (${cart.reduce((s, x) => s + x.quantity, 0)})`,
          },
          { id: "bonus", label: "Новик Бонус" },
          { id: "pharmacy", label: "Аптеки" },
        ].map((x) => (
          <button
            key={x.id}
            className={section === x.id ? "selected" : ""}
            onClick={() => go(x.id as Section)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="source-banner">
        <b>Демонстрационный сервис · demo</b>
        <p>
          Заказы, записи, отклики и баллы учебные. Деньги не списываются,
          партнёры не получают заявки. Используйте вымышленные данные.
        </p>
      </div>
      {error && (
        <div className="commerce-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <p className="commerce-notice" role="status">
          {notice}
        </p>
      )}
      {section === "exchange" && (
        <>
          <div className="local-search">
            <input
              aria-label="Поиск заданий"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Какую задачу ищем?"
            />
          </div>
          <div className="filters">
            {["Все", ...new Set(data.tasks.map((x) => x.category))].map((c) => (
              <button
                key={c}
                className={filter === c ? "selected" : ""}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="catalog-grid">
            {tasks.map((t) => (
              <article className="card" key={t.id}>
                <div className="card-body">
                  <span className="tag">{t.category} · demo</span>
                  <h2>{t.title}</h2>
                  <p>{t.description}</p>
                  <div className="catalog-bottom">
                    <b>{money(t.budgetMinor)}</b>
                    <button
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          const result = await httpApi.request<{
                            message: string;
                          }>("/exchange", { taskId: t.id });
                          setNotice(result.message);
                        } catch (e) {
                          setError(
                            e instanceof Error ? e.message : "Ошибка отклика",
                          );
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Откликнуться · demo
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!tasks.length && (
            <div className="empty">
              <h3>Заданий не найдено</h3>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("Все");
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
          <button
            className="primary journey-next"
            onClick={() => go("appointments")}
          >
            Найти услугу и время <ArrowUpRight size={17} />
          </button>
        </>
      )}
      {section === "cafes" && (
        <>
          <div className="cafe-selector">
            {data.cafes.map((c) => (
              <button
                className={cafe.id === c.id ? "selected" : ""}
                key={c.id}
                onClick={() => {
                  setCafeId(c.id);
                  setFilter("Все");
                  setQuery("");
                }}
              >
                <b>{c.name}</b>
                <small>
                  {c.address} · {c.hours} · demo
                </small>
              </button>
            ))}
          </div>
          <h2>Меню · {cafe.name}</h2>
          <div className="local-search">
            <input
              aria-label="Поиск в меню"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Блюдо или напиток"
            />
          </div>
          <div className="filters">
            {[
              "Все",
              ...new Set(
                data.menu
                  .filter((x) => x.cafeId === cafe.id)
                  .map((x) => x.category),
              ),
            ].map((c) => (
              <button
                key={c}
                className={filter === c ? "selected" : ""}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="catalog-grid">
            {menu.map((item) => (
              <article className="card" key={item.id}>
                <div
                  className="entry-visual photo-cafe"
                  role="img"
                  aria-label="Иллюстрация кафе · demo"
                />
                <div className="card-body">
                  <span className="tag">{item.category} · demo</span>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <div className="catalog-bottom">
                    <b>{money(item.priceMinor)}</b>
                    <button
                      aria-label={`В корзину: ${item.name}`}
                      disabled={!item.available}
                      onClick={() => add(item.id)}
                    >
                      {item.available ? "В корзину" : "Недоступно · demo"}
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!menu.length && (
            <div className="empty">
              <h3>Блюд не найдено</h3>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("Все");
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          )}
          <button className="primary journey-next" onClick={() => go("cart")}>
            <ShoppingBag size={17} />
            Перейти в корзину
          </button>
        </>
      )}
      {section === "cart" && (
        <>
          {created && (
            <div className="order-confirmation" role="status">
              <h2>Демо-заказ создан</h2>
              <b>{created.id}</b>
              <p>
                Оплата не выполнялась. Кафе не получило заказ, доставка не будет
                выполнена.
              </p>
              <p>
                Итого в демонстрации: {money(created.quote.totalMinor)} ·
                начислено {created.quote.earnPoints} demo-баллов
              </p>
              <button className="primary" onClick={() => go("bonus")}>
                Посмотреть бонусы
              </button>
            </div>
          )}
          {cart.length ? (
            <>
              <div className="cart-lines">
                {cart.map((line) => {
                  const item = data.menu.find((x) => x.id === line.itemId);
                  return (
                    <div className="cart-line" key={line.itemId}>
                      <div>
                        <b>{item?.name || "Позиция недоступна"}</b>
                        <p>
                          {item
                            ? money(item.priceMinor * line.quantity)
                            : "Обновите корзину"}
                        </p>
                      </div>
                      <div className="quantity">
                        <button
                          aria-label={`Уменьшить ${item?.name}`}
                          onClick={() => quantity(line.itemId, -1)}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          aria-label={`Увеличить ${item?.name}`}
                          onClick={() => quantity(line.itemId, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                className="create-form checkout"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitOrder();
                }}
              >
                <label>
                  Получение
                  <select
                    aria-label="Способ получения"
                    value={fulfilment}
                    onChange={(e) => setFulfilment(e.target.value)}
                  >
                    <option value="pickup">Самовывоз · demo</option>
                    <option value="delivery">Доставка · demo</option>
                  </select>
                </label>
                <label>
                  Использовать demo-баллы (до {quote?.maxBonusPoints ?? 0})
                  <input
                    aria-label="Бонусные баллы"
                    type="number"
                    min={0}
                    max={quote?.maxBonusPoints ?? 0}
                    step={1}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                  />
                </label>
                {quoting ? (
                  <p role="status">Рассчитываем заказ на сервере…</p>
                ) : (
                  quote && (
                    <dl className="quote">
                      <div>
                        <dt>Блюда</dt>
                        <dd>{money(quote.subtotalMinor)}</dd>
                      </div>
                      <div>
                        <dt>Доставка · demo</dt>
                        <dd>{money(quote.deliveryMinor)}</dd>
                      </div>
                      <div>
                        <dt>Баллы · demo</dt>
                        <dd>−{quote.bonusPoints}</dd>
                      </div>
                      <div>
                        <dt>Итого · demo</dt>
                        <dd>{money(quote.totalMinor)}</dd>
                      </div>
                    </dl>
                  )
                )}
                <p className="demo-note">
                  1 demo-балл = 1 ₽ в расчёте. Баллами можно покрыть до{" "}
                  {bonus.data?.maxPaymentPercent ?? 20}% стоимости блюд,
                  доставка исключена. Реальная оплата отключена.
                </p>
                <label className="consent">
                  <input type="checkbox" required />
                  Понимаю, что это демонстрация, заказ не будет исполнен
                </label>
                <button
                  className="primary"
                  disabled={busy || quoting || !quote}
                >
                  {busy ? "Создаём…" : "Оформить демо-заказ"}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setCart([]);
                    setPoints(0);
                    setCreated(null);
                  }}
                >
                  Очистить корзину
                </button>
              </form>
            </>
          ) : (
            !created && (
              <div className="empty">
                <ShoppingBag size={28} />
                <h3>Корзина пуста</h3>
                <p>Выберите блюдо из демокаталога.</p>
                <button className="primary" onClick={() => go("cafes")}>
                  Открыть меню
                </button>
              </div>
            )
          )}
          <h3>История демо-заказов</h3>
          {orders.loading || orders.error ? (
            <RemoteState {...orders} />
          ) : orders.data?.length ? (
            orders.data.map((o) => (
              <div className="history-row" key={o.id}>
                <b>{o.id}</b>
                <span>
                  {money(o.quote.totalMinor)} · {date(o.createdAt)} · оплата не
                  выполнялась
                </span>
              </div>
            ))
          ) : (
            <p className="demo-note">Демо-заказов пока нет.</p>
          )}
        </>
      )}
      {section === "bonus" &&
        (bonus.loading || bonus.error ? (
          <RemoteState {...bonus} />
        ) : (
          <>
            <div className="bonus-balance">
              <span>НОВИК БОНУС · DEMO</span>
              <h2>
                {bonus.data?.balance} <small>баллов</small>
              </h2>
              <p>
                До {bonus.data?.maxPaymentPercent}% стоимости блюд в
                демо-расчёте
              </p>
            </div>
            <h3>История начислений и списаний</h3>
            {bonus.data?.transactions.length ? (
              bonus.data.transactions.map((t) => (
                <div className="history-row" key={t.id}>
                  <div>
                    <b>{t.reason}</b>
                    <p>
                      {date(t.createdAt)}
                      {t.orderId ? ` · ${t.orderId}` : ""}
                    </p>
                  </div>
                  <strong>
                    {t.points > 0 ? "+" : ""}
                    {t.points}
                  </strong>
                </div>
              ))
            ) : (
              <p>Операций пока нет.</p>
            )}
            <button
              className="primary journey-next"
              onClick={() => go("cafes")}
            >
              К партнёрскому меню · demo
            </button>
          </>
        ))}
      {section === "appointments" && (
        <>
          <h2>Выберите услугу и время · demo</h2>
          <form
            className="create-form"
            onSubmit={(e) => {
              e.preventDefault();
              book();
            }}
          >
            <label>
              Специалист
              <select
                aria-label="Специалист"
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  setSlot("");
                }}
              >
                {serviceProviders.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Время Урала
              <select
                aria-label="Время записи"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                required
              >
                <option value="">Выберите demo-время</option>
                {availableSlots.map((t) => (
                  <option key={t} value={t}>
                    {date(t)}
                  </option>
                ))}
              </select>
            </label>
            {!availableSlots.length && <p>Демонстрационных окон нет.</p>}
            <button className="primary" disabled={busy || !slot}>
              Создать демо-запись
            </button>
          </form>
          <h3>Ваши демо-записи</h3>
          {bookings.loading || bookings.error ? (
            <RemoteState {...bookings} />
          ) : bookings.data?.length ? (
            bookings.data.map((b) => (
              <div className="history-row" key={b.id}>
                <b>{b.providerName}</b>
                <span>{date(b.slot)} · demo</span>
              </div>
            ))
          ) : (
            <p className="demo-note">
              Демо-записей пока нет. Это не медицинская запись.
            </p>
          )}
          <button
            className="secondary journey-next"
            onClick={() => go("cafes")}
          >
            После дел — в кафе
          </button>
        </>
      )}
      {section === "pharmacy" && <Pharmacy />}
    </section>
  );
}
