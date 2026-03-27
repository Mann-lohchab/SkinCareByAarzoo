import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/db'
import Otp from './pages/otp'
import AdminPanel from './pages/AdminPanel'
import VideoCallBooking from './pages/VideoCallBooking'
import VideoCall from './pages/VideoCall'
import ChatPage from './pages/ChatPage'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useStore } from './zustnd/store'

function App() {
  const { user, setUser } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          'http://localhost:3000/api/auth/user',
          { withCredentials: true, headers: {
            "Cache-Control": "no-cache"
          }}
        )
        if (res.data.validate) {
          setUser(res.data.user)
        } else {
          setUser(null)
        }
        console.log("User data:", res.data)
      } catch (err) {
        console.log(err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [setUser])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={user ? <Navigate to="/dashboard"/> : <Login/>}/>
        <Route path='/signup' element={user ? <Navigate to="/dashboard"/> : <Signup/>} />
        <Route path='/dashboard' element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} />
        <Route path="/book-session" element={user ? <VideoCallBooking /> : <Navigate to="/login" />} />
        <Route path="/my-bookings" element={user ? <VideoCallBooking /> : <Navigate to="/login" />} />
        <Route path="/video-call" element={user ? <VideoCall /> : <Navigate to="/login" />} />
        <Route path="/chat/:memberEmail" element={user ? <ChatPage /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
