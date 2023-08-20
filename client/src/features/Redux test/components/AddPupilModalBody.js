import { useState } from "react";
import { useDispatch } from "react-redux";
import InputText from "../../../components/Input/InputText";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { addNewPupil } from "../pupilSlice";

const INITIAL_LEAD_OBJ = {
  firstName: "",
  last_name: "",
  password: "",
  email: "",
};

function AddPupilModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leadObj, setLeadObj] = useState(INITIAL_LEAD_OBJ);

  const saveNewLead = () => {
    if (leadObj.firstName.trim() === "")
      return setErrorMessage("First Name is required!");
    else if (leadObj.email.trim() === "")
      return setErrorMessage("Email id is required!");
    else {
      let newLeadObj = {
        id: 7,
        email: leadObj.email,
        firstName: leadObj.firstName,
        lastName: leadObj.lastName,
        password: leadObj.password,
        avatar: "https://reqres.in/img/faces/1-image.jpg",
      };
      dispatch(addNewPupil({ newLeadObj }));
      dispatch(showNotification({ message: "New Lead Added!", status: 1 }));
      closeModal();
    }
  };

  const updateFormValue = (e) => {
    setErrorMessage("");
    setLeadObj({ ...leadObj, [e.target.name]: e.target.value });
  };

  return (
    <>
      <InputText
        type="text"
        defaultValue={leadObj.firstName}
        name={'firstName'}
        updateType="firstName"
        containerStyle="mt-4"
        labelTitle="First Name"
        updateFormValue={updateFormValue}
      />

      <InputText
        type="text"
        defaultValue={leadObj.last_name}
        name={'lastName'}
        updateType="last_name"
        containerStyle="mt-4"
        labelTitle="Last Name"
        updateFormValue={updateFormValue}
      />

      <InputText
        type="email"
        defaultValue={leadObj.email}
        name={'email'}
        updateType="email"
        containerStyle="mt-4"
        labelTitle="Email Id"
        updateFormValue={updateFormValue}
      />
      <InputText
        type="text"
        defaultValue={leadObj.email}
        name={'firstName'}
        updateType="password"
        containerStyle="mt-4"
        labelTitle="Password"
        updateFormValue={updateFormValue}
      />

      <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
      <div className="modal-action">
        <button className="btn btn-ghost" onClick={() => closeModal()}>
          Cancel
        </button>
        <button className="btn btn-primary px-6" onClick={() => saveNewLead()}>
          Save
        </button>
      </div>
    </>
  );
}

export default AddPupilModalBody;
