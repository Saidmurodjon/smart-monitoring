// Test/namuna ma'lumot: Chorvoq GES (Toshkent viloyati, Bo'stonliq tumani,
// Chirchiq daryosida) — 2 ta agregat bilan, biri sog'lom (nominal yaqin),
// ikkinchisi ogohlantirish darajasida (FUZZY.md holat chegaralariga mos
// keladigan qiymatlar) — dashboard/FIS baholashni sinash uchun.
//
// Ishga tushirish: npx tsx scripts/seedChorvoqGes.ts

import prisma from "../src/config/prisma";
import { upsertStaticParam } from "../src/repositories/EquipmentStaticParamRepository";
import { insertReadings } from "../src/repositories/SensorReadingRepository";

async function seedAggregate(
  gesId: number,
  label: string,
  blobs: { turbine: object; generator: object; transformer: object },
  values: {
    turbineStatic: Record<string, number>;
    turbineReadings: Record<string, number>;
    generatorStatic: Record<string, number>;
    generatorReadings: Record<string, number>;
    transformerStatic: Record<string, number>;
    transformerReadings: Record<string, number>;
  },
): Promise<void> {
  const aggregate = await prisma.aggregate.create({
    data: {
      gesId,
      hydroTurbine: blobs.turbine,
      hydroGenerator: blobs.generator,
      transformer: blobs.transformer,
      state: "running",
      isPublished: true,
    },
  });

  const UNITS: Record<string, string> = {
    aylanishTezligi: "RPM",
    quvvat: "MW",
    suvSarfi: "m3/s",
    tebranish: "mm/s",
    IA: "A",
    IB: "A",
    IC: "A",
    UA: "kV",
    UB: "kV",
    UC: "kV",
    cosPhi: "",
    sinPhi: "",
    statorHarorati: "°C",
    transformatorHarorati: "°C",
    R60: "MOhm",
    R15: "MOhm",
    pNominal: "kW",
    qNominal: "kVAr",
    rizol1: "MOhm",
    rizol2: "MOhm",
    rizol3: "MOhm",
    kAbs1: "",
    kAbs2: "",
    kAbs3: "",
  };
  async function seedStatic(equipmentType: "TURBINE" | "GENERATOR" | "TRANSFORMER", params: Record<string, number>) {
    for (const [paramName, paramValue] of Object.entries(params)) {
      const unit = UNITS[paramName] ?? (paramName.startsWith("ryuq") || paramName.startsWith("rnn") ? "Ohm" : undefined);
      await upsertStaticParam(aggregate.id, equipmentType, paramName, paramValue, { unit });
    }
  }

  async function seedReadings(equipmentType: "TURBINE" | "GENERATOR" | "TRANSFORMER", readings: Record<string, number>) {
    await insertReadings(
      aggregate.id,
      equipmentType,
      Object.entries(readings).map(([paramName, value]) => ({ paramName, value, unit: UNITS[paramName] })),
    );
  }

  await seedStatic("TURBINE", values.turbineStatic);
  await seedReadings("TURBINE", values.turbineReadings);
  await seedStatic("GENERATOR", values.generatorStatic);
  await seedReadings("GENERATOR", values.generatorReadings);
  await seedStatic("TRANSFORMER", values.transformerStatic);
  await seedReadings("TRANSFORMER", values.transformerReadings);

  console.log(`  ${label}: aggregateId=${aggregate.id} yaratildi (statik parametrlar + sensor o'qishlar bilan)`);
}

