import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Team from '../../features/settings/team'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Team Members"}))
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])


    return(
        <Team/>
    )
}

export default InternalPage