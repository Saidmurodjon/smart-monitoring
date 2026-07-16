# SENDMAIL — Email orqali ro'yxatdan o'tishni tasdiqlash va parol tiklash

Ushbu fayl `smart-monitoring` platformasidagi email-xabarnomalar (registratsiya
tasdiqlash oqimi, parolni tiklash) bo'yicha qoidalar, dizayn va takliflarni
belgilaydi. `ROLES.md` autentifikatsiya/rol tizimini qanday qurganini
tasvirlagan edi — bu hujjat o'sha tizim ustiga **admin tasdig'i** bosqichini
va **email xabarnomalarni** qo'shadi.

## 1. Muammo (2026-07-16 holatiga ko'ra, o'zgarishdan oldin)

- `POST /api/v1/users` (ro'yxatdan o'tish) darhol faol `VIEWER` hisob
  yaratardi — admin nazoratisiz, email aloqasiz.
- Klient tomonidagi `Register.js` va `ForgotPassword.js` sahifalari **soxta**
  edi — hech qaysi biri backend'ga so'rov yubormasdi (Register token'ni
  `localStorage`'ga qo'lda yozardi, ForgotPassword faqat lokal state
  o'zgartirardi).
- Mailer, parolni tiklash tokeni, "kutilmoqda" holati — hech biri mavjud
  emas edi.

GES — strategik infratuzilma bo'lgani uchun, endi **har qanday** yo'l bilan
(lokal email/parol yoki Google) ro'yxatdan o'tgan foydalanuvchi admin
tasdig'igacha **PENDING** holatda qoladi, login imkonsiz.

## 2. Holatlar (`AccountStatus`)

| Holat | Ma'nosi | Login mumkinmi? |
|---|---|:---:|
| `PENDING` | Ro'yxatdan o'tgan, admin ko'rib chiqmagan (standart) | ❌ |
| `APPROVED` | Admin tasdiqlagan, rol berilgan | ✅ |
| `REJECTED` | Admin rad etgan | ❌ |

Mavjud (migratsiya vaqtidagi) foydalanuvchilar avtomatik `APPROVED` qilib
qo'yildi — hech kim bloklanmadi. Faqat migratsiyadan **keyingi** yangi
ro'yxatdan o'tishlar `PENDING` bilan boshlanadi. Bootstrap-admin
(`.env`dagi `ADMIN_EMAIL`/`ADMIN_PASSWORD` orqali yaratiladigan birinchi
ADMIN) alohida `APPROVED` qilib yaratiladi — aks holda tizimga birinchi
kiruvchi ham o'zini tasdiqlashini kuta olmay qolardi.

## 3. Email xabarnomalar matritsasi

| Trigger | Kimga | Mazmuni |
|---|---|---|
| Ro'yxatdan o'tish (lokal yoki Google, yangi hisob) | Foydalanuvchiga | "Arizangiz qabul qilindi, admin xabardor qilindi, tasdiqlangach alohida xat keladi" |
| Ro'yxatdan o'tish (yangi hisob) | Barcha `APPROVED` ADMIN'larga (bo'sh bo'lsa `ADMIN_EMAIL`) | "Yangi foydalanuvchi tasdiqlashni kutmoqda: [ism, email, usul]" |
| Admin tasdiqlaydi (`PUT /users/:id/approve`) | Foydalanuvchiga | "Hisobingiz tasdiqlandi, rolingiz: [X], endi kirishingiz mumkin" |
| Admin rad etadi (`PUT /users/:id/reject`) | Foydalanuvchiga | "Hisobingizga ruxsat berilmadi" |
| "Parolni tiklash" so'rovi | Foydalanuvchiga (faqat `provider="local"`) | Tiklash havolasi, 1 soat amal qiladi |

**Nega login qilingan sari xat yuborilmaydi**: so'rovni tom ma'noda
dekompozitsiya qilganda ("login va register qismiga xabar boradigan
bo'lsin") — bu ro'yxatdan o'tish (register) va parolni tiklash (login
sahifasidagi funksiya) oqimlariga tegishli, har bir muvaffaqiyatli login
uchun emas. Har login uchun xat — keraksiz shovqin bo'lardi; agar kelajakda
"kirish urinishlari" xavfsizlik xabarnomasi kerak bo'lsa, bu alohida so'rov
bilan qo'shiladi (§6 ga qarang).

## 4. Texnik dizayn

- **Provayder: [Resend](https://resend.com)** (SMTP emas, HTTP API) —
  foydalanuvchi tanlovi. `server/src/services/mail/`:
  - `mailer.ts` — `sendMail({to, subject, html})`, `RESEND_API_KEY`
    sozlanmagan bo'lsa **jim o'tkazib yuboradi** (faqat log yozadi) — asosiy
    oqim (ro'yxatdan o'tish, login, parol tiklash) mailer ishlamasa ham
    buzilmasligi shart (`.claude/rules/security.md` xatolikka chidamlilik
    printsipi).
  - `templates.ts` — HTML shablonlar, faqat inline style (ko'p mail-klient
    `<style>` blokini olib tashlaydi), o'zbek tilida.
  - `notifications.ts` — yuqori darajadagi funksiyalar
    (`sendRegistrationReceivedEmail`, `sendAdminNewUserNotification`,
    `sendAccountApprovedEmail`, `sendAccountRejectedEmail`,
    `sendPasswordResetEmail`) — har biri o'z ichida try/catch bilan
    o'ralgan, chaqiruvchi kod hech qachon mail xatoligini ushlashi shart
    emas.
- **Ma'lumotlar bazasi**: `User.status` (`AccountStatus` enum) va yangi
  `PasswordResetToken` jadvali (`token` unique, `expiresAt`, `usedAt`).
- **Login gate** (`auth/Controller.js`): parol **to'g'ri** tekshirilgandan
  **keyin** holat tekshiriladi — noto'g'ri parol taxmin qilingan so'rovga
  hisob holati haqida ma'lumot sizib chiqmasligi uchun.
- **Google OAuth** (`auth/google.js`): yangi hisob ham `PENDING` yaratiladi;
  `status !== APPROVED` bo'lsa token berilmaydi, o'rniga
  `CLIENT_URL/auth/pending?status=pending|rejected` ga yo'naltiriladi.
- **Parolni tiklash**: `POST /auth/forgot-password` — email mavjudligidan
  qat'iy nazar bir xil javob qaytaradi (enumeration hujumidan himoya).
  Token — `crypto.randomBytes(32)`, 1 soat amal qiladi, bir marta ishlatiladi
  (`usedAt`). `POST /auth/reset-password` — token + yangi parol.

## 5. `.env` o'zgaruvchilari (foydalanuvchi o'zi to'ldiradi)

```
RESEND_API_KEY=
MAIL_FROM=Smart Monitoring <onboarding@resend.dev>
```

Sozlash: [resend.com](https://resend.com) da ro'yxatdan o'ting → API Key
yarating → `RESEND_API_KEY` ga qo'ying. Sinov uchun Resend'ning sandbox
domeni (`onboarding@resend.dev`) ishlaydi (faqat ro'yxatdan o'tgan Resend
akkauntiga xat yuboradi); real domenga xat yuborish uchun o'z domeningizni
Resend'da tasdiqlab, `MAIL_FROM`ni shu domenga o'zgartiring. Google OAuth
kalitlari kabi — bu qadamni men (Claude) sizning o'rningizga bajara olmayman
(tashqi hisob yaratish/domen tasdiqlash kerak).

## 6. Takliflar (keyingi bosqichlar, hozircha qurilmagan)

- **Rate limiting**: `.claude/rules/security.md` #3 ("daqiqasiga 100 so'rov")
  hali loyihaning hech qayerida amalga oshirilmagan — bu ushbu ishdan oldin
  ham mavjud bo'shliq edi, shu sabab bu yerda ham qo'shilmadi. Ammo
  `forgot-password` va `POST /users` — email-spam va enumeration uchun eng
  ko'p maqsad qilinadigan endpoint'lar, shu sabab keyingi bosqichda birinchi
  navbatda shularga IP-asoslangan cheklov qo'yish tavsiya etiladi.
- **REJECTED foydalanuvchi uchun qayta ariza**: hozircha o'lik nuqta — admin
  qo'lda holatni o'zgartirishi yoki foydalanuvchi boshqa email bilan qayta
  ro'yxatdan o'tishi kerak. "Qayta ariza yuborish" oqimi kelajakda qo'shilishi
  mumkin.
- **"Kirish urinishlari" xavfsizlik xabarnomasi**: har safar login
  qilinganda emas, balki masalan yangi qurilma/IP'dan birinchi marta
  kirilganda ogohlantiruvchi xat — agar xohlansa, alohida so'rov bilan
  qo'shiladi.
- **Real domen sender**: hozir Resend'ning sandbox `onboarding@resend.dev`
  manzili ishlatiladi — production uchun o'z domenida SPF/DKIM sozlab, shu
  domendan yuborish tavsiya etiladi (email'lar spam papkasiga tushmasligi
  uchun).

## 7. Holat — amalga oshirildi (2026-07-16)

§1–5'dagi reja **to'liq amalga oshirildi** — batafsil `PROGRESS.md`
"2026-07-16" yozuviga qarang. Backend oqimlari (ro'yxatdan o'tish → PENDING →
admin tasdiqlaydi/rad etadi → login gate, parolni tiklash to'liq round-trip)
`curl` orqali uchidan-uchigacha sinovdan o'tkazildi (jumladan
`RESEND_API_KEY` sozlanmagan holatda ham asosiy oqim buzilmasligi). Klient
tomoni: `Register.js`/`ForgotPassword.js` haqiqiy API'ga ulandi, yangi
`ResetPassword.js`/`AuthPending.js` sahifalari, admin "Foydalanuvchilar"
sahifasida holat ustuni va tasdiqlash/rad etish tugmalari qo'shildi.

**Hali qilinmagan** (§6'dagi takliflar): rate limiting, REJECTED uchun qayta
ariza oqimi, login xavfsizlik xabarnomasi, real domen sender — bularning
barchasi alohida so'rov bilan boshlanadi.
