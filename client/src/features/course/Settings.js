import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import SelectBox from "../../components/Input/SelectBox";
import useFetch from "../../hooks/UseFetch";
import { COURSE_INITIAL_STATE } from "../../utils/initialStates";
import Button from "../../components/buttons/Button";
import { useLocation } from "react-router-dom";
import MultiSelectBox from "../../components/Input/MultiSelectBox";
function Settings() {
  const location = useLocation();
  const [val, setVal] = useState(
    location?.state ? location.state : COURSE_INITIAL_STATE
  );
  // Call API to update profile settings changes
  const { fetchData } = useFetch();
  const Submit = async () => {
    fetchData("courses", {
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
  // get teacher and pupil
  const { data: teacher, fetchData: fetchTeacher } = useFetch();
  const { data: pupil, fetchData: fetchPupil } = useFetch();
  useEffect(() => {
    fetchTeacher("teachers");
    fetchPupil("pupils");
  }, []);
  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText
            labelTitle="Course Name"
            defaultValue={val.name}
            name="name"
            updateFormValue={updateFormValue}
          />

          <InputText
            labelTitle="Type"
            defaultValue={val.type}
            name="type"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Cost "
            defaultValue={val.cost}
            name="cost"
            updateFormValue={updateFormValue}
          />

          <SelectBox
            labelTitle="Teacher"
            defaultValue={val.teacher}
            name="teacher"
            placeholder={"teacher"}
            options={teacher}
            updateFormValue={updateFormValue}
          />

          <SelectBox
            labelTitle="Pupil"
            defaultValue={val.pupil}
            name="pupil"
            placeholder={"pupil"}
            options={pupil}
            updateFormValue={updateFormValue}
          />
          <MultiSelectBox/>
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Time"
            defaultValue={val.time}
            name="time"
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

export default Settings;
