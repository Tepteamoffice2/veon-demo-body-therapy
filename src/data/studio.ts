// All facts come from veon/client.json (company.products_services, contacts, C-001, C-002, C-005, C-015).
// Nothing here is invented: no ratings, reviews or client counts.

export const contacts = {
  phoneHref: "tel:+380680796731",
  phoneIntl: "+38 (068) 079-67-31",
  phoneLocal: "068 079 67 31",
  email: "info@body-therapy.com.ua",
  instagram: "https://www.instagram.com/body_therapy_kremen/",
  instagramHandle: "@body_therapy_kremen",
  street: "вул. Першотравнева, 20",
  city: "Кременчук",
  postal: "39600",
  hours: "щодня 9:00–20:00",
  lat: 49.0647,
  lng: 33.4155,
  map: "https://www.google.com/maps/search/?api=1&query=49.0647%2C33.4155",
} as const;

export interface Service {
  name: string;
  /** minutes as shown, e.g. "40" or "60–90" */
  min: string;
  /** price as shown, e.g. "800" or "від 800" */
  price: string;
  note?: string;
}

export const services = {
  relax: { name: "Розслаблюючий масаж", min: "60", price: "1200" },
  healing: { name: "Лікувальний масаж", min: "60", price: "1300" },
  back: { name: "Масаж спини", min: "40", price: "800" },
  neck: { name: "Масаж шийно-комірцевої зони", min: "30", price: "600" },
  visceral: { name: "Вісцеральний масаж", min: "45", price: "1300" },
  sport: { name: "Спортивний масаж", min: "60", price: "1200" },
  cellulite: { name: "Антицелюлітний масаж", min: "60", price: "1200" },
  honey: { name: "Медовий масаж", min: "40", price: "1000" },
  lymph: { name: "Лімфодренажний масаж", min: "60", price: "1200" },
  wrap: { name: "Обгортання для тіла", min: "60–90", price: "від 800" },
  face: { name: "Масаж обличчя", min: "30", price: "500" },
  kids: { name: "Дитячий масаж", min: "30", price: "600" },
  pregnant: { name: "Масаж для вагітних", min: "45", price: "1000" },
  home: { name: "Масаж на дому", min: "60", price: "1500", note: "в межах Кременчука" },
  fourHands: { name: "Масаж у 4 руки", min: "90", price: "2200", note: "працюють два майстри одночасно" },
} satisfies Record<string, Service>;

export interface Request {
  id: string;
  label: string;
  answer: string;
  items: Service[];
  /** an in-page anchor that continues this answer */
  more?: { href: string; label: string };
}

const s = services;

export const requests: Request[] = [
  {
    id: "spyna",
    label: "Болить спина або шия",
    answer: "Почніть з масажу спини або шийно-комірцевої зони. Якщо біль тримається давно, краще лікувальний масаж на повну годину.",
    items: [s.back, s.neck, s.healing],
  },
  {
    id: "travma",
    label: "Відновлення після травми",
    answer: "Тут потрібен не разовий масаж, а курс: консультація, план і сеанси ЛФК, масажу та мануальної терапії.",
    items: [
      { name: "Первинна консультація", min: "60", price: "400" },
      { name: "Сеанс реабілітації", min: "60–90", price: "500–700" },
    ],
    more: { href: "#reabilitatsiia", label: "Як проходить курс" },
  },
  {
    id: "sport",
    label: "Після тренувань",
    answer: "Спортивний масаж — для м’язів після навантажень. Лімфодренажний — м’якший, теж на повну годину.",
    items: [s.sport, s.lymph],
  },
  {
    id: "relax",
    label: "Розслабитися",
    answer: "Година тиші й рук майстра. Для особливого випадку — масаж у чотири руки.",
    items: [s.relax, s.face, s.fourHands],
  },
  {
    id: "tonus",
    label: "Фігура і тонус",
    answer: "Такі процедури зазвичай беруть курсом, тому на них діють абонементи. Масаж можна поєднати з обгортанням.",
    items: [s.cellulite, s.lymph, s.honey, s.wrap],
  },
  {
    id: "dity",
    label: "Дитина або вагітність",
    answer: "Окремі масажі для дітей і для майбутніх мам, коротші за звичайний сеанс: 30 і 45 хвилин.",
    items: [s.kids, s.pregnant],
  },
  {
    id: "vdoma",
    label: "Вдома",
    answer: "Майстер приїде до вас додому в межах Кременчука.",
    items: [s.home],
  },
  {
    id: "podarunok",
    label: "Подарунок",
    answer: "Сертифікат на конкретний масаж або на суму. Діє 6 місяців, є електронна версія.",
    items: [
      { name: "Сертифікат на масаж спини", min: "40", price: "800" },
      { name: "Сертифікат на розслаблюючий масаж", min: "60", price: "1200" },
    ],
    more: { href: "#sertyfikaty", label: "Усі сертифікати" },
  },
];

export interface PriceGroup { id: string; title: string; items: Service[] }

export const priceGroups: PriceGroup[] = [
  { id: "likuvalni", title: "Лікувальні та відновлювальні", items: [s.healing, s.back, s.neck, s.visceral, s.sport] },
  { id: "rozslablennia", title: "Розслаблення", items: [s.relax, s.fourHands, s.face] },
  { id: "tilo", title: "Фігура і тонус", items: [s.cellulite, s.lymph, s.honey, s.wrap] },
  { id: "osoblyvi", title: "Діти, вагітність, удома", items: [s.kids, s.pregnant, s.home] },
];

export const subscriptions = [
  { sessions: "5 сеансів", off: "−10%", valid: "діє 6 місяців" },
  { sessions: "10 сеансів", off: "−15%", valid: "діє 8 місяців" },
  { sessions: "20 сеансів", off: "−20%", valid: "діє 12 місяців" },
];

export const payment = "Готівка, картка Visa або Mastercard, Google Pay, Apple Pay, Samsung Pay, безготівковий переказ.";

export const certificates = [
  { value: "800", what: "масаж спини" },
  { value: "1200", what: "розслаблюючий масаж" },
  { value: "2000", what: "комплекс процедур" },
  { value: "5000", what: "VIP-пакет" },
];

export const courses = [
  { name: "Групові", price: "10 000", detail: "16 занять по 3 години, групи 4–6 людей" },
  { name: "Інтенсив", price: "12 000", detail: "12 занять по 4 години" },
  { name: "Індивідуальні", price: "15 000", detail: "20 занять по 2,5 години" },
];

export const nav = [
  { href: "#pidbir", label: "Масаж" },
  { href: "#reabilitatsiia", label: "Реабілітація" },
  { href: "#tsiny", label: "Ціни" },
  { href: "#sertyfikaty", label: "Сертифікати" },
  { href: "#kursy", label: "Курси" },
  { href: "#studiia", label: "Про студію" },
  { href: "#kontakty", label: "Контакти" },
];

export const FUTURE = "Розділ у розробці";
