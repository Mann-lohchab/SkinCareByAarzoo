import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../style/Dashboard.css'
import { useStore } from '../zustnd/store'
import { Navbar } from '../components/Navbar'
import { connectRealtime } from '../lib/realtime'

function VideoCallBooking() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    sessionType: 'consultation',
    scheduledTime: '',
    duration: 30
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [user])

  useEffect(() => {
    if (!user) {
      return undefined
    }

    const socket = connectRealtime({
      onMessage: (event) => {
        if (
          event.type === 'booking.created' ||
          event.type === 'booking.updated' ||
          event.type === 'booking.deleted'
        ) {
          fetchBookings()
        }
      },
    })

    return () => {
      socket.close()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:3000/api/auth/video-call/bookings', { withCredentials: true })
      if (res.data.validate) {
        setBookings(res.data.bookings)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await axios.post('http://localhost:3000/api/auth/video-call/create', formData, { withCredentials: true })
      if (res.data.validate) {
        toast.success('Video call session booked successfully!')
        setShowForm(false)
        setFormData({
          sessionType: 'consultation',
          scheduledTime: '',
          duration: 30
        })
        fetchBookings()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error booking session')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookingId) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/auth/video-call/delete/${bookingId}`, { withCredentials: true })
      if (res.data.validate) {
        toast.success('Booking cancelled')
        fetchBookings()
      }
    } catch (err) {
      toast.error('Error cancelling booking')
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

  const sessionTypes = [
    { value: 'consultation', label: 'General Consultation', duration: 30 },
    { value: 'technical', label: 'Technical Support', duration: 45 },
    { value: 'followup', label: 'Follow-up Session', duration: 15 },
    { value: 'demo', label: 'Product Demo', duration: 60 }
  ]

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <>
      <Navbar />
      <div className='booking-container'>
        <div className='booking-header'>
          <div className='header-left'>
            <h1>Video Call Sessions</h1>
            <p>Book a one-on-one video call session with our team</p>
          </div>
          <div className='header-right'>
            <button className='back-btn-booking' onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className='logout-btn-booking' onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className='booking-content'>
          <div className='brutalist-card booking-card'>
            <div className='card-header-brutalist'>
              <h2>Book a New Session</h2>
              <button 
                className='btn-primary'
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Book Now'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className='booking-form'>
                <div className='form-group'>
                  <label>Session Type</label>
                  <select 
                    value={formData.sessionType}
                    onChange={(e) => {
                      const selected = sessionTypes.find(s => s.value === e.target.value)
                      setFormData({
                        ...formData,
                        sessionType: e.target.value,
                        duration: selected.duration
                      })
                    }}
                    required
                    className='brutalist-input'
                  >
                    {sessionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.duration} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div className='form-group'>
                  <label>Preferred Date & Time</label>
                  <input 
                    type='datetime-local'
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    min={getMinDateTime()}
                    required
                    className='brutalist-input'
                  />
                </div>

                <div className='form-group'>
                  <label>Duration: {formData.duration} minutes</label>
                  <input 
                    type='range'
                    min='15'
                    max='60'
                    step='15'
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className='brutalist-range'
                  />
                </div>

                <button type='submit' className='btn-primary' disabled={loading}>
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>

          <div className='my-bookings'>
            <h2>My Bookings</h2>
            {loading && bookings.length === 0 ? (
              <div className='loading-state'>Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className='brutalist-card empty-state'>
                <p>You haven't booked any sessions yet.</p>
                <p>Click "Book Now" to schedule your first video call!</p>
              </div>
            ) : (
              <div className='bookings-grid'>
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className='brutalist-card booking-item'>
                    <div className='booking-info'>
                      <div className='booking-type'>
                        {sessionTypes.find(s => s.value === booking.session_type)?.label || booking.session_type}
                      </div>
                      <div className='booking-id'>ID: {booking.booking_id}</div>
                    </div>
                    <div className='booking-details'>
                      <div className='detail-row'>
                        <span className='label'>Date & Time:</span>
                        <span className='value'>{formatDate(booking.scheduled_time)}</span>
                      </div>
                      <div className='detail-row'>
                        <span className='label'>Duration:</span>
                        <span className='value'>{booking.duration} minutes</span>
                      </div>
                      <div className='detail-row'>
                        <span className='label'>Status:</span>
                        <span 
                          className='status-indicator'
                          style={{backgroundColor: getStatusColor(booking.status), border: '2px solid black'}}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    {booking.status === 'pending' && (
                      <button 
                        className='btn-cancel-booking'
                        onClick={() => handleDelete(booking.booking_id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className='video-call-section'>
                        <div className='confirmed-message'>
                          Your session is confirmed! Click below to join.
                        </div>
                        {booking.stream_session_id && (
                          <button 
                            onClick={() => navigate(`/video-call?callId=${booking.stream_session_id}`)}
                            className='btn-join-video'
                          >
                            🎥 Join Video Call
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .booking-container {
          min-height: 100vh;
          background-color: #F5F7FF;
          padding: 132px 20px 20px;
          font-family: 'Roboto Mono', 'Courier New', monospace;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-left h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0A0A0A;
        }

        .header-left p {
          margin: 0;
          color: #666;
        }

        .header-right {
          display: flex;
          gap: 10px;
        }

        .back-btn-booking, .logout-btn-booking {
          padding: 0.875rem 1.75rem;
          border: 3px solid black;
          box-shadow: 4px 4px 0px black;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
          transition: all 0.15s ease;
        }

        .back-btn-booking {
          background: white;
          color: #0A0A0A;
        }

        .back-btn-booking:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }

        .logout-btn-booking {
          background: #f44336;
          color: white;
        }

        .logout-btn-booking:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }

        .booking-content {
          max-width: 1280px;
          margin: 0 auto;
        }

        .booking-card {
          background: white;
          border: 3px solid black;
          box-shadow: 6px 6px 0px black;
          padding: 25px;
          margin-bottom: 30px;
        }

        .card-header-brutalist {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .card-header-brutalist h2 {
          margin: 0;
          color: #333;
          font-weight: 700;
        }

        .btn-primary {
          background-color: #2563EB;
          color: white;
          border: 3px solid #000000;
          box-shadow: 6px 6px 0px black;
          padding: 0.875rem 1.75rem;
          font-weight: 700;
          font-size: 1rem;
          font-family: 'Roboto Mono', monospace;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0px black;
        }

        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 700;
          color: #333;
        }

        .brutalist-input {
          padding: 12px;
          border: 3px solid black;
          font-size: 14px;
          font-family: 'Roboto Mono', monospace;
          background: white;
        }

        .brutalist-input:focus {
          outline: none;
          box-shadow: 4px 4px 0px black;
        }

        .brutalist-range {
          width: 100%;
          accent-color: #2563EB;
        }

        .my-bookings h2 {
          color: #0A0A0A;
          margin-bottom: 20px;
          font-weight: 800;
          font-size: 1.75rem;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 40px;
          background: white;
          border: 3px solid black;
          box-shadow: 6px 6px 0px black;
          color: #0A0A0A;
        }

        .empty-state p {
          margin: 5px 0;
        }

        .bookings-grid {
          display: grid;
          gap: 20px;
        }

        .booking-item {
          background: white;
          border: 3px solid black;
          box-shadow: 6px 6px 0px black;
          padding: 20px;
        }

        .booking-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid black;
        }

        .booking-type {
          font-size: 18px;
          font-weight: 700;
          color: #0A0A0A;
        }

        .booking-id {
          font-size: 12px;
          color: #666;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
        }

        .detail-row .label {
          color: #666;
          font-weight: 500;
        }

        .detail-row .value {
          font-weight: 700;
          color: #0A0A0A;
        }

        .status-indicator {
          padding: 4px 12px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .btn-cancel-booking {
          width: 100%;
          padding: 12px;
          background: #f44336;
          color: white;
          border: 3px solid black;
          box-shadow: 4px 4px 0px black;
          font-weight: 700;
          font-family: 'Roboto Mono', monospace;
          cursor: pointer;
        }

        .btn-cancel-booking:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px black;
        }

        .confirmed-message {
          padding: 10px;
          background: #e8f5e9;
          border: 2px solid black;
          color: #2e7d32;
          font-size: 14px;
          text-align: center;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .booking-container {
            padding-top: 112px;
          }

          .booking-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-right {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </>
  )
}

export default VideoCallBooking
