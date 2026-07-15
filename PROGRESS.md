# PROGRESS LOG

Ushbu fayl loyihadagi muhim o'zgarishlar, qarorlar va sabablarining qisqa
tarixini saqlaydi. Maqsad — context compact/reset bo'lganda yoki yangi
sessiya boshlanganda, avvalgi ishlarni tezda tushunib olish.

Yozuvlar eng yangisidan boshlab (yuqorida — yangi, pastda — eski) tartibda.
Har bir yozuv: **sana**, **nima qilindi**, **nega**, **qaysi fayllar**.

---

## 2026-07-15 (5) — Qoidalarni DB'ga ko'chirish YAKUNLANDI: f1, f2, f3, f4, f5, f6, GES ham DB-asosli

- **Sabab:** Fgt (turbina) namunali migratsiyasidan keyingi tabiiy davomi —
  qolgan barcha FIS bloklari xuddi shu isbotlangan naqsh bilan ko'chirildi.
  Fuzzy Logic yadrosini DB'ga ko'chirish vazifasi shu bilan **to'liq
  yakunlandi**.
- **`scripts/seedFuzzyRulesTurbine.ts` o'chirildi**, o'rniga
  **`scripts/seedFuzzyRules.ts`** (yagona, barcha 8 ta blokni — Fgt, f1,
  f2, f3, f4, f5, f6, GES — bitta joyda tavsiflovchi konfiguratsiya
  massivi orqali) — ikkita alohida skript bir-biridan uzoqlashib
  ketmasligi uchun konsolidatsiya qilindi. Natija: 8 blok × jami 4+3+2+
  6+6+2+2+3=28 o'zgaruvchi, 25+20+15+35+35+15+15+20=180 ta qoida DB'ga
  yozildi.
- **`fuzzyEngine/{generator,transformer,ges}.ts`ga qo'shildi:** har biriga
  mos `assessXFromDb()` funksiyalari (`assessGeneratorElectricalFromDb`,
  `assessGeneratorNonElectricalFromDb`, `assessGeneratorFromDb`,
  `assessWindingFromDb`, `assessInsulationFromDb`,
  `assessElectricalPartFromDb` — f5 uchun, ikkinchi darajali FIS ekanligi
  saqlanib qoldi — `assessTransformerNonElectricalFromDb`,
  `assessTransformerFromDb`, `assessGesLevelFromDb`). Eski kod-ichidagi
  pure funksiyalar (`assessGenerator`, `assessTransformer`,
  `assessGesLevel`) **o'chirilmadi** — fallback sifatida qoldi.
- **`{Generator,Transformer,Ges}AssessmentService.ts`ga qo'shildi:** har
  biriga Turbina uchun ishlatilgan xuddi shu `assessWithFallback()`
  naqshi — avval DB'dan urinadi, xato bo'lsa `winston.warn(...)` bilan
  kod ichidagi defaultga qaytadi.
