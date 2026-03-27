import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../style/Dashboard.css'
import { useStore } from '../zustnd/store'
import { Navbar } from '../components/Navbar'
import { connectRealtime } from '../lib/realtime'

function AdminPanel() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'bookings') {
        const res = await axios.get('http://localhost:3000/api/auth/video-call/all-bookings', { withCredentials: true })
        if (res.data.validate) {
          setBookings(res.data.bookings)
        }
      } else if (activeTab === 'users') {
        const res = await axios.get('http://localhost:3000/api/auth/admin/users', { withCredentials: true })
        if (res.data.validate) {
          setUsers(res.data.users)
        }
      }
    } catch (err) {
      toast.error('Error fetching data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [activeTab])

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return undefined
    }

    const socket = connectRealtime({
      onMessage: (event) => {
        if (
          event.type === 'booking.created' ||
          event.type === 'booking.updated' ||
          event.type === 'booking.deleted'
        ) {
          if (activeTab === 'bookings') {
            fetchData()
          }
        }

        if (event.type === 'admin.user_role_updated' && activeTab === 'users') {
          fetchData()
        }
      },
    })

    return () => {
      socket.close()
    }
  }, [user, activeTab])

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
      setUser(null)
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logout failed')
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await axios.put('http://localhost:3000/api/auth/video-call/update-status', 
        { bookingId, status },
        { withCredentials: true }
      )
      if (res.data.validate) {
        toast.success('Booking status updated')
        if (res.data.videoCallUrl) {
          toast.info(`Video call link: ${res.data.videoCallUrl}`)
        }
        fetchData()
      }
    } catch (err) {
      toast.error('Error updating booking')
    }
  }

  const updateUserRole = async (email, role) => {
    try {
      const res = await axios.put('http://localhost:3000/api/auth/admin/update-role',
        { email, role },
        { withCredentials: true }
      )
      if (res.data.validate) {
        toast.success('User role updated')
        fetchData()
      }
    } catch (err) {
      toast.error('Error updating user role')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4caf50'
      case 'pending': return '#ff9800'
      case 'cancelled': return '#f44336'
      case 'completed': return '#2196f3'
      default: return '#9e9e9e'
    }
  }

  return (
    <>
      <Navbar />
      <div className='admin-container'>
        <div className='admin-header'>
          <h2>{activeTab === 'bookings' ? 'Video Call Bookings' : 'Manage Users'}</h2>
          <div className='admin-info'>
            <span>Welcome, {user?.fullname}</span>
            <button className='back-btn-admin' onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className='logout-btn-admin' onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className='admin-nav-tabs'>
          <button 
            className={`nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Video Call Bookings
          </button>
          <button 
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </div>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : activeTab === 'bookings' ? (
          <div className='brutalist-table'>
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Session Type</th>
                  <th>Scheduled Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center'}}>No bookings found</td>
                  </tr>
                ) : bookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td>{booking.booking_id}</td>
                    <td>
                      <div className='user-cell'>
                        <strong>{booking.user_name}</strong>
                        <span>{booking.user_email}</span>
                      </div>
                    </td>
                    <td>{booking.session_type}</td>
                    <td>{formatDate(booking.scheduled_time)}</td>
                    <td>{booking.duration} min</td>
                    <td>
                      <span 
                        className='status-badge'
                        style={{backgroundColor: getStatusColor(booking.status), border: '2px solid black'}}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && booking.stream_session_id ? (
                        <button 
                          onClick={() => navigate(`/video-call?callId=${booking.stream_session_id}`)}
                          style={{
                            display: 'inline-block',
                            padding: '8px 12px',
                            background: '#4caf50',
                            color: 'white',
                            border: '2px solid black',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          🎥 Join Video Call
                        </button>
                      ) : (
                        <div className='action-buttons'>
                          {booking.status === 'pending' && (
                            <>
                              <button 
                                className='btn-confirm'
                                onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                              >
                                Confirm
                              </button>
                              <button 
                                className='btn-cancel'
                                onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button 
                              className='btn-complete'
                              onClick={() => updateBookingStatus(booking.booking_id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='brutalist-table'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center'}}>No users found</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullname}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`} style={{border: '2px solid black'}}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.created_at ? formatDate(u.created_at) : 'N/A'}</td>
                    <td>
                      <div className='action-buttons'>
                        {u.role !== 'admin' ? (
                          <button 
                            className='btn-promote'
                            onClick={() => updateUserRole(u.email, 'admin')}
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button 
                            className='btn-demote'
                            onClick={() => updateUserRole(u.email, 'user')}
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-container {
          min-height: 100vh;
          background-color: #F5F7FF;
          padding: 20px;
          font-family: 'Roboto Mono', 'Courier New', monospace;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding: 20px;
        }
        
        .admin-header h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #0A0A0A;
          letter-spacing: -0.03em;
        }
        
        .admin-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .back-btn-admin {
          padding: 10px 20px;
          background: #1E3A8A;
          color: white;
          border: 3px solid black;
          box-shadow: 4px 4px 0px black;
          cursor: pointer;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
        }

        .back-btn-admin:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }
        
        .logout-btn-admin {
          padding: 10px 20px;
          background: #f44336;
          color: white;
          border: 3px solid black;
          box-shadow: 4px 4px 0px black;
          cursor: pointer;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
        }
        
        .logout-btn-admin:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }
        
        .admin-nav-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .nav-tab {
          padding: 15px 30px;
          background: white;
          border: 3px solid black;
          box-shadow: 4px 4px 0px black;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
          font-family: 'Roboto Mono', monospace;
          transition: all 0.15s ease;
        }
        
        .nav-tab:hover, .nav-tab.active {
          background: #2563EB;
          color: white;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }
        
        .brutalist-table {
          background: white;
          border: 3px solid black;
          box-shadow: 6px 6px 0px black;
          overflow: hidden;
          max-width: 1280px;
          margin: 0 auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #1E3A8A;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 700;
          border-bottom: 3px solid black;
        }
        
        td {
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        .user-cell {
          display: flex;
          flex-direction: column;
        }
        
        .user-cell span {
          font-size: 12px;
          color: #666;
        }
        
        .status-badge {
          padding: 5px 12px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }
        
        .role-badge {
          padding: 5px 12px;
          font-size: 12px;
          text-transform: capitalize;
          font-weight: 700;
        }
        
        .role-badge.admin {
          background: #4caf50;
          color: white;
        }
        
        .role-badge.user {
          background: #9e9e9e;
          color: white;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-confirm, .btn-promote {
          background: #4caf50;
          color: white;
          border: 2px solid black;
          padding: 6px 12px;
          border-radius: 0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
        }
        
        .btn-cancel, .btn-demote {
          background: #f44336;
          color: white;
          border: 2px solid black;
          padding: 6px 12px;
          border-radius: 0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
        }
        
        .btn-complete {
          background: #2196f3;
          color: white;
          border: 2px solid black;
          padding: 6px 12px;
          border-radius: 0;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
        }
        
        .loading {
          text-align: center;
          color: #0A0A0A;
          font-size: 18px;
          padding: 50px;
          font-weight: 700;
        }
      `}</style>
    </>
  )
}

export default AdminPanel