async function main(): Promise<void> {
  const ges = await prisma.ges.create({
    data: {
      name: "Chorvoq GES",
      power: "620 MW",
      region: "Toshkent viloyati, Bo'stonliq tumani",
      status: "ishlamoqda",
      latitude: 41.628,
      longitude: 70.113,
      isAktive: true,
      isPublished: true,
    },
  });
  console.log(`Chorvoq GES yaratildi: gesId=${ges.id}`);

  // 1-agregat — sog'lom holat (barcha qiymatlar nominalga yaqin, FUZZY.md
  // markazlariga ko'ra "yaxshi/a'lo" bandiga tushishi kutiladi).
  await seedAggregate(
    ges.id,
    "1-agregat (sog'lom)",
    {
      turbine: { name: "Gidroturbina T-1", model: "RO-115-V-500", serial: "TRB-CHV-01" },
      generator: { name: "Gidrogenerator G-1", model: "SV-1130/135-32", serial: "GEN-CHV-01" },
      transformer: { name: "Transformator TR-1", model: "TDTsN-125000/110", serial: "TRF-CHV-01" },
    },
    {
      turbineStatic: { aylanishTezligi: 300, quvvat: 100, suvSarfi: 120 },
      turbineReadings: { aylanishTezligi: 302, quvvat: 98, suvSarfi: 119, tebranish: 0.6 },
      // pNominal/qNominal computeActivePower/computeReactivePower (fuzzyEngine/generator.ts)
      // formulasiga mos: (UA*IA+UB*IB+UC*IC)*cosPhi/sinPhi — √3 yoki /1000 YO'Q,
      // shu sabab nominal qiymat "1-agregat sog'lom" o'qishlaridan hisoblab
      // qo'yilgan, real MW emas (aks holda deviation sun'iy ravishda maksimal
      // chiqib, kAbs qanchalik yaxshi bo'lishidan qat'iy nazar f1 doim "Yomon" bo'lib qolardi).
      generatorStatic: { R60: 500, R15: 400, pNominal: 24555, qNominal: 10409 },
      generatorReadings: {
        IA: 850, IB: 848, IC: 852, UA: 10.5, UB: 10.5, UC: 10.4,
        cosPhi: 0.92, sinPhi: 0.39, statorHarorati: 72, tebranish: 0.5,
      },
      transformerStatic: {
        ryuqAB: 2.5, ryuqBC: 2.5, ryuqCA: 2.5, rnnA: 0.5, rnnB: 0.5, rnnC: 0.5,
        ryuqABActual: 2.51, ryuqBCActual: 2.49, ryuqCAActual: 2.52,
        rnnAActual: 0.5, rnnBActual: 0.51, rnnCActual: 0.5,
        rizol1: 1000, rizol2: 1050, rizol3: 980, kAbs1: 1.4, kAbs2: 1.45, kAbs3: 1.38,
      },
      transformerReadings: { transformatorHarorati: 58, tebranish: 0.4 },
    },
  );

  // 2-agregat — ogohlantirish darajasi (aylanish tezligi/tebranish/harorat
  // nominal'dan sezilarli chetlashgan — "o'rtacha/yomon" bandini sinash uchun).
  await seedAggregate(
    ges.id,
    "2-agregat (ogohlantirish darajasida)",
    {
      turbine: { name: "Gidroturbina T-2", model: "RO-115-V-500", serial: "TRB-CHV-02" },
      generator: { name: "Gidrogenerator G-2", model: "SV-1130/135-32", serial: "GEN-CHV-02" },
      transformer: { name: "Transformator TR-2", model: "TDTsN-125000/110", serial: "TRF-CHV-02" },
    },
    {
      turbineStatic: { aylanishTezligi: 300, quvvat: 100, suvSarfi: 120 },
      turbineReadings: { aylanishTezligi: 280, quvvat: 115, suvSarfi: 136, tebranish: 1.8 },
      // Nominal — 1-agregat bilan bir xil (asbob/loyihaviy qiymat o'zgarmaydi,
      // faqat ishlash sharoiti yomonlashgan): past yuklama tufayli hisoblangan
      // activePower nominaldan ~43% chetlashadi ("Yomon" bandiga tushadi).
      generatorStatic: { R60: 500, R15: 400, pNominal: 24555, qNominal: 10409 },
      generatorReadings: {
        IA: 600, IB: 595, IC: 610, UA: 10.0, UB: 9.8, UC: 10.1,
        cosPhi: 0.78, sinPhi: 0.626, statorHarorati: 98, tebranish: 2.1,
      },
      transformerStatic: {
        ryuqAB: 2.5, ryuqBC: 2.5, ryuqCA: 2.5, rnnA: 0.5, rnnB: 0.5, rnnC: 0.5,
        ryuqABActual: 2.7, ryuqBCActual: 2.68, ryuqCAActual: 2.72,
        rnnAActual: 0.54, rnnBActual: 0.55, rnnCActual: 0.53,
        rizol1: 640, rizol2: 610, rizol3: 655, kAbs1: 1.05, kAbs2: 1.02, kAbs3: 1.08,
      },
      transformerReadings: { transformatorHarorati: 88, tebranish: 1.2 },
    },
  );
}

main()
  .then(() => {
    console.log("Chorvoq GES uchun namuna ma'lumotlar muvaffaqiyatli qo'shildi.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
