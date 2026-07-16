import winston from "winston";
import prisma from "../../config/prisma";
import { sendMail } from "./mailer";
import {
  registrationReceivedTemplate,
  adminNewUserTemplate,
  accountApprovedTemplate,
  accountRejectedTemplate,
  passwordResetTemplate,
} from "./templates";

interface MinimalUser {
  email: string;
  fullName: string | null;
  provider: string;
}

// SENDMAIL.md — "adminlar" ro'yxati: tasdiqlangan ADMIN'lar bazadan olinadi,
// bo'sh bo'lsa (masalan birinchi o'rnatishda) ADMIN_EMAIL fallback sifatida ishlatiladi.
async function getAdminRecipients(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "APPROVED" },
    select: { email: true },
  });
  if (admins.length > 0) return admins.map((a) => a.email);
  return process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [];
}

export async function sendRegistrationReceivedEmail(user: MinimalUser): Promise<void> {
  try {
    await sendMail({
      to: user.email,
      subject: "Ro'yxatdan o'tish arizangiz qabul qilindi",
      html: registrationReceivedTemplate(user.fullName),
    });
  } catch (err) {
    winston.error(`sendRegistrationReceivedEmail xatolik: ${(err as Error).message}`);
  }
}

export async function sendAdminNewUserNotification(user: MinimalUser): Promise<void> {
  try {
    const recipients = await getAdminRecipients();
    await Promise.all(
      recipients.map((to) =>
        sendMail({
          to,
          subject: "Yangi foydalanuvchi tasdiqlashni kutmoqda",
          html: adminNewUserTemplate(user),
        }),
      ),
    );
  } catch (err) {
    winston.error(`sendAdminNewUserNotification xatolik: ${(err as Error).message}`);
  }
}

export async function sendAccountApprovedEmail(user: MinimalUser, role: string): Promise<void> {
  try {
    await sendMail({
      to: user.email,
      subject: "Hisobingiz tasdiqlandi",
      html: accountApprovedTemplate(user.fullName, role),
    });
  } catch (err) {
    winston.error(`sendAccountApprovedEmail xatolik: ${(err as Error).message}`);
  }
}

export async function sendAccountRejectedEmail(user: MinimalUser): Promise<void> {
  try {
    await sendMail({
      to: user.email,
      subject: "Hisobingizga ruxsat berilmadi",
      html: accountRejectedTemplate(user.fullName),
    });
  } catch (err) {
    winston.error(`sendAccountRejectedEmail xatolik: ${(err as Error).message}`);
  }
}

export async function sendPasswordResetEmail(user: MinimalUser, resetUrl: string): Promise<void> {
  try {
    await sendMail({
      to: user.email,
      subject: "Parolni tiklash",
      html: passwordResetTemplate(resetUrl),
    });
  } catch (err) {
    winston.error(`sendPasswordResetEmail xatolik: ${(err as Error).message}`);
  }
}
