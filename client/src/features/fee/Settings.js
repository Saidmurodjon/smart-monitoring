import { useState, useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import useFetch from "../../hooks/UseFetch";
import { FEE_INITIAL_STATE } from "../../utils/initialStates";
import Button from "../../components/buttons/Button";
import { useLocation } from "react-router-dom";
import DashboardTopBar from "../dashboard/components/DashboardTopBar";
import Table from "./components/Table";
function Settings() {
  const location = useLocation();
  const [val, setVal] = useState(
    location?.state ? location.state : FEE_INITIAL_STATE
  );
  // Call API to update profile settings changes
  const { data, fetchData } = useFetch();

  const Submit = async () => {};
  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  const updateDashboardPeriod = ({ startDate, endDate }) => {
    // Dashboard range changed, write code to refresh your values
    setVal({ ...val, startDate, endDate });
  };
  const Search = () => {
    fetchData(
      `pupils?firstName=${val.firstName}&lastName=${val.lastName}&startDate=${val.startDate}&endDate=${val.endDate}`
    );
  };
  return (
    <>
      <TitleCard title="Fee Settings" topMargin="mt-2">
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
           <Button name={"Search"} btnStyle={"btn-primary mt-9"} onPress={Search} />
          <InputText
            labelTitle="Pasport"
            defaultValue={val.pasport}
            name="pasport"
            updateFormValue={updateFormValue}
            isDisabled
          />
        </div>
        <div className="divider"></div>

        <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />
        <div className="mt-16">
          <Button name={"Save"} btnStyle={"btn-primary"} onPress={Submit} />
          <Button name={"Cancel"} btnStyle={"secondary"} navigate={-1} />
        </div>
        <Table value={data} />
      </TitleCard>
    </>
  );
}

export default Settings;
