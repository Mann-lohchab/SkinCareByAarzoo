import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../style/Signup.css'
import gmailIcon from '../assets/gmail.png'
import passwordIcon from '../assets/password.png'
import pic from '../assets/pic.png'
import profileIcon from '../assets/profile.png'
import { apiClient } from '../lib/config'

function Signup() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    // profilepic: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await apiClient.post('/auth/register', formData)
      if (res.data.validate) {
        toast.success(res.data.message || 'OTP sent to your email.')
        navigate('/otp')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Error during registration')
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='signup-page'>
      <div className="signup-layout">
        <div className="signup-visual">
          <img src={pic} alt="Skincare consultation workspace" />
          <div className="signup-overlay">
            <div className="signup-badge">New client access</div>
            <h2>Start with a clean, premium onboarding flow.</h2>
            <p>
              Create your account to book sessions, manage consultations, and keep your skincare journey organized from day one.
            </p>
          </div>
        </div>

        <div className="signup-panel">
          <div className="signup-card">
            <div className="signup-kicker">SkinCareByAarzoo</div>
            <h1 className="signup-title">Create account</h1>
            <p className="signup-subtitle">
              Set up your profile to access bookings, follow-ups, and personalized care.
            </p>

            <form className='signup-form-fields' onSubmit={handleSubmit}>
              <div className="signup-field">
                <label htmlFor="fullname">Full name</label>
                <div className="signup-input-wrap">
                  <img src={profileIcon} alt="" aria-hidden="true" className="signup-icon" />
                  <input
                    type="text"
                    id='fullname'
                    name='fullname'
                    placeholder='Enter your full name'
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="email">Email address</label>
                <div className="signup-input-wrap">
                  <img src={gmailIcon} alt="" aria-hidden="true" className="signup-icon" />
                  <input
                    type="email"
                    id='email'
                    name='email'
                    placeholder='Enter your email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="password">Password</label>
                <div className="signup-input-wrap">
                  <img src={passwordIcon} alt="" aria-hidden="true" className="signup-icon" />
                  <input
                    type="password"
                    id='password'
                    name='password'
                    placeholder='Create a password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* <div className="signup-field">
                <label htmlFor="profilepic">Profile picture URL</label>
                <div className="signup-input-wrap">
                  <img src={profileIcon} alt="" aria-hidden="true" className="signup-icon" />
                  <input
                    type="text"
                    id='profilepic'
                    name='profilepic'
                    placeholder='Paste your profile image URL'
                    value={formData.profilepic}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>*/}

              <button type='submit' className='signup-submit' disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Create account'}
              </button>

              <div className="signup-divider">or</div>

              <button type='button' className='signup-secondary' onClick={() => navigate('/login')}>
                Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
