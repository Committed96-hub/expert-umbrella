export type DemoScreening = {
  id: string;
  date: string;
  time: string;
  filmId: string;
};
export type DemoOffer = {
  id: string;
  name: string;
  priceMinor: number;
  timing: string;
  note: string;
  mode: "DEMO";
};
export type DemoExperienceCatalog = {
  mode: "DEMO";
  screenings: DemoScreening[];
  hall: {
    rows: number;
    seatsPerRow: number;
    unavailable: string[];
    prices: { frontMinor: number; backMinor: number };
  };
  request: {
    id: string;
    title: string;
    description: string;
    district: string;
    desiredTime: string;
  };
  offers: DemoOffer[];
};
export type DemoTicket = {
  id: string;
  mode: "DEMO";
  validForAdmission: false;
  screening: DemoScreening;
  filmTitle: string;
  seats: { row: number; seat: number; priceMinor: number }[];
  totalMinor: number;
  createdAt: string;
};
export type DemoExchange = {
  id: string;
  mode: "DEMO";
  status: "open" | "selected" | "completed";
  offerId?: string;
  messages: { author: string; text: string }[];
};
