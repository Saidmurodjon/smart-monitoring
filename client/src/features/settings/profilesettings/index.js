import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import InputText from "../../../components/Input/InputText";
import Avatar from "../../../components/Avatar";
import { showNotification } from "../../common/headerSlice";
import http from "../../../utils/http";

const ROLE_LABELS = {
  ADMIN: "Administrator",
  ENGINEER: "Muhandis",
  VIEWER: "Kuzatuvchi",
};

const ROLE_BADGE_STYLE = {
  ADMIN: "badge-primary",
  ENGINEER: "badge-info",
  VIEWER: "badge-ghost",
};

function ProfileSettings() {
  const dispatch = useDispatch();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ fullName: "", orgName: "", phone: "" });

  const [pwdDraft, setPwdDraft] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdFormKey, setPwdFormKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await http.get("/users/me");
        if (cancelled) return;
        setProfile(data);
        setDraft({ fullName: data.fullName || "", orgName: data.orgName || "", phone: data.phone || "" });
      } catch (err) {
        dispatch(showNotification({ message: "Profilni yuklashda xatolik yuz berdi", status: 0 }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, []);

  const updateFormValue = (e) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const { data } = await http.put("/users/me", draft);
      setProfile(data);
      dispatch(showNotification({ message: "Profil yangilandi", status: 1 }));
    } catch (err) {
      const msg = err?.response?.data || "Saqlashda xatolik yuz berdi";
      dispatch(showNotification({ message: String(msg), status: 0 }));
    } finally {
      setSaving(false);
    }
  };

  const updatePwdValue = (e) => {
    setPwdDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const changePassword = async () => {
    if (!pwdDraft.newPassword || pwdDraft.newPassword !== pwdDraft.confirmPassword) {
      dispatch(showNotification({ message: "Yangi parollar mos kelmadi", status: 0 }));
      return;
    }
    setPwdSaving(true);
    try {
      await http.put("/users/me/password", {
        currentPassword: pwdDraft.currentPassword,
        newPassword: pwdDraft.newPassword,
      });
      dispatch(showNotification({ message: "Parol muvaffaqiyatli o'zgartirildi", status: 1 }));
      setPwdDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdFormKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data || "Parolni o'zgartirishda xatolik yuz berdi";
      dispatch(showNotification({ message: String(msg), status: 0 }));
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <TitleCard title="Profil sozlamalari" topMargin="mt-2">
        <div className="py-10 text-center text-gray-500 italic">Yuklanmoqda...</div>
      </TitleCard>
    );
  }

  return (
    <>
      <TitleCard title="Profil sozlamalari" topMargin="mt-2">
        {/* Identity header */}
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-base-200">
          <Avatar email={profile.email} size="w-14" textSize="text-2xl" />
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-base-content break-all">{profile.email}</span>
            <div className="flex items-center gap-2">
              <span className={`badge badge-sm ${ROLE_BADGE_STYLE[profile.role] || "badge-ghost"}`}>
                {ROLE_LABELS[profile.role] || profile.role}
              </span>
              <span className="badge badge-sm badge-outline">
                {profile.provider === "google" ? "Google hisobi" : "Lokal hisob"}
              </span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputText
            labelTitle="To'liq ism"
            name="fullName"
            defaultValue={draft.fullName}
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Tashkilot"
            name="orgName"
            defaultValue={draft.orgName}
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Telefon"
            name="phone"
            defaultValue={draft.phone}
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Email"
            labelStyle="text-base-content/60"
            defaultValue={profile.email}
            updateFormValue={() => {}}
            isDisabled
          />
        </div>
        <p className="text-xs text-base-content/50 -mt-3">Email manzilni o'zgartirib bo'lmaydi.</p>

        {/* Action row */}
        <div className="flex justify-end border-t border-base-200 pt-4 mt-5">
          <button
            className={"btn btn-primary" + (saving ? " loading" : "")}
            onClick={updateProfile}
            disabled={saving}
          >
            Saqlash
          </button>
        </div>
      </TitleCard>

      {profile.provider === "local" && (
        <TitleCard title="Parolni o'zgartirish" topMargin="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" key={pwdFormKey}>
            <InputText
              labelTitle="Joriy parol"
              type="password"
              name="currentPassword"
              defaultValue={pwdDraft.currentPassword}
              updateFormValue={updatePwdValue}
            />
            <InputText
              labelTitle="Yangi parol"
              type="password"
              name="newPassword"
              defaultValue={pwdDraft.newPassword}
              updateFormValue={updatePwdValue}
            />
            <InputText
              labelTitle="Yangi parolni tasdiqlang"
              type="password"
              name="confirmPassword"
              defaultValue={pwdDraft.confirmPassword}
              updateFormValue={updatePwdValue}
            />
          </div>

          <div className="flex justify-end border-t border-base-200 pt-4 mt-5">
            <button
              className={"btn btn-primary" + (pwdSaving ? " loading" : "")}
              onClick={changePassword}
              disabled={pwdSaving}
            >
              Parolni yangilash
            </button>
          </div>
        </TitleCard>
      )}
    </>
  );
}

export default ProfileSettings;
