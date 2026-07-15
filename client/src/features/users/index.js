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

function UsersList() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

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

  return (
    <TitleCard title="Foydalanuvchilar va rollar" topMargin="mt-2">
      <p className="text-sm text-base-content/70 mb-4">
        Har bir foydalanuvchining tizimdagi rolini shu yerdan boshqarishingiz
        mumkin. Rol qanday vazifani bajarishi haqida{" "}
        <span className="font-semibold">ROLES.md</span> faylida batafsil
        yozilgan.
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
                <th>Rol</th>
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
