# GES jihozlarini noaniq mantiq (Fuzzy Logic) asosida baholash

> **Manba:** Bu hujjat Артикбаев Н.А.нинг "Табиий ва техноген тусдаги фавқулодда
> вазиятларда гидроэнергетика объектлари фаолиятининг ишончлилигини баҳолаш
> услуби" (PhD, 2024, ЎзР ФА Энергетика муаммолари институти) диссертацияси
> автореферати асосида тайёрланган ва шу манбага мос равишда тахрирланган.
> Услуб Чорвоқ ГЭСда синовдан ўтган (real amaliyotda tasdiqlangan), shuning
> uchun bu yerdagi arxitektura taxminiy emas — ilmiy manbada aniq isbotlangan.

Ushbu hujjat maʼlumotlarni statik/dinamik/hisoblanadigan (preprocessing)
turlarga, noaniq mantiq (FIS) arxitekturasiga va real vaqtli monitoring
tizimiga qanday joylashtirishni bosqichma-bosqich ko‘rsatadi.

## 1. Umumiy baholash strukturasi (4 qatlamli)

Diссертациядаги Simulink modellariga (3–6-rasmlar) ko‘ra, baholash **bitta**
emas, **to‘rt qatlamli** jarayon:

| Qatlam | Nima qiladi | Usul |
|---|---|---|
| 0. Preprocessing | Xom sensor qiymatlaridan (IA,IB,IC,UA,UB,UC,cosφ,sinφ va h.k.) hosila ko‘rsatkichlar (P, Q, K_abs) hisoblanadi | Oddiy formula (fuzzy emas) |
| 1. Sub-baholash | Har bir jihoz/qism uchun FIS: Fgt, f1, f2, f3, f4, f6 | To‘liq Mamdani FIS (fuzzify → min-qoida → centroid) |
| 1.5. Ichki birlashtirish | Faqat transformator uchun: f5 = FIS(f3, f4) | **Yana bir bosqich Mamdani FIS** (oddiy o‘rtacha emas!) |
| 2. Jihoz darajasi | Fgg = √(f1·f2); Ftr = √(f5·f6) | Deterministik formula — qoida/og'irlik shart emas |
| 3. GES darajasi | GES holati = FIS(Fgt, Fgg, Ftr) | 3-rasmdagi Simulink sxemasiga ko‘ra **yana to‘liq Mamdani FIS** (3 kirish → 1 chiqish), oddiy o'rtacha emas |

| Jihoz | Pastki funksiyalar | Umumiy holat formulasi |
|---|---|---|
| Gidroturbina | Bitta FIS (to‘g‘ridan-to‘g‘ri 4 parametr) | Fgt (to‘g‘ridan-to‘g‘ri FIS chiqishi) |
| Gidrogenerator | f1 – elektr qism, f2 – noelektr qism | F_gg = √(f1 · f2) |
| Transformator | f3 – chulg‘am, f4 – izolyatsiya → f5 – elektr qism (FIS orqali); f6 – noelektr qism | F_tr = √(f5 · f6) |

`Fgt, f1, f2, f3, f4, f5, f6` — har biri o‘z FIS tizimi orqali (fuzzify →
min-qoida → max(W,0) → centroid) hisoblanadi. Faqat `Fgg` va `Ftr`
hisoblanishida qoida bazasi kerak emas — bular sof matematik formula.

## 2. Parametrlarni statik / dinamik / hisoblanadigan (preprocessing) turlarga ajratish

**Muhim tuzatish:** diссертациядаги Simulink modellari (5- va 6-rasmlar)ga
ko‘ra, ko‘p sonli xom sensor qiymatlari FIS'ga to‘g‘ridan-to‘g‘ri kirmaydi —
avval kichikroq sondagi **hosila (derived) ko‘rsatkichlarga** aylantiriladi.
Bu preprocessing bosqichi FIS emas, oddiy formula.

