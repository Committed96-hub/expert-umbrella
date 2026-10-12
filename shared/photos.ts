export type CityPhoto = {
  id: string; object: string; city: "Новоуральск"; author: string;
  source: string; original: string; license: string; licenseUrl: string;
  date: string; evidence: string; changes: "Нет";
};
export type PhotoRegistry = {
  photos: CityPhoto[];
  sections: Record<string, { photoId?: string; missing?: string }>;
};
