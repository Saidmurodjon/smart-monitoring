import React, { useState } from "react";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";

function SelectBox(props) {
  const {
    labelTitle,
    labelDescription,
    defaultValue,
    containerStyle,
    placeholder,
    labelStyle,
    options = [],
    name,
    updateFormValue,
  } = props;

  const [value, setValue] = useState(defaultValue || "");

  const updateValue = (e) => {
    updateFormValue(e);
    setValue(e.target.value);
  };

  return (
    <div className={`inline-block ${containerStyle}`}>
      <label className={`label  ${labelStyle}`}>
        <div className="label-text">
          {labelTitle}
          {labelDescription && (
            <div className="tooltip tooltip-right" data-tip={labelDescription}>
              <InformationCircleIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </label>

      <select
        className="select select-bordered w-full"
        value={value}
        name={name}
        onChange={updateValue}
      >
        <option  value="PLACEHOLDER">
         <input type="text"/>
        </option>
        {options?.map((o, k) => {
          return (
            <option value={o.value || o._id} key={k}>
              {o.name || o.firstName + " " + o.lastName}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default SelectBox;
