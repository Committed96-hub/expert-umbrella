import type { CityPhoto, PhotoRegistry } from "../../shared/photos";
const commons = "https://commons.wikimedia.org/wiki/File:";
const upload = "https://upload.wikimedia.org/wikipedia/commons/";
function own(id: string, file: string, path: string, object: string, date: string): CityPhoto {
  return { id, object, city: "Новоуральск", author: "Gavrilov S.A.",
    source: commons + encodeURIComponent(file), original: upload + path + encodeURIComponent(file),
    license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    date, evidence: "Авторская подпись в разделе Summary: точный объект и Новоуральск; Source: Own work. Лицензия указана правообладателем в Licensing.", changes: "Нет" };
}
export const photoRegistry: PhotoRegistry = {
  photos: [
    { id: "lake", object: "Вид на Новоуральск с противоположного берега Верх-Нейвинского пруда", city: "Новоуральск",
      author: "Alexander Yampolsky (ayampolsky)",
      source: "https://flickr.com/photos/157001631@N07/27101230488",
      original: upload + "3/38/" + encodeURIComponent("Новоуральск на другом берегу (27101230488).jpg"),
      license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      date: "2014-02-09", evidence: "Wikimedia Commons: File:Новоуральск_на_другом_берегу_(27101230488).jpg; подпись и геометка 57.262786, 60.132063. Flickr review подтвердил лицензию 29.10.2022.", changes: "Нет" },
    own("square", "Театральная площадь в Новоуральске.JPG", "a/af/", "Театральная площадь", "2011-08-22"),
    own("theatre", "Театр оперетты Урала.jpg", "5/5c/", "Театр музыки, драмы и комедии", "2011-02-06"),
    own("residential", "Улица Ленина, дом 90. Новоуральск.JPG", "8/86/", "Улица Ленина, дом 90", "2011-08-22"),
  ],
  sections: {
    home: { photoId: "lake" }, feed: { photoId: "square" }, ads: { photoId: "residential" },
    "city/events": { photoId: "theatre" }, "city/cinema": { missing: "Лицензированное фото кинотеатра ещё не подтверждено" },
    jobs: { missing: "Нужны разрешённые фотографии реальных предприятий" },
    shops: { missing: "Права на фотографии ТЦ «Комсомол» и ТЦ «Кедр» пока не подтверждены" },
    malls: { missing: "Права на фотографии ТЦ «Комсомол» и ТЦ «Кедр» пока не подтверждены" },
    cafes: { missing: "Нужны фотографии заведений с разрешением владельцев или авторов" },
    online: { missing: "Фотографии мест камер и разрешённые трансляции не подтверждены" },
    parks: { missing: "Нужны лицензированные фотографии конкретных городских парков и аллей" },
    "city/medical": { missing: "Нужно подтверждённое фото медицинского учреждения" },
    services: { missing: "Фотографии местных мастеров с разрешением ещё не добавлены" },
  },
};
