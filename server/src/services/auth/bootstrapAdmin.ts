import bcrypt from "bcryptjs";
import winston from "winston";
import prisma from "../../config/prisma";

const SALT_ROUNDS = 10;

// ROLES.md §4 — enforcement yoqilgach, tizimga kirishning yagona yo'li shu
// bo'ladi: .env'dagi ADMIN_EMAIL/ADMIN_PASSWORD orqali birinchi ADMIN
// hisobi avtomatik yaratiladi (faqat `users` jadvali bo'sh bo'lsa).
export async function bootstrapAdmin(): Promise<void> {
  const count = await prisma.user.count();
  if (count > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    winston.warn(
      "Foydalanuvchilar jadvali bo'sh, lekin ADMIN_EMAIL/ADMIN_PASSWORD .env'da yo'q — tizimga kirish imkonsiz bo'ladi.",
    );
    return;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  // SENDMAIL.md — yangi ro'yxatdan o'tganlar PENDING bo'lib yaratiladi, lekin
  // bootstrap-admin buni chetlab o'tishi shart: aks holda birinchi ADMIN o'zi
  // ham tasdiqlanishini kutib, tizimga kira olmay qoladi.
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "ADMIN",
      status: "APPROVED",
      provider: "local",
      fullName: "Administrator",
    },
  });
  winston.info(`Boshlang'ich ADMIN hisobi yaratildi: ${email}`);
}
