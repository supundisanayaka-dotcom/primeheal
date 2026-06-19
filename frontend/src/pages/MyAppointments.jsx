import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'

const MyAppointments = () => {

  const { doctors } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const storedApts = localStorage.getItem('appointments')
    if (storedApts) {
      setAppointments(JSON.parse(storedApts))
    } else {
      // If none exist, let's load default placeholders from doctors.slice(0, 3)
      const defaultApts = doctors.slice(0, 3).map((doc, idx) => ({
        _id: `default_${idx}`,
        docId: doc._id,
        docName: doc.name,
        docImage: doc.image,
        docSpeciality: doc.speciality,
        docAddress: doc.address,
        slotDate: '25, July, 2024',
        slotTime: '8:30 PM',
        status: 'Pending',
        fees: doc.fees,
        isDefault: true
      }))
      localStorage.setItem('appointments', JSON.stringify(defaultApts))
      setAppointments(defaultApts)
    }
  }, [doctors])

  const cancelAppointment = (aptId) => {
    const updated = appointments.map(apt => 
      apt._id === aptId ? { ...apt, status: 'Cancelled' } : apt
    )
    setAppointments(updated)
    localStorage.setItem('appointments', JSON.stringify(updated))
  }

  return (
    <div>
        <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>

        <div>
        {appointments.map((item, index) => (
          <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b border-gray-100' key={item._id || index}>
            
            <div>
              <img className='w-32 bg-indigo-50 rounded-lg object-cover' src={item.docImage || item.image} alt={item.docName || item.name} />
            </div>

              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold text-base'>{item.docName || item.name}</p>
                <p className='text-xs text-gray-500'>{item.docSpeciality || item.speciality}</p>
                <p className='text-zinc-700 font-medium mt-2'>Address:</p>
                <p className='text-xs'>{(item.docAddress || item.address)?.line1}</p>
                <p className='text-xs'>{(item.docAddress || item.address)?.line2}</p>
                <p className='text-xs mt-2'>
                  <span className='text-xs text-neutral-700 font-semibold'>Date & Time:</span> {item.slotDate} | {item.slotTime}
                </p>
                
                {/* Dynamic Patient Details */}
                {!item.isDefault && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-0.5 border border-gray-100">
                    <p><span className="font-semibold text-gray-700">Patient:</span> {item.patientName} ({item.patientNo})</p>
                    <p><span className="font-semibold text-gray-700">NIC:</span> {item.patientNic} | <span className="font-semibold text-gray-700">Phone:</span> {item.patientPhone}</p>
                    <p><span className="font-semibold text-gray-700">Email:</span> {item.patientEmail} | <span className="font-semibold text-gray-700">Address:</span> {item.patientAddress}</p>
                    <p><span className="font-semibold text-gray-700">No Show Refund:</span> {item.noShowRefund ? <span className="text-teal-600 font-semibold">Yes (Surcharge: 275 LKR)</span> : 'No'}</p>
                    <p><span className="font-semibold text-gray-700">Total Charged:</span> <span className="font-bold text-gray-800">${item.fees}{item.noShowRefund && " + 275 LKR"}</span></p>
                  </div>
                )}
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                {item.status === 'Cancelled' ? (
                  <button disabled className='text-sm text-red-500 text-center sm:min-w-48 py-2 border border-red-200 bg-red-50 rounded font-medium select-none'>
                    Cancelled
                  </button>
                ) : (
                  <>
                    <button className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300 rounded'>
                      Pay Online
                    </button>
                    <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-[#FF9F68] hover:text-white transition-all duration-300 rounded'>
                      Cancel appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}

export default MyAppointments