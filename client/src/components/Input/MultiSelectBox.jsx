import { useState } from "react";
import Select from "react-tailwindcss-select";

const MultiSelectBox = ({
  labelTitle,
  labelStyle,
  type,
  name,
  containerStyle,
  defaultValue,
  placeholder,
  updateFormValue,
  isDisabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const companyOptions = defaultValue?.map((c) => ({
    value: c._id,
    label: c.firstName + " " + c.lastName,
  }));

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    updateFormValue(selectedOption);

    console.log(`Selected Option: ${selectedOption.label}`);
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span className={"label-text text-base-content " + labelStyle}>
          {labelTitle}
        </span>
      </label>
      <Select
        primaryColor={"indigo"}
        value={selectedOption}
        onChange={handleChange}
        options={companyOptions}
        isMultiple={true}
        isSearchable={true}
        isClearable={true}
        placeholder={placeholder}
        classNames={{
          menuButton: ({ isDisabled }) =>
            `flex text-gray-400 border border-gray-200/20 rounded shadow-sm transition-all duration-300 outline-none input ${
              isDisabled
                ? "bg-gray-200"
                : "focus:border-blue-500 focus:ring focus:ring-blue-500/20"
            }`,
          menu: "absolute z-10 w-full bg-gray-300/10 shadow-lg border rounded py-1 mt-1.5 text-sm text-gray-700 bg-white/20 backdrop-blur-md",
          listItem: ({ isSelected }) =>
            `block transition duration-200 px-2 py-2 cursor-pointer select-none truncate rounded ${
              isSelected
                ? `text-white bg-blue-500`
                : `text-gray-400 hover:bg-blue-100 hover:text-blue-500`
            }`,
        }}
      />
    </div>
  );
};

export default MultiSelectBox;
