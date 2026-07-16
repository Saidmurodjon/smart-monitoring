import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import http from "../../utils/http";
import { showNotification } from "../common/headerSlice";

const ROLE_OPTIONS = ["ADMIN", "ENGINEER", "VIEWER"];
const ROLE_LABELS = {
  ADMIN: "Administrator",
  ENGINEER: "Muhandis",
  VIEWER: "Kuzatuvchi",
};
const STATUS_LABELS = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};
const STATUS_BADGE_STYLE = {
  PENDING: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
};

function UsersList() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [pendingRoleChoice, setPendingRoleChoice] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await http.get("/users");
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      dispatch(showNotification({ message: "Foydalanuvchilarni yuklashda xatolik yuz berdi", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const changeRole = async (id, role) => {
    setSavingId(id);
    try {
      await http.put(`/users/${id}/role`, { role });
      dispatch(showNotification({ message: "Rol yangilandi", status: 1 }));
      await load();
    } catch (err) {
      const msg = err?.response?.data || "Rolni yangilashda xatolik yuz berdi";
      dispatch(showNotification({ message: String(msg), status: 0 }));
    } finally {
      setSavingId(null);
    }
  };

  const approveUser = async (id) => {
    const role = pendingRoleChoice[id] || "VIEWER";
    setSavingId(id);
    try {
      await http.put(`/users/${id}/approve`, { role });
      dispatch(showNotification({ message: "Foydalanuvchi tasdiqlandi", status: 1 }));
      await load();
    } catch (err) {
      const msg = err?.response?.data || "Tasdiqlashda xatolik yuz berdi";
      dispatch(showNotification({ message: String(msg), status: 0 }));
    } finally {
      setSavingId(null);
    }
  };

  const rejectUser = async (id) => {
    setSavingId(id);
    try {
      await http.put(`/users/${id}/reject`, {});
      dispatch(showNotification({ message: "Foydalanuvchi rad etildi", status: 1 }));
      await load();
    } catch (err) {
      const msg = err?.response?.data || "Rad etishda xatolik yuz berdi";
      dispatch(showNotification({ message: String(msg), status: 0 }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <TitleCard title="Foydalanuvchilar va rollar" topMargin="mt-2">
      <p className="text-sm text-base-content/70 mb-4">
        Yangi ro'yxatdan o'tgan foydalanuvchilar "Kutilmoqda" holatida
        ko'rinadi — rolini tanlab tasdiqlang yoki rad eting. Tasdiqlangan
        foydalanuvchilarning rolini istalgan vaqtda o'zgartirishingiz mumkin.
        Batafsil <span className="font-semibold">ROLES.md</span> va{" "}
        <span className="font-semibold">SENDMAIL.md</span> fayllarida.
      </p>

      {loading ? (
        <div>Yuklanmoqda...</div>
      ) : rows.length === 0 ? (
        <div className="text-base-content/60 italic">Foydalanuvchi topilmadi.</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Email</th>
                <th>Hisob turi</th>
                <th>Holat</th>
                <th>Rol / Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName || "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-outline">
                      {u.provider === "google" ? "Google" : "Lokal"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_BADGE_STYLE[u.status] || "badge-ghost"}`}>
                      {STATUS_LABELS[u.status] || u.status}
                    </span>
                  </td>
                  <td>
                    {u.status === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="select select-bordered select-sm"
                          value={pendingRoleChoice[u.id] || "VIEWER"}
                          disabled={savingId === u.id}
                          onChange={(e) =>
                            setPendingRoleChoice((prev) => ({ ...prev, [u.id]: e.target.value }))
                          }
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-success btn-xs"
                          disabled={savingId === u.id}
                          onClick={() => approveUser(u.id)}
                        >
                          Tasdiqlash
                        </button>
                        <button
                          className="btn btn-error btn-outline btn-xs"
                          disabled={savingId === u.id}
                          onClick={() => rejectUser(u.id)}
                        >
                          Rad etish
                        </button>
                      </div>
                    ) : (
                      <select
                        className="select select-bordered select-sm"
                        value={u.role}
                        disabled={savingId === u.id}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TitleCard>
  );
}

export default UsersList;
