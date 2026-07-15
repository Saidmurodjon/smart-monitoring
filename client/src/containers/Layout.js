import Header from "./Header"
import PageContent from "./PageContent"
import LeftSidebar from "./LeftSidebar"
import { useSelector, useDispatch } from 'react-redux'
import RightSidebar from './RightSidebar'
import { useEffect } from "react"
import  {  removeNotificationMessage } from "../features/common/headerSlice"
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ModalLayout from "./ModalLayout"

function Layout(){
  const dispatch = useDispatch()
  const {newNotificationMessage, newNotificationStatus} = useSelector(state => state.header)


  useEffect(() => {
      if(newNotificationMessage !== ""){
          if(newNotificationStatus === 1)NotificationManager.success(newNotificationMessage, 'Success')
          if(newNotificationStatus === 0)NotificationManager.error( newNotificationMessage, 'Error')
          dispatch(removeNotificationMessage())
      }
        // eslint-disable-next-line
  }, [newNotificationMessage])

    return(
      <>
        { /* Navbar - full width, fixed, always visible (h-16 / min-height:4rem) */ }
        <Header/>

        { /* Left drawer - overlay+toggle on mobile, permanent rail on desktop (drawer-mobile, daisyui@2).
             pt-16 offsets the fixed navbar's height so content starts below it, not under it. */ }
        <div className="drawer drawer-mobile pt-16">
            <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" defaultChecked />
            <PageContent/>
            <LeftSidebar />
        </div>

        { /* Right drawer - containing secondary content like notifications list etc.. */ }
        <RightSidebar />


        {/** Notification layout container */}
        <NotificationContainer />

      {/* Modal layout container */}
        <ModalLayout />

      </>
    )
}

export default Layout