import type {
  Evidence,
  RealObject,
  RealSnapshot,
  CityContentSource,
} from "../../shared/real";
const checkedAt = "2026-10-13";
const factsOnly =
  "Краткие фактические сведения со ссылкой на первоисточник. Авторские тексты и изображения не перепубликуются. Автоматический сбор не включён; для него нужны условия API/фида.";
const source = (
  name: string,
  url: string,
  covers: string[],
  method: Evidence["method"] = "public_page",
): Evidence => ({ name, url, covers, method, checkedAt, terms: factsOnly });
const plan = "https://www.culture-ural.ru/docs/Culture_Plan_10_2026.pdf";
const cinema = "https://kinoneiva.ru/contact";
const film =
  "https://kinoneiva.ru/schedule/cmsmsrvunj2lb0829sy3h2zto/soon?cityId=cjtd73pnveqzk0766h6yitl4x";
const dns = "https://www.dns-shop.ru/shops/novouralsk/402930-tc-komsomolec/";
const bags = "https://www.bagsland.ru/kontakty/";
const med = "https://xn--31-8kcd6cc6a0anm.xn--p1ai/city_polyclinic";
function object(
  value: Omit<RealObject, "mode" | "verifiedAt" | "validAt" | "photoStatus"> &
    Partial<Pick<RealObject, "validAt" | "photoStatus">>,
): RealObject {
  return {
    mode: "REAL",
    verifiedAt: checkedAt,
    validAt: null,
    photoStatus: "permission_missing",
    ...value,
  };
}
export const realObjects: RealObject[] = [
  object({
    id: "neyva",
    title: "Киноцентр «Нейва»",
    category: "Кино",
    sections: ["city/cinema", "search", "city/addresses"],
    status: "verified",
    summary:
      "Реальный киноцентр Новоуральска. Расписание и покупка настоящих билетов доступны на сайте киноцентра. В Новик 24 можно пройти отдельный учебный сценарий без бронирования.",
    fields: {
      Адрес: "Новоуральск, ул. Ленина, 85а",
      Телефон: "+7 (34370) 6-01-60",
      Часы: "Пн–вс, 10:00–23:00",
      Организатор: "ООО «Киноцентр «Нейва»",
      Сеансы: null,
      Цена: null,
    },
    sources: [
      source("Официальные контакты «Нейвы»", cinema, [
        "Название",
        "Адрес",
        "Телефон",
        "Часы",
        "Организатор",
      ]),
    ],
    actionUrl: "https://kinoneiva.ru/schedule",
    actionLabel: "Расписание на официальном сайте",
    demoAction: "cinema",
    relatedIds: ["fall2"],
  }),
  object({
    id: "fall2",
    title: "Вышка 2",
    category: "Фильм",
    sections: ["city/cinema"],
    status: "partial",
    summary:
      "Приключение героинь, решивших продолжить экстремальное путешествие. Информация о фильме опубликована киноцентром; текущие сеансы и цены здесь не подтверждены.",
    fields: {
      Жанр: "Триллер, драма",
      Продолжительность: "102 минуты",
      Возраст: "18+",
      Кинотеатр: "Нейва, Новоуральск",
      Дата: null,
      Сеанс: null,
      Цена: null,
    },
    sources: [
      source("Карточка фильма на сайте киноцентра", film, [
        "Название",
        "Жанр",
        "Продолжительность",
        "Возраст",
        "Кинотеатр",
      ]),
    ],
    actionUrl: film,
    actionLabel: "Проверить сеансы у киноцентра",
  }),
  object({
    id: "solo",
    title: "Ресторан для друзей Solo",
    category: "Кафе",
    sections: ["cafes", "city/addresses", "search", "cart"],
    status: "partial",
    summary:
      "Заведение в Новоуральске. На официальном сайте указан адрес на улице Корнилова. Меню, цены и условия заказа необходимо уточнить у ресторана. Учебное меню ниже — отдельный DEMO-каталог, не предложение Solo.",
    fields: {
      Адрес: "Новоуральск, ул. Корнилова, 13А",
      Телефон: null,
      Часы: null,
      Меню: null,
      Доставка: null,
      Самовывоз: null,
    },
    sources: [
      source(
        "Официальный сайт Solo",
        "https://www.solo66.ru/",
        ["Название", "Адрес"],
        "search_index",
      ),
    ],
    actionUrl: "https://www.solo66.ru/",
    actionLabel: "Официальный сайт Solo",
    demoAction: "solo",
  }),
  object({
    id: "kedr",
    title: "ТЦ «Кедр»",
    category: "Торговые центры",
    sections: ["malls", "shops", "city/addresses"],
    status: "verified",
    summary:
      "Адрес торгового центра подтверждён официальными страницами его магазинов. Режим всего ТЦ и текущие акции требуют отдельной проверки.",
    fields: {
      Адрес: "Новоуральск, ул. Первомайская, 87",
      Часы: null,
      Телефон: null,
      Акции: null,
    },
    sources: [
      source("Контакты магазина Bagsland", bags, ["Название", "Адрес"]),
      source(
        "Магазин Ле’Муррр",
        "https://lemurrr.ru/shops/nov/point77329",
        ["Название", "Адрес"],
        "search_index",
      ),
    ],
    relatedIds: ["bagsland", "lemurrr"],
    actionUrl: bags,
    actionLabel: "Проверить магазин в ТЦ",
  }),
  object({
    id: "komsomolec",
    title: "ТЦ «Комсомолец»",
    category: "Торговые центры",
    sections: ["malls", "shops", "city/addresses"],
    status: "verified",
    summary:
      "В задании указан «Комсомол». Официальная карточка DNS называет объект «ТЦ Комсомолец». Не считаем эти названия тождественными без подтверждения владельца.",
    fields: {
      Адрес: "Новоуральск, ул. Автозаводская, 21",
      Название: "Комсомолец — по источнику DNS",
      Часы: null,
      Телефон: null,
      Акции: null,
    },
    sources: [source("Официальный магазин DNS", dns, ["Название", "Адрес"])],
    relatedIds: ["dns"],
    actionUrl: dns,
    actionLabel: "Магазин на сайте DNS",
  }),
  object({
    id: "dns",
    title: "DNS — ТЦ «Комсомолец»",
    category: "Электроника",
    sections: ["malls", "shops"],
    status: "partial",
    summary:
      "Реальная точка сети цифровой и бытовой техники. Товары, локальные остатки и цены проверяйте на сайте магазина; цены других городов не подставляются.",
    fields: {
      Адрес: "Новоуральск, ул. Автозаводская, 21",
      Расположение: "1 этаж",
      Категория: "Цифровая и бытовая техника",
      Часы: null,
      Телефон: null,
      Товары: null,
      Акции: null,
    },
    sources: [
      source("DNS", dns, ["Название", "Адрес", "Расположение", "Категория"]),
    ],
    actionUrl: dns,
    actionLabel: "Посмотреть официальный каталог",
  }),
  object({
    id: "bagsland",
    title: "Bagsland — ТЦ «Кедр»",
    category: "Сумки и аксессуары",
    sections: ["malls", "shops"],
    status: "verified",
    summary:
      "Магазин сети сумок и аксессуаров. Контакты и часы приведены по официальному справочнику сети, без неподтверждённых скидок и цен.",
    fields: {
      Адрес: "Новоуральск, ул. Первомайская, 87",
      Расположение: "1 этаж",
      Телефон: "+7 (996) 183-84-04",
      Часы: "Ежедневно, 08:00–21:00",
      Товары: null,
      Акции: null,
    },
    sources: [
      source("Официальные контакты Bagsland", bags, [
        "Название",
        "Адрес",
        "Расположение",
        "Телефон",
        "Часы",
      ]),
    ],
    actionUrl: "https://www.bagsland.ru/",
    actionLabel: "Товары на сайте магазина",
  }),
  object({
    id: "lemurrr",
    title: "Ле’Муррр — ТЦ «Кедр»",
    category: "Зоотовары",
    sections: ["malls", "shops"],
    status: "partial",
    summary:
      "Магазин зоотоваров указан в официальном справочнике сети. Текущие часы, остатки и местные цены здесь не подтверждены.",
    fields: {
      Адрес: "Новоуральск, ул. Первомайская, 87",
      Категория: "Товары для животных",
      Часы: null,
      Телефон: null,
      Товары: null,
      Акции: null,
    },
    sources: [
      source(
        "Ле’Муррр",
        "https://lemurrr.ru/shops/nov/point77329",
        ["Название", "Адрес", "Категория"],
        "search_index",
      ),
    ],
    actionUrl: "https://lemurrr.ru/shops/nov/point77329",
    actionLabel: "Официальная карточка магазина",
  }),
  object({
    id: "rav4",
    title: "Toyota RAV4, 2010 — Новоуральск",
    category: "Автомобили",
    sections: ["ads", "cars", "search"],
    status: "verified",
    validAt: "2026-10-01",
    summary:
      "Краткие характеристики публичного объявления № 409140471. Продавец описывает автомобиль как находящийся в хорошем состоянии; независимая проверка состояния не проводилась. Фотографии и авторский текст продавца не копируются.",
    fields: {
      Марка: "Toyota",
      Модель: "RAV4",
      Год: "2010",
      Цена: "1 250 000 ₽",
      Пробег: "287 000 км",
      Двигатель: "Бензин, 2,0 л",
      Мощность: "158 л.с.",
      Коробка: "Вариатор",
      Привод: "Полный, 4WD",
      Кузов: "SUV, 5 дверей",
      Цвет: "Серый",
      Комплектация: "2.0 CVT Стандарт",
      Состояние: "Хорошее — со слов продавца",
      Город: "Новоуральск",
      Публикация: "01.10.2026",
    },
    sources: [
      source(
        "Подробное объявление Дром",
        "https://auto.drom.ru/novouralsk/toyota/rav4/409140471.html",
        ["Характеристики", "Цена", "Публикация", "Город"],
      ),
    ],
    actionUrl: "https://auto.drom.ru/novouralsk/toyota/rav4/409140471.html",
    actionLabel: "Открыть оригинальное объявление",
  }),
  object({
    id: "vesta-archive",
    title: "LADA Vesta, 2024 — архивный пример",
    category: "Автомобили",
    sections: ["cars"],
    status: "archived",
    validAt: "2026-09-01",
    summary:
      "Источник пометил объявление архивным. Используется только для демонстрации сравнения характеристик; не является актуальным предложением продажи.",
    fields: {
      Марка: "LADA",
      Модель: "Vesta",
      Год: "2024",
      Цена: "1 250 000 ₽ — архив",
      Пробег: "35 990 км",
      Двигатель: "Бензин, 1,8 л",
      Мощность: "122 л.с.",
      Коробка: "Вариатор",
      Привод: "Передний",
      Кузов: "Седан",
      Цвет: "Чёрный",
      Комплектация: null,
      Состояние: null,
      Публикация: "01.09.2026",
    },
    sources: [
      source(
        "Архив Дром",
        "https://auto.drom.ru/novouralsk/lada/vesta/356233649.html",
        ["Характеристики", "Архивный статус", "Публикация"],
      ),
    ],
    actionUrl: "https://auto.drom.ru/novouralsk/lada/vesta/356233649.html",
    actionLabel: "Открыть архивный оригинал",
  }),
  object({
    id: "ueip-job",
    title: "Транспортировщик, 5 разряд — АО «УЭХК»",
    category: "Вакансии",
    sections: ["jobs", "search"],
    status: "partial",
    validAt: "2026-09-23",
    summary:
      "Опубликованная вакансия реального работодателя. Работа с погрузкой и перемещением грузов; требования относятся к безопасности транспортировки. Открытость вакансии необходимо уточнить по оригиналу.",
    fields: {
      Работодатель: "АО «УЭХК»",
      Должность: "Транспортировщик, 5 разряд",
      Зарплата: "35 000–40 000 ₽ — по публикации",
      График: "Полный день",
      Занятость: "Полная",
      Требования:
        "Среднее профессиональное образование; опыт не указан как обязательный",
      Обязанности: "Погрузка, разгрузка, сортировка и доставка ТМЦ",
      Условия: null,
      Адрес: "Новоуральск, ул. Дзержинского, 2",
      Публикация: "23.09.2026",
    },
    sources: [
      source(
        "ГдеРабота — публичная карточка",
        "https://gderabota.ru/вакансии/новоуральск/транспортировщик-5-разряд/230105",
        [
          "Должность",
          "Работодатель",
          "Зарплата",
          "График",
          "Адрес",
          "Публикация",
          "Требования",
          "Обязанности",
        ],
      ),
    ],
    actionUrl:
      "https://gderabota.ru/вакансии/новоуральск/транспортировщик-5-разряд/230105",
    actionLabel: "Проверить вакансию у источника",
    demoAction: "job",
  }),
  object({
    id: "gogol",
    title: "«Гоголь. Триптих» — 15 октября",
    category: "События",
    sections: ["city/events", "feed", "search"],
    status: "verified",
    validAt: "2026-10-15",
    photoStatus: "licensed",
    photoId: "theatre",
    summary:
      "Гастрольный спектакль Театра кукол Екатеринбурга в Театре музыки, драмы и комедии Новоуральска. Событие включено в официальный план культуры на октябрь 2026 года.",
    fields: {
      Место: "Театр музыки, драмы и комедии, камерная сцена",
      Адрес: "Новоуральск, ул. Строителей, 13",
      Дата: "15.10.2026",
      Время: "14:00 и 18:00",
      Возраст: "16+",
      Стоимость: "Платно; сумма не опубликована",
    },
    sources: [
      source("Отдел культуры НГО — план октября 2026", plan, [
        "Название",
        "Место",
        "Дата",
        "Время",
        "Возраст",
        "Платно",
        "Адрес",
      ]),
    ],
    actionUrl: "https://nash-teatr.com/",
    actionLabel: "Уточнить билеты у театра",
  }),
  object({
    id: "culture-plan",
    title: "Культурный Новоуральск — октябрь 2026",
    category: "Новости",
    sections: ["feed", "city/events", "city/addresses"],
    status: "verified",
    validAt: "2026-10",
    summary:
      "Отдел культуры опубликовал октябрьский план мероприятий. В приложении доступен краткий обзор; подробности и изменения следует сверять с официальным документом.",
    fields: {
      Источник: "Отдел культуры Администрации НГО",
      Период: "Октябрь 2026",
      Событие: "«Легенда о Шигирском идоле», 24 и 25 октября, 18:00",
      Возраст: "12+",
      Место: "Театр музыки, драмы и комедии",
      Цена: null,
    },
    sources: [
      source("Официальный план культуры", plan, [
        "Период",
        "Событие",
        "Возраст",
        "Место",
      ]),
    ],
    actionUrl: plan,
    actionLabel: "Открыть официальный план",
  }),
  object({
    id: "cmsch31",
    title: "Городская поликлиника ЦМСЧ № 31 ФМБА России",
    category: "Медицина",
    sections: [
      "city/medical",
      "appointments",
      "city/addresses",
      "services",
      "search",
    ],
    status: "verified",
    summary:
      "Реальная городская поликлиника. Свободные талоны не импортируются и не выдумываются. Для настоящей записи используйте официальный сервис учреждения.",
    fields: {
      Адрес: "Новоуральск, ул. Комсомольская, 9",
      Телефон: "+7 (34370) 2-47-97",
      "Контактный центр": "Рабочие дни, 07:30–19:00",
      Талоны: null,
      Запись: "Через официальный сервис",
    },
    sources: [
      source("Официальная городская поликлиника", med, [
        "Название",
        "Адрес",
        "Телефон",
        "Контактный центр",
        "Запись",
      ]),
    ],
    actionUrl: med,
    actionLabel: "Официальная запись и контакты",
  }),
  object({
    id: "park",
    title: "Центральный парк культуры и отдыха",
    category: "Парки",
    sections: ["parks", "city/addresses", "city/events"],
    status: "verified",
    summary:
      "Городской ЦПКиО указан в официальном плане учреждений культуры. Время работы и мероприятия уточняются. Можно сохранить место и посмотреть контакты.",
    fields: {
      Адрес: "Новоуральск, ул. Фурманова, 26",
      Телефон: "+7 (34370) 5-29-25",
      Часы: null,
      Мероприятия: null,
    },
    sources: [
      source("План культуры НГО, контакты учреждений", plan, [
        "Название",
        "Адрес",
        "Телефон",
      ]),
    ],
    actionUrl: plan,
    actionLabel: "Контакты в официальном документе",
  }),
  object({
    id: "square-online",
    title: "Театральная площадь",
    category: "Город онлайн",
    sections: ["online"],
    status: "verified",
    photoStatus: "licensed",
    photoId: "square",
    validAt: "2011-08-22",
    summary:
      "Реальная городская локация на авторской фотографии. Это статичный исторический снимок. Камера и её установка не подтверждены; прямой эфир пока недоступен.",
    fields: {
      Место: "Театральная площадь, Новоуральск",
      "Прямой эфир": "Пока недоступен",
      "Дата фото": "22.08.2011",
      Камера: null,
    },
    sources: [
      {
        ...source(
          "Wikimedia Commons — автор Gavrilov S.A.",
          "https://commons.wikimedia.org/wiki/File:Театральная_площадь_в_Новоуральске.JPG",
          ["Место", "Дата фото"],
        ),
        terms:
          "Фото CC BY-SA 3.0, атрибуция сохранена. Оригинал без изменений.",
      },
    ],
    actionUrl:
      "https://commons.wikimedia.org/wiki/File:Театральная_площадь_в_Новоуральске.JPG",
    actionLabel: "История и источник снимка",
  }),
  object({
    id: "zhivika",
    title: "Аптека «Живика» — улица Ленина",
    category: "Аптеки",
    sections: ["pharmacy"],
    status: "partial",
    summary:
      "Адрес местной аптеки указан на официальном сайте сети. Остатки препаратов, цены и продажа через Новик 24 отключены.",
    fields: {
      Адрес: "Новоуральск, ул. Ленина, 70",
      Телефон: null,
      Часы: null,
      Наличие: null,
      Цена: null,
    },
    sources: [
      source(
        "Официальный сайт Живика",
        "https://zhivika.ru/novouralsk/product/1471812_uroderm_maz_dnaruzhprim_30_15g",
        ["Название", "Адрес"],
        "search_index",
      ),
    ],
    actionUrl: "https://zhivika.ru/novouralsk/pharmacy/list",
    actionLabel: "Проверить аптеку у сети",
  }),
];
realObjects.push(
  object({
    id: "bus4",
    title: "Городской автобус № 4",
    category: "Транспорт",
    sections: ["city/schedule", "services", "search"],
    status: "partial",
    validAt: "2026-03-06",
    summary:
      "В опубликованном сообщении о муниципальных перевозках подтверждён городской маршрут № 4. Указанные условия относятся к публикации от марта 2026 года. Текущее расписание, остановки и тариф уточняются; прогноз прибытия не имитируется.",
    fields: {
      Город: "Новоуральск",
      Маршрут: "№ 4",
      Перевозчик: "ТСБ — по публикации от 06.03.2026",
      Расписание: null,
      Остановки: null,
      Тариф: null,
    },
    sources: [
      source(
        "Новоуральский городской портал — сообщение о перевозчиках",
        "https://novouralsk.su/2026/03/06/perevozchiki-na-reguliruemyh-avtobusnyh-marshrutah-opredeleny/?noamp=mobile",
        ["Маршрут", "Город", "Перевозчик", "Дата публикации"],
      ),
    ],
    actionUrl: "https://novouralsk.midural.ru/article/show/id/1388",
    actionLabel: "Официальный раздел «Транспорт» (доступность уточняется)",
  }),
);
export const curatedCitySource: CityContentSource = {
  async list(): Promise<RealSnapshot> {
    return {
      version: checkedAt,
      objects: structuredClone(realObjects),
      automaticUpdates: false,
    };
  },
};
