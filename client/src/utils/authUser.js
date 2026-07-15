// JWT payload'ini faqat UI'da rolni ko'rsatish/yashirish uchun o'qiydi —
// imzo tekshirilmaydi (bu shart emas: haqiqiy ruxsat chegarasi serverda,
// ROLES.md §6). Token yaroqsiz bo'lsa jim ravishda null qaytaradi.
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
}

export function getCurrentUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return decodeToken(token)?.role || null;
}

export function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return decodeToken(token);
}
