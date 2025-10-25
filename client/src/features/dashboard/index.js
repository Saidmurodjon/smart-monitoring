import DashboardStats from './components/DashboardStats'
import AmountStats from './components/AmountStats'
import PageStats from './components/PageStats'


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


const statsData = [
    // {title : "Mavjud GES lar", value : "57", icon : <UserGroupIcon className='w-8 h-8'/>, description : "↗︎ 2300 (22%)"},
    // {title : "Ishlayotganlari", value : "50", icon : <CreditCardIcon className='w-8 h-8'/>, description : "Current month"},
    // {title : "Tamirlanmoqda", value : "7", icon : <CircleStackIcon className='w-8 h-8'/>, description : "50 in hot leads"},
    // {title : "Yangi qurilmoqda", value : "4", icon : <UsersIcon className='w-8 h-8'/>, description : "↙ 300 (18%)"},
    {
    title: "Mavjud GESlar",
    value: "57",
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



function Dashboard(){

    const dispatch = useDispatch()
 

    const updateDashboardPeriod = (newRange) => {
        // Dashboard range changed, write code to refresh your values
        dispatch(showNotification({message : `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status : 1}))
    }

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