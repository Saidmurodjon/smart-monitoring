# Security Rules (Always Rules)

1. **Atrof-muhit o'zgaruvchilari:** Hech qachon `.env` dagi ma'lumotlar (JWT_SECRET, DB_URL) kodga yozilmaydi.
2. **CORS:** Ishlab chiqarish (production) muhitida faqat frontend domeniga ruxsat berilsin.
3. **API Rate Limiting:** Har bir foydalanuvchi uchun daqiqasiga 100 ta so‘rov chegarasi qo‘yilsin.
4. **SQL/NoSQL injeksiyadan himoya:** Prisma/Drizzle parametrlangan so‘rovlardan foydalanadi, lekin raw SQL yozilganda alohida e'tibor berilsin.