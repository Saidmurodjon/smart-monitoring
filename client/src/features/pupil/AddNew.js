import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";
import InputText from "../../components/Input/InputText";
import TextAreaInput from "../../components/Input/TextAreaInput";
import ToogleInput from "../../components/Input/ToogleInput";
import useFetch from "../../hooks/UseFetch";
import { toast } from "react-toastify";

function ProfileSettings() {
  const [val, setVal] = useState({
    firstName: "",
    lastName: "",
  });

  // Call API to update profile settings changes
  const { data, error, fetchData } = useFetch();
  const Submit = async (_id) => {
    fetchData("teachers", {
      method: "post",
      data: val,
    });
  };
  useEffect(() => {
    if (data) {
      toast.success("Teacher ma'lumotlari qo'shldi!", {
        theme: "colored",
      });
    } else if (error) {
      toast.error(`Error in POST request: ${error}`, {
        theme: "colored",
      });
    }
  }, [data, error]);
  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
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
          {/* <InputText
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
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Language"
            defaultValue="English"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Timezone"
            defaultValue="IST"
            updateFormValue={updateFormValue}
          />
          <ToogleInput
            updateType="syncData"
            labelTitle="Sync Data"
            defaultValue={true}
            updateFormValue={updateFormValue}
          /> */}
        </div>

        <div className="mt-16">
          <button className="btn btn-primary float-right" onClick={Submit}>
            Save
          </button>
        </div>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
