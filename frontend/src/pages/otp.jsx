import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../style/Login.css' // reuse login css for similar design
import pic from '../assets/pic.png'

function Otp() {
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(120) // 2 minutes in seconds
  const navigate = useNavigate()

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleVerify = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:3000/api/auth/otp', { otp }, { withCredentials: true })
      if (res.data.validate) {
        toast.success('Registration successful! Please login.')
        navigate('/login')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Error verifying OTP')
      console.log(err)
    }
  }

  const handleResend = async () => {
    if (timer > 0) {
      toast.error(`Please wait ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')} before resending.`)
      return
    }
    try {
      const res = await axios.post('http://localhost:3000/api/auth/resend-otp', {}, { withCredentials: true })
      if (res.data.validate) {
        toast.success('OTP resent successfully.')
        setTimer(120) // reset timer
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Error resending OTP')
      console.log(err)
    }
  }

  return (
    <div className='container'>
      <div className="content">
        <div className="login">
          <div className="header">Verify OTP</div>
          <form action="" className='forms' onSubmit={handleVerify}>
            <div className="input-group">
              <label htmlFor="otp">Enter OTP</label>
              <input type="text" id='otp' placeholder='Enter the OTP sent to your email' value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>

            <button type='submit' className='login-btn'>Verify</button>
            <div className="or">or</div>
            <button type='button' className='signup' onClick={handleResend} disabled={timer > 0}>
              {timer > 0 ? `Resend in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
            </button>
          </form>
        </div>
        <div className="pic"><img src={pic} alt="" srcSet="" className='pic'/></div>
      </div>
    </div>
  )
}

export default Otp