- **Tekshirildi (yana ham to'liq regressiyasizlik isboti):** bitta
  aggregate uchun to'liq zanjir — turbina/generator/transformator
  (yaxshi va yomon holatlar) + GES darajasi (jumladan avvalgi eng muhim
  topilma — bitta jihoz yomon, qolganlari yaxshi → 50/O'rtacha) — DB
  yo'li orqali **barchasi avvalgi (kod-asosli) natijalar bilan aynan bir
  xil** chiqdi. Server logida hech qanday fallback ogohlantirishi
  yozilmadi — demak butun zanjir haqiqatan DB'dan ishladi, tasodifiy
  emas. `npx tsc --noEmit` — 0 xato. Test aggregate'lar tozalandi.
- **Loyihaning holati:** Fuzzy Logic yadrosi endi to'liq
  `.claude/rules/fuzzy-logic.md`ga mos: qoidalar DB'da, kod ichida faqat
  "default 10 ta qoida" (aslida — har bir blokning o'zining kanonik+
  fallback default to'plami, DB ishlamay qolganda ishlatiladigan xavfsiz
  zaxira). Keyingi tabiiy qadamlar (bu sessiyada qilinmagan): qoidalarni
  tahrirlash uchun admin UI/endpoint, va DB'dagi qoidalarni domen
  ekspertlari (energetiklar) tomonidan real qiymatlarga sozlash — hozirgi
  barcha chegaralar hali ham test/default (FUZZY.md'da izohlangan).

---

## 2026-07-15 (4) — Qoidalarni DB'ga ko'chirish: Fgt (gidroturbina) namunali migratsiya + kod-fallback

- **Sabab:** `.claude/rules/fuzzy-logic.md` #2: "Barcha IF-THEN qoidalari
  fuzzy_rules jadvalda saqlanishi kerak (qattiq kod emas). Faqat asosiy
  (default) 10 ta qoida kodda bo'lishi mumkin." Bu sessiyaning oxirgi
  yirik vazifasi edi. Turbina (Fgt) — sessiya davomida qat'iy o'rnatilgan
  "avval bitta jihoz to'liq, keyin umumlashtirish" naqshiga ko'ra namunali
  migratsiya sifatida tanlandi.
- **`server/prisma/schema.prisma`:** ikkita yangi model —
  `FuzzyVariableDefinition` (`fuzzy_variable_definitions`: assessmentType,
  variable, kind ["deviation"|"direct"|"score"], centers, ascendingOrder)
  va `FuzzyRuleDefinition` (`fuzzy_rule_definitions`: assessmentType,
  antecedents JSON, outputClass, weight). Migratsiya toza o'tdi (drift
  muammosi bo'lmadi).
- **`repositories/FuzzyRuleRepository.ts`** (yangi): `getVariableDefinitions`/
  `getRuleDefinitions` (o'qish) va `upsertVariableDefinition`/
  `replaceRuleDefinitions` (seed/boshqaruv uchun).
- **`fuzzyEngine/dbRuleLoader.ts`** (yangi): DB qatorlarini
  `evaluateFis()` kutgan `variableSets`/`rules` shakliga aylantiradi.
  **Muhim arxitekturaviy foyda:** bu bosqichda `engine.ts`ga HECH QANDAY
  o'zgarish kerak bo'lmadi — oldingi sessiyada (aralash-holat qoidalari
  ishi paytida) `evaluateFis(inputs, variableSets, rules)` allaqachon
  "istalgan qoidalar ro'yxati bilan ishlaydigan" generic funksiya
  qilib qurilgan edi, shuning uchun DB'dan kelgan qoidalar ham bir xil
  yo'l bilan ishlaydi. Ta'riflar (kamdan-kam o'zgaradi) 60 soniyalik
  xotira keshi bilan saqlanadi; nominal qiymatlar (aggregate'ga xos)
  keshlanmaydi.
- **`fuzzyEngine/turbine.ts`ga qo'shildi:** `assessTurbineFromDb()` —
  asosiy yo'l, DB'dan o'qiydi. Eski `assessTurbine()` (kod ichida
  hardcoded) **o'chirilmadi** — fuzzy-logic.md #2'ga ko'ra "default 10
  qoida" kodda qolishiga ruxsat beriladi, va bu endi DB ishlamay qolsa
  ishlatiladigan **fallback** vazifasini bajaradi.
- **`TurbineAssessmentService.ts`:** yangi `assessWithFallback()` —
  avval `assessTurbineFromDb()`ni sinaydi, xato bo'lsa (DB'da ta'rif
  yo'q yoki ulanish muammosi) `winston.warn(...)` bilan ogohlantirib,
  kod ichidagi `assessTurbine()`ga qaytadi — CLAUDE.md #5.3 "FIS
  hisoblashda xatolik yuz bersa, oldingi baholash natijasi qaytarilsin"
  ruhiga mos (hisoblash to'xtab qolmaydi). Bu ikkala mavjud endpoint
  (`POST .../turbine/:id` va `.../turbine/:id/from-stored`) uchun
  avtomatik ishlaydi — alohida o'zgartirish kerak bo'lmadi.
- **`scripts/seedFuzzyRulesTurbine.ts`** (yangi, `npx tsx
  scripts/seedFuzzyRulesTurbine.ts` bilan ishga tushiriladi): DB'ni
  `turbine.ts`dagi hozirgi qiymatlar bilan to'ldiradi — muhimi,
  qoidalarni QO'LDA yozib chiqmasdan, `buildCanonicalRules()`ning
  o'zini chaqirib avtomatik generatsiya qiladi (transkripsiya xatosi
  ehtimoli yo'q). 4 ta o'zgaruvchi ta'rifi + 25 ta qoida (5 kanonik +
  4 o'zgaruvchi × 5 sinf fallback) saqlandi.
- **Tekshirildi (eng muhimi — REGRESSIYASIZLIK isboti):** barcha 3 ta
  oldingi test stsenariysi DB yo'li orqali **aynan bir xil** natija
  berdi — 90/A'lo, 10/Juda yomon, 23.33/Yomon (firedRules kuchlari
  ham bitta-bittalab mos, masalan mixed holatda 0.5/0.333/0.167).
  So'ngra fallback mexanizmi ham alohida sinovdan o'tkazildi: DB'dagi
  Fgt ta'riflari vaqtincha o'chirilib (server qayta ishga tushirilib
  xotira keshi tozalanganidan keyin), bir xil so'rov yuborildi — natija
  yana 90/A'lo bo'ldi, log'da aniq ogohlantirish yozildi
  (`"Fgt: DB qoidalari ishlatilmadi, kod ichidagi default FIS'ga
  qaytildi"`), server ishlayverdi. Keyin ta'riflar qayta seed qilindi.
  `npx tsc --noEmit` — 0 xato.
- **Hali qilinmagan:** f1, f2, f3, f4, f6, GES darajasi hali kod ichida
  hardcoded qolmoqda (o'zlarining `assessTurbine()`ga o'xshash pure
  funksiyalari bilan) — ular ham xuddi shu naqsh bilan (DB loader +
  seed skript + fallback) keyingi bosqichda ko'chiriladi. Buning uchun
  `dbRuleLoader.ts`/`FuzzyRuleRepository.ts` allaqachon generic — faqat
  har bir blok uchun seed skript va service'dagi fallback logikasi
  qo'shilishi kerak.

---

## 2026-07-15 (3) — Generator/Transformator/GES ham "from-stored" naqshiga o'tkazildi

- **Sabab:** faqat gidroturbina uchun qurilgan "DB'dagi saqlangan
  ma'lumotlardan avtomatik baholash" yo'li qolgan uch bosqichga ham
  takrorlandi — endi butun 4 qatlamli zanjir (turbina→generator→
  transformator→GES) xom parametrlarni qayta-qayta yubormasdan, faqat
  DB'dagi eng so'nggi sensor/statik ma'lumotlardan ishlaydi.
- **`GeneratorAssessmentService.runGeneratorAssessmentFromStoredData()`:**
  10 ta dinamik (`IA..UC, cosPhi, sinPhi, statorHarorati, tebranish`) va
  4 ta statik (`R60, R15, pNominal, qNominal`) parametrni DB'dan o'qiydi.
  Yangi endpoint: `POST /api/assessment/generator/:aggregateId/from-stored`.
- **`TransformerAssessmentService.runTransformerAssessmentFromStoredData()`:**
  **Muhim dizayn qarori** — f3/f4 (chulg'am, izolyatsiya) FUZZY.md §2'ga
  ko'ra TO'LIQ statik (megger/absorbtsiya o'lchovlari davriy texnik
  xizmat natijasi, uzluksiz sensor emas). Shu sabab bu qiymatlar (jumladan
  "hozirgi o'lchov"lar ham) `equipment_static_params`da saqlanadi — "hozirgi"
  qiymatlar `Actual` qo'shimchasi bilan (`ryuqABActual` va h.k.) nominal
  qiymatdan ajratiladi, chunki `(aggregateId, equipmentType, paramName)`
  unique kaliti bitta paramName uchun faqat bitta qatorga ruxsat beradi.
  Faqat f6 (harorat, tebranish) haqiqiy real-vaqt sensor sifatida
  `sensor_readings`da saqlanadi. Jami 18 ta statik + 2 ta dinamik parametr.
  Yangi endpoint: `POST /api/assessment/transformer/:aggregateId/from-stored`.
- **GES darajasi uchun alohida "from-stored" endpoint QO'SHILMADI** —
  `GesAssessmentService.runGesAssessment()` allaqachon boshidanoq faqat
  DB'dan (oxirgi Fgt/F_gg/F_tr) o'qiydi, xom body qabul qilmaydi — demak
  u allaqachon "from-stored" xarakterida edi, dublikat kerak emas edi.
- **Tekshirildi:** to'liq zanjir — bitta aggregate uchun barcha 3 jihozning
  statik+dinamik ma'lumotlari yuborildi, so'ngra ketma-ket
  turbina→generator→transformator→GES `from-stored` chaqirildi — barchasi
  **90/A'lo** berdi (hech qanday xom FIS parametri qayta yuborilmadi,
  faqat `aggregateId`). `npx tsc --noEmit` — 0 xato. Test aggregate
  tozalandi (cascade orqali barcha static params/sensor readings ham o'chdi).

---

## 2026-07-15 (2) — equipment_metadata + sensor_data (TimescaleDB hypertable) ingestion pipeline

- **Sabab:** "Qoidalarni DB'ga ko'chirish" vazifasiga o'tishdan oldin
  aniqlandi: deviation-asosli o'zgaruvchilar (masalan Aylanish tezligi)
  uchun "nominal" qiymat har bir jihozga xos — bu qiymat DB'da haqiqiy
  saqlanmasdan turib, qoidalar bazasini DB'ga ko'chirish yarim-tugallanmagan
  bo'lardi. Shuning uchun avval shu infratuzilma qurildi.
- **Muhim topilma:** ushbu Neon Postgres instansida `timescaledb`
  kengaytmasi **mavjud va yoqiladigan** ekan (`CREATE EXTENSION
  timescaledb` muvaffaqiyatli o'tdi) — CLAUDE.md #5.1'dagi "TimescaleDB
  continuous aggregates" talabi endi haqiqatan bajarilishi mumkin (avval
  bu standart Neon'da mavjud emas deb taxmin qilingan edi).
- **`server/prisma/schema.prisma`:**
  - `EquipmentStaticParam` (`equipment_static_params`) — FUZZY.md §7
    "equipment_metadata"ga mos, statik/nominal qiymatlar,
    `(aggregateId, equipmentType, paramName)` bo'yicha unique.
  - `SensorReading` (`sensor_readings`) — FUZZY.md §7 "sensor_data"ga mos.
    **Muhim dizayn qarori:** hypertable talabi bo'yicha vaqt ustuni
    (`recordedAt`) barcha unique/PK cheklovlarga kirishi shart — shuning
    uchun alohida autoincrement `id` YO'Q, kompozit kalit
    `(aggregateId, equipmentType, paramName, recordedAt)` ishlatildi.
  - Migratsiyalar: `20260714...add_equipment_metadata_and_sensor_readings`
    (jadval yaratish) + qo'lda yozilgan
    `20260715002000_enable_timescaledb_hypertable` (`CREATE EXTENSION` +
    `create_hypertable()`).
  - **⚠️ Muhim voqea:** `prisma migrate dev --create-only` chaqirilganda,
    Timescale'ning `create_hypertable()` o'zi avtomatik qo'shgan indeks
    Prisma tomonidan "kutilmagan drift" deb aniqlandi va Prisma **butun
    development bazasini reset qilishni** taklif qildi (`prisma migrate
    reset` — barcha ma'lumot o'chirilardi). Bu buyruq **ishga
    tushirilmadi**. Buning o'rniga: hypertable konversiyasi to'g'ridan-
    to'g'ri (`$executeRawUnsafe` orqali) qo'lda bajarildi, so'ngra shu
    SQL migratsiya papkasi sifatida qo'lda yozilib,
    `prisma migrate resolve --applied` bilan tarixga qo'lda ro'yxatga
    olindi — `migrate dev`ning drift-aniqlash yo'lidan butunlay chetlab
    o'tildi. (Bu xuddi shu sessiyaning oldingi qismida `email @unique`
    migratsiyasi uchun ishlatilgan texnikaning takrori.)
- **`repositories/EquipmentStaticParamRepository.ts`** va
  **`repositories/SensorReadingRepository.ts`** (yangi): `upsertStaticParam`/
  `getStaticParams`, `insertReadings`/`getLatestReadings` (har bir
  `paramName` uchun eng so'nggi yozuvni oladi).
- **`EquipmentDataController.ts`/`routes/EquipmentData.ts`** (yangi):
  `PUT /api/aggregates/:aggregateId/:equipmentType/static-params` va
  `POST /api/aggregates/:aggregateId/:equipmentType/readings`.
- **`TurbineAssessmentService.ts`ga qo'shildi:**
  `runTurbineAssessmentFromStoredData()` — xom parametrlarni so'rov
  body'sida talab qilish o'rniga, DB'dagi eng so'nggi sensor o'qishlari +
  nominal statik parametrlarni o'qib avtomatik baholaydi. Yangi endpoint:
  `POST /api/assessment/turbine/:aggregateId/from-stored`. Bu FUZZY.md
  §11'dagi haqiqiy real-vaqt oqimiga mos yo'l (hozircha faqat turbina
  uchun — generator/transformator/GES uchun xuddi shunday naqsh bilan
  keyinroq qo'shiladi).
- **Tozalash:** `ReadingController.js` (Mongoose davridan qolgan, hech
  qayerda ulanmagan, chaqirilsa xato beradigan o'lik kod — `Reading.create`
  aniqlanmagan) o'chirildi, chunki uning vazifasini endi
  `EquipmentDataController`/`SensorReadingRepository` to'g'ri bajaradi.
- **Tekshirildi:** to'liq zanjir — aggregate yaratish → nominal statik
  qo'yish → sensor o'qish yuborish → `from-stored` orqali baholash → 90/
  A'lo. Ma'lumot yo'qligida aniq `422` va aylanuvchi xabar. Yangi (yomon)
  tebranish o'qishi yuborilganda "eng so'nggi" to'g'ri yangilanib, natija
  mos ravishda 50/O'rtacha'ga tushdi (§2026-07-15(1)dagi fallback qoida
  mexanizmi bilan mos). `npx tsc --noEmit` — 0 xato. Test aggregate
  tozalandi (cascade orqali static params/sensor readings ham o'chdi).

---

## 2026-07-15 (1) — Aralash-holat qoidalari qo'shildi: eng muhim topilgan cheklov hal qilindi

- **Sabab:** o'tgan sessiyada topilgan MUHIM cheklov — "kanonik" 5-qoidali
  FIS eng ko'p uchraydigan real holatni (bitta jihoz yomon, qolganlari
  yaxshi) baholay olmasdi (aniq xato tashlardi). Bu ustuvor vazifa sifatida
  belgilangan edi, shu sessiyada hal qilindi.
- **`fuzzyEngine/engine.ts`** (qayta yozildi, lekin barcha chaqiruvchi
  fayllar — `turbine.ts`, `generator.ts`, `transformer.ts`, `ges.ts` —
  o'zgarishsiz qoldi, chunki `evaluateCanonicalFis(inputs, variableSets)`
  ochiq API imzosi saqlanib qolgan):
  - Yangi generic `FisRule` tipi (`antecedents`, `outputClass`, `weight`)
    va `evaluateFis(inputs, variableSets, rules)` — istalgan qoidalar
    ro'yxati bilan ishlaydi (kelajakda DB'dan yuklanadigan haqiqiy
    qoidalar ham shu funksiyaga beriladi).
  - `buildCanonicalRules(variables, fallbackWeight=0.5)` — ikki qatlamli
    qoidalar bazasini avtomatik quradi: (1) eski AND-qoidalar (vazn 1.0,
    dissertatsiya formulasi, o'zgarmagan), (2) yangi — har bir
    o'zgaruvchi × har bir sinf uchun bitta-parametrli fallback qoida
    (vazn 0.5). Bir xil sinfga bir nechta qoida ishga tushsa, ular
    orasidan ENG KUCHLISI olinadi (MAX agregatsiya, YIG'INDI emas) — bu
    bitta halokatli parametrning ko'p sonli yaxshi parametrlar orasida
    "yuvilib ketishining" oldini oladi (xavfsizlik uchun muhim tanlov).
  - `denominator===0` uchun xato tashlash logikasi saqlanib qoldi, lekin
    endi faqat haqiqiy himoya (assertion) — fallback qoidalar butun kirish
    domenini qoplagani uchun amalda deyarli hech qachon ishga tushmaydi.
  - **Muhim xossasi:** barcha kirishlar rozi bo'lgan "toza" holatlarda
    natija **hech o'zgarmadi** (AND-qoida vazni 1.0 > fallback vazni 0.5,
    shuning uchun to'liq mos kelganda AND-qoida hukmronlik qiladi) —
    avvalgi barcha test natijalari (90/A'lo, 10/Juda yomon) qayta
    tekshirilib, aynan bir xil chiqishi tasdiqlandi (regressiyasiz).
- **`FUZZY.md`ga yangi §4.5** qo'shildi — bu qoida qurilishi dissertatsiya
  avtoreferatida yo'qligi, bizning topilgan-muammoga-yechim ekanligi aniq
  belgilab qo'yildi (to'liq 120 betlik matn topilsa, almashtirilishi mumkin).
- **Tekshirildi:** avvalgi barcha "toza" stsenariylar (turbina/generator/
  transformator good/bad) qayta ishga tushirilib, bir xil natija berdi.
  Ilgari `422`/xato qaytargan ikkita aralash stsenariy endi mantiqiy
  baholangan natija berdi:
  - Turbina: aylanish tezligi/quvvat/suv sarfi o'rtacha-yomon + tebranish
    halokatli → **23.33 ("Yomon")** — qo'lda hisoblangan taxminiy qiymatga
    (≈23.3) mos keldi.
  - GES darajasi: turbina=10 (Juda yomon), generator=90, transformator=90
    → **50 ("O'rtacha")** — oddiy o'rtacha bo'lganida 63.3 ("Yaxshi")
    chiqardi, bu xavfsizlik nuqtai nazaridan yetarlicha ehtiyotkor emas edi.
  `npx tsc --noEmit` — 0 xato. Test aggregate'lar tozalandi.

---

## 2026-07-14 (7) — GES-darajasidagi FIS + to'liq zanjir tekshiruvi + MUHIM cheklov topildi

- **Sabab:** todo ro'yxatidagi 4-qatlamning oxirgi qismi — Fgt/F_gg/F_tr'ni
  yagona GES bahosiga birlashtiruvchi FIS. Bu bilan FUZZY.md'dagi butun
  4 qatlamli arxitektura birinchi marta uchidan-uchigacha (turbina →
  generator → transformator → GES) real ishlab ko'rildi.
- **`server/prisma/schema.prisma`:** `EquipmentType` enumiga `GES` qiymati
  qo'shildi (migratsiya `20260714174456_add_ges_equipment_type`) — chunki
  GES-darajasidagi yozuv `TURBINE`/`GENERATOR`/`TRANSFORMER`ning birontasiga
  ham to'g'ri kelmaydi.
- **`fuzzyEngine/ges.ts`** (yangi): `assessGesLevel(fgt, fgg, ftr)` —
  uchala kirish ham 0-100 domenida bo'lgani uchun bir xil
  `scoreMembershipSet()` ishlatiladi.
- **`repositories/FuzzyAssessmentRepository.ts`** (yangi, birinchi marta
  haqiqiy Repository qatlami): `findLatestScore()` — DB'dan eng so'nggi
  Fgt/F_gg/F_tr qiymatlarini o'qiydi. Turbina/generator/transformator
  servislaridagi yozish tomoni hali to'g'ridan-to'g'ri Prisma bilan ishlaydi
  (`$transaction` bilan ko'p qatorli atomik yozuv uchun repository
  abstraksiyasi hozircha ortiqcha murakkablik bo'lardi — .claude/rules/
  architecture.mdga to'liq mos kelmaydi, lekin ataylab shunday qoldirilgan).
- **`GesAssessmentService.ts`/`GesAssessmentController.ts`:** yangi
  endpoint `POST /api/assessment/ges/:aggregateId` — xom parametr qabul
  qilmaydi, DB'dan so'nggi Fgt/F_gg/F_tr'ni o'qiydi; agar birortasi hali
  hisoblanmagan bo'lsa, aniq xabar bilan `422` qaytaradi.
- **⚠️ MUHIM TOPILGAN CHEKLOV:** "kanonik" 5-qoidali FIS (har bir sinf
  uchun BARCHA kirishlar bir xil sinfga mos kelishi kerak) GES darajasida
  sinovdan o'tkazilganda — turbina "Juda yomon" (10), lekin generator va
  transformator "A'lo" (90) bo'lgan real stsenariyda — **hech qaysi qoida
  ishga tushmadi va aniq xato qaytardi** (avvalgi tuzatishga ko'ra, noto'g'ri
  0 emas). Bu texnik jihatdan to'g'ri ishlayapti (xato sukut o'rniga aniq
  signal beryapti), LEKIN **bu eng ko'p uchraydigan real holat** — bitta
  jihoz yomon, qolgan ikkitasi yaxshi. Hozirgi 5 qoidalik baza buni umuman
  baholay olmaydi. **Bu keyingi ishning eng muhim ustuvor yo'nalishi**:
  yoki (a) to'liq dissertatsiya matnidan aralash-sinf qoidalarni olish,
  yoki (b) "eng yaqin sinf" asosidagi muqobil defuzzifikatsiya strategiyasi
  (masalan har bir kirishni eng mos sinfga alohida moslashtirib, keyin
  minimal/og'irlikli birlashtirish) qo'shish kerak — hozirgi arxitektura
  (`.claude/rules/fuzzy-logic.md`dagi "DB'dan qoidalar" talabi bilan bir
  qatorda) buni readily qo'llab-quvvatlaydi, faqat ko'proq qoida kerak.
- **Tekshirildi:** to'liq zanjir (turbina→generator→transformator→GES)
  barcha "a'lo" holatda `90/A'lo` berdi. GES-darajasi hisoblanishidan oldin
  chaqirilganda to'g'ri `422` va aniq xabar qaytardi. Aralash holat (bitta
  jihoz yomon) yuqoridagi cheklovni ochib berdi. `npx tsc --noEmit` — 0
  xato. Test aggregate tozalandi.

---

## 2026-07-14 (6) — Transformator FIS (f3, f4, f5, f6, F_tr) — shu jumladan haqiqiy ikkinchi darajali FIS (f5)

- **Sabab:** todo ro'yxatidagi navbatdagi qadam. Bu blok muhim, chunki
  faqat shu yerda FUZZY.md'ning eng katta tuzatishi — **f5 haqiqiy alohida
  FIS ekanligi** (oddiy o'rtacha emas) — birinchi marta amalda sinaldi.
- **`variableSets.ts`:** yangi `scoreMembershipSet()` — 0-100 ball
  domenidagi kirish uchun standart 5-sinf a'zolik to'plami (markazlar
  `OUTPUT_CLASS_CENTERS` bilan bir xil: 10/30/50/70/90). Bu boshqa bir
  FIS'ning chiqishi (f3, f4) navbatdagi FIS'ga (f5) kirish sifatida
  berilganda ishlatiladi — FUZZY.md "Qatlam 1.5".
- **`fuzzyEngine/transformer.ts`** (yangi):
  - `assessWinding` — f3, 6 kirish (barchasi og'ish-asosli, ±2/5/8/15%).
  - `assessInsulation` — f4, 6 kirish (barchasi "katta qiymat yaxshi").
  - `assessElectricalPart` — **f5 = FIS(f3.score, f4.score)**,
    `scoreMembershipSet()` orqali — f3/f4'ning ANIQ natijalarini qayta
    fuzzifikatsiya qiladi, dissertatsiyaning
    `W(tr.el.qism)i=min(mu(f3(i)),mu(f4(i)),1)` formulasiga aynan mos.
  - `assessTransformerNonElectrical` — f6, 2 kirish (harorat, tebranish).
  - `assessTransformer` — `F_tr = sqrt(f5 * f6)` (deterministik).
  - **TS xatosi va tuzatilishi:** `WindingResistance`/`InsulationResistance`
    interfeyslarini to'g'ridan-to'g'ri `Record<string, number>` kutgan
    `evaluateCanonicalFis`ga uzatish `TS2345` xatosi berdi (interfeys index
    signature'ga ega emas). Chaqiruv joyida `{ ...actual }` bilan yangi
    obyekt literal yaratib tuzatildi (obyekt literallar index signature
    talabidan ozod).
- **Service/Controller/Route:** `TransformerAssessmentService.ts` (f3,f4,f5,
  f6,F_tr — beshtasi ham `$transaction` ichida saqlanadi) →
  `TransformerAssessmentController.ts` → `POST
  /api/assessment/transformer/:aggregateId`. Servisda dastlab yozilgan
  ishlatilmagan o'zgaruvchi (`fTrStatus` placeholder) va
  `classifyForStorage` degan takrorlangan (allaqachon `variableSets.ts`da
  bor) klassifikatsiya funksiyasi darhol tozalandi — `OUTPUT_CLASS_LABELS`/
  `classifyScore` qayta ishlatildi.
- **Tekshirildi:** `npx tsc --noEmit` — 0 xato. `curl` bilan 2 stsenariy:
  barcha qarshiliklar nominalga mos + izolyatsiya a'lo + past harorat/
  tebranish → f3=f4=f5=f6=F_tr=90/A'lo; qarshiliklar 2x og'gan + izolyatsiya
  past + harorat/tebranish yuqori → barchasi 10/Juda yomon. Test aggregate
  tozalandi.

---

## 2026-07-14 (5) — Gidrogenerator FIS (f1, f2, F_gg)

- **Sabab:** Fuzzy engine yadrosi turbina bilan tasdiqlangandan keyin,
  todo ro'yxatidagi navbatdagi qadam — generator uchun ham xuddi shu
  dvigatelni (`evaluateCanonicalFis`) qayta ishlatib, real ikkinchi
  "iste'molchi" bilan sinash.
- **`server/src/services/fuzzyEngine/variableSets.ts`:** `directValueMembershipSet`
  endi ixtiyoriy `ascendingOrder` parametrini qabul qiladi — chunki
  `K_abs` (absorbtsiya koeffitsienti) "katta qiymat yaxshi" turidagi
  parametr, `Tebranish`dan farqli ("kichik qiymat yaxshi"). Shu bitta
  o'zgarish bilan mavjud `directValueMembershipSet` chaqiruvlari (turbina)
  buzilmadi (sukut qiymat eski xatti-harakatni saqlaydi).
- **`server/src/services/fuzzyEngine/generator.ts`** (yangi):
  - Preprocessing: `computeActivePower`/`computeReactivePower`/
    `computeAbsorptionCoefficient` — xom `IA,IB,IC,UA,UB,UC,cosPhi,sinPhi,
    R60,R15`dan `P`, `Q`, `K_abs` hisoblaydi. **Eslatma:** aniq
    koeffitsient/birlik konversiyasi to'liq 120 betlik dissertatsiya
    matnida bo'lishi mumkin — bizda faqat avtoreferat bor, shuning uchun
    fizik jihatdan asosli, lekin taxminiy (test/default) formula
    ishlatildi.
  - `assessGeneratorElectrical` (f1, 3 kirish: K_abs, P, Q) va
    `assessGeneratorNonElectrical` (f2, 2 kirish: stator harorati,
    tebranish) — FUZZY.md §5.B'ga mos.
  - `assessGenerator` — `F_gg = sqrt(f1 * f2)` (deterministik, FIS emas).
- **Service/Controller/Route:** `GeneratorAssessmentService.ts` (f1, f2,
  F_gg — uchalasi `$transaction` ichida alohida `fuzzy_assessments`
  qatoriga yoziladi) → `GeneratorAssessmentController.ts` → yangi endpoint
  `POST /api/assessment/generator/:aggregateId` (`routes/Assessment.ts`ga
  qo'shildi).
- **Tekshirildi:** `npx tsc --noEmit` — 0 xato. `curl` bilan 2 stsenariy:
  barcha parametrlar nominalga mos + past yuklama → f1=f2=F_gg=90/A'lo;
  tok ikki baravar oshirilgan + K_abs past + harorat/tebranish yuqori →
  f1=f2=F_gg=10/Juda yomon. Test aggregate va yozuvlari tozalandi.

---

## 2026-07-14 (4) — Fuzzy Logic yadrosi: gidroturbina (Fgt) FIS, TypeScript'da to'liq vertikal namuna

- **Sabab:** `FUZZY.md` (dissertatsiya asosida tuzatilgan) endi aniq arxitektura
  berdi — shu asosida haqiqiy kod qurishni boshladik. CLAUDE.md "Baholash
  yadrosi: TypeScript" talabini birinchi marta bajaramiz (loyihaning qolgan
  qismi hozircha JS).
- **DB (`server/prisma/schema.prisma`):** `EquipmentType` enum (TURBINE/
  GENERATOR/TRANSFORMER) va `FuzzyAssessment` modeli (`fuzzy_assessments`)
  qo'shildi, `Aggregate`ga bog'landi (`onDelete: Cascade`). Migratsiya:
  `20260714171258_add_fuzzy_assessments`. `equipment_metadata`/`sensor_data`/
  `equipment_failures` hali qo'shilmagan — hozircha kirish qiymatlari
  to'g'ridan-to'g'ri so'rov body'sida beriladi (ingestion pipeline keyingi bosqich).
- **TypeScript tooling** (`server/`): `typescript`, `tsx`, `@types/node`,
  `@types/express` devDependency sifatida qo'shildi; `tsconfig.json`
  (`strict:true`, `allowJs:true`, `module:commonjs`, `moduleResolution:bundler`
  — TS 7'da `node`/`node10` olib tashlangani uchun). `dev`/`start`
  skriptlari `tsx` orqali ishlaydigan qilindi; nodemon `.ts` fayllarni ham
  kuzatadigan bo'ldi (`-e js,mjs,cjs,json,ts`) — buni unutib, birinchi test
  paytida eski koddan natija olib chalg'ib qolgan edim, server qayta
  ishga tushirilgach tuzaldi.
- **Fuzzy engine** (`server/src/services/fuzzyEngine/`, barchasi `.ts`):
  - `membership.ts` — triangular/shoulder a'zolik funksiyalari va
    `fiveClassPartition` (5 ta markazdan standart "shoulder+triangle+shoulder"
    bo'linish).
  - `variableSets.ts` — 5 ta chiqish sinfi (`juda_yomon`..`alo`), FUZZY.md §4
    chegaralari (20/40/60/80) va ularning defuzzifikatsiya markazlari
    (10/30/50/70/90); `deviationMembershipSet` (nominaldan og'ish, masalan
    Aylanish tezligi) va `directValueMembershipSet` (xom qiymat, masalan
    Tebranish) helperlar.
  - `engine.ts` — generic Mamdani baholovchi (`evaluateCanonicalFis`):
    dissertatsiyaning `W_i=min(...,1) → μ*_i=max(W_i·vazn,0) → centroid`
    formulasini aynan takrorlaydi, barcha FIS bloklari (Fgt, f1-f6, keyinroq
    GES darajasi) uchun qayta ishlatiladi.
  - `turbine.ts` — Fgt uchun konkret 4 ta kirish (Aylanish_tezligi, Quvvat,
    Suv_sarfi, Tebranish) va chegaralar (hozircha test/default qiymatlar,
    keyin DB'ga ko'chiriladi — `.claude/rules/fuzzy-logic.md` #2).
  - **Muhim tuzatilgan xato:** agar kirish qiymatlari BIRONTA sinfga (5
    tadan) bir vaqtda to'liq mos kelmasa (masalan bitta parametr a'lo,
    boshqasi juda yomon — aralash holat), barcha 5 qoida kuchi 0 bo'lib,
    dastlab kod sukut bo'yicha `score=0`ga (ya'ni "Juda yomon"ga) qaytib
    ketayotgan edi — bu tasodifan to'g'ri chiqishi ham, chalg'ituvchi
    noto'g'ri natija berishi ham mumkin edi. Tuzatildi: bunday holatda aniq
    xato tashlanadi (`throw`), sukut bo'yicha noto'g'ri songa qaytilmaydi.
    Bu — "kanonik" 5-qoidali FIS shaklining o'zidagi cheklov (faqat avtoreferatda
    ko'rsatilgan formula, to'liq 120 betlik qoidalar jadvali emas); to'liq
    dissertatsiya matni yoki qo'shimcha "aralash" qoidalar olinganda
    kengaytiriladi.
- **Backend service/controller/route** (Controller→Service→Repository
  qatlamlariga mos, `.claude/rules/architecture.md`):
  `services/assessment/TurbineAssessmentService.ts` (FIS chaqiradi +
  `fuzzyAssessment.create` orqali saqlaydi) → `controllers/
  TurbineAssessmentController.ts` (validatsiya + xatoni ushlash) →
  `routes/Assessment.ts` (`export = router` — chunki JS fayl uni to'g'ridan-
  to'g'ri `require()` qiladi, `export default` bilan CJS interop buzilardi).
  Yangi endpoint: `POST /api/assessment/turbine/:aggregateId`.
- **Tekshirildi:** `npx tsc --noEmit` — 0 xato. `curl` bilan 3 stsenariy: (1)
  nominal qiymatlar → 90 ball/A'lo, (2) barcha 4 parametr bir xilda yomon →
  10 ball/Juda yomon, (3) aralash (bitta parametr yaxshi, boshqasi yomon) →
  yuqoridagi tuzatishdan keyin aniq xato (avval xato ravishda 0/Juda yomon
  qaytarardi). Test aggregate va uning fuzzy_assessments yozuvlari
  tozalandi (haqiqiy ma'lumot emas edi).
- **Hali qilinmagan (keyingi qadamlar):** f1-f6, Fgg/Ftr, GES-darajasidagi
  FIS; `equipment_metadata`/`sensor_data` jadvallari va MQTT/sensor ingestion
  pipeline; qoidalarni DB'ga ko'chirish (`.claude/rules/fuzzy-logic.md`);
  ishonchlilik (reliability) moduli (FUZZY.md §6). Jihoz identifikatsiya
  modeli (hozircha `aggregateId` + `equipmentType` juftligi ishlatildi —
  alohida `Equipment` jadvali emas) hali "yakuniy" qaror emas, kelajakda
  ko'p sonli sensor/statik parametr saqlash zarurati tug'ilganda qayta
  ko'rib chiqilishi mumkin.

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
