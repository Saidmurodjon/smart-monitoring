import { useState } from "react";

function RadioInput({
  labelTitle,
  labelStyle,
  type,
  name,
  containerStyle,
  defaultValue,
  placeholder,
  updateFormValue,
  updateType,
}) {
  const [value, setValue] = useState(defaultValue);

  const updateToogleValue = (val) => {
    setValue(val.target.value);
    updateFormValue(val);
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>
          {labelTitle}
        </span>
      </label>
      <div className="">
        <input
          type="radio"
          id="male"
          name={name}
          value={"male"}
          checked={value === "male"}
          onChange={updateToogleValue}
        />
        <label htmlFor="male">Male</label>
      </div>
      <div>
        <input
          type="radio"
          id="female"
          name={name}
          checked={value === "female"}
          value={"female"}
          onChange={updateToogleValue}
        />
        <label htmlFor="female">FeMale</label>
      </div>
    </div>
  );
}

export default RadioInput;
