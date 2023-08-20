import { useState } from "react";

function InputText({
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
console.log(value);
  const changeHandler  = (val) => {
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
      <input
        type={type || "text"}
        name={name}
        value={value}
        placeholder={placeholder || ""}
        onChange={changeHandler }
        className="input  input-bordered w-full "
      />
    </div>
  );
}

export default InputText;
