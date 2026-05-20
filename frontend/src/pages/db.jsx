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
          <div>
            <p className='dashboard-eyebrow'>Control Center</p>
            <h1>Welcome back, {user?.fullname?.split(' ')[0] || 'there'}</h1>
          </div>
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
            <div className='user-meta'>
              <div className='meta-tile'>
                <span>Account</span>
                <strong>Active</strong>
              </div>
              <div className='meta-tile'>
                <span>Role</span>
                <strong>{isAdmin ? 'Administrator' : 'Client'}</strong>
              </div>
            </div>
          </div>

          <div className='dashboard-cards'>
            <button className='dashboard-card' onClick={() => navigate('/book-session')}>
              <div className='card-icon'>VC</div>
              <h3>Book Video Call</h3>
              <p>Schedule a one-on-one video consultation session</p>
            </button>

            <button className='dashboard-card' onClick={() => navigate('/my-bookings')}>
              <div className='card-icon'>BK</div>
              <h3>My Bookings</h3>
              <p>View and manage your scheduled sessions</p>
            </button>

            {isAdmin && (
              <button className='dashboard-card dashboard-card-highlight' onClick={() => navigate('/admin')}>
                <div className='card-icon'>AD</div>
                <h3>Admin Panel</h3>
                <p>Manage users and video call bookings</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
