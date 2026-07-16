// SENDMAIL.md — barcha shablonlar: faqat inline style (ko'p mail-klientlar
// <style> blokini olib tashlaydi), matn o'zbek tilida (CLAUDE.md #5.4).

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  ENGINEER: "Muhandis",
  VIEWER: "Kuzatuvchi",
};

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <h2 style="color: #4f46e5; margin-bottom: 16px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">Smart Monitoring — GES texnik holatini baholash platformasi</p>
    </div>
  `;
}

export function registrationReceivedTemplate(fullName: string | null): string {
  return layout(
    "Ro'yxatdan o'tish arizangiz qabul qilindi",
    `
      <p>Assalomu alaykum${fullName ? `, ${fullName}` : ""}!</p>
      <p>Smart Monitoring platformasida ro'yxatdan o'tganingiz uchun rahmat. Arizangiz administratorga yuborildi.</p>
      <p>Tasdiqlangandan so'ng, platformadan foydalanish uchun sizga alohida xat yuboriladi.</p>
    `,
  );
}

export function adminNewUserTemplate(user: { email: string; fullName: string | null; provider: string }): string {
  return layout(
    "Yangi foydalanuvchi tasdiqlashni kutmoqda",
    `
      <p>Platformada yangi foydalanuvchi ro'yxatdan o'tdi va tasdiqlashingizni kutmoqda:</p>
      <ul>
        <li><strong>F.I.Sh:</strong> ${user.fullName || "—"}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Usul:</strong> ${user.provider === "google" ? "Google" : "Email/parol"}</li>
      </ul>
      <p>Uni tasdiqlash yoki rad etish uchun "Foydalanuvchilar" bo'limiga o'ting.</p>
    `,
  );
}

export function accountApprovedTemplate(fullName: string | null, role: string): string {
  return layout(
    "Hisobingiz tasdiqlandi",
    `
      <p>Assalomu alaykum${fullName ? `, ${fullName}` : ""}!</p>
      <p>Hisobingiz administrator tomonidan tasdiqlandi. Sizga <strong>${ROLE_LABELS[role] || role}</strong> huquqi berildi.</p>
      <p>Endi platformaga tizimga kirishingiz mumkin.</p>
    `,
  );
}

export function accountRejectedTemplate(fullName: string | null): string {
  return layout(
    "Hisobingizga ruxsat berilmadi",
    `
      <p>Assalomu alaykum${fullName ? `, ${fullName}` : ""}.</p>
      <p>Afsuski, hisobingizga platformadan foydalanish uchun ruxsat berilmadi. Batafsil ma'lumot uchun administratorga murojaat qiling.</p>
    `,
  );
}

export function passwordResetTemplate(resetUrl: string): string {
  return layout(
    "Parolni tiklash",
    `
      <p>Parolingizni tiklash uchun so'rov yubordingiz. Quyidagi tugma orqali yangi parol o'rnating:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Parolni tiklash</a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">Havola 1 soatdan so'ng amal qilmaydi. Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.</p>
    `,
  );
}
