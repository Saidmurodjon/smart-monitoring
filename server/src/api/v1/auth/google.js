const express = require("express");
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const prisma = require("../../../config/prisma");
const { signToken } = require("./Controller");

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/v1/auth/google/callback";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ROLES.md §8 — GOOGLE_CLIENT_ID/SECRET .env'da bo'lmasa strategiya
// ro'yxatga olinmaydi va route'lar server'ni yiqitmasdan 501 qaytaradi.
const isConfigured = Boolean(CLIENT_ID && CLIENT_SECRET);

if (isConfigured) {
  passport.use(
    new GoogleStrategy(
      { clientID: CLIENT_ID, clientSecret: CLIENT_SECRET, callbackURL: CALLBACK_URL },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google profilida email topilmadi"));

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                fullName: profile.displayName,
                role: "VIEWER",
                provider: "google",
                googleId: profile.id,
              },
            });
          } else if (user.provider !== "google" || !user.googleId) {
            // Avval lokal ro'yxatdan o'tgan email Google orqali birinchi
            // marta kirmoqda — hisoblarni birlashtiramiz.
            user = await prisma.user.update({
              where: { id: user.id },
              data: { provider: "google", googleId: profile.id },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

router.get("/google", (req, res, next) => {
  if (!isConfigured) {
    return res
      .status(501)
      .send("Google orqali kirish sozlanmagan — .env'ga GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET qo'shing");
  }
  return passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    if (!isConfigured) {
      return res.status(501).send("Google orqali kirish sozlanmagan");
    }
    return passport.authenticate("google", { session: false, failureRedirect: `${CLIENT_URL}/login` })(req, res, next);
  },
  (req, res) => {
    const token = signToken(req.user);
    res.redirect(`${CLIENT_URL}/auth/google/success?token=${encodeURIComponent(token)}`);
  },
);

module.exports = router;
