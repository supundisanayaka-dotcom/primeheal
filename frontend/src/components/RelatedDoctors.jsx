import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({speciality,docID}) => {

    const {doctors} = useContext(AppContext)
    const navigate = useNavigate

    const [relDoc,setRelDocs] = useState([])

    useEffect(()=>{
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc)=>doc.speciality === speciality && doc._id !== docID)
            setRelDocs(doctorsData)
        }
    },[doctors,speciality,docID])

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900'>
      <h1 className='text-3xl font-medium'>Top Doctors to Book</h1>

      <p className='sm:w-1/3 text-center text-sm'>
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pt-5'>
        {relDoc.slice(0, 5).map((item) => (
          <div
            key={item._id}
            onClick={() => {navigate(`/appointment/${item._id}`); scrollto(0,0)}}
            className='border-teal-100 border rounded-xl overflow-hidden cursor-pointer
                       hover:translate-y-[-10px] transition-all duration-500'
          >
            <img
              src={item.image}
              alt={item.name}
              className='w-full h-64 object-cover bg-gradient-to-b from-primary to-[#E0F2F1]'
            />

            <div className='p-4'>
              <div className='flex items-center gap-2 text-sm text-green-500'>
                <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                <p>Available</p>
              </div>

              <p className='text-lg font-medium mt-2'>{item.name}</p>
              <p className='text-sm text-gray-600'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          navigate('/doctors')
          scrollTo(0, 0)
        }}
        className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10'
      >
        More
      </button>
    </div>
  )
}



export default RelatedDoctors