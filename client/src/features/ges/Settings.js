import { useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import SelectBox from "../../components/Input/SelectBox";
import useFetch from "../../hooks/UseFetch";
import { GES_INITIAL_STATE } from "../../utils/initialStates";
import Button from "../../components/buttons/Button";
import { useLocation } from "react-router-dom";
import RadioInput from "../../components/Input/RadioInput";
function Settings() {
  const location = useLocation();
  const [val, setVal] = useState(
    location?.state ? location.state : GES_INITIAL_STATE
  );
  // Call API to update profile settings changes
  const { fetchData } = useFetch();
  const Submit = async () => {
    fetchData("ges-list", {
      method: location?.state ? "put" : "post",
      data: val,
      status: location?.state ? 200 : 201,
      successMessage: location?.state
        ? "Ma'lumot yangilandi !"
        : "Ma'lumot qo'shildi",
    });
  };
  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  console.log(val);

  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText
            labelTitle="GES nomi"
            defaultValue={val.name}
            name="name"
            updateFormValue={updateFormValue}
          />

          <InputText
            labelTitle="Hudud"
            defaultValue={val.region}
            name="region"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Texnik holati"
            defaultValue={val.status}
            name="status"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Tamirlangan vaqti"
            defaultValue={
              val.age ? new Date(val?.age).toISOString().split("T")[0] : val.age
            }
            type="date"
            name="repair"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Quvvati"
            defaultValue={val.power}
            name="power"
            updateFormValue={updateFormValue}
          />
          {/* <InputText
            labelTitle="Home Phone"
            defaultValue={val.homePhone}
            name="homePhone"
            updateFormValue={updateFormValue}
          />
          <SelectBox
            labelTitle="Course"
            defaultValue={val.course}
            name="course"
            placeholder={"Cource"}
            options={[
              { name: "IELTS", value: "64dba6be153a73d50cb809e4" },
              { name: "GENERAL", value: "64dba6be153a73d50cb809e4" },
            ]}
            updateFormValue={updateFormValue}
          />
          <RadioInput
            labelTitle="Gender"
            defaultValue={val.gender}
            name="gender"
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
          <InputText
            labelTitle="Cupon"
            defaultValue={val.cupon}
            name="cupon"
            updateFormValue={updateFormValue}
          /> */}
        </div>

        <div className="mt-16">
          <Button name={"Save"} btnStyle={"btn-primary"} onPress={Submit} />
          <Button name={"Cancel"} btnStyle={"secondary"} navigate={-1} />
        </div>
      </TitleCard>
    </>
  );
}

export default Settings;