### Gidroturbina
| Parametr | Tur | Izoh |
|---|---|---|
| Aylanish_tezligi (A) | Dinamik | O‘zgaruvchan |
| Quvvat (Q) | Dinamik | O‘zgaruvchan |
| Suv_sarfi (S) | Dinamik | O‘zgaruvchan |
| Tebranish (T) | Dinamik | O‘zgaruvchan |

Statik parametr yo‘q — barchasi to‘g‘ridan-to‘g‘ri FIS kirishi (Fgt uchun 4 ta).

### Gidrogenerator

**Preprocessing (xom → hosila):**
| Xom kirish | Tur | Nimaga aylanadi |
|---|---|---|
| IA, IB, IC, UA, UB, UC, cosφ, sinφ | Dinamik | `P` (faol quvvat), `Q` (reaktiv quvvat) — formula orqali hisoblanadi |
| R60, R15 | Statik (ta’mirdan keyin) | `K_abs = R60/R15` (absorbtsiya koeffitsienti) |

**f1 — Elektr qism (FIS kirishi — 3 ta, 9 ta emas):**
- `K_abs` (hisoblangan, statik)
- `P` — faol quvvat (hisoblangan, dinamik)
- `Q` — reaktiv quvvat (hisoblangan, dinamik)

**f2 — Noelektr qism (FIS kirishi — 2 ta, 5 ta emas):**
- `T_stat` — stator harorati (dinamik)
- `∀` (tebranish, dinamik)

> `Rq`, `Rs` kabi statik qarshiliklar diагностика/keshda saqlanadi, lekin
> Simulton modelida f2'ning to‘g‘ridan-to‘g‘ri FIS kirishi sifatida emas,
> tebranish/harorat hisob-kitobiga yordamchi parametr sifatida ishlatiladi.

### Transformator

**f3 — Chulg‘am holati (FIS kirishi — 6 ta, barchasi statik):**
`R_yuq.A-B, R_yuq.B-C, R_yuq.C-A` (yuqori chulg‘am), `R_nn.A, R_nn.B, R_nn.C` (pastki chulg‘am)

**f4 — Izolyatsiya holati (FIS kirishi — 6 ta, barchasi statik):**
`R_izol.Yk-Pk+K, R_izol.Pk-Yk+K, R_izol.Pk+Yk-K` (izolyatsiya qarshiliklari), `K_abs1, K_abs2, K_abs3` (absorbtsiya koeffitsientlari)

**f5 — Elektr qism (FIS kirishi — 2 ta: f3 va f4 natijalari):**
`f5 = FIS(f3, f4)` — bu **alohida, to‘liq Mamdani FIS bosqichi**
(`W = min(μ(f3), μ(f4), 1) → μ(f5)`, so‘ng centroid). FUZZY.md'ning oldingi
versiyasida bu "o‘rtacha yoki geometrik o‘rtacha" deb noaniq qoldirilgan edi —
diссертация bu bosqichni ham to‘liq FIS sifatida aniq ko‘rsatgan.

**f6 — Noelektr qism (FIS kirishi — 2 ta, 6/7 ta emas):**
- `T_tr` — transformator/yog‘ harorati (dinamik)
- `∀_trans` — tebranish (dinamik)

> `dTg`, `dTy.m.h.nom`, `R` (yuklama), `K` (transformatsiya koeffitsienti),
> `n` (aylanish tezligi) — bular preprocessing/statik chegara sifatida
> ishlatiladi, f6'ning bevosita FIS kirishi emas.

