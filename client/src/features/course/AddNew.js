import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import InputText from "../../components/Input/InputText";
import TextAreaInput from "../../components/Input/TextAreaInput";
import ToogleInput from "../../components/Input/ToogleInput";
import ErrorText from "../../components/Typography/ErrorText";
import axios from "axios";
import Button from "../../components/button/Button";

function ProfileSettings() {
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;
  const INITIAL_TEACHER_OBJ = {
    firstName: "",
    lastName: "",
  };
  const [val, setVal] = useState(INITIAL_TEACHER_OBJ);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const [loginObj, setLoginObj] = useState(INITIAL_TEACHER_OBJ);
  const submitForm = async () => {
    setErrorMessage("");

    if (val.firstName.trim() === "")
      return setErrorMessage("First Name is required! (use any value)");
    if (val.lastName.trim() === "")
      return setErrorMessage("Last Name is required! (use any value)");
    else {
      // setLoading(true);
      // Call API to check user credentials and save token in localstorage
      try {
        const res = await axios.post(`${SERVER_URL}teachers`, val);
        console.log(res);
        if (res.status === 201) {
          setLoading(false);
          dispatch(
            showNotification({
              message: "Teacher's data was added ",
              status: 1,
            })
          );
        }
      } catch (error) {
        setLoading(false);
        setErrorMessage(error.response.data);
      }
    }
  };

  // Call API to update profile settings changes

  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  return (
    <>
      <TitleCard title="Add new course" topMargin="mt-2">
        <form action="" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputText
              labelTitle="Name"
              defaultValue={val.firstName}
              name="firstName"
              updateFormValue={updateFormValue}
            />

            <InputText
              labelTitle="Last Name"
              defaultValue={val.lastName}
              name="lastName"
              updateFormValue={updateFormValue}
            />
            <InputText
              labelTitle="Title"
              defaultValue="UI/UX Designer"
              updateFormValue={updateFormValue}
            />
            <InputText
              labelTitle="Place"
              defaultValue="California"
              updateFormValue={updateFormValue}
            />
            <TextAreaInput
              labelTitle="About"
              defaultValue="Doing what I love, part time traveller"
              updateFormValue={updateFormValue}
            />
          </div>

          <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
          <div className="mt-16">
            <button
              className={
                "btn btn-primary float-right" + (loading ? " loading" : "")
              }
              onClick={() => submitForm()}
            >
              Save
            </button>
            {/* <Button name={'Cancel'} styles={"btn bg-[#00A9C] float-right mx-1" + (loading ? " loading" : "")}/> */}
          </div>
        </form>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
