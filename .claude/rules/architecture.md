# Architecture Constraints (Always Rules)

1. **Backend qatlamlari (Controller -> Service -> Repository -> DB):**
   - Controller faqat so'rov/qabul qilish uchun.
   - Service faqat biznes mantiq (FIS chaqirish, validatsiya).
   - Repository faqat ma'lumotlar bazasi bilan ishlaydi (Prisma/Drizzle).
2. **Frontend holat boshqaruvi:**
   - **Server holati:** React Query (API dan kelgan ma'lumotlar) -> Kesh va sinxronlash.
   - **Client holati:** Zustand (UI holati, filterlar, session ma'lumotlari).
   - **Real vaqt:** WebSocket hook (`useSocket`) orqali ma'lumotlarni Zustand ga o‘tkazish.
3. **Xatolarni boshqarish:**
   - Barcha xatolar `AppError` sinfi orqali yuborilsin.
   - `try-catch` da log uchun `pino` ishlatilsin.