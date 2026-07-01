import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'

const Home = () => {
  return (
    <div>
      <Header />
      <div className="mx-4 sm:mx-[10%]">
        <SpecialityMenu />
        <TopDoctors />
        <Banner />
      </div>
    </div>
  )
}

export default Home
