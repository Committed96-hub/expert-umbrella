import type { DemoExperienceCatalog } from "../../shared/experiences";
export function experienceSeed(now = new Date()): DemoExperienceCatalog {
  const day = (offset: number) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Yekaterinburg",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(now.getTime() + offset * 86400000));
  const dates = [day(1), day(2)];
  return {
    mode: "DEMO",
    screenings: dates.flatMap((date) =>
      ["18:00", "20:30"].map((time) => ({
        id: `demo-${date}-${time}`,
        date,
        time,
        filmId: "fall2",
      })),
    ),
    hall: {
      rows: 5,
      seatsPerRow: 8,
      unavailable: ["1-2", "2-5", "4-4"],
      prices: { frontMinor: 35000, backMinor: 45000 },
    },
    request: {
      id: "mixer-demo",
      title: "Установить смеситель",
      description:
        "Учебная заявка: заменить смеситель, проверить соединения и убрать рабочее место. Ни один реальный житель не разместил эту заявку.",
      district: "Центральный район · DEMO",
      desiredTime: "Завтра, 18:00–20:00 · DEMO",
    },
    offers: [
      {
        id: "offer-1",
        name: "DEMO-исполнитель А",
        priceMinor: 150000,
        timing: "Завтра, 18:00",
        note: "Учебное предложение: работа, расходники отдельно",
        mode: "DEMO",
      },
      {
        id: "offer-2",
        name: "DEMO-исполнитель Б",
        priceMinor: 190000,
        timing: "Завтра, 19:00",
        note: "Учебное предложение: работа и базовые расходники",
        mode: "DEMO",
      },
      {
        id: "offer-3",
        name: "DEMO-исполнитель В",
        priceMinor: 130000,
        timing: "Послезавтра, 10:00",
        note: "Учебное предложение: только установка",
        mode: "DEMO",
      },
    ],
  };
}
