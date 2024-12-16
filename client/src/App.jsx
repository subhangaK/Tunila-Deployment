import React from 'react'
import { Routes, Route } from 'react-router-dom'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Login from './pages/login.jsx'
import Home from './pages/Home.jsx'
import UploadMusic from './pages/UploadMusic.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path ='/' element={<Home/>}/>
        <Route path ='/login' element={<Login/>}/>
        <Route path ='/email-verify' element={<EmailVerify/>}/>
        <Route path ='/reset-password' element={<ResetPassword/>}/>
        <Route path="/upload-music" element={<UploadMusic/>} />
      </Routes>

    </div>
  )
}

export default App