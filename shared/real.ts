export type Evidence = {
  url: string;
  name: string;
  checkedAt: string;
  method: "public_page" | "search_index";
  terms: string;
  covers: string[];
};
export type RealObject = {
  id: string;
  title: string;
  category: string;
  sections: string[];
  mode: "REAL";
  status: "verified" | "partial" | "archived";
  summary: string;
  fields: Record<string, string | null>;
  sources: Evidence[];
  verifiedAt: string;
  validAt: string | null;
  photoStatus: "licensed" | "permission_missing";
  photoId?: string;
  relatedIds?: string[];
  actionUrl?: string;
  actionLabel?: string;
  demoAction?: "cinema" | "solo" | "job" | "exchange";
};
export type RealSnapshot = {
  version: string;
  objects: RealObject[];
  automaticUpdates: false;
};
export interface CityContentSource {
  list(): Promise<RealSnapshot>;
}
