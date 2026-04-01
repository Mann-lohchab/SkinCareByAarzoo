import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../style/Login.css'
import passwordIcon from '../assets/password.png'
import pic from '../assets/pic.png'
import { apiClient } from '../lib/config'

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
      const res = await apiClient.post('/auth/otp', { otp })
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
      const res = await apiClient.post('/auth/resend-otp', {})
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
    <div className='login-page'>
      <div className="login-layout">
        <div className="login-panel">
          <div className="login-card">
            <div className="login-kicker">SkinCareByAarzoo</div>
            <h1 className="login-title">Verify your code</h1>
            <p className="login-subtitle">
              Enter the 6-digit OTP sent to your email to complete account creation.
            </p>

            <form className='login-form' onSubmit={handleVerify}>
              <div className="login-field">
                <label htmlFor="otp">One-time password</label>
                <div className="login-input-wrap otp-input-wrap">
                  <img src={passwordIcon} alt="" aria-hidden="true" className="login-icon" />
                  <input
                    type="text"
                    id='otp'
                    inputMode='numeric'
                    autoComplete='one-time-code'
                    maxLength={6}
                    className='otp-input'
                    placeholder='Enter the 6-digit OTP'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              </div>

              <p className="otp-timer-text">
                {timer > 0
                  ? `You can request a new code in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
                  : 'Your code expired? Request a new OTP below.'}
              </p>

              <button type='submit' className='login-submit'>Verify OTP</button>

              <div className="login-divider">or</div>

              <button type='button' className='login-secondary' onClick={handleResend} disabled={timer > 0}>
                {timer > 0 ? `Resend in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
              </button>
            </form>
          </div>
        </div>

        <div className="login-visual">
          <img src={pic} alt="Skincare verification screen" />
          <div className="login-overlay">
            <h2>Secure signup, smooth handoff.</h2>
            <p>
              Finish verification to unlock bookings, consultations, and client access without friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Otp