## 3. Noaniq mantiq (FIS) arxitekturasi — to‘g‘irlangan sxema

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         UMUMIY FIS ARXITEKTURASI (4 QATLAM)                       │
│                                                                                    │
│  Qatlam 0 (preprocessing, fuzzy emas):                                            │
│   IA,IB,IC,UA,UB,UC,cosφ,sinφ ──► P, Q          R60,R15 ──► K_abs                 │
│                                                                                    │
│  Qatlam 1 (sub-FIS, har biri mustaqil Mamdani FIS):                               │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐  ┌───────────────┐   │
│   │ Fgt (turbina) │   │ f1 (gen.elektr)│  │ f2 (gen.noelektr)│ f3 (chulg'am) │   │
│   │ A,Q,S,T       │   │ K_abs,P,Q      │  │ T_stat, ∀        │ 6 ta R        │   │
│   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘  └───────┬───────┘   │
│           │                   │                    │                  │           │
│           │                   └──────┬─────────────┘             ┌────┘           │
│           │                          ▼                           ▼                │
│           │                   Fgg = √(f1·f2)              f4 (izolyatsiya, 6 ta R) │
│           │                   (deterministik, FIS emas)          │                 │
│           │                                                      ▼                 │
│           │                                        Qatlam 1.5: f5 = FIS(f3, f4)   │
│           │                                                      │                 │
│           │                                        f6 (tr.noelektr: T, ∀) ─────┐  │
│           │                                                      │             │  │
│           │                                                      ▼             ▼  │
│           │                                            Ftr = √(f5·f6) (determin.) │
│           │                          │                            │                │
│           ▼                          ▼                            ▼                │
│  Qatlam 3:            GES holati = FIS(Fgt, Fgg, Ftr)  ← to'liq Mamdani FIS        │
│                        (3-rasm Simulink modeliga ko'ra, oddiy o'rtacha EMAS)       │
│                                                                                     │
│  Har bir FIS chiqishi: 0–100 ball + 5 ta holat (pastga qarang)                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 4. Ball chegaralari (diссертация, 2-rasm algoritmi)

Barcha darajadagi (f1..f6, Fgt, Fgg, Ftr, GES) chiqish ballari **bir xil 5 ta
chegara** bo‘yicha holatga aylantiriladi — bu CLAUDE.md'dagi 5 holatga aniq
mos keladi:

| Ball oralig‘i | Holat |
|---|---|
| `F ≤ 20` | Juda yomon |
| `20 < F ≤ 40` | Yomon |
| `40 < F ≤ 60` | O‘rtacha |
| `60 < F ≤ 80` | Yaxshi |
| `F > 80` | A’lo |

## 4.5. Qoidalar bazasi: kanonik + aralash-holat fallback (bizning qo'shimchamiz)

> **Muhim eslatma:** bu bo'lim dissertatsiya avtoreferatida yo'q — bu
> implementatsiya paytida topilgan real muammoning bizning yechimimiz.
> To'liq 120 betlik dissertatsiya matnida to'liqroq qoidalar jadvali
> bo'lishi mumkin; bu yerdagi yechim shu jadval topilguncha ishlatiladigan
> amaliy, asosli muqobil.

§3-4'dagi "kanonik" formula (`W_i = min(barcha kirishlar sinf_i'da, 1)`) —
har bir chiqish sinfi uchun BITTA qoida, va bu qoida BARCHA kirish
parametrlari BIR VAQTDA o'sha sinfga mos kelishini talab qiladi. Bu
dissertatsiya formulasini aynan takrorlaydi, lekin **jiddiy amaliy
kamchiligi bor**: agar kirishlar turli sinflarga tarqalgan bo'lsa (masalan
gidroturbinaning tebranishi "juda yomon", lekin quvvati "yaxshi" bo'lsa),
**hech qaysi qoida ishga tushmaydi** — bu esa aynan eng ko'p uchraydigan
real holat (bitta parametr yomonlashgan, qolganlari hali normal).

**Yechim — ikki qatlamli qoidalar bazasi** (`fuzzyEngine/engine.ts`,
`buildCanonicalRules()`):

1. **Kanonik AND-qoidalar** (vazn `1.0`) — dissertatsiyadagi asl formula,
   yuqorida tavsiflangan.
2. **Fallback bitta-o'zgaruvchili qoidalar** (vazn `0.5`, sozlanadigan) —
   har bir kirish parametri × har bir chiqish sinfi uchun alohida qoida:
   "IF shu-bitta-parametr sinf_i'da THEN chiqish sinf_i'ga hissa qo'shadi".
   Boshqa parametrlar bu qoidada tekshirilmaydi.

Bir xil chiqish sinfiga bir nechta qoida (masalan AND-qoida + bir nechta
fallback qoida) ishga tushsa, ular orasidan **eng kuchlisi** olinadi
(standart Mamdani "qoidalar orasida OR = max" agregatsiyasi) — YIG'INDI
emas. Bu muhim: agar 3 ta parametrdan 2 tasi "a'lo", 1 tasi "juda yomon"
bo'lsa, "juda yomon" sinfi ko'p sonli "a'lo" ovozlari orasida
o'rtachalashib yuvilib ketmaydi — bitta halokatli parametr har doim o'z
sinfi uchun to'liq ovoz beradi (xavfsizlik nuqtai nazaridan muhim: erta
aniqlash printsipi, CLAUDE.md).

Barcha kirishlar rozi bo'lgan "toza" holatda (masalan hammasi nominal)
AND-qoida (vazn 1.0) fallback qoidalardan (vazn 0.5) har doim ustun
turadi — shuning uchun natija dissertatsiya formulasiga aynan mos qoladi,
**hech narsa o'zgarmaydi**. Fallback qoidalar faqat kirishlar mos
kelmagan holatlarda "bo'shliqni to'ldiradi".

**Misol** (haqiqiy test natijasi): GES darajasida gidroturbina = 10
("Juda yomon"), gidrogenerator = 90, transformator = 90 bo'lsa — yakuniy
GES bahosi **50 ("O'rtacha")** bo'ladi (oddiy o'rtacha bo'lganida 63.3,
"Yaxshi" chiqardi — bu xavfsizlik nuqtai nazaridan yetarlicha ehtiyotkor
emas edi).

## 5. Har bir FIS uchun aʼzolik funksiyalari va qoidalar

> **Yangilanish (2026-07-15):** `.claude/rules/fuzzy-logic.md` #2'ga ko'ra
> qoidalar/aʼzolik funksiyalari endi kodda emas, DB'da saqlanadi
> (`fuzzy_variable_definitions`, `fuzzy_rule_definitions`) — **Fgt
> (gidroturbina) uchun bu allaqachon amalga oshirilgan** (namunali
> migratsiya). Quyidagi qiymatlar hali ham to'g'ri (aynan shu qiymatlar
> DB'ga seed qilingan, `scripts/seedFuzzyRulesTurbine.ts`), lekin ular
> endi "hozircha kod ichida" emas — kod ichidagi versiyasi
> (`fuzzyEngine/turbine.ts`dagi `assessTurbine()`) faqat DB ishlamay
> qolganda ishlaydigan **fallback** rolini bajaradi. f1, f2, f3, f4, f6
> va GES darajasi hali ham kod ichida hardcoded — xuddi shu naqsh bilan
> keyinroq DB'ga ko'chiriladi.

### A. Gidroturbina (Fgt)
Inputlar (4 ta dinamik): Aylanish_tezligi (RPM), Quvvat (MW), Suv_sarfi (m³/s), Tebranish (mm/s)

Aʼzolik funksiyalari (har biri uchun LOW/MEDIUM/HIGH, triangular):
- Aylanish tezligi: nominal 300 RPM, warning ±5%, danger ±10%
- Quvvat: nominal 100 MW, warning 90%, danger 110%
- Suv sarfi: nominal diapazon, warning ±20%, danger ±30%
- Tebranish: normal <1 mm/s, warning 1-3 mm/s, danger >3 mm/s

Qoidalar (misol, diссертация formatiga mos: `min(μ1,μ2,μ3,μ4,1) → μ(Fgt(i))`):
```
IF Aylanish_tezligi HIGH AND Quvvat HIGH AND Suv_sarfi NORMAL THEN OGOHLANTIRISH
IF Tebranish HIGH AND Quvvat HIGH THEN XAVF
IF Aylanish_tezligi NORMAL AND Quvvat NORMAL AND Suv_sarfi NORMAL AND Tebranish NORMAL THEN NORMAL
...
```

### B. Gidrogenerator

**Preprocessing:**
```
P = f(IA, IB, IC, UA, UB, UC, cosφ)   // faol quvvat
Q = f(IA, IB, IC, UA, UB, UC, sinφ)   // reaktiv quvvat
K_abs = R60 / R15                      // absorbtsiya koeffitsienti
```

**f1 – Elektr qism**
Inputlar: `K_abs` (statik-hosila), `P`, `Q` (dinamik-hosila)

Aʼzolik funksiyalari:
- K_abs: >1.3 normal, 1.0–1.3 warning, <1.0 danger
- P, Q: nominal quvvatga nisbatan og‘ish (p.u.), ±10% normal, ±20% warning, undan yuqori danger

**f2 – Noelektr qism**
Inputlar: `T_stat` (stator harorati, dinamik), `∀` (tebranish, dinamik)

Aʼzolik funksiyalari:
- Harorat: nominalga nisbatan og‘ish
- Tebranish: <1 mm/s normal, 1-3 mm/s warning, >3 mm/s danger

Umumiy generator holati: **F_gg = √(f1 · f2)** — deterministik, qoida shart emas.

### C. Transformator

**f3 – Chulg‘am holati**
Inputlar (6 ta, barchasi statik): `R_yuq.A-B, R_yuq.B-C, R_yuq.C-A, R_nn.A, R_nn.B, R_nn.C`

Aʼzolik funksiyalari: nominal qarshilikdan og‘ish foizi bo‘yicha — ±2% normal, ±5% warning, >5% danger

**f4 – Izolyatsiya holati**
Inputlar (6 ta, barchasi statik): `R_izol.Yk-Pk+K, R_izol.Pk-Yk+K, R_izol.Pk+Yk-K, K_abs1, K_abs2, K_abs3`

Aʼzolik: qarshilik qiymatlari va K_abs bo‘yicha me’yor

**f5 – Elektr qism (f3 va f4 asosida, alohida FIS bosqichi)**
```
W(tr.el.qism)i = min(μ(f3(i)), μ(f4(i)), 1) → μ(f5(i))
μ*(f5(i)) = max(W(tr.el.qism)i, 0)
f5 = Σ(W_i · μ*(f5(i))) / Σμ*(f5(i))    // centroid
```
Ya'ni `f3` va `f4`'ning ANIQ (crisp) natijalari qayta fuzzifikatsiya qilinib,
o‘z qoida bazasi orqali `f5` chiqariladi — oddiy o‘rtacha yoki sqrt EMAS.

**f6 – Noelektr qism**
Inputlar: `T_tr` (transformator/yog‘ harorati, dinamik), `∀_trans` (tebranish, dinamik)

Aʼzolik funksiyalari:
- Harorat gradienti: <5°C normal, >10°C danger
- Tebranish: transformator uchun <0.5 mm/s normal

Umumiy transformator holati: **F_tr = √(f5 · f6)** — deterministik.

### D. GES darajasi (yakuniy birlashtirish)
Inputlar: `Fgt`, `Fgg`, `Ftr` (uchala jihozning yakuniy ballari)

3-rasmdagi Simulink modeliga ko‘ra bu ham **to‘liq Mamdani FIS** (fuzzify →
min-qoida → centroid), 3 kirish → 1 chiqish. Bu bosqich uchun ham o‘z qoida
bazasi (masalan: "IF Fgt LOW AND Fgg NORMAL AND Ftr NORMAL THEN GES O'RTACHA")
kerak bo‘ladi — bu FUZZY.md'ning oldingi versiyasida umuman ko‘rsatilmagan edi.

## 6. Ishonchlilik (reliability) — FIS'dan mustaqil, alohida modul

Diссертациянинг 4-bobi FIS ballaridan **butunlay boshqa**, statistik
ishonchlilik hisoblashini taqdim etadi. Bu "texnik holat" (fuzzy score) emas —
"buzilish ehtimoli" / "necha soat ishonchli ishlaydi" degan boshqa savolga
javob beradi, va ikkalasi alohida ko‘rsatiladi.

**Kerakli xom ma’lumot:** har bir jihoz uchun nosozlik hodisalari tarixi
(qachon, qaysi oraliqda buzilgan) — bu FUZZY.md'ning oldingi versiyasida
ko‘rsatilmagan yangi ma’lumot turi, `fuzzy_assessments`dan farqli alohida
jadval talab qiladi (masalan `equipment_failures`: equipment_id, failed_at,
resolved_at).

**Hisoblash:**
```
λ = 1 / MTBF        // MTBF — buzilishlar orasidagi o'rtacha vaqt (soat)
P(t) = e^(-λt)       // bitta jihozning t soatdan keyingi ishonchliligi

