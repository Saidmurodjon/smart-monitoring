import { useEffect } from 'react'
import { PUPIL_MODAL_BODY_TYPES } from '../utils/globalConstantUtil'
import { useSelector, useDispatch } from 'react-redux'
import { closeModal } from '../features/common/modalSlice'
import AddPupilModalBody from '../features/pupils/components/AddPupilModalBody'
import ConfirmationModalBody from '../features/common/components/ConfirmationModalBody'


function PupilModalLayout(){


    const {isOpen, bodyType, size, extraObject, title} = useSelector(state => state.modal)
    const dispatch = useDispatch()
console.log(extraObject);
    const close = (e) => {
        dispatch(closeModal(e))
    }



    return(
        <>
        {/* The button to open modal */}

            {/* Put this part before </body> tag */}
            <div className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className={`modal-box  ${size === 'lg' ? 'max-w-5xl' : ''}`}>
                <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => close()}>✕</button>
                <h3 className="font-semibold text-2xl pb-6 text-center">{title}</h3>


                {/* Loading modal body according to different modal type */}
                {
                    {
                             [PUPIL_MODAL_BODY_TYPES.PUPIL_ADD_NEW] : <AddPupilModalBody closeModal={close} extraObject={extraObject}/>,
                             [PUPIL_MODAL_BODY_TYPES.CONFIRMATION] : <ConfirmationModalBody extraObject={extraObject} closeModal={close}/>,
                             [PUPIL_MODAL_BODY_TYPES.DEFAULT] : <div></div>
                    }[bodyType]
                }
            </div>
            </div>
            </>
    )
}

export default PupilModalLayout