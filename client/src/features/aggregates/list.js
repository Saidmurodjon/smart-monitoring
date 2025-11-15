import moment from "moment";
import { useEffect } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import useFetch from "../../hooks/UseFetch";
import IconButton from "../../components/buttons/IconButton";
import Button from "../../components/buttons/Button";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  fetchGesList,
  selectGesItems,
  selectGesLoading,
  selectGesError,
  removeGes,
} from "./gesSlice";
import { toast } from "react-toastify";
import http from "../../utils/http";
import GesAnimation from "../ges/GesAnimation";
import AggregateAnimation from "./AggregateAnimation";
import TransformerAnimation from "./TransformerAnimation";

function Transactions() {
  const location = useLocation();
  const { total, running, maintenance, building } = useSelector(
    (s) => s.ges?.stats
  );
  const geo = location.state?.geo;
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector(
    (s) => ({
      items: selectGesItems(s),
      loading: selectGesLoading(s),
      error: selectGesError(s),
    }),
    shallowEqual
  );

  const selectedRegionName =
    geo?.properties?.name ||
    geo?.properties?.NAME_1 ||
    geo?.name ||
    null;

  useEffect(() => {
    const params = selectedRegionName ? { region: selectedRegionName } : {};
    dispatch(fetchGesList(params));
  }, [selectedRegionName, dispatch]);

  const Delete = async (row) => {
    if (!window.confirm("Delete the item?")) return;
    try {
      await http.delete(`/ges-list?_id=${row._id}`);
      dispatch(removeGes({ _id: row._id }));
      toast.success("Item has deleted", { theme: "colored" });
    } catch (e) {
      const msg = e?.response?.data || e.message;
      toast.error(String(msg), { theme: "colored" });
    }
  };

  // Bitta agregatni olaymiz (hozircha birinchi element)
  const firstAgg = items && items.length > 0 ? items[0] : null;
  const hydroTurbine = firstAgg?.hydroTurbine || {};
  const hydroGenerator = firstAgg?.hydroGenerator || {};
  const transformer = firstAgg?.transformer || {};

  return (
    <>
      <TitleCard
        title="Aggregat"
        topMargin="mt-2"
        TopSideButtons={
          <Button
            name={"Add new"}
            btnStyle={"btn-primary px-6 btn-sm normal-case"}
            navigate={"./add-new"}
          />
        }
      >
        {loading && <div>Yuklanmoqda...</div>}
        {error && (
          <div className="text-red-500">Xatolik: {String(error)}</div>
        )}

        {!loading && !error && !firstAgg && (
          <div>Maʼlumot topilmadi</div>
        )}

        {!loading && !error && firstAgg && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* 1 - Gidroturbina */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-center mb-2">
                  Gidroturbina
                </h2>
                 <AggregateAnimation />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Umumiy holati</span>
                    <span>{hydroTurbine.overall || "Aʼlo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aylanash tezligi</span>
                    <span>{hydroTurbine.speed_rpm || "-"} ayl/daq</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quvvat</span>
                    <span>{hydroTurbine.ratedPowerKW || "-"} kVt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suv sarfi</span>
                    <span>{hydroTurbine.ratedFlow_m3s || "-"} m³/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tebranish</span>
                    <span>{hydroTurbine.vibration || "-"} mkm</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  name="Batafsil"
                  btnStyle="btn-sm px-8"
                  // navigate={"./turbine-details"}
                />
              </div>
            </div>

            {/* 2 - Gidrogenerator */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-center mb-4">
                  Gidrogenerator
                </h2>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Umumiy holati</span>
                    <span>{hydroGenerator.overall || "Aʼlo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kabs</span>
                    <span>{hydroGenerator.kabs || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tebranish</span>
                    <span>{hydroGenerator.vibration || "-"} mkm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stator harorati</span>
                    <span>
                      {hydroGenerator.statorTemp || "-"} °C
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  name="Batafsil"
                  btnStyle="btn-sm px-8"
                  // navigate={"./generator-details"}
                />
              </div>
            </div>

            {/* 3 - Transformator */}
            <div className="bg-base-100 shadow-md rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-center mb-4">
                  Transformator
                </h2>
                <TransformerAnimation/>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Umumiy holati</span>
                    <span>{transformer.overall || "Aʼlo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chulgʻam texnik holati</span>
                    <span>{transformer.windingState || "Aʼlo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Izolyatsiya holati</span>
                    <span>{transformer.insulationState || "Aʼlo"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Noelektrik qism</span>
                    <span>{transformer.mechanicalState || "Aʼlo"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button
                  name="Batafsil"
                  btnStyle="btn-sm px-8"
                  // navigate={"./transformer-details"}
                />
              </div>
            </div>
          </div>
        )}
      </TitleCard>
    </>
  );
}

export default Transactions;
