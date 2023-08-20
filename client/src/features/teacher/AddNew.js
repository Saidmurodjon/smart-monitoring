import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import SelectBox from "../../components/Input/SelectBox";
import useFetch from "../../hooks/UseFetch";
import { toast } from "react-toastify";
import { TEACHER_INITIAL_STATE } from "../../utils/initialStates";
import Button from "../../components/buttons/Button";
import { useLocation } from "react-router-dom";
function Profil({ state }) {
  const location = useLocation();
  const [val, setVal] = useState(
    location?.state ? location.state : TEACHER_INITIAL_STATE
  );
  // console.log(location.state);

  console.log(val);
  // Call API to update profile settings changes
  const { data, error, fetchData } = useFetch();
  const Submit = async (_id) => {
    fetchData("teachers", {
      method: location?.state ? "put" : "post",
      data: val,
    });
  };
  useEffect(() => {
    if (data) {
      toast.success(
        location?.state
          ? "Teacher ma'lumotlari yangilandi!"
          : "Teacher ma'lumotlari qo'shldi!",
        {
          theme: "colored",
        }
      );
    } else if (error) {
      toast.error(`Error in POST request: ${error}`, {
        theme: "colored",
      });
    }
  }, [data, error]);
  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  console.log(val);
  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText
            labelTitle="First Name"
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
            labelTitle="Pasport"
            defaultValue={val.pasport}
            name="pasport"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Age"
            defaultValue={
              val.age ? new Date(val?.age).toISOString().split("T")[0] : val.age
            }
            type="date"
            name="age"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Phone"
            defaultValue={val.phone}
            name="phone"
            updateFormValue={updateFormValue}
          />
          <SelectBox
            labelTitle="Subject"
            defaultValue={val.subject}
            name="subject"
            placeholder={"Subject"}
            options={[
              { name: "IELTS", value: "IELTS" },
              { name: "GENERAL", value: "GENERAL" },
            ]}
            updateFormValue={updateFormValue}
          />
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Location"
            defaultValue={val.location}
            name="location"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Email"
            defaultValue={val.email}
            name="email"
            updateFormValue={updateFormValue}
          />
        </div>

        <div className="mt-16">
          <Button name={"Save"} btnStyle={"btn-primary"} onPress={Submit} />
          <Button name={"Cancel"} btnStyle={"secondary"} navigate={-1} />
        </div>
      </TitleCard>
    </>
  );
}

export default Profil;
