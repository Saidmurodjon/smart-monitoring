import { useState } from "react";
import { useDispatch } from "react-redux";
import Datepicker from "react-tailwindcss-datepicker";
import { showNotification } from "../headerSlice";

function FilterBodyRightDrawer() {
  const dispatch = useDispatch();
  const [dateValue, setDateValue] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleDatePickerValueChange = (newValue) => {
    setDateValue(newValue);
    dispatch(
      showNotification({
        message: `Period updated to ${newValue.startDate} to ${newValue.endDate}`,
        status: 1,
      })
    );
  };

  return (
    <>
      <label className="label">
        <span className="label-text">Sana oralig'i</span>
      </label>
      <Datepicker
        containerClassName="w-full"
        value={dateValue}
        theme={"light"}
        inputClassName="input input-bordered w-full"
        popoverDirection={"down"}
        toggleClassName="invisible"
        onChange={handleDatePickerValueChange}
        showShortcuts={true}
        primaryColor={"white"}
      />
    </>
  );
}

export default FilterBodyRightDrawer;
