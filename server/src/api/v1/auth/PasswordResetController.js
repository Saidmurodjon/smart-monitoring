const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../../../config/prisma");
const { sendPasswordResetEmail } = require("../../../services/mail/notifications");

const SALT_ROUNDS = 10;
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 soat
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const GENERIC_MESSAGE =
  "Agar bu email tizimda mavjud bo'lsa, parolni tiklash havolasi yuborildi.";

module.exports = {
  /** POST /api/v1/auth/forgot-password — Body: { email }.
   * Foydalanuvchi mavjudligidan qat'iy nazar bir xil javob qaytariladi
   * (email enumeration hujumidan himoya). */
  ForgotPassword: async function (req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(412).send("Email kiritilishi shart");
    }
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      // Google hisoblarida parol yo'q — tiklash ma'nosiz, jim o'tkazib yuboriladi.
      if (user && user.provider === "local") {
        const token = crypto.randomBytes(32).toString("hex");
        await prisma.passwordResetToken.create({
          data: { token, userId: user.id, expiresAt: new Date(Date.now() + TOKEN_TTL_MS) },
        });
        const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
        sendPasswordResetEmail(user, resetUrl);
      }
      return res.status(200).send(GENERIC_MESSAGE);
    } catch (err) {
      return res.status(417).send("So'rov amalga oshmadi");
    }
  },

  /** POST /api/v1/auth/reset-password — Body: { token, newPassword }. */
  ResetPassword: async function (req, res) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(412).send("Token va yangi parolni kiriting");
    }
    if (String(newPassword).length < 6) {
      return res.status(412).send("Yangi parol kamida 6 belgidan iborat bo'lishi kerak");
    }
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        return res.status(400).send("Havola yaroqsiz yoki muddati o'tgan. Qaytadan so'rov yuboring.");
      }
      const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await prisma.$transaction([
        prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashed } }),
        prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
      ]);
      return res.status(200).send("Parol muvaffaqiyatli yangilandi. Endi tizimga kirishingiz mumkin.");
    } catch (err) {
      return res.status(417).send("So'rov amalga oshmadi");
    }
  },
};
