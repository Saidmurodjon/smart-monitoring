import { useEffect } from "react";

// Google OAuth callback shu sahifaga ?token=... bilan redirect qiladi
// (server/src/api/v1/auth/google.js). Login.js'ning submitForm'idagi
// muvaffaqiyatli-login oqimi bilan bir xil: tokenni saqlab, dashboard'ga
// o'tkazadi.
function AuthGoogleSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/app/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4">Tizimga kirilmoqda...</p>
      </div>
    </div>
  );
}

export default AuthGoogleSuccess;
