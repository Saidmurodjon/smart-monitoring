import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import Button from "../../components/buttons/Button";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import http from "../../utils/http";
import { useDispatch } from "react-redux";
import { addGes, updateGes } from "./gesSlice";
import { AGGREGATES_INITIAL_STATE } from "../../utils/initialStates";

function AggregatesStaticForm() {
  // edit holati: location.state ichida doc (yoki agregatlar) bo‘lishi mumkin
  const location = useLocation();
  const editingDoc = location?.state || null;
  // Agar serverdan kelgan doc ichida agregatlar bo‘lsa, o‘shani yuklaymiz;
  // bo‘lmasa toza AGGREGATES_INITIAL_STATE
  const [val, setVal] = useState(
    editingDoc? editingDoc : AGGREGATES_INITIAL_STATE
  );
const [params] = useSearchParams();
const gesId = params.get("gesId");
console.log(gesId);


  const navigate = useNavigate();
  const dispatch = useDispatch();
// 1) (ixtiyoriy) editingDoc kelishi kechiksa, state-ni sinxronlab turish
useEffect(() => {
  if (editingDoc?.aggregates) {
    setVal(editingDoc);
  }
}, [editingDoc]);
console.log(val);
// 2) updateFormValuePath o‘sha-o‘sha (yaxshi ishlayapti)
const updateFormValuePath = (e) => {
  const { name, value, type } = e.target;
  const path = name.split(".");
  setVal((prev) => {
    const next = { ...prev };
    let obj = next;
    for (let i = 0; i < path.length - 1; i++) {
      obj[path[i]] = { ...(obj[path[i]] || {}) };
      obj = obj[path[i]];
    }
    const last = path[path.length - 1];
    obj[last] = type === "number" && value !== "" ? Number(value) : value;
    return next;
  });
};

  const Submit = async () => {
    try {
      const isEdit = Boolean(editingDoc?._id);
      const path = isEdit
        ? `ges/${gesId}/aggregates?_id=${editingDoc._id}`
        : `ges/${gesId}/aggregates`;

      const method = isEdit ? "put" : "post";
  

      const { data: doc } = await http.request({
        url: path,
        method,
        data: val,
      });

      if (isEdit) dispatch(updateGes(doc));
      else dispatch(addGes(doc));

      toast.success(
        isEdit
          ? "Agregatlar ma’lumotlari yangilandi!"
          : "Agregatlar ma’lumotlari saqlandi!",
        { theme: "colored" }
      );
      navigate(-1);
    } catch (err) {
      const msg = err?.response?.data || err.message;
      toast.error(String(msg), { theme: "colored" });
    }
  };

  return (
    <TitleCard title="Aggregates (Static specs)" topMargin="mt-2">
      {/* HYDRO TURBINE */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Hydro Turbine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText labelTitle="Model" name="hydroTurbine.model"
            defaultValue={val.hydroTurbine.model} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Rated Power (kW)" type="number" name="hydroTurbine.power"
            defaultValue={val.hydroTurbine.power} updateFormValue={updateFormValuePath}/>
         
        </div>
      </div>

      {/* HYDRO GENERATOR */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Hydro Generator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText labelTitle="Model" name="hydroGenerator.model"
            defaultValue={val.hydroGenerator.model} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Rated Power (kW)" type="number" name="hydroGenerator.power"
            defaultValue={val.hydroGenerator.power} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Voltage (V)" type="number" name="hydroGenerator.voltage_V"
            defaultValue={val.hydroGenerator.voltage_V} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Frequency (Hz)" type="number" name="hydroGenerator.frequency_Hz"
            defaultValue={val.hydroGenerator.frequency_Hz} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="cos φ" type="number" name="hydroGenerator.cosphi"
            defaultValue={val.hydroGenerator.cosphi} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Efficiency (%)" type="number" name="hydroGenerator.efficiency"
            defaultValue={val.hydroGenerator.efficiency} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Serial Number" name="hydroGenerator.serialNumber"
            defaultValue={val.hydroGenerator.serialNumber} updateFormValue={updateFormValuePath}/>
        
        </div>
      </div>

      {/* TRANSFORMER */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Transformer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText labelTitle="Rated Power (kVA)" type="number" name="transformer.power"
            defaultValue={val.transformer.power} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Primary (kV)" type="number" name="transformer.primary_kV"
            defaultValue={val.transformer.primary_kV} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Secondary (kV)" type="number" name="transformer.secondary_kV"
            defaultValue={val.transformer.secondary_kV} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Efficiency (%)" type="number" name="transformer.efficiency"
            defaultValue={val.transformer.efficiency} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Cooling" name="transformer.cooling"
            defaultValue={val.transformer.cooling} updateFormValue={updateFormValuePath}/>
          <InputText labelTitle="Serial Number" name="transformer.serialNumber"
            defaultValue={val.transformer.serialNumber} updateFormValue={updateFormValuePath}/>
        </div>
      </div>

      <div className="mt-10">
        <Button name="Save" btnStyle="btn-primary" onPress={Submit} />
        <Button name="Cancel" btnStyle="secondary" navigate={-1} />
      </div>
    </TitleCard>
  );
}

export default AggregatesStaticForm;
