# Fuzzy Logic Development Rules (Always Rules)

1. **Yangi parametr qo'shish:** Har bir yangi parametr (masalan, "Vibration") uchun `fuzzify` funksiyasida `triangular` yoki `trapezoidal` a'zolik funksiyasi aniq belgilanishi kerak.
2. **Qoidalar bazasi:** Barcha IF-THEN qoidalari `fuzzy_rules` MongoDB/PostgreSQL jadvalida saqlanishi kerak (qattiq kod emas). Faqat asosiy (default) 10 ta qoida kodda bo‘lishi mumkin.
3. **Og'irliklar:** Har bir qoida 0.0 dan 1.0 gacha vaznga ega. Defuzzification (Centroid yoki Weighted Average) dan oldin og'irlik qo'llanilishi shart.
4. **Ishlash tezligi:** Bitta FIS hisobi 50ms dan oshmasligi kerak. Agar oshsa, Worker Thread yoki Web Worker ga o‘tkazish kerak.
5. **Log:** Har bir baholash (assessment) natijasi `fuzzy_assessments` jadvalida saqlansin (ma'lumotlar bazasi yuki uchun).