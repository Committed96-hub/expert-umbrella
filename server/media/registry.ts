import type { CityPhoto, PhotoRegistry } from "../../shared/photos";
const commons = "https://commons.wikimedia.org/wiki/File:";
const upload = "https://upload.wikimedia.org/wikipedia/commons/";
function filename(file: string) {
  // Wikimedia media URLs use underscores, matching the actual Original file links.
  return encodeURIComponent(file.replaceAll(" ", "_"))
    .replaceAll("(", "%28")
    .replaceAll(")", "%29");
}
function own(
  id: string,
  file: string,
  path: string,
  object: string,
  date: string,
): CityPhoto {
  return {
    id,
    object,
    city: "Новоуральск",
    author: "Gavrilov S.A.",
    source: commons + filename(file),
    original: upload + path + filename(file),
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    date,
    evidence:
      "Авторская подпись в разделе Summary: точный объект и Новоуральск; Source: Own work. Лицензия указана правообладателем в Licensing.",
    changes: "Нет",
  };
}
export const photoRegistry: PhotoRegistry = {
  photos: [
    {
      id: "forest",
      object: "Городской лесной массив Новоуральска",
      city: "Новоуральск",
      author: "Денис Александров",
      source:
        commons +
        encodeURIComponent(
          "Novouralsk, Sverdlovsk Oblast, Russia - panoramio (819).jpg",
        ),
      original:
        upload +
        "7/79/" +
        filename("Novouralsk, Sverdlovsk Oblast, Russia - panoramio (819).jpg"),
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      date: "2015-04-13",
      evidence:
        "Первоисточник Panoramio №118638328 (архив: https://web.archive.org/web/20161031223454/http://www.panoramio.com/photo/118638328). Автор Денис Александров; лицензия подтверждена Panoramio upload bot 04.06.2017. Геометка 57.244148, 60.089614; категория Forest massif, Novouralsk. Дата — дата исходной публикации. Это не подтверждённый снимок ЦПКиО на Фурманова, 26.",
      changes: "Нет",
    },
    {
      id: "hospital",
      object: "Больничный городок Новоуральска — архивный вид",
      city: "Новоуральск",
      author: "Денис Александров",
      source:
        commons +
        encodeURIComponent(
          "Novouralsk, Sverdlovsk Oblast, Russia - panoramio (113).jpg",
        ),
      original:
        upload +
        "0/0f/" +
        filename("Novouralsk, Sverdlovsk Oblast, Russia - panoramio (113).jpg"),
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      date: "2012-05-12",
      evidence:
        "Первоисточник Panoramio №73036261 (архив: https://web.archive.org/web/20161024200758/http://www.panoramio.com/photo/73036261). Автор Денис Александров; CC BY 3.0 подтверждена ботом 05.01.2017. Геометка 57.248998, 60.103160 и категория Hospital precinct, Novouralsk подтверждают место. Не выдаётся за фасад городской поликлиники на Комсомольской, 9.",
      changes: "Нет",
    },
    {
      id: "lake",
      object:
        "Вид на Новоуральск с противоположного берега Верх-Нейвинского пруда",
      city: "Новоуральск",
      author: "Alexander Yampolsky (ayampolsky)",
      source: "https://flickr.com/photos/157001631@N07/27101230488",
      original:
        upload +
        "3/38/" +
        filename("Новоуральск на другом берегу (27101230488).jpg"),
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      date: "2014-02-09",
      evidence:
        "Wikimedia Commons: File:Новоуральск_на_другом_берегу_(27101230488).jpg; подпись и геометка 57.262786, 60.132063. Flickr review подтвердил лицензию 29.10.2022.",
      changes: "Нет",
    },
    own(
      "square",
      "Театральная площадь в Новоуральске.JPG",
      "a/af/",
      "Театральная площадь",
      "2011-08-22",
    ),
    own(
      "theatre",
      "Театр оперетты Урала.jpg",
      "5/5c/",
      "Театр музыки, драмы и комедии",
      "2011-02-06",
    ),
    own(
      "residential",
      "Улица Ленина, дом 90. Новоуральск.JPG",
      "8/86/",
      "Улица Ленина, дом 90",
      "2011-08-22",
    ),
  ],
  sections: {
    home: { photoId: "lake" },
    feed: { photoId: "square" },
    ads: { photoId: "residential" },
    "city/events": { photoId: "theatre" },
    cinema: {
      missing:
        "Фото киноцентра «Нейва» с подтверждёнными правами пока не найдено",
    },
    cars: { missing: "Фотографии продавцов не копируются без разрешения" },
    "city/cinema": {
      missing: "Лицензированное фото кинотеатра ещё не подтверждено",
    },
    jobs: { missing: "Нужны разрешённые фотографии реальных предприятий" },
    shops: {
      missing:
        "Права на фотографии ТЦ «Комсомол» и ТЦ «Кедр» пока не подтверждены",
    },
    malls: {
      missing:
        "Права на фотографии ТЦ «Комсомол» и ТЦ «Кедр» пока не подтверждены",
    },
    cafes: {
      missing:
        "Нужны фотографии заведений с разрешением владельцев или авторов",
    },
    online: { photoId: "square" },
    parks: { photoId: "forest" },
    "city/medical": { photoId: "hospital" },
    services: {
      missing: "Фотографии местных мастеров с разрешением ещё не добавлены",
    },
  },
};
