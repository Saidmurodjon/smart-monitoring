import { useEffect, useState } from "react";
import moment from "moment";
import TitleCard from "../../components/Cards/TitleCard";
import useFetch from "../../hooks/UseFetch";
import IconButton from "../../components/buttons/IconButton";
import Button from "../../components/buttons/Button";
import { useLocation, useNavigate } from "react-router-dom";
import GesAnimation from "./GesAnimation";

// status badge ranglari
function getStatusClass(status) {
  switch (status) {
    case "A'lo":
      return "bg-lime-400 text-black";
    case "Yaxshi":
      return "bg-yellow-400 text-black";
    case "Yomon":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400 text-black";
  }
}

function Transactions() {
  // xaritadan navigate bilan yuborilgan obyekt
  const location = useLocation();
  const navigate = useNavigate();
  const ges = location.state?.ges;

  // backenddan keladigan data (agregatlar ro'yxati)
  const { data: firstData, fetchData: fetchFirstData } = useFetch();
  const { fetchData: fetchSecondData } = useFetch();

  // tanlangan GES nomi bo'yicha filter
  const selectedName = ges?.name || null;

  // aktiv tanlangan agregat (o'ng panel uchun)
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
console.log(firstData);

  // ma'lumot yuklash
  useEffect(() => {
    if (selectedName) {
      fetchFirstData(`ges-list?name=${encodeURIComponent(selectedName)}`);
    } else {
      fetchFirstData("ges-list");
    }

  }, [selectedName]);

  // agregatlar soni
  const unitCount = firstData?.length ?? ges?.totalUnits ?? 0;

  // o'ng panelda ko'rsatiladigan agregat
  const activeUnit =
    firstData && firstData.length > 0
      ? firstData[activeUnitIndex]
      : null;

  // o'chirish
  const Delete = async (value) => {
    if (window.confirm("Delete the item?")) {
      await fetchSecondData("ges-list?_id=" + value._id, {
        method: "delete",
        status: 200,
        successMessage: "Item has deleted",
      });

      // qayta yuklash: shu ges bo'yicha qolsin
      if (selectedName) {
        fetchFirstData(
          `ges-list?name=${encodeURIComponent(selectedName)}`
        );
      } else {
        fetchFirstData("ges-list");
      }
    }
  };

  return (
    <>
      <TitleCard
        title={
          selectedName
            ? selectedName
            : "GES ma'lumotlari"
        }
        topMargin="mt-2"
        TopSideButtons={
          <Button
            name={"Add new"}
            btnStyle={"btn-primary px-6 btn-sm normal-case"}
            navigate={"./add-new"}
          />
        }
      >
        {/* 3 ustunli layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* ==== CHAP USTUN ==== */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col text-black">
            {/* Orqaga qaytish */}
            <div className="text-xs text-gray-600 mb-4 flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <span className="text-base font-black">◀◀</span>
                <span className="font-semibold italic">
                  Ortga qaytish
                </span>
              </button>
            </div>

            {/* GES "ishlayapti" animatsiyasi */}
            <div className="flex flex-col items-center mb-4">
              <GesAnimation />
              <div className="text-lg font-semibold italic mt-3 text-center text-gray-900">
                {selectedName || "Noma'lum GES"}
              </div>
            </div>
            {/* GES haqida ma'lumotlar */}
            <div className="text-[14px] leading-relaxed text-gray-800">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 items-center">
                <div className="font-semibold italic text-gray-800">
                  Umumiy holati
                </div>
                <div>
                  <span
                    className={
                      "px-3 py-[3px] rounded font-semibold text-[14px] " +
                      getStatusClass(ges?.status || "—")
                    }
                  >
                    {ges?.status || "—"}
                  </span>
                </div>

                <div className="font-semibold italic text-gray-800">
                  Agregatlar soni
                </div>
                <div className="font-semibold text-gray-900">
                  {unitCount} ta
                </div>

                <div className="font-semibold italic text-gray-800">
                  Hudud
                </div>
                <div className="text-gray-900">
                  {ges?.location || "—"}
                </div>

                <div className="font-semibold italic text-gray-800">
                  Quvvati
                </div>
                <div className="text-gray-900">
                  {ges?.power || "—"}
                </div>

                <div className="font-semibold italic text-gray-800">
                  Oxirgi tekshiruv
                </div>
                <div className="text-gray-900">
                  {ges?.lastCheck
                    ? moment(ges.lastCheck).format("D MMM YYYY, HH:mm")
                    : "—"}
                </div>

                <div className="font-semibold italic text-gray-800">
                  Mas'ul shaxs
                </div>
                <div className="text-gray-900">
                  {ges?.responsible || "—"}
                </div>

                <div className="font-semibold italic text-gray-800">
                  Kontakt
                </div>
                <div className="text-gray-900 break-all">
                  {ges?.email || ges?.phone || "—"}
                </div>

                <div className="font-semibold italic text-gray-800">
                  Izoh
                </div>
                <div className="text-gray-900">
                  {ges?.desc || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* ==== O'RTA USTUN ==== */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col text-black">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-semibold italic text-gray-900">
                Agregatlar ro'yxati
              </div>
              <div className="text-[11px] text-gray-500 font-medium">
                {unitCount} ta
              </div>
            </div>

            <div className="border-t border-gray-200 mb-4" />

            {/* ro'yxat scroll bo'lishi uchun max-height */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] pr-2">
              <table className="table w-full text-[13px]">
                <thead>
                  <tr className="text-gray-600">
                    <th className="font-semibold">#</th>
                    <th className="font-semibold">Nomi</th>
                    <th className="font-semibold">Holat</th>
                    <th className="font-semibold">Ta'mirlangan</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {firstData && firstData.length > 0 ? (
                    firstData.map((unit, idx) => (
                      <tr
                        key={idx}
                        className={`cursor-pointer hover:bg-gray-100 ${idx === activeUnitIndex ? "bg-gray-100" : ""
                          }`}
                        onClick={() => setActiveUnitIndex(idx)}
                      >
                        <td className="font-semibold text-gray-800">
                          {idx + 1}
                        </td>

                        <td className="text-gray-800">
                          {unit.name || `${idx + 1}-agregat`}
                        </td>

                        <td>
                          <span
                            className={
                              "px-2 py-[2px] rounded text-[12px] font-semibold " +
                              getStatusClass(unit.status)
                            }
                          >
                            {unit.status || "—"}
                          </span>
                        </td>

                        <td className="text-gray-700 whitespace-nowrap">
                          {unit.repair
                            ? moment(unit.repair).format("D MMM YYYY")
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap text-right">
                          <IconButton
                            iconType={"trash"}
                            value={unit}
                            onPress={Delete}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center text-gray-500 py-6 italic"
                      >
                        Ma'lumot topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* yangi agregat qo'shish tugmasi (ixtiyoriy) */}
            <div className="pt-4">
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg py-2">
                Yangi agregat qo'shish
              </button>
            </div>
          </div>

          {/* ==== O'NG USTUN ==== */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col text-black">
            <div className="text-base font-semibold italic text-gray-900 mb-3">
              Agregat haqida ma'lumot
            </div>
            <div className="border-t border-gray-200 mb-4" />

            {activeUnit ? (
              <div className="space-y-4 text-[14px] leading-relaxed">
                {/* agregat nomi va holat */}
                <div className="flex items-center justify-between">
                  <div className="font-semibold italic text-gray-800">
                    {activeUnit.name ||
                      `${activeUnitIndex + 1}-agregat`}
                  </div>

                  <div
                    className={
                      "px-3 py-[4px] rounded font-semibold text-[13px] " +
                      getStatusClass(activeUnit.status)
                    }
                  >
                    {activeUnit.status || "—"}
                  </div>
                </div>

                {/* detallar */}
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <div className="text-gray-600 font-semibold italic">
                    So'ngi ta'mir:
                  </div>
                  <div className="text-gray-800">
                    {activeUnit.repair
                      ? moment(activeUnit.repair).format(
                        "D MMM YYYY, HH:mm"
                      )
                      : "—"}
                  </div>

                  <div className="text-gray-600 font-semibold italic">
                    Quvvat:
                  </div>
                  <div className="text-gray-800">
                    {activeUnit.power || "—"}
                  </div>

                  <div className="text-gray-600 font-semibold italic">
                    Izoh:
                  </div>
                  <div className="text-gray-800">
                    {activeUnit.desc ||
                      activeUnit.description ||
                      "—"}
                  </div>
                </div>

                <button className="w-full bg-[#9b92c7] text-black font-semibold italic text-[14px] rounded-md py-2 hover:opacity-90">
                  Batafsil
                </button>
              </div>
            ) : (
              <div className="text-gray-500 italic text-center py-10 text-sm">
                Agregat tanlanmagan
              </div>
            )}
          </div>
        </div>
      </TitleCard>
    </>
  );
}

export default Transactions;
