import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token") || "";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pwdObj, setPwdObj] = useState({ newPassword: "", confirmPassword: "" });

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) return setErrorMessage("Havola yaroqsiz — token topilmadi.");
    if (pwdObj.newPassword.trim().length < 6)
      return setErrorMessage("Yangi parol kamida 6 belgidan iborat bo'lishi kerak!");
    if (pwdObj.newPassword !== pwdObj.confirmPassword)
      return setErrorMessage("Parollar mos kelmadi!");

    setLoading(true);
    try {
      await axios.post(`${SERVER_URL}auth/reset-password`, { token, newPassword: pwdObj.newPassword });
      setLoading(false);
      setDone(true);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response?.data || "Parolni yangilashda xatolik yuz berdi");
    }
  };

  const updateFormValue = (e) => {
    setErrorMessage("");
    setPwdObj({ ...pwdObj, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl  shadow-xl">
        <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
          <div className="">
            <LandingIntro />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">
              Yangi parol o'rnatish
            </h2>

            {done ? (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Parol yangilandi</p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Endi yangi parolingiz bilan tizimga kirishingiz mumkin
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">Kirish</button>
                  </Link>
                </div>
              </>
            ) : !token ? (
              <ErrorText styleClass="mt-8 text-center">
                Havola yaroqsiz — token topilmadi. Qaytadan "Parolni tiklash" so'rovini yuboring.
              </ErrorText>
            ) : (
              <form onSubmit={(e) => submitForm(e)}>
                <div className="mb-4">
                  <InputText
                    defaultValue={pwdObj.newPassword}
                    type="password"
                    name="newPassword"
                    containerStyle="mt-4"
                    labelTitle="Yangi parol"
                    updateFormValue={updateFormValue}
                  />
                  <InputText
                    defaultValue={pwdObj.confirmPassword}
                    type="password"
                    name="confirmPassword"
                    containerStyle="mt-4"
                    labelTitle="Yangi parolni tasdiqlang"
                    updateFormValue={updateFormValue}
                  />
                </div>

                <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                <button
                  type="submit"
                  className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}
                >
                  Parolni yangilash
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
