import React from 'react'
import '../style/Dashboard.css'
import { useStore } from '../zustnd/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Navbar } from '../components/Navbar'
import { apiClient } from '../lib/config'

function Dashboard() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout', {})
      setUser(null)
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logout failed')
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className='dashboard-page'>
      <Navbar />
      <div className='dashboard-container'>
        <div className='dashboard-header'>
          <h1>Welcome to Your Dashboard</h1>
          <button className='logout-btn' onClick={handleLogout}>Logout</button>
        </div>
        
        <div className='dashboard-content'>
          <div className='user-info-card'>
            <div className='user-avatar'>
              {user?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div className='user-details'>
              <h2>{user?.fullname}</h2>
              <p>{user?.email}</p>
              {isAdmin && <span className='role-badge'>Admin</span>}
            </div>
          </div>

          <div className='dashboard-cards'>
            <div className='brutalist-card' onClick={() => navigate('/book-session')}>
              <div className='card-icon'>📹</div>
              <h3>Book Video Call</h3>
              <p>Schedule a one-on-one video consultation session</p>
            </div>

            <div className='brutalist-card' onClick={() => navigate('/my-bookings')}>
              <div className='card-icon'>📅</div>
              <h3>My Bookings</h3>
              <p>View and manage your scheduled sessions</p>
            </div>

            {isAdmin && (
              <div className='brutalist-card-blue' onClick={() => navigate('/admin')}>
                <div className='card-icon'>⚙️</div>
                <h3>Admin Panel</h3>
                <p>Manage users and video call bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