// Ketma-ket ulangan tizim (gidroturbina-generator-transformator):
P_umumiy(t) = P_turbina(t) · P_generator(t) · P_transformator(t)
            = e^(-(λ1+λ2+λ3)·t)
```

Chorvoq GESdagi haqiqiy o‘lchovlarda: `λ_turbina=0.000035`,
`λ_generator=0.000033`, `λ_transformator=0.00002` (1/soat) — bu raqamlar
loyihaga xos emas, faqat metodika namunasi sifatida keltirilgan; haqiqiy
qiymatlar har bir GES'ning o‘z nosozlik tarixidan hisoblanadi.

**Amaliy xulosa:** platformada ikkita alohida ko‘rsatkich bo‘lishi kerak —
1) **Texnik holat** (FIS, 0-100%, 5 holat, real-time sensordan) va
2) **Ishonchlilik** (statistik, %, vaqt funksiyasi, nosozlik tarixidan) —
ikkinchisi hozircha loyiha doirasidan tashqarida (kelajakda kengaytirish
sifatida qoldiriladi), lekin FUZZY.md'da eslatib o'tish muhim edi.

## 7. Maʼlumotlar bazasiga qanday saqlash?

### Statik parametrlar (`equipment_metadata`)
```sql
-- Gidrogenerator uchun
INSERT INTO equipment_metadata (equipment_id, param_name, param_value, unit, param_type)
VALUES
  (gen_id, 'R60', 500, 'MOhm', 'nominal'),
  (gen_id, 'R15', 400, 'MOhm', 'nominal');

