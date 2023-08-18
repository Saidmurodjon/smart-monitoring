import { useState } from "react";
import { useDispatch } from "react-redux";
import InputText from "../../../components/Input/InputText";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import { addNewPupil } from "../pupilSlice";

const INITIAL_PUPIL_OBJ = {
  first_name: "",
  last_name: "",
  email: "",
};

function AddPupilModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pupilObj, setPupilObj] = useState(INITIAL_PUPIL_OBJ);

  const saveNewPupil = () => {
    if (pupilObj.first_name.trim() === "")
      return setErrorMessage("First Name is required!");
    else if (pupilObj.email.trim() === "")
      return setErrorMessage("Email id is required!");
    else {
      let newPupilObj = {
        id: 7,
        email: pupilObj.email,
        first_name: pupilObj.first_name,
        last_name: pupilObj.last_name,
        avatar: "https://reqres.in/img/faces/1-image.jpg",
      };
      dispatch(addNewPupil({ newPupilObj }));
      dispatch(showNotification({ message: "New Pupil Added!", status: 1 }));
      closeModal();
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setPupilObj({ ...pupilObj, [updateType]: value });
  };

  return (
    <>
      <InputText
        type="text"
        defaultValue={pupilObj.first_name}
        updateType="first_name"
        containerStyle="mt-4"
        labelTitle="First Name"
        updateFormValue={updateFormValue}
      />

      <InputText
        type="text"
        defaultValue={pupilObj.last_name}
        updateType="last_name"
        containerStyle="mt-4"
        labelTitle="Last Name"
        updateFormValue={updateFormValue}
      />

      <InputText
        type="email"
        defaultValue={pupilObj.email}
        updateType="email"
        containerStyle="mt-4"
        labelTitle="Email Id"
        updateFormValue={updateFormValue}
      />

      <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
      <div className="modal-action">
        <button className="btn btn-ghost" onClick={() => closeModal()}>
          Cancel
        </button>
        <button className="btn btn-primary px-6" onClick={() => saveNewPupil()}>
          Save
        </button>
      </div>
    </>
  );
}

export default AddPupilModalBody;
