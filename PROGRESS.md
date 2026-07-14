# PROGRESS LOG

Ushbu fayl loyihadagi muhim o'zgarishlar, qarorlar va sabablarining qisqa
tarixini saqlaydi. Maqsad — context compact/reset bo'lganda yoki yangi
sessiya boshlanganda, avvalgi ishlarni tezda tushunib olish.

Yozuvlar eng yangisidan boshlab (yuqorida — yangi, pastda — eski) tartibda.
Har bir yozuv: **sana**, **nima qilindi**, **nega**, **qaysi fayllar**.

---

## 2026-07-14 (3) — FUZZY.md ilmiy manba (Artikbaev N.A. PhD dissertatsiyasi) asosida qayta yozildi

- **Sabab:** `FUZZY.md` (loyihaning Fuzzy Logic arxitektura rejasi) dastlab
  taxminiy/noaniq joylari bor edi. Foydalanuvchi Артикбаев Н.А.нинг
  "...гидроэнергетика объектлари фаолиятининг ишончлилигини баҳолаш услуби"
  (PhD, 2024, Chorvoq GESda amaliyotda sinovdan o'tgan) diссертация
  avtoreferatini taqdim etdi — shu manba asosida FUZZY.md to'liq tahrirlandi.
- **Asosiy tuzatishlar:**
  - Baholash aslida **4 qatlamli**: preprocessing (xom sensor → P/Q/K_abs,
    formula) → sub-FIS (Fgt, f1-f6) → jihoz darajasi (Fgg/Ftr — deterministik
    `sqrt`, LEKIN `f5 = FIS(f3,f4)` — alohida to'liq Mamdani FIS bosqichi,
    oddiy o'rtacha emas) → **GES darajasi — yana bitta FIS** (`GES =
    FIS(Fgt,Fgg,Ftr)`, 3-rasm Simulink modeliga ko'ra; avval bu bosqich
    umuman ko'rsatilmagan edi).
  - Parametr sonlari to'g'irlandi: `f1` (generator elektr qism) FIS kirishi
    9 emas — 3 ta (`K_abs, P, Q`; xom IA/IB/IC/UA/UB/UC/cosφ/sinφ endi
    preprocessing bosqichi). `f2` va `f6` — 5-7 emas, 2 tadan (harorat +
    tebranish).
  - Aniq **ball chegaralari** qo'shildi: `≤20` Juda yomon, `20-40` Yomon,
    `40-60` O'rtacha, `60-80` Yaxshi, `>80` A'lo (dissertatsiya 2-rasm
    algoritmidan) — bularsiz kod qaysi songa qaysi holatni berishni bilmas edi.
  - Yangi **§6 Ishonchlilik (reliability)** bo'limi qo'shildi — bu FIS
    texnik-holat ballaridan mustaqil, alohida statistik model
    (`λ = 1/MTBF`, `P(t) = e^(-λt)`, ketma-ket tizim uchun ko'paytma), nosozlik
    tarixi jadvali (`equipment_failures`) talab qiladi. Hozircha loyiha
    doirasidan tashqarida qoldirilgan (implementatsiya qilinmagan), lekin
    hujjatlashtirildi — kelajakda kerak bo'lishi mumkin.
- **Hali qilinmagan:** FUZZY.md hali faqat hujjat — hech qanday FIS kodi,
  Prisma schema (`equipment_metadata`/`sensor_data`/`fuzzy_assessments`/
  `equipment_failures`), yoki backend servis yozilmagan. Jihoz identifikatsiya
  modeli (Aggregate JSON blob vs alohida equipment jadvallari) hali hal
  qilinmagan ochiq savol bo'lib qolmoqda.

---

## 2026-07-14 (2) — GES qo'shish: xaritadan joylashuv tanlash + dashboard ko'rinish toggle

- **Sabab:** xaritadagi GES markerlari hozirgacha hardcoded/mock massiv edi;
  endi haqiqiy DB ma'lumotlaridan chizilishi, va har bir GES uchun
  joylashuv (lat/lng) hamda "dashboardda ko'rinsinmi" degan boshqaruv kerak edi.
- **Backend** (`server/prisma/schema.prisma`): `Ges` modeliga `latitude Float?`,
  `longitude Float?` qo'shildi (migratsiya: `20260714150559_add_ges_location`).
  `isPublished` maydoni allaqachon bor edi — endi "dashboardda ko'rinish" flagi
  sifatida ishlatiladi (yangi maydon qo'shilmadi). `GesList.js` controller
  whitelist (`GES_FIELDS`)ga `latitude`/`longitude` qo'shildi.
- **Frontend:**
  - `client/src/components/UZMAP/useUzbekistanProjection.js` — xarita
    proyeksiya hisoblash logikasi umumiy hook'ga chiqarildi (avval faqat
    `UZMAP/index.jsx` ichida edi), endi ikkita joyda (xarita + location picker)
    bir xil geometriya ishlatiladi.
  - `client/src/components/UZMAP/LocationPicker.jsx` (yangi) — xaritani bosish
    orqali koordinata tanlash komponenti. `getScreenCTM()`/`matrixTransform`
    orqali klik nuqtasi SVG user-space'ga o'tkaziladi, keyin
    `projection.invert()` bilan `[longitude, latitude]`ga aylantiriladi —
    CSS scaling/letterboxdan qat'i nazar to'g'ri ishlaydi.
  - `client/src/features/ges/Settings.js` (Add/Edit GES formasi, bitta
    komponent ikkala route uchun ham ishlatiladi) — "Texnik holati" endi
    erkin matn emas, balki 5 ta fuzzy holat (`A'lo/Yaxshi/O'rtacha/Yomon/Juda
    yomon`) bilan `SelectBox`; "Dashboardda ko'rinsin" toggle qo'shildi
    (`isPublished`); `GesLocationPicker` joylashtirildi — tanlangan
    lat/lng formaning `val` state'iga yoziladi va submit paytida avtomatik
    yuboriladi (alohida submit-kod o'zgarishi kerak bo'lmadi).
  - `client/src/features/ges/list.js` — GES ro'yxatida har bir qator uchun
    "Dashboardda" ustunida toggle qo'shildi, bosilganda darhol PUT so'rov
    yuboradi va Redux'ni yangilaydi (optimistik emas, server javobidan keyin).
  - `client/src/components/UZMAP/index.jsx` — hardcoded `gesLocations` massivi
    olib tashlandi; endi Redux (`selectGesItems`) dan o'qiydi, faqat
    `isPublished === true` VA lat/lng mavjud bo'lgan GESlarni marker sifatida
    chizadi. Komponent mount bo'lganda `items` bo'sh bo'lsa `fetchGesList()`
    dispatch qiladi (dashboard sahifasi allaqachon fetch qilsa ham, xarita
    boshqa joyda ishlatilsa ham ishlashi uchun). Status legend va rang
    funksiyasi 5 ta fuzzy holatga mos kengaytirildi (avval faqat 3 tasi bor edi).
  - `client/src/utils/initialStates.js` — `GES_INITIAL_STATE`ga
    `latitude: null, longitude: null, isPublished: true` qo'shildi (yangi
    GES sukut bo'yicha dashboardda ko'rinadi, agar admin o'chirmasa).
- **Tekshirildi:** backend qayta ishga tushirilib (`prisma generate` uchun
  fayl qulfini yechish kerak bo'ldi — Windows'da ishlab turgan `nodemon`
  jarayoni Prisma query-engine DLL'ini band qilib turgan edi), `curl` bilan
  yangi maydonlar bilan GES yaratildi/o'qildi/o'chirildi (test yozuv
  tozalandi). Client `webpack compiled successfully` — barcha yangi/o'zgargan
  fayllar xatosiz kompilyatsiya qilindi.
- **Hali qilinmagan:** brauzerda haqiqiy click-to-pick UX va marker
  ko'rinishi foydalanuvchi tomonidan hali vizual tasdiqlanmagan (bu muhitda
  screenshot/brauzer tool yo'q).

---

## 2026-07-14 — MongoDB → Prisma/Neon migratsiyasi, auth bug fix, dashboard/xarita/navbar qayta dizayni

### 1. Backend: MongoDB/Mongoose → Prisma + Neon Postgres
- Haqiqiy production ma'lumot yo'q edi, shuning uchun "fresh migration" qilindi (eski data saqlanmadi).
- `server/prisma/schema.prisma` — `User` (email `@unique`), `Ges` (`@@map("ges_list")`), `Aggregate` (Ges'ga FK, JSON maydonlar: hydroTurbine/hydroGenerator/transformer).
- `server/src/config/prisma.js` — singleton `PrismaClient` (`global.__prisma` pattern).
- `server/src/utils/mongoCompat.js` — `withMongoId()`: Prisma'ning raqamli `id`si yoniga string `_id` qo'shadi, shu bilan mavjud React client (`._id` ishlatadigan) o'zgarishsiz ishlayveradi.
- Controllerlar (`Users`, `GesList`, `Aggregates`) Prisma uchun qayta yozildi; Prisma noma'lum fieldlarni jim tashlab yubormaydi (Mongoose'dan farqli), shu sabab `pickGesFields`/`pickAggregateFields` whitelist helperlar qo'shildi.
- Prisma **v6** da qolindi (v7 emas) — v7 `prisma.config.ts` + driver adapters talab qiladi, hozirgi oddiy `datasource{url=env(...)}` patternga mos emas.
- Eski Mongoose model fayllari (`server/src/api/v1/models/*.js`, 7 ta) o'chirildi.
- Verifikatsiya: Users/GesList/Aggregates uchun to'liq CRUD curl orqali tekshirildi, nested `aggregates` populate va `_id` compat ishlashi tasdiqlandi.

### 2. Auth forma bugi
- `Register.js`/`ForgotPassword.js`: `InputText` xom DOM event yuboradi, lekin sahifalar `{updateType, value}` destructure qilardi (doim `undefined`) — forma qiymatlari umuman yangilanmasdi.
- Fix: `Login.js`dagi to'g'ri pattern (`e.target.name`/`e.target.value`) ga moslashtirildi.

### 3. Claude Code konfiguratsiyasi
- `.claude/rules/*.md` (architecture, code-style, fuzzy-logic, security) — foydalanuvchi tomonidan yozilgan, to'g'ri joyga (`.claude/rules/`) qo'yilgani tasdiqlandi — bu papka avtomatik yuklanadi.
- `.claude/settings.json` — npm/git/prisma uchun asosiy permission allow-list yaratildi.
- `CLAUDE.md`/rules kontenti amaldagi kod bilan solishtirildi, lekin foydalanuvchi so'rovi bilan **qo'lda tuzatilmadi** (faqat farqlar aytib berildi, "tegmang" deyilgan).

### 4. Sidebar UX
- `Layout.js`: `drawer drawer-mobile` → `drawer` (+ `defaultChecked`), `LeftSidebar.js`: yopish (X) tugmasidan `lg:hidden` olib tashlandi — endi barcha ekran o'lchamlarida slide-in/collapsible ishlaydi.

### 5. Dashboard/Xarita/Navbar qayta dizayni (eng ko'p iteratsiya bo'lgan qism)
- **Xarita** (`client/src/components/UZMAP/index.jsx`): `react-simple-maps` + `d3-geo` asosida qoldirildi (kutubxona almashtirilmadi — muammo CSS/layout'da edi, kutubxonada emas).
  - Ilgari qo'lda tanlangan `scale`/`center` qiymatlari mamlakatning katta qismini SVG viewBox chegarasidan tashqarida qoldirib, **kesib** yuborayotgan edi. Tuzatildi: `geoMercator().fitExtent()`/`fitSize()` orqali butun GeoJSON geometriyasi avtomatik joylashtiriladi.
  - Viewbox o'lchamlari `geoPath().bounds()` bilan o'lchangan haqiqiy aspekt nisbatiga (≈1.53:1) moslashtirildi — behuda letterbox bo'shliqni yo'qotish uchun.
  - Zoom funksiyasi (avval qo'shilgan) **butunlay olib tashlandi** — UX muammolarga sabab bo'lgani uchun.
  - Xarita ustidagi alohida floating action-button klasteri (`actions` prop) olib tashlandi — u haqiqiy navbar bilan ustma-ust tushib, ikonkalari ko'rinmay qolayotgan edi.
- **Stat kartalar** (`DashboardStats.js`, `overlay` prop): ixcham, shisha effektli (`bg-base-100/80 backdrop-blur`) 2×2 grid qilib xaritaning chap-pastki burchagiga joylashtirildi (Qoraqalpog'iston bo'sh hududi ustiga).
- **Sana oralig'i tanlash**: eski `DashboardTopBar`dan `FilterBodyRightDrawer .js` (fayl nomida oxirida bo'sh joy bor — repo'dagi eski xususiyat, tegilmadi) ichiga, mavjud "Filter" right-drawer'ga ko'chirildi.
- **Navbar** (`Header.js`): Refresh Data, Share, Search kabi barcha sahifa harakatlari yagona global navbar'ga jamlandi (alohida floating klaster emas). So'ralgan tartib: Refresh → Bell → Filter → Kun/Tun → Search → Share → ... → Profile (oxirida).
- **Navbar auto-hide** (`PageContent.js`): sahifa eng yuqorisida turganda VA kursor viewport yuqori ~72px zonasiga kirganda navbar `translate-y` bilan ko'rinadi, aks holda yashirin.
- **Theme-aware xarita ranglari**: `index.css`da `--map-land-fill` va h.k. CSS custom property'lar (`:root` va `[data-theme="dark"]` ostida) — chunki `Geography`ning `style` propi inline JS, Tailwind `dark:` variant to'g'ridan-to'g'ri ishlamaydi.
- **DaisyUI `.drawer-content{height:auto}` bugi**: xaritani "ekranni to'ldirish" uchun kerak bo'lgan foizli-balandlik zanjirini buzayotgan edi — `PageContent.js`dagi `drawer-content` div'iga aniq `h-full` qo'shib tuzatildi.

### 6. Git
- Barcha yuqoridagi o'zgarishlar bitta commitda (`3252906`) `origin/main`ga push qilindi.
- `.env` fayllar `.gitignore` orqali himoyalangan holda qoldi, commitga kirmadi.

### Ma'lum bo'lgan cheklovlar / hali qilinmagan ishlar
- Xaritadagi GES joylashuvlari hali ham **hardcoded/mock** massiv (`UZMAP/index.jsx` ichida) — haqiqiy GES koordinatalariga ulanmagan, chunki `Ges` modelida lat/lng maydoni yo'q. Bu ataylab prototip sifatida qoldirilgan.
- Fuzzy Logic (FIS) yadrosi hali ishlab chiqilmagan — `CLAUDE.md`dagi bo'lim 4 hali reja bosqichida.
- Bu muhitda brauzer/screenshot tool mavjud emas — barcha UI tekshiruvlari foydalanuvchi tomonidan screenshot yuborish orqali amalga oshirilgan.