-- Transformator uchun
INSERT INTO equipment_metadata (equipment_id, param_name, param_value, unit, param_type)
VALUES
  (tr_id, 'Rchul_A_B', 2.5, 'Ohm', 'nominal'),
  (tr_id, 'Rchul_A_C', 2.5, 'Ohm', 'nominal'),
  (tr_id, 'Rchul_B_C', 2.5, 'Ohm', 'nominal'),
  (tr_id, 'RA', 0.5, 'Ohm', 'nominal'),
  (tr_id, 'RB', 0.5, 'Ohm', 'nominal'),
  (tr_id, 'RC', 0.5, 'Ohm', 'nominal'),
  (tr_id, 'R_izol.Yk-Pk+K', 1000, 'MOhm', 'nominal'),
  (tr_id, 'Rizol.Pk-Yk+K', 1000, 'MOhm', 'nominal'),
  (tr_id, 'Rizol.Pk+Yk+K', 1000, 'MOhm', 'nominal'),
  (tr_id, 'K_abs1', 1.4, '', 'nominal'),
  (tr_id, 'K_abs2', 1.3, '', 'nominal'),
  (tr_id, 'K_abs3', 1.5, '', 'nominal');
```

### Dinamik parametrlar (`sensor_data`)
Har bir dinamik parametr uchun sensor maʼlumoti kelganda yoziladi:
```sql
INSERT INTO sensor_data (time, equipment_id, param_name, value, unit)
VALUES
  (NOW(), gen_id, 'IA', 850, 'A'),
  (NOW(), gen_id, 'UA', 10.5, 'kV'),
  (NOW(), gen_id, 'cosfi', 0.92, ''),
  (NOW(), gen_id, 'Ts', 72, '°C');
