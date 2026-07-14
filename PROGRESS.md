# PROGRESS LOG

Ushbu fayl loyihadagi muhim o'zgarishlar, qarorlar va sabablarining qisqa
tarixini saqlaydi. Maqsad — context compact/reset bo'lganda yoki yangi
sessiya boshlanganda, avvalgi ishlarni tezda tushunib olish.

Yozuvlar eng yangisidan boshlab (yuqorida — yangi, pastda — eski) tartibda.
Har bir yozuv: **sana**, **nima qilindi**, **nega**, **qaysi fayllar**.

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
