// src/features/dashboard/index.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DashboardStats from "./components/DashboardStats";
import AmountStats from "./components/AmountStats";
import PageStats from "./components/PageStats";
import LineChart from "./components/LineChart";
import BarChart from "./components/BarChart";
import DoughnutChart from "./components/DoughnutChart";
import UserChannels from "./components/UserChannels";
import UzbekistanMap from "../../components/UZMAP";

import {
  BuildingLibraryIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import { getSocket } from "../../utils/socket";
import { fetchGesList, addGes } from "../ges/gesSlice";

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



  const statsData = [
    {
      title: "Mavjud GESlar",
      value: String(total ?? 0),
      icon: <BuildingLibraryIcon className="w-6 h-6" />,
      description: "O‘zbekiston kesimida",
    },
    {
      title: "Ishlayotganlari",
      value: String(running ?? 0),
      icon: <BoltIcon className="w-6 h-6" />,
      description: "Faol holatda",
    },
    {
      title: "Ta’mirlanmoqda",
      value: String(maintenance ?? 0),
      icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
      description: "Texnik xizmat jarayonida",
    },
    {
      title: "Yangi qurilmoqda",
      value: String(building ?? 0),
      icon: <BuildingOffice2Icon className="w-6 h-6" />,
      description: "Qurilish bosqichida",
    },
  ];
// console.log(total);

  return (
    <>
      {/* Hero: full-bleed map filling the whole screen, with stats floating over it */}
      <div className="relative h-[calc(100%+1rem)] -mx-6 -mt-4">
        <UzbekistanMap />

        {/* Stat cards floating over the map, bottom-left corner, compact 2x2 grid */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 z-20 grid grid-cols-2 gap-2 sm:gap-3 w-56 sm:w-72">
          {statsData.map((d, k) => (
            <DashboardStats key={k} {...d} colorIndex={k} overlay />
          ))}
        </div>
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
