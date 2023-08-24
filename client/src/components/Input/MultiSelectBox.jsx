import { useState } from "react";
import Select from "react-tailwindcss-select";

const options = [
  { value: "fox", label: "🦊 Fox" },
  { value: "Butterfly", label: "🦋 Butterfly" },
  { value: "Honeybee", label: "🐝 Honeybee" },
];

const App = () => {
  const values = [
    { id: 1, name: "Netflix" },
    { id: 2, name: "Amazon Prime" },
    { id: 3, name: "Hulu" },
    { id: 4, name: "HBO" },
    { id: 5, name: "Disney+" },
    { id: 11, name: "N1etflix" },
    { id: 21, name: "A1mazon Prime" },
    { id: 111, name: "1Hulu" },
    { id: 41, name: "H1BO" },
    { id: 51, name: "D1isney+" }
  ];

  const [selectedOption, setSelectedOption] = useState(null);

  const companyOptions = values.map((c) => ({ value: c.id, label: c.name }));

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    console.log(`Selected Option: ${selectedOption.label}`);
  };

  return (
    <Select
      primaryColor={"indigo"}
      value={selectedOption}
      onChange={handleChange}
      options={companyOptions}
      isMultiple={true}
      isSearchable={true}
      isClearable={true}
      placeholder={'tanlang'}
      classNames={{
        menuButton: ({ isDisabled }) =>
          `flex text-gray-400 border border-gray-200/20 rounded shadow-sm transition-all duration-300 outline-none mt-9 input ${
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
  );
};

export default App;
