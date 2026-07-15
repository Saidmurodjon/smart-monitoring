# ROLES — Autentifikatsiya va rollar tizimi

Ushbu fayl `smart-monitoring` platformasidagi foydalanuvchi rollari va Google
OAuth integratsiyasi bo'yicha taklif va qoidalarni belgilaydi. `CLAUDE.md`
(§5.2) allaqachon uchta rolni talab qiladi: **admin, engineer, viewer** — bu
hujjat o'sha talabni amaliy ruxsatlar matritsasi va texnik rejaga aylantiradi.

## 1. Hozirgi holat (2026-07-15 holatiga ko'ra)

Kod bazasini tekshirish shuni ko'rsatdi — auth tizimi hozircha **stub**:

- `server/src/api/v1/auth/Controller.js` — `login`/`password` ni `User`
  jadvaliga umuman solishtirmaydi, faqat qattiq kodlangan
  `login === "admin" && password === "admin"` tekshiruvi bor. JWT'ga
  `{ type: "admin" }` claim yoziladi, lekin hech qayerda o'qilmaydi.
- `server/src/api/v1/middlewares/Authentication.js` — faqat JWT imzosini
  tekshiradi (`jwt.verify`), rol yoki huquqni tekshirmaydi, va
  `routes/index.js`da **butunlay o'chirilgan** (`// router.use(Authentication)`)
  — ya'ni hozir amalda barcha `/api/v1/*` endpointlar autentifikatsiyasiz
  ochiq.
- `User` modelida (`schema.prisma`) `role` maydoni yo'q.

Demak, quyidagi reja "mavjudni to'g'irlash" emas, "noldan qurish"ga teng.

## 2. Rollar va vazifalari

| Rol | Kim | Asosiy vazifa |
|---|---|---|
| **admin** | Tizim/loyiha egasi, bosh muhandis | To'liq huquq — foydalanuvchi va rol boshqaruvi, GES/agregat CRUD, **Fuzzy Logic qoidalari** (`/app/fuzzy-rules`) tahrirlash, barcha ma'lumotlarni ko'rish. |
| **engineer** | GES operatori, texnik xodim | Operatsion ish: agregat qo'shish/tahrirlash, statik parametr (nominal qiymatlar) kiritish, sensor ma'lumotlari va FIS baholash natijalarini ko'rish. Fuzzy qoidalarga **tegmaydi**. |
| **viewer** | Rahbariyat, tashqi nazoratchi, monitoring xodimi | Faqat o'qish — dashboard, GES/agregat holati, hisobotlar. Hech narsani o'zgartira olmaydi. |

