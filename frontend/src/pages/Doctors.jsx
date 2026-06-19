import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Doctors = () => {

  const { speciality } = useParams()
  const navigate = useNavigate()

  const { doctors } = useContext(AppContext)

  const [filterDoc, setFilterDoc] = useState([])
  const [showFilter, setShowFilter] = useState(false) // ✅ fixed

  // Apply filter
  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(
        doctors.filter(doc => doc.speciality === speciality)
      )
    } else {
      setFilterDoc(doctors)
    }
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  // Handle navigation + close filter (for mobile)
  const handleFilterClick = (value) => {
    if (speciality === value) {
      navigate('/doctors')
    } else {
      navigate(`/doctors/${value}`)
    }
    setShowFilter(false) // ✅ auto close on mobile
  }

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>

      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">

        {/* Mobile Filter Button */}
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden 
          ${showFilter ? 'bg-blue-500 text-white' : ''}`}
          onClick={() => setShowFilter(prev => !prev)}
        >
          Filters
        </button>

        {/* -------- Left Side (Filters) -------- */}
        <div className={`${showFilter ? 'flex' : 'hidden'} sm:flex flex-col gap-4 text-sm text-gray-600`}>

          <p onClick={() => handleFilterClick('General physician')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "General physician" ? "bg-indigo-100 text-black" : ""}`}>
            General physician
          </p>

          <p onClick={() => handleFilterClick('Gynecologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "Gynecologist" ? "bg-indigo-100 text-black" : ""}`}>
            Gynecologist
          </p>

          <p onClick={() => handleFilterClick('Dermatologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "Dermatologist" ? "bg-indigo-100 text-black" : ""}`}>
            Dermatologist
          </p>

          <p onClick={() => handleFilterClick('Pediatricians')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "Pediatricians" ? "bg-indigo-100 text-black" : ""}`}>
            Pediatricians
          </p>

          <p onClick={() => handleFilterClick('Neurologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "Neurologist" ? "bg-indigo-100 text-black" : ""}`}>
            Neurologist
          </p>

          <p onClick={() => handleFilterClick('Gastroenterologist')}
            className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer
            ${speciality === "Gastroenterologist" ? "bg-indigo-100 text-black" : ""}`}>
            Gastroenterologist
          </p>

        </div>

        {/* -------- Right Side (Doctors List) -------- */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
          {
            filterDoc.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/appointment/${item._id}`)}
                className="border border-teal-100 rounded-xl overflow-hidden cursor-pointer
                hover:translate-y-[-10px] transition-all duration-500"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover bg-gradient-to-b from-primary to-[#E0F2F1]"
                />

                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p>Available</p>
                  </div>

                  <p className="text-lg font-medium mt-2">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.speciality}</p>
                </div>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  )
}

export default Doctors