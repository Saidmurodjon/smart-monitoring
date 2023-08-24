import { useState } from "react";

function ToogleInput({
  labelTitle,
  labelStyle,
  name,
  containerStyle,
  defaultValue,
  updateFormValue,
}) {
  const [value, setValue] = useState(defaultValue);

  const updateToogleValue = (e) => {
    setValue(e.target.value);
    updateFormValue(e);
};
console.log();

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label cursor-pointer">
        <span className={"label-text text-base-content " + labelStyle}>
          {labelTitle}
        </span>
        <input
          type="checkbox"
          name={name}
          className="toggle"
          value={value}
          onChange={updateToogleValue}
        />
      </label>
    </div>
  );
}

export default ToogleInput;
