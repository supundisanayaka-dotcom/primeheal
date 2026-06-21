import React, { useState, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()

  const [showMenu, setShowMenu] = useState(false)
  const { token, setToken } = useContext(AppContext)

  return (
    <div className='flex items-center justify-between text-sm py-3.5 px-6 mb-8 border border-white/30 bg-white/75 backdrop-blur-md sticky top-4 z-50 rounded-2xl shadow-[0_8px_32px_0_rgba(0,167,167,0.06)] transition-all duration-300'>

      {/* -------- Logo -------- */}
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className='w-32 cursor-pointer'
      />

      {/* -------- Desktop Menu -------- */}
      <ul className='hidden md:flex items-center gap-6'>
        <NavLink to='/' className='hover:text-blue-600'>
          <li>HOME</li>
        </NavLink>
        <NavLink to='/doctors' className='hover:text-blue-600'>
          <li>ALL DOCTORS</li>
        </NavLink>
        <NavLink to='/about' className='hover:text-blue-600'>
          <li>ABOUT</li>
        </NavLink>
        <NavLink to='/contact' className='hover:text-blue-600'>
          <li>CONTACT</li>
        </NavLink>
      </ul>

      {/* -------- Right Side -------- */}
      <div className='flex items-center gap-4'>

        {token ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img className='w-8 rounded-full' src={assets.profile_pic} alt="Profile" />
            <img className='w-2.5' src={assets.dropdown_icon} alt="Dropdown" />

            {/* Dropdown */}
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4'>
                <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>
                  My Profile
                </p>
                <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>
                  My Appointments
                </p>
                <p onClick={() => setToken(false)} className='hover:text-black cursor-pointer'>
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-[#FF9F68] text-white px-4 py-2 rounded-md hover:bg-[#E08550]'
          >
            Create account
          </button>
        )}

        {/* -------- Mobile Menu Icon -------- */}
        <img
          onClick={() => setShowMenu(true)}
          className='w-6 md:hidden cursor-pointer'
          src={assets.menu_icon}
          alt="menu"
        />
      </div>

      {/* -------- Mobile Menu -------- */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] bg-white z-20 transform transition-transform duration-300 md:hidden 
        ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-6 border-b'>
          <img className='w-32' src={assets.logo} alt="logo" />
          <img
            className='w-7 cursor-pointer'
            onClick={() => setShowMenu(false)}
            src={assets.cross_icon}
            alt="close"
          />
        </div>

        {/* Menu Items */}
        <ul className='flex flex-col items-start gap-4 mt-5 px-5 text-lg font-medium'>
          <NavLink onClick={() => setShowMenu(false)} to='/'>
            <p className='px-4 py-2 rounded hover:bg-gray-100 w-full'>HOME</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
            <p className='px-4 py-2 rounded hover:bg-gray-100 w-full'>ALL DOCTORS</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/about'>
            <p className='px-4 py-2 rounded hover:bg-gray-100 w-full'>ABOUT</p>
          </NavLink>
          <NavLink onClick={() => setShowMenu(false)} to='/contact'>
            <p className='px-4 py-2 rounded hover:bg-gray-100 w-full'>CONTACT</p>
          </NavLink>
        </ul>
      </div>

      {/* -------- Overlay (optional but nice UX) -------- */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className='fixed inset-0 bg-black opacity-30 z-10 md:hidden'
        />
      )}

    </div>
  )
}

export default Navbar