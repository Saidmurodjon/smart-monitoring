import DashboardStats from './components/DashboardStats'
import AmountStats from './components/AmountStats'
import PageStats from './components/PageStats'
import React, { useEffect, useState } from "react";
import {getSocket } from "../../utils/socket";
import { setGesList } from "../../features/ges/gesSlice";
import { useSelector } from "react-redux";
import {
  BuildingLibraryIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline'
import UserChannels from './components/UserChannels'
import LineChart from './components/LineChart'
import BarChart from './components/BarChart'
import DashboardTopBar from './components/DashboardTopBar'
import { useDispatch } from 'react-redux'
import {showNotification} from '../common/headerSlice'
import DoughnutChart from './components/DoughnutChart'
import UzbekistanMap from '../../components/UZMAP'
import useFetch from '../../hooks/UseFetch';





function Dashboard(){
  const { total, running, maintenance, building } = useSelector(s => s.ges?.stats);
  console.log(total);
    const dispatch = useDispatch()
  // backenddan keladigan data (agregatlar ro'yxati)
  const { data: firstData, fetchData: fetchFirstData } = useFetch();
  const { fetchData: fetchSecondData } = useFetch();
  const statsData = [
    {
    title: "Mavjud GESlar",
    value: String(total),
    icon: <BuildingLibraryIcon className='w-8 h-8 text-blue-500' />,
    description: "O‘zbekiston kesimida",
  },
  {
    title: "Ishlayotganlari",
    value: "50",
    icon: <BoltIcon className='w-8 h-8 text-green-500' />,
    description: "Faol holatda",
  },
  {
    title: "Ta’mirlanmoqda",
    value: "7",
    icon: <WrenchScrewdriverIcon className='w-8 h-8 text-yellow-500' />,
    description: "Texnik xizmat jarayonida",
  },
  {
    title: "Yangi qurilmoqda",
    value: "4",
    icon: <BuildingOffice2Icon className='w-8 h-8 text-purple-500' />,
    description: "Qurilish bosqichida",
  },
]

 // web socket 
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
    });

    socket.on("reading:new", (data) => {
      console.log("📡 New reading:", data);
      setReadings((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("reading:new");
    };
  }, []);

    const updateDashboardPeriod = (newRange) => {
        // Dashboard range changed, write code to refresh your values
        dispatch(showNotification({message : `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status : 1}))
    }
  useEffect(() => {

      fetchFirstData("ges-list");


  }, []);

      // ✅ Yuklangan ma’lumot Redux store’ga yoziladi
  useEffect(() => {
    if (firstData && Array.isArray(firstData)) {
      dispatch(setGesList(firstData));
    } else if (firstData?.data && Array.isArray(firstData.data)) {
      dispatch(setGesList(firstData.data));
    }
  }, [firstData, dispatch]);

  // 📡 Real-time socket (yangi GES qo‘shilganda)
  useEffect(() => {
    socket.on("ges:new", (data) => {
      console.log("🆕 Yangi GES:", data);
      dispatch(addGes(data));
    });
    return () => socket.off("ges:new");
  }, [dispatch]);
    return(
        <>
        {/** ---------------------- Select Period Content ------------------------- */}
            <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod}/>
        
        {/** ---------------------- Different stats content 1 ------------------------- */}
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {
                    statsData.map((d, k) => {
                        return (
                            <DashboardStats key={k} {...d} colorIndex={k}/>
                        )
                    })
                }
            </div>

<dir>
    <UzbekistanMap/>
</dir>

        {/** ---------------------- Different charts ------------------------- */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <LineChart />
                <BarChart />
            </div>
            
        {/** ---------------------- Different stats content 2 ------------------------- */}
        
            <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
                <AmountStats />
                <PageStats />
            </div>

        {/** ---------------------- User source channels table  ------------------------- */}
        
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <UserChannels />
                <DoughnutChart />
            </div>
        </>
    )
}

export default Dashboard