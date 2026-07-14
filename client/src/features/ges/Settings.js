import { useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import InputText from "../../components/Input/InputText";
import SelectBox from "../../components/Input/SelectBox";
// import useFetch from "../../hooks/UseFetch";
import { GES_INITIAL_STATE } from "../../utils/initialStates";
import Button from "../../components/buttons/Button";
import { useLocation, useNavigate } from "react-router-dom";
import RadioInput from "../../components/Input/RadioInput";
import { toast } from "react-toastify";
import http from "../../utils/http";
import { addGes, updateGes } from "./gesSlice";
import { useDispatch } from "react-redux";
import GesLocationPicker from "../../components/UZMAP/LocationPicker";

const STATUS_OPTIONS = [
  { name: "A'lo", value: "A'lo" },
  { name: "Yaxshi", value: "Yaxshi" },
  { name: "O'rtacha", value: "O'rtacha" },
  { name: "Yomon", value: "Yomon" },
  { name: "Juda yomon", value: "Juda yomon" },
];

function Settings() {
  // edit holati: location.state ichida doc bor deb faraz
  const location = useLocation();
  const editingDoc = location?.state || null;
  const [val, setVal] = useState(editingDoc ? editingDoc : GES_INITIAL_STATE);

  
  const navigate=useNavigate()
    const dispatch = useDispatch();

  // Call API to update profile settings changes
  // const { fetchData } = useFetch();
  // const Submit = async () => {
  //   fetchData("ges-list", {
  //     method: location?.state ? "put" : "post",
  //     data: val,
  //     status: location?.state ? 200 : 201,
  //     successMessage: location?.state
  //       ? "Ma'lumot yangilandi !"
  //       : "Ma'lumot qo'shildi",
  //   });
  // };
  const Submit = async (e) => {
    // e.preventDefault();
    try {
      const isEdit = Boolean(editingDoc?._id);
      const path   = isEdit ? `/ges-list?_id=${editingDoc._id}` : `/ges-list`;
      const method = isEdit ? "put" : "post";

      // server JSON doc qaytarishi shart (qarang: #1)
      const { data: doc } = await http.request({ url: path, method, data: val });
        // 🔹 Optimistik Redux
      if (isEdit) dispatch(updateGes(doc));
      else dispatch(addGes(doc));
      toast.success(isEdit ? "Ma'lumot yangilandi!" : "Ma'lumot qo'shildi", { theme: "colored" });
      navigate(-1)
      // ixtiyoriy: orqaga qaytish
      // navigate(-1);
    } catch (err) {
      const msg = err?.response?.data || err.message;
      toast.error(String(msg), { theme: "colored" });
    }
  };
  const updateFormValue = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };

  const togglePublished = (e) => {
    setVal({ ...val, isPublished: e.target.checked });
  };

  const pickLocation = ({ latitude, longitude }) => {
    setVal((v) => ({ ...v, latitude, longitude }));
  };


  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputText
            labelTitle="GES nomi"
            defaultValue={val.name}
            name="name"
            updateFormValue={updateFormValue}
          />

          <InputText
            labelTitle="Hudud"
            defaultValue={val.region}
            name="region"
            updateFormValue={updateFormValue}
          />
          <SelectBox
            labelTitle="Texnik holati"
            defaultValue={val.status}
            name="status"
            options={STATUS_OPTIONS}
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Tamirlangan vaqti"
            defaultValue={
              val.age ? new Date(val?.age).toISOString().split("T")[0] : val.age
            }
            type="date"
            name="repair"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Quvvati"
            defaultValue={val.power}
            name="power"
            updateFormValue={updateFormValue}
          />
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={!!val.isPublished}
                onChange={togglePublished}
              />
              <span className="label-text">Dashboardda ko'rinsin</span>
            </label>
          </div>
          {/* <InputText
            labelTitle="Home Phone"
            defaultValue={val.homePhone}
            name="homePhone"
            updateFormValue={updateFormValue}
          />
          <SelectBox
            labelTitle="Course"
            defaultValue={val.course}
            name="course"
            placeholder={"Cource"}
            options={[
              { name: "IELTS", value: "64dba6be153a73d50cb809e4" },
              { name: "GENERAL", value: "64dba6be153a73d50cb809e4" },
            ]}
            updateFormValue={updateFormValue}
          />
          <RadioInput
            labelTitle="Gender"
            defaultValue={val.gender}
            name="gender"
            updateFormValue={updateFormValue}
          />
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Location"
            defaultValue={val.location}
            name="location"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Email"
            defaultValue={val.email}
            name="email"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Cupon"
            defaultValue={val.cupon}
            name="cupon"
            updateFormValue={updateFormValue}
          /> */}
        </div>

        <div className="divider"></div>

        <div>
          <label className="label">
            <span className="label-text">GESning xaritadagi joylashuvi (belgilash uchun xaritani bosing)</span>
          </label>
          <GesLocationPicker
            latitude={val.latitude}
            longitude={val.longitude}
            onPick={pickLocation}
          />
          {val.latitude != null && val.longitude != null && (
            <p className="text-sm text-base-content/70 mt-2">
              Tanlangan koordinata: {val.latitude}, {val.longitude}
            </p>
          )}
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
