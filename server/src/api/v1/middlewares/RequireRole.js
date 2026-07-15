// Faqat berilgan rollardan biriga ega foydalanuvchiga ruxsat beradi.
// Har doim `Authentication` middleware'idan KEYIN ishlatiladi — `req.user`ga
// tayanadi. ROLES.md §3 (ruxsatlar matritsasi) shu yerda amalga oshiriladi.
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send("Tizimga kirish talab qilinadi");
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send("Bu amal uchun ruxsatingiz yetarli emas");
    }
    return next();
  };
}

module.exports = requireRole;
