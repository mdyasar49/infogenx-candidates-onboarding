import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavigationDrawer from './NavigationDrawer'
import logo from '../assets/logo.png'
import './TopHeader.css'

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

      <header className="portal-header no-print">
        <div className="portal-header-left">
          <button
            type="button"
            className="drawer-toggle-btn"
            onClick={() => setIsDrawerOpen(true)}
            title="Open Menu Drawer"
            aria-label="Open Navigation Menu"
          >
            <span className="drawer-toggle-icon">☰</span>
            <span>Menu</span>
          </button>

          <img
            src={logo}
            alt="Infogenx Logo"
            className="header-logo"
            onClick={() => navigate('/pdf')}
          />
        </div>

        <div className="portal-header-right">
          {currentProfile && (
            <div className="header-user-profile">
              <span className="header-avatar">
                {currentProfile.name ? currentProfile.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <div className="header-user-meta">
                <p className="header-user-name">{currentProfile.name}</p>
                <p className="header-user-role">{currentProfile.role || 'Candidate'}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            className="header-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>
    </>
  )
}

export default TopHeader
