import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavigationDrawer from './NavigationDrawer'
import logo from '../assets/logo.png'

function TopHeader({ profile }) {
  const { user: authUser, logout } = useAuth()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const currentProfile = profile || authUser

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <header className="portal-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 24px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(0, 18, 60, 0.08)',
        marginBottom: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 18, 60, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            style={{
              background: '#FFF8F3',
              border: '1.5px solid rgba(230, 85, 37, 0.25)',
              borderRadius: '10px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#00123C',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(230, 85, 37, 0.08)'
            }}
            title="Open Menu Drawer"
          >
            <span style={{ fontSize: '18px', lineHeight: 1, color: '#E65525' }}>☰</span>
            <span style={{ color: '#00123C' }}>Menu</span>
          </button>

          <img
            src={logo}
            alt="Infogenx Logo"
            style={{ height: '38px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => navigate('/pdf')}
          />
        </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {currentProfile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00123C 0%, #E65525 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '15px'
            }}>
              {currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#00123C' }}>{currentProfile.name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#5C6A86' }}>{currentProfile.role || 'Candidate'}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#00123C',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Logout
        </button>
      </div>
    </header>
    </>
  )
}

export default TopHeader

