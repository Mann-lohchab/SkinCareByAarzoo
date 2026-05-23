import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const { user } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const callId = searchParams.get('callId')
  
  const [client, setClient] = useState(null)
  const [call, setCall] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [permissionState, setPermissionState] = useState('idle')
  const clientRef = useRef(null)
  const callRef = useRef(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.leave().catch(console.error)
      }
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(console.error)
      }
    }
  }, [])

  const getMediaErrorMessage = (err) => {
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'Camera and microphone need HTTPS. Please open this app in a secure (https) browser context.'
    }

    switch (err?.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
      case 'SecurityError':
        return 'Permission denied. Allow camera and microphone access in browser site settings and try again.'
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera or microphone was found. Connect devices and retry.'
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Camera or microphone is already in use by another app or browser tab.'
      case 'OverconstrainedError':
        return 'Requested camera/microphone settings are not available on this device.'
      default:
        return err?.message || 'Failed to setup video call'
    }
  }

  const setupVideoCall = async () => {
    if (!callId) {
      setError('No call selected')
      return
    }

    setError(null)
    setLoading(true)
    setPermissionState('requesting')

    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera and microphone need HTTPS. Please open this app in a secure (https) browser context.')
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      mediaStream.getTracks().forEach((track) => track.stop())
      setPermissionState('granted')

      const res = await apiClient.get('/auth/video-call/token')

      if (!res.data.validate) {
        throw new Error(res.data.message || 'Unable to authorize video call')
      }

      const newClient = new StreamVideoClient({
        apiKey: res.data.apiKey || API_KEY,
        user: {
          id: res.data.userId,
          name: user.fullname || user.email,
        },
        token: res.data.token,
      })

      const newCall = newClient.call('default', callId)
      await newCall.join({
        create: true,
        audio: true,
        video: true,
      })

      clientRef.current = newClient
      callRef.current = newCall
      setClient(newClient)
      setCall(newCall)
    } catch (err) {
      console.error('Setup error:', err)
      const permissionDenied = ['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(err?.name)
      setPermissionState(permissionDenied ? 'denied' : 'idle')
      setError(getMediaErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = useCallback(() => {
    navigate(-1)
  }, [navigate])

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '80vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: '#f5f7fb',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            borderRadius: '18px',
            background: '#ffffff',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
            textAlign: 'center',
          }}>
            <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>
              {permissionState === 'requesting' ? 'Waiting for permission...' : 'Joining video call...'}
            </h2>
            <p style={{ color: '#64748b' }}>
              Allow camera and microphone access in your browser prompt.
            </p>
          </div>
        </div>
      </>
    )
  }

  if (error || !client || !call) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '100vh',
          padding: '132px 20px 48px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
          display: 'grid',
          placeItems: 'center',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            padding: '32px',
            borderRadius: '22px',
            background: '#ffffff',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.16)',
            border: '1px solid rgba(148, 163, 184, 0.26)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'grid',
              placeItems: 'center',
              fontSize: '24px',
              marginBottom: '20px',
            }}>
              camera
            </div>
            <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.65rem' }}>
              Join video consultation
            </h2>
            <p style={{ margin: '0 0 18px', color: '#475569', lineHeight: 1.6 }}>
              Click below to let this site ask for camera and microphone permission before joining the call.
            </p>
            {error && (
              <p style={{
                margin: '0 0 18px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#fef2f2',
                color: '#b91c1c',
                fontWeight: 600,
              }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={setupVideoCall}
                style={{
                  border: '0',
                  borderRadius: '12px',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '12px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Enable camera and microphone
              </button>
              <button
                onClick={() => navigate(-1)}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#334155',
                  padding: '12px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Go back
              </button>
            </div>
          </div>
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
