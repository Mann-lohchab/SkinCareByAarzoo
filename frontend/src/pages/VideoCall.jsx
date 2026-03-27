import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  StreamVideo,
  StreamVideoClient,
  SpeakerLayout,
  CallControls,
  StreamCall,
  StreamTheme,
} from '@stream-io/video-react-sdk'
import '@stream-io/video-react-sdk/dist/css/styles.css'
import { useStore } from '../zustnd/store'
import { Navbar } from '../components/Navbar'
import { apiClient } from '../lib/config'

// API Key from environment
const API_KEY = import.meta.env.VITE_GETSTREAM_API_KEY || 'kjuyb9r35pvr'

function VideoCall() {
  const { user, setUser } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const callId = searchParams.get('callId')
  
  const [client, setClient] = useState(null)
  const [call, setCall] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const setupVideoCall = async () => {
      try {
        // Get token from backend
        const res = await apiClient.get('/auth/video-call/token')
        
        if (res.data.validate) {
          setToken(res.data.token)
          
          // Create Stream Video client
          const newClient = new StreamVideoClient({
            apiKey: API_KEY,
            user: {
              id: res.data.userId,
              name: user.fullname || user.email,
            },
            token: res.data.token,
          })
          
          setClient(newClient)
          
          // Join or create call
          if (callId) {
            const newCall = newClient.call('default', callId)
            
            try {
              await newCall.join({ create: true })
            } catch (joinErr) {
              console.log('Join error:', joinErr)
              // Try to get existing call
              await newCall.get()
            }
            
            setCall(newCall)
          }
        }
      } catch (err) {
        console.error('Setup error:', err)
        setError(err.message || 'Failed to setup video call')
      } finally {
        setLoading(false)
      }
    }

    setupVideoCall()

    return () => {
      if (call) {
        call.leave().catch(console.error)
      }
      if (client) {
        client.disconnectUser().catch(console.error)
      }
    }
  }, [callId])

  const handleLeave = useCallback(() => {
    navigate(-1)
  }, [navigate])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column'
        }}>
          <h2>Loading video call...</h2>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column'
        }}>
          <h2 style={{ color: 'red' }}>Error: {error}</h2>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </>
    )
  }

  if (!client || !call) {
    return (
      <>
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh',
          flexDirection: 'column'
        }}>
          <h2>No call selected</h2>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <StreamTheme>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ 
                padding: '10px', 
                background: '#000', 
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3>Video Call - {callId}</h3>
                <button 
                  onClick={handleLeave}
                  style={{
                    padding: '8px 16px',
                    background: '#ff4d4d',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Leave Call
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <SpeakerLayout />
              </div>
              <div style={{ padding: '10px', background: '#000' }}>
                <CallControls onLeave={handleLeave} />
              </div>
            </div>
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  )
}

export default VideoCall