```

### Baholash natijalari (`fuzzy_assessments`)
Har bir FIS bosqichi natijasi (Fgt, f1, f2, f3, f4, f5, f6, Fgg, Ftr, GES)
alohida yozuv sifatida saqlanadi:
```sql
INSERT INTO fuzzy_assessments (
    equipment_id, assessment_type, health_score, health_status,
    input_parameters, fired_rules, assessment_time
) VALUES (
    gen_id, 'f1', 82, 'A''lo',
    '{"K_abs":1.25, "P":10.5, "Q":3.2}',
    '[{"rule":"G1","strength":0.8},...]',
    NOW()
);
```

### Nosozlik tarixi (`equipment_failures`) — ishonchlilik hisobi uchun
```sql
INSERT INTO equipment_failures (equipment_id, failed_at, resolved_at, cause)
VALUES (gen_id, '2025-03-01 10:00', '2025-03-01 14:00', 'izolyatsiya buzilishi');
```

## 8. Backendda FIS hisoblash oqimi (to‘g‘irlangan, preprocessing bilan)

```javascript
// Misol: gidrogenerator uchun
async function assessGenerator(equipmentId) {
    const staticParams = await getStaticParams(equipmentId);   // R60, R15
    const latest = await getLatestSensorData(equipmentId);     // IA..UC, cosfi, sinfi, Ts, vibration

    // 0. Preprocessing — hosila ko'rsatkichlarni hisoblash (FIS emas)
    const P = computeActivePower(latest);      // IA,IB,IC,UA,UB,UC,cosfi asosida
    const Q = computeReactivePower(latest);    // IA,IB,IC,UA,UB,UC,sinfi asosida
    const K_abs = staticParams.R60 / staticParams.R15;

    // 1. f1 (elektrik) — 3 ta kirish
    const f1Result = fuzzyEngine.assess({ K_abs, P, Q }, generatorF1Rules);

    // 2. f2 (noelektrik) — 2 ta kirish
    const f2Result = fuzzyEngine.assess(
        { T_stat: latest.Ts, vibration: latest.vibration },
        generatorF2Rules
    );

    // 3. Fgg — deterministik geometrik o'rtacha (FIS emas)
    const overallScore = Math.sqrt(f1Result.score * f2Result.score);
    const overallStatus = getStatus(overallScore); // 20/40/60/80 chegaralari

    // 4. Saqlash
    await saveAssessment(equipmentId, 'F_gg', overallScore, overallStatus, { f1: f1Result, f2: f2Result });

    // 5. WebSocket push
    wsService.emitAssessment(stationId, equipmentId, { overallScore, overallStatus, f1: f1Result, f2: f2Result });

    return { overallScore, overallStatus };
}

