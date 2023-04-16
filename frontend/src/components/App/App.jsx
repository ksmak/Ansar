// React, Router
import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"

// Components
import MainPage from "../pages/MainPage/MainPage"
import LoginPage from "../pages/LoginPage/LoginPage"


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App