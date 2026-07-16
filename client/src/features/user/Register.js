import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Register() {
  const INITIAL_REGISTER_OBJ = {
    fullName: "",
    email: "",
    phone: "+998",
    orgName: "",
    password: "",
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
  const [submitted, setSubmitted] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (registerObj.fullName.trim() === "")
      return setErrorMessage("F.I.Sh kiritilishi shart!");
    if (registerObj.email.trim() === "")
      return setErrorMessage("Email kiritilishi shart!");
    if (registerObj.phone.trim() === "")
      return setErrorMessage("Telefon raqami kiritilishi shart!");
    if (registerObj.password.trim().length < 6)
      return setErrorMessage("Parol kamida 6 belgidan iborat bo'lishi kerak!");

    setLoading(true);
    try {
      await axios.post(`${SERVER_URL}users`, registerObj);
      setLoading(false);
      setSubmitted(true);
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response?.data || "Ro'yxatdan o'tishda xatolik yuz berdi");
    }
  };

  const updateFormValue = (e) => {
    setErrorMessage("");
    setRegisterObj({ ...registerObj, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl  shadow-xl">
        <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
          <div className="">
            <LandingIntro />
          </div>
          <div className="py-24 px-10">
            {submitted ? (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Arizangiz qabul qilindi</p>
                <p className="mt-4 mb-2 font-semibold text-center">
                  Ro'yxatdan o'tganingiz uchun rahmat! Arizangiz administratorga yuborildi.
                </p>
                <p className="mb-8 text-center text-base-content/70">
                  Tasdiqlangandan so'ng, platformadan foydalanish uchun sizga emailingizga
                  alohida xat yuboriladi.
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">Login sahifasiga qaytish</button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  Ro'yxatdan o'tish
                </h2>
                <form onSubmit={(e) => submitForm(e)}>
                  <div className="mb-4">
                    <InputText
                      defaultValue={registerObj.fullName}
                      name="fullName"
                      containerStyle="mt-4"
                      labelTitle="F.I.Sh"
                      updateFormValue={updateFormValue}
                    />

                    <InputText
                      defaultValue={registerObj.email}
                      name="email"
                      type="email"
                      containerStyle="mt-4"
                      labelTitle="Email"
                      updateFormValue={updateFormValue}
                    />

                    <InputText
                      defaultValue={registerObj.phone}
                      name="phone"
                      containerStyle="mt-4"
                      labelTitle="Telefon"
                      updateFormValue={updateFormValue}
                    />

                    <InputText
                      defaultValue={registerObj.orgName}
                      name="orgName"
                      containerStyle="mt-4"
                      labelTitle="Tashkilot (ixtiyoriy)"
                      updateFormValue={updateFormValue}
                    />

                    <InputText
                      defaultValue={registerObj.password}
                      type="password"
                      name="password"
                      containerStyle="mt-4"
                      labelTitle="Parol"
                      updateFormValue={updateFormValue}
                    />
                  </div>

                  <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={
                      "btn mt-2 w-full btn-primary" + (loading ? " loading" : "")
                    }
                  >
                    Ro'yxatdan o'tish
                  </button>

                  <div className="text-center mt-4">
                    Hisobingiz bormi?{" "}
                    <Link to="/login">
                      <span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Kirish
                      </span>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
