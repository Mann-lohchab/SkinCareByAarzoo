import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../style/Dashboard.css'
import { useStore } from '../zustnd/store'
import { Navbar } from '../components/Navbar'
import { connectRealtime } from '../lib/realtime'
import { apiClient } from '../lib/config'

function AdminPanel() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const bookingStats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
  }), [bookings])

  const userStats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    members: users.filter((u) => u.role !== 'admin').length,
  }), [users])

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
        const res = await apiClient.get('/auth/video-call/all-bookings')
        if (res.data.validate) {
          setBookings(res.data.bookings)
        }
      } else if (activeTab === 'users') {
        const res = await apiClient.get('/auth/admin/users')
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
      await apiClient.post('/auth/logout', {})
      setUser(null)
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Logout failed')
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await apiClient.put('/auth/video-call/update-status', { bookingId, status })
      if (res.data.validate) {
        toast.success('Booking status updated')
        if (res.data.videoCallUrl) {
          toast.info(`Video call link: ${res.data.videoCallUrl}`)
        }
        fetchData()
      }
    } catch {
      toast.error('Error updating booking')
    }
  }

  const updateUserRole = async (email, role) => {
    try {
      const res = await apiClient.put('/auth/admin/update-role', { email, role })
      if (res.data.validate) {
        toast.success('User role updated')
        fetchData()
      }
    } catch {
      toast.error('Error updating user role')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#16a34a'
      case 'pending': return '#d97706'
      case 'cancelled': return '#dc2626'
      case 'completed': return '#2563eb'
      default: return '#64748b'
    }
  }

  return (
    <>
      <Navbar />
      <div className='admin-container'>
        <div className='admin-header'>
          <div>
            <span className='admin-eyebrow'>Admin workspace</span>
            <h2>{activeTab === 'bookings' ? 'Video Call Bookings' : 'Manage Users'}</h2>
          </div>
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

        <div className='admin-summary-grid'>
          {activeTab === 'bookings' ? (
            <>
              <div className='admin-summary-card'>
                <span>Total bookings</span>
                <strong>{bookingStats.total}</strong>
              </div>
              <div className='admin-summary-card'>
                <span>Pending review</span>
                <strong>{bookingStats.pending}</strong>
              </div>
              <div className='admin-summary-card'>
                <span>Confirmed</span>
                <strong>{bookingStats.confirmed}</strong>
              </div>
              <div className='admin-summary-card'>
                <span>Completed</span>
                <strong>{bookingStats.completed}</strong>
              </div>
            </>
          ) : (
            <>
              <div className='admin-summary-card'>
                <span>Total users</span>
                <strong>{userStats.total}</strong>
              </div>
              <div className='admin-summary-card'>
                <span>Admins</span>
                <strong>{userStats.admins}</strong>
              </div>
              <div className='admin-summary-card'>
                <span>Members</span>
                <strong>{userStats.members}</strong>
              </div>
            </>
          )}
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
                        style={{backgroundColor: getStatusColor(booking.status)}}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {booking.status === 'confirmed' && booking.stream_session_id ? (
                        <button 
                          onClick={() => navigate(`/video-call?callId=${booking.stream_session_id}`)}
                          className='btn-join-admin'
                        >
                          Join Video Call
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
                      <span className={`role-badge ${u.role}`}>
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
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 32rem),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
          padding: 132px 20px 48px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding: 0;
        }

        .admin-eyebrow {
          display: inline-flex;
          margin-bottom: 8px;
          color: #2563eb;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        
        .admin-header h2 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0;
          line-height: 1.05;
        }
        
        .admin-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
          color: #475569;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .back-btn-admin,
        .logout-btn-admin,
        .nav-tab,
        .btn-confirm,
        .btn-promote,
        .btn-cancel,
        .btn-demote,
        .btn-complete,
        .btn-join-admin {
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
        }

        .back-btn-admin, .logout-btn-admin {
          padding: 10px 16px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
        }

        .back-btn-admin {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.34);
        }
        
        .logout-btn-admin {
          background: #dc2626;
          color: white;
        }
        
        .back-btn-admin:hover,
        .logout-btn-admin:hover,
        .nav-tab:hover,
        .btn-confirm:hover,
        .btn-promote:hover,
        .btn-cancel:hover,
        .btn-demote:hover,
        .btn-complete:hover,
        .btn-join-admin:hover {
          transform: translateY(-1px);
        }
        
        .admin-nav-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding: 6px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 16px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          width: fit-content;
        }
        
        .nav-tab {
          padding: 12px 18px;
          background: transparent;
          color: #475569;
          font-size: 14px;
        }
        
        .nav-tab.active {
          background: #2563eb;
          color: white;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.28);
        }

        .admin-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          max-width: 1280px;
          margin: 0 auto 18px;
        }

        .admin-summary-card {
          padding: 18px;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 18px;
          box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
        }

        .admin-summary-card span {
          display: block;
          color: #64748b;
          font-size: 0.83rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .admin-summary-card strong {
          display: block;
          color: #0f172a;
          font-size: 2rem;
          line-height: 1;
        }
        
        .brutalist-table {
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.28);
          border-radius: 20px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.1);
          overflow: auto;
          max-width: 1280px;
          margin: 0 auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          background: #f8fafc;
          color: #475569;
          padding: 14px 16px;
          text-align: left;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }
        
        td {
          padding: 16px;
          border-bottom: 1px solid #edf2f7;
          color: #1e293b;
          vertical-align: middle;
        }

        tbody tr:hover {
          background: #f8fafc;
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
          color: #64748b;
        }
        
        .status-badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }
        
        .role-badge {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          text-transform: capitalize;
          font-weight: 700;
        }
        
        .role-badge.admin {
          background: #dcfce7;
          color: #166534;
        }
        
        .role-badge.user {
          background: #e2e8f0;
          color: #334155;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .btn-confirm, .btn-promote {
          background: #dcfce7;
          color: #166534;
          padding: 8px 12px;
          font-size: 12px;
        }
        
        .btn-cancel, .btn-demote {
          background: #fee2e2;
          color: #991b1b;
          padding: 8px 12px;
          font-size: 12px;
        }
        
        .btn-complete {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 8px 12px;
          font-size: 12px;
        }

        .btn-join-admin {
          background: #16a34a;
          color: #ffffff;
          padding: 9px 13px;
          font-size: 12px;
          box-shadow: 0 10px 22px rgba(22, 163, 74, 0.24);
        }
        
        .loading {
          text-align: center;
          color: #475569;
          font-size: 18px;
          padding: 50px;
          font-weight: 700;
          max-width: 1280px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.86);
          border-radius: 18px;
          border: 1px solid rgba(148, 163, 184, 0.28);
        }

        @media (max-width: 820px) {
          .admin-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-info {
            justify-content: flex-start;
          }

          .admin-nav-tabs {
            width: 100%;
          }

          .nav-tab {
            flex: 1;
          }
        }
      `}</style>
    </>
  )
}

export default AdminPanel
