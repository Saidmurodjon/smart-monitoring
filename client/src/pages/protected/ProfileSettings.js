import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ProfileSettings from '../../features/settings/profilesettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Settings"}))
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])


    return(
        <ProfileSettings />
    )
}

export default InternalPage