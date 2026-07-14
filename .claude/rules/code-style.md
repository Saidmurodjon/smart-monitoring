# Code Style & Standards (Always Rules)

1. **TypeScript ustuvorligi:** Barcha fayllar `.ts` yoki `.tsx` da yozilishi shart. `any` ishlatish taqiqlanadi, `unknown` yoki aniq interfeyslar ishlatilsin.
2. **Import tartibi:**
   - Tashqi kutubxonalar (react, hono, etc.)
   - Ichki modullar (`@/services`, `@/models`, `@/utils`)
   - Nisbiy importlar (`./component`, `../types`)
3. **Funksiya nomlanishi:**
   - Hook'lar: `use` prefiksi bilan (masalan, `useAssessment`)
   - Servislar: `Service` suffiksi bilan (masalan, `FuzzyEngineService`)
   - Controllerlar: `Controller` suffiksi bilan
4. **Formatlash:** Prettier (single quotes, semi: true, trailingComma: all, printWidth: 100).
5. **Izohlar:** Murakkab mantiqlar (ayniqsa FIS qoidalari) albatta izoh bilan ta'minlansin.