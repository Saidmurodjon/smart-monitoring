# SMART MONITORING — GES TEXNIK HOLATINI BAHOLASH PLATFORMASI

## 1. Loyiha haqida
Bu O'zbekiston GESlari (gidroelektrostansiyalari) uchun **noaniq mantiq (Fuzzy Logic)** asosida texnik holatni real vaqtda baholaydigan strategik monitoring platformasi.
- **Dastlabki bosqich:** 1 ta GES (3 ta asosiy agregat: Transformator, Generator, Turbina). GES ning holati (Alo, yaxshi, o'rtacha, yomon, juda yomon) holatda baholanadi, Gesning holatiga GESning tarkibidagi agregatlarning holati tasir qiladi(5 ta holat), agaregatlarning har birida (Transformator, Generator, Turbina) va ular ham mos ravishda (5 holatda baholanadi)

- **Asosiy vazifa:** Sensor ma'lumotlarini qabul qilish -> Noaniq baholash (FIS) -> Signalizatsiya -> Vizualizatsiya.

## 2. Texnologik stek (YANGILANGAN)
- **Frontend:** React (v19+), Tailwind CSS, DaisyUI, ECharts, React Query, Zustand, Socket.io-client.
- **Backend:** Bun (yoki Node.js v22), Hono , Pino (log), Drizzle/Prisma (ORM).
- **Ma'lumotlar bazasi:** PostgreSQL + TimescaleDB (vaqt seriyali ma'lumotlar uchun).
- **Baholash yadrosi:** TypeScript, Fuzzy Inference System (FIS), Worker Threads (ko'p yadroli hisoblash).
- **Real vaqt:** WebSocket (Socket.io yoki native).

## 3. Arxitektura qoidalari
- **Modullilik:** Backend `src/services/fuzzyEngine/`, `src/services/dataIngestion/` kabi mustaqil modullarga bo'linadi.
- **RESTful API:** Barcha endpointlar `/api/v1/` prefiksi ostida.
- **Ma'lumotlar oqimi:** Sensor (MQTT/Modbus) -> Validatsiya -> MongoDB/PostgreSQL -> FIS baholash -> WebSocket orqali Frontend-ga push.

## 4. Noaniq mantiq (Fuzzy Logic) yadrosi


- **GES:** Agregatlarning umumiy holati tasir qiladi.
- **Agregatlarga:** TransformerFIS, GeneratorFIS, TurbinaFIS.
- **A'zolik funksiyalari:** Triangular
- **Natija:** 0-100% ball, Holat: A'lo, Juda yaxshi, Yaxshi, Yomon, Juda yomon.

## 5. Kritik cheklovlar va talablar
1. **Vaqt seriyali samaradorlik:** Har bir sensor ma'lumoti 10 soniyada keladi. TimescaleDB continuous aggregates ishlatilsin.
2. **Xavfsizlik:** Barcha API'lar JWT bilan himoyalangan. Rol: admin, engineer, viewer.
3. **Xatolikka chidamlilik:** FIS hisoblashda xatolik yuz bersa, oldingi baholash natijasi (cache) qaytarilsin.
4. **Tillar:** Kod va sharhlar **Ingliz tilida**, foydalanuvchi interfeysi va xatolik xabarlari **O'zbek tilida**.

## 6. Progress Log (majburiy — har doim yangilab boriladi)
Loyiha ildizidagi **`PROGRESS.md`** — sessiyalar orasidagi context uzilib qolmasligi
uchun (masalan, `/compact` yoki context limit tufayli) muhim o'zgarishlar, qarorlar
va ularning sabablari yozib boriladigan jurnal.

- **Har qanday muhim ish tugagach** (yangi feature, arxitekturaviy qaror, muhim
  bugfix, migratsiya, ko'p bosqichli UI o'zgarish va h.k.) `PROGRESS.md` fayliga
  yangi yozuv **qo'shilishi shart** — mavjud yozuvlarni o'chirmasdan, eng yuqoriga
  (eng yangi sana birinchi bo'lib turadigan tartibda).
- Har bir yozuvda: **sana**, **nima qilindi**, **nega qilindi (sabab/kontekst)**,
  **qaysi fayllar o'zgardi** qisqa va aniq ko'rsatilsin — kelgusi sessiya buni
  o'qib, kodni qayta o'rganmasdan tezda kontekstga kirishi kerak.
- Mayda-chuyda ishlar (typo, formatlash, bitta qatorlik fix) uchun yozuv shart emas
  — faqat kelgusi sessiya uchun bilish muhim bo'lgan narsalar yoziladi.
- Kontekst compact/reset bo'lishidan oldin (yoki uzoq/murakkab ish yakunida)
  `PROGRESS.md` yangilanganiga ishonch hosil qilinsin.