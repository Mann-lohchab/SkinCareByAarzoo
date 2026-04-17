import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../style/Login.css'
import gmailIcon from '../assets/gmail.png'
import passwordIcon from '../assets/password.png'
import pic from '../assets/pic.png'
import { useStore } from '../zustnd/store'
import { apiClient } from '../lib/config'

function Login() {
  const { setUser } = useStore()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
      const res = await apiClient.post('/auth/login', formData)

      // Check if login was successful
      if (res.status === 200 && (res.data?.validate === true || res.data?.message?.includes('success'))) {
        // Fetch user data
        const userRes = await apiClient.get('/auth/user')
        if (userRes.data?.validate) {
          console.log('Fetched user data:', userRes.data.user)
          setUser(userRes.data.user)
        }
        toast.success('Logged in successfully!')
        navigate('/dashboard')
      } else {
        // Login failed - show error message
        const errorMsg = res.data?.message || 'Login failed'
        toast.error(errorMsg)
      }
    } catch (err) {
      console.log('Login error:', err)
      // Handle error response
      if (err.response?.data) {
        // If response is JSON
        if (typeof err.response.data === 'object') {
          toast.error(err.response.data.message || 'Login failed')
        } else {
          // Plain text response
          toast.error(err.response.data || 'Login failed')
        }
      } else if (err.request) {
        toast.error('Network error - server not responding')
      } else {
        toast.error('Login failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='login-page'>
      <div className="login-layout">
        <div className="login-panel">
          <div className="login-card">
            <a href="/" className="login-kicker">SkinCareByAarzoo</a>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">
              Sign in to manage your appointments, dashboard access, and skincare consultations in one place.
            </p>

            <form className='login-form' onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="username">Email address</label>
                <div className="login-input-wrap">
                  <img src={gmailIcon} alt="" aria-hidden="true" className="login-icon" />
                  <input
                    type="email"
                    id='username'
                    name='username'
                    placeholder='Enter your email'
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-input-wrap">
                  <img src={passwordIcon} alt="" aria-hidden="true" className="login-icon" />
                  <input
                    type="password"
                    id='password'
                    name='password'
                    placeholder='Enter your password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* <div className="login-row">
                <button type="button" className="login-forgot">Forgot password?</button>
              </div> */}

              <button type='submit' className='login-submit' disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              <div className="login-divider">or</div>

              <button type='button' className='login-secondary' onClick={() => navigate('/signup')}>
                Create an account
              </button>
            </form>
          </div>
        </div>

        <div className="login-visual">
          <img src={pic} alt="Skincare wellness" />
          <div className="login-overlay">
            <h2>Professional care, calm experience.</h2>
            <p>
              Access your sessions, track bookings, and stay connected with a platform designed for a premium client experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
