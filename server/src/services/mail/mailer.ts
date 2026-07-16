import { Resend } from "resend";
import winston from "winston";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || "Smart Monitoring <onboarding@resend.dev>";

// SENDMAIL.md — kalit sozlanmagan bo'lsa xat yuborilmaydi, lekin so'rov
// (ro'yxatdan o'tish, login, parol tiklash) baribir muvaffaqiyatli
// yakunlanishi kerak (.claude/rules/security.md xatolikka chidamlilik
// printsipi bilan bir xil: tashqi xizmat ishlamasa ham asosiy oqim buzilmaydi).
const isConfigured = Boolean(RESEND_API_KEY);
const resend = isConfigured ? new Resend(RESEND_API_KEY) : null;

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  if (!resend) {
    winston.warn(
      `Mail yuborilmadi (RESEND_API_KEY .env'da yo'q) — qabul qiluvchi: ${to}, mavzu: ${subject}`,
    );
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: MAIL_FROM, to, subject, html });
    if (error) {
      winston.error(`Mail yuborishda xatolik (${to}): ${error.message}`);
      return;
    }
    winston.info(`Mail yuborildi: ${to} — ${subject}`);
  } catch (err) {
    winston.error(`Mail yuborishda kutilmagan xatolik (${to}): ${(err as Error).message}`);
  }
}
