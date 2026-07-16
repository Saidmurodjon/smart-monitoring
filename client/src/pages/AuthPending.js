import { Link } from "react-router-dom";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";

// Google OAuth callback shu sahifaga ?status=pending|rejected bilan
// redirect qiladi (server/src/api/v1/auth/google.js) — status APPROVED
// bo'lmaguncha token berilmaydi, shu sabab bu yerda token yo'q.
function AuthPending() {
  const status = new URLSearchParams(window.location.search).get("status") || "pending";
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body items-center text-center">
          {isRejected ? (
            <XCircleIcon className="w-20 text-error" />
          ) : (
            <ClockIcon className="w-20 text-warning" />
          )}
          <h2 className="text-xl font-bold mt-2">
            {isRejected ? "Hisobingizga ruxsat berilmadi" : "Hisobingiz tasdiqlanishini kutmoqda"}
          </h2>
          <p className="text-base-content/70 mt-2">
            {isRejected
              ? "Batafsil ma'lumot uchun administratorga murojaat qiling."
              : "Arizangiz administratorga yuborildi. Tasdiqlangandan so'ng, platformadan foydalanish uchun emailingizga xabar boradi."}
          </p>
          <Link to="/login" className="mt-6">
            <button className="btn btn-primary">Login sahifasiga qaytish</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthPending;
