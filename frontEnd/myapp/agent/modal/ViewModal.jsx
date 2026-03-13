import React from 'react'

const ViewModal = ({ close }) => {
    return (
        <div>

            <div className='absolute h-200 top-[20%]   w-200 border bg-amber-500 flex items-center justify-center'>

                <button onClick={close} className='border bg-amber-50'>close</button>this is the agent modal </div>
        </div>
    )
}

export default ViewModal