// GES darajasi — bu ham alohida FIS (deterministik emas!)
async function assessGes(gesId) {
    const [fgt, fgg, ftr] = await Promise.all([
        assessTurbine(gesId), assessGenerator(gesId), assessTransformer(gesId),
    ]);
    const gesResult = fuzzyEngine.assess(
        { Fgt: fgt.overallScore, Fgg: fgg.overallScore, Ftr: ftr.overallScore },
        gesLevelRules   // alohida qoida bazasi kerak
    );
    await saveAssessment(gesId, 'GES', gesResult.score, getStatus(gesResult.score), { fgt, fgg, ftr });
    return gesResult;
}

function getStatus(score) {
    if (score <= 20) return "Juda yomon";
    if (score <= 40) return "Yomon";
    if (score <= 60) return "O'rtacha";
    if (score <= 80) return "Yaxshi";
    return "A'lo";
}
```

## 9. Frontend vizualizatsiyasi (namuna)

Rasmlardagi kabi, interfeysda kirish parametrlari maydonlari va chiqish
ko‘rsatkichlari bo‘lishi kerak.

```jsx
// Generator baholash sahifasi (namuna, platformaga moslashtirilmagan!)
const GeneratorAssessment = () => {
  const [inputs, setInputs] = useState({
    IA: '', UA: '', IB: '', UB: '', IC: '', UC: '',
    R60: '', R15: '', cosfi: '', Ts: '', vibration: ''
  });
  const [results, setResults] = useState(null);

  const handleCalculate = async () => {
    const res = await api.post('/assessment/generator', inputs);
    setResults(res.data);
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      <div className="border rounded p-4">
        <h3 className="font-bold">Elektrik ko'rsatkichlar</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <InputField label="IA" value={inputs.IA} onChange={...} />
          {/* ... */}
        </div>
        <button onClick={handleCalculate} className="btn btn-primary mt-4">Hisoblash</button>
      </div>
      <div className="border rounded p-4">
        <ResultDisplay label="Elektrik holati (f1)" value={results?.f1} />
        <ResultDisplay label="Noelektrik holati (f2)" value={results?.f2} />
        <ResultDisplay label="Umumiy holat (F_gg)" value={results?.overall} />
      </div>
    </div>
  );
};
```

Natijalarni chiroyli ko‘rsatish: har bir holat uchun gauge (0-100%) + rangli
holat yorlig‘i (§4'dagi 5 ta chegaraga mos rang). Kirish parametrlarini real
vaqtda yangilash uchun WebSocket orqali avtomatik to‘ldirish (agar sensor
ulangan bo‘lsa). Tarix grafigi — holat o‘zgarishi trendi.

## 10. API endpointlari (namuna, platformaga moslashtirilmagan!)

| Endpoint | Method | Tavsif |
|---|---|---|
| `/api/v1/assessment/turbine/:id` | POST | Gidroturbina baholash (4 parametr) |
| `/api/v1/assessment/generator/:id` | POST | Gidrogenerator baholash (preprocessing + f1/f2) |
| `/api/v1/assessment/transformer/:id` | POST | Transformator baholash (f3/f4/f5/f6) |
| `/api/v1/assessment/ges/:id` | GET | Butun GES bo‘yicha yakuniy FIS natijasi (Fgt,Fgg,Ftr → GES) |
| `/api/v1/reliability/:equipmentId` | GET | Nosozlik tarixidan hisoblangan ishonchlilik (§6, kelajakda) |

## 11. Xulosa va tavsiya

- Baholash **4 qatlamli**: preprocessing (formula) → sub-FIS (f1..f6, Fgt) →
  jihoz darajasi (Fgg, Ftr — deterministik `sqrt`; f5 — FIS) → GES darajasi
  (FIS, 3 kirishli).
- Barcha darajada bir xil **5 ta chegara** (20/40/60/80) ishlatiladi.
- `equipment_metadata` (statik — amalda `equipment_static_params`),
  `sensor_data` (dinamik — amalda `sensor_readings`, **haqiqatan
  TimescaleDB hypertable**, chunki bu Neon instansida `timescaledb`
  kengaytmasi mavjud va yoqilgan), `fuzzy_assessments` (har bosqich
  natijasi, derived) — **amalga oshirilgan** (2026-07-15). Ingestion
  endpointlari (`PUT/POST /api/aggregates/:id/:equipmentType/...`) va
  "DB'dan avtomatik baholash" yo'li (`POST
  /api/assessment/turbine/:id/from-stored`) hozircha faqat gidroturbina
  uchun namuna sifatida ulangan — generator/transformator/GES uchun xuddi
  shu naqsh keyinroq takrorlanadi. `equipment_failures` (ishonchlilik
  hisobi uchun) hali qo'shilmagan.
- Real vaqt oqimi: MQTT → Backend → (1) DB yozish, (2) preprocessing,
  (3) FIS hisoblash (barcha qatlamlar), (4) WebSocket push. Frontend faqat
  kerakli natijalarni (ball, status, asosiy parametrlar) oladi — tarmoq
  yukini kamaytirish uchun.
- Har bir FIS (Fgt, f1, f2, f3, f4, f5, f6, GES darajasi) uchun **alohida**
  qoidalar bazasi va aʼzolik funksiyalari kerak — bular DB'da saqlanadi
  (`.claude/rules/fuzzy-logic.md`ga muvofiq), faqat 10 ta default qoida
  kodda qolishi mumkin.