**Nega aynan shu chegara (fuzzy qoidalar faqat admin'da):** noto'g'ri
threshold yoki qoida butun baholash tizimini (barcha GES'lar bo'yicha)
buzishi mumkin — bu boshqa CRUD amallardan (bitta agregatga ta'sir qiladi)
farqli, tizim darajasidagi xavf. Shuning uchun `engineer`ga ham berilmaydi.

## 3. Ruxsatlar matritsasi

| Resurs / amal | admin | engineer | viewer |
|---|:---:|:---:|:---:|
| GES ro'yxati/holatini ko'rish | ✅ | ✅ | ✅ |
| Dashboard, statistika | ✅ | ✅ | ✅ |
| GES yaratish / tahrirlash / o'chirish | ✅ | ❌ | ❌ |
| Agregat yaratish / tahrirlash / o'chirish | ✅ | ✅ | ❌ |
| Agregat statik parametrlarini kiritish (`static-params`) | ✅ | ✅ | ❌ |
| Sensor ma'lumotlarini ko'rish | ✅ | ✅ | ✅ |
| Sensor ma'lumotlarini qo'lda kiritish/import (agar kerak bo'lsa) | ✅ | ✅ | ❌ |
| FIS baholash natijalarini ko'rish (`/assessment/.../summary`) | ✅ | ✅ | ✅ |
| Yangi FIS baholashni ishga tushirish (`POST /assessment/...`) | ✅ | ✅ | ❌ |
| Fuzzy qoidalar/o'zgaruvchilarni ko'rish (`/app/fuzzy-rules`) | ✅ | ❌ | ❌ |
| Fuzzy qoidalar/o'zgaruvchilarni tahrirlash | ✅ | ❌ | ❌ |
| Foydalanuvchi va rol boshqaruvi | ✅ | ❌ | ❌ |

> GES yaratish/o'chirish `engineer`ga berilmagan — bu tashkiliy/strategik
> qaror (yangi GES qo'shish loyihaviy daraja), agregat darajasidagi kunlik
> operatsion ishlardan farqli. Agar bu haddan tashqari cheklovchi ko'rinsa,
> keyinroq oson kengaytirish mumkin.

## 4. Ma'lumotlar bazasi o'zgarishlari (taklif)

```prisma
enum Role {
  ADMIN
  ENGINEER
  VIEWER
}

model User {
  id         Int      @id @default(autoincrement())
  fullName   String?
  orgName    String?
  phone      String?  @default("+998")
  email      String   @unique
  password   String?           // Google orqali kirganlarda bo'sh bo'lishi mumkin
  role       Role     @default(VIEWER)
  provider   String   @default("local")  // "local" | "google"
  googleId   String?  @unique
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  orders     Order[]  @relation("OrderAuthors")

  @@map("users")
}
```

- `password` **ixtiyoriy**ga o'tkaziladi — Google orqali ro'yxatdan
  o'tganlarda parol yo'q.
- Yangi foydalanuvchi standart bo'yicha `VIEWER` — eng kam huquqli holat
  (xavfsizlik printsipi: "least privilege by default"), admin keyin
  qo'lda `ENGINEER`/`ADMIN`ga ko'taradi.
- Mavjud (agar bo'lsa) foydalanuvchilar migratsiyada `role = ADMIN` qilib
  qo'yiladi (hozirgi yagona "admin/admin" stub'ning o'rnini bosish uchun) —
  keyin qo'lda qayta ko'rib chiqiladi.

## 5. Google OAuth oqimi (taklif)

1. `passport` + `passport-google-oauth20` kutubxonalari qo'shiladi.
2. `GET /api/v1/auth/google` → Google consent screen'ga yo'naltiradi.
3. `GET /api/v1/auth/google/callback` → Google profil (`email`, `name`,
   `sub`/`googleId`) qaytadi:
   - Agar `email` bo'yicha `User` mavjud bo'lsa — `googleId`/`provider`
     yangilanadi (agar bo'lmasa) va login davom etadi.
   - Aks holda — yangi `User` yaratiladi, `role: VIEWER`, `provider: "google"`.
4. Muvaffaqiyatli bo'lsa, mavjud login oqimi bilan **bir xil formatdagi**
   JWT chiqariladi (`server/src/config/swagger/config.js`dagi `JWT_KEY`),
   endi claim ichida `{ userId, email, role }` bo'ladi (hozirgi
   `{ type: "admin" }`o'rniga) — frontend deyarli o'zgarmaydi, faqat
   login sahifasiga "Google orqali kirish" tugmasi qo'shiladi.
5. `.env`ga `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_CALLBACK_URL` qo'shiladi — **hech qachon kodga yozilmaydi**
   (`.claude/rules/security.md` #1).

## 6. Ruxsatlarni majburlash (enforcement)

- `Authentication.js` middleware **haqiqiy JWT payload'ni** o'qib
  `req.user = { id, email, role }` qilib beradi (hozirgi kabi faqat
  imzo tekshirish emas), va **qayta yoqiladi** (`routes/index.js`dagi
  o'chirilgan `router.use(Authentication)` qatori).
- Rol darajasidagi cheklov uchun yangi kichik middleware:
  `requireRole("admin")` yoki `requireRole("admin", "engineer")` —
  yozuv (POST/PUT/DELETE) endpointlarga, jumladan `fuzzy-rules` admin
  route'lariga (`FuzzyRuleAdminController.ts`) qo'shiladi.
- O'qish (GET) endpointlar barcha uch rolga ochiq qoladi — faqat
  autentifikatsiya talab qilinadi, rol tekshirilmaydi.

## 7. Holat — amalga oshirildi (2026-07-15)

§1–6'dagi reja **to'liq amalga oshirildi** — batafsil PROGRESS.md
"2026-07-15 (11)" yozuviga qarang. Qisqacha: schema/migratsiya, bcrypt
login, bootstrap-admin, `Authentication`/`requireRole`, barcha resurslar
bo'yicha enforcement, Google OAuth server kodi (kalitlar hali `.env`da
yo'q — foydalanuvchi qo'shishi kerak), va frontend (Google tugmasi,
callback sahifa, rol bo'yicha yon panel filtri) — hammasi tayyor.

**Hali qilinmagan (alohida so'rov bilan boshlanadi):**
- Parolni tiklash ("Forgot password") — sahifa bor, backendga ulanmagan
  (bu ishdan mustaqil, oldindan mavjud bo'shliq).
- Rol bo'yicha UI cheklovi faqat bitta joyda (fuzzy-rules sidebar bandi) —
  boshqa sahifalardagi alohida tugmalarni (masalan viewer uchun) hali
  yashirmaydi, faqat server darajasida bloklanadi.
- Rate limiting (`.claude/rules/security.md` #3).
- Real Google Client ID/Secret bilan to'liq oqimni brauzerda sinash —
  foydalanuvchi kalitlarni qo'shgach o'zi bajaradi.
