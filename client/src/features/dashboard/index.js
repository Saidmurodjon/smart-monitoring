// src/features/dashboard/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DashboardTopBar from "./components/DashboardTopBar";
import DashboardStats from "./components/DashboardStats";
import AmountStats from "./components/AmountStats";
import PageStats from "./components/PageStats";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import DoughnutChart from "./components/DoughnutChart";
import UserChannels from "./components/UserChannels";
import UzbekistanMap from "../../components/UZMAP";

import { BuildingLibraryIcon, BoltIcon, WrenchScrewdriverIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

import { getSocket } from "../../utils/socket";
import { fetchGesList, addGes } from "../ges/gesSlice";
import { showNotification } from "../common/headerSlice";

function Dashboard() {
  const dispatch = useDispatch();

  // Redux stats (doimiy yangilanadi)
  const { total, running, maintenance, building } = useSelector((s) => s.ges?.stats || {});

  // Soket instance (singleton)
  const socket = useMemo(() => getSocket(), []);

  // Demo: “reading:new” oqimidan kelayotgan ma’lumotlar
  const [readings, setReadings] = useState([]);

  // 1) Dastlabki ma’lumotni olish (fetch)
  useEffect(() => {
    dispatch(fetchGesList()); // kerak bo‘lsa { region } bilan chaqiring
  }, [dispatch]);

  // // 2) Soket: reading:new — faqat UI ko‘rsatish uchun
  // useEffect(() => {
  //   const onConnect = () => console.log("✅ Socket connected");
  //   const onReadingNew = (data) => {
  //     console.log("📡 reading:new", data);
  //     setReadings((prev) => [data, ...prev]);
  //   };

  //   socket.on("connect", onConnect);
  //   socket.on("reading:new", onReadingNew);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("reading:new", onReadingNew);
  //   };
  // }, [socket]);

  // // 3) Soket: ges:new — real vaqt rejimida GES qo‘shilishi
  // useEffect(() => {
  //   const onGesNew = (doc) => {
  //     console.log("🆕 ges:new", doc);
  //     dispatch(addGes(doc)); // upsert sifatida qo‘shiladi
  //   };

  //   socket.on("ges:new", onGesNew);
  //   return () => socket.off("ges:new", onGesNew);
  // }, [dispatch, socket]);

  // Top bar range o‘zgarsa
  const updateDashboardPeriod = (newRange) => {
    dispatch(
      showNotification({
        message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`,
        status: 1,
      })
    );
    // kerak bo‘lsa shu yerda qayta fetch qilishingiz mumkin
    // dispatch(fetchGesList({ start: newRange.startDate, end: newRange.endDate }))
  };

  const statsData = [
    {
      title: "Mavjud GESlar",
      value: String(total ?? 0),
      icon: <BuildingLibraryIcon className="w-8 h-8" />,
      description: "O‘zbekiston kesimida",
    },
    {
      title: "Ishlayotganlari",
      value: String(running ?? 0),
      icon: <BoltIcon className="w-8 h-8" />,
      description: "Faol holatda",
    },
    {
      title: "Ta’mirlanmoqda",
      value: String(maintenance ?? 0),
      icon: <WrenchScrewdriverIcon className="w-8 h-8" />,
      description: "Texnik xizmat jarayonida",
    },
    {
      title: "Yangi qurilmoqda",
      value: String(building ?? 0),
      icon: <BuildingOffice2Icon className="w-8 h-8" />,
      description: "Qurilish bosqichida",
    },
  ];
console.log(total);

  return (
    <>
      {/* Select period */}
      <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />

      {/* Stats row */}
      <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
        {statsData.map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
      </div>

      {/* Map */}
      <div className="mt-4">
        <UzbekistanMap />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <LineChart />
        <BarChart />
      </div>

      {/* More stats */}
      <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
        <AmountStats />
        <PageStats />
      </div>

      {/* User channels + doughnut */}
      <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
        <UserChannels />
        <DoughnutChart />
      </div>
    </>
  );
}

export default Dashboard;
