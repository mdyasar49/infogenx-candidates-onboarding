import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'

function TopHeader({ profile }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="portal-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 28px',
      background: '#FFFFFF',
      borderBottom: '1px solid rgba(0, 18, 60, 0.08)',
      marginBottom: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0, 18, 60, 0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src={logo} alt="Infogenx Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {profile && (
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
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#00123C' }}>{profile.name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#5C6A86' }}>{profile.role || 'Candidate'}</p>
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
  )
}

export default TopHeader

