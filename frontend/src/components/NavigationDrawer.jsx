import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'
import './NavigationDrawer.css'

function NavigationDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleNav = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/login')
  }

  const candidateName = user?.name || user?.email?.split('@')[0] || 'Candidate'
  const candidateInitial = candidateName.charAt(0).toUpperCase()
  const candidateRole = user?.department ? `${user.department} Specialist` : 'Business Development Executive'

  // Check if candidate passed assessment from sessionStorage
  let hasPassed = false
  if (user?.email) {
    try {
      const saved = sessionStorage.getItem(`infogenx_assessment_result_${user.email}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        hasPassed = parsed.passed || parsed.score >= 40
      }
    } catch (e) {
      // ignore
    }
  }

  const menuSections = [
    {
      title: 'Core 6-Step Pipeline',
      items: [
        { path: '/pdf', icon: '📄', label: 'Step 1: SOP / PDF Guide', badge: 'Step 1' },
        { path: '/ppt', icon: '🖥️', label: 'Step 2: Company PPT', badge: 'Step 2' },
        { path: '/assessment', icon: '📝', label: 'Step 3: Assessment Exam', badge: 'Step 3' },
        { path: '/result', icon: '📊', label: 'Step 4: Exam Result', badge: hasPassed ? 'Passed ✓' : 'Step 4', badgeClass: hasPassed ? 'drawer-badge-passed' : '' },
        { path: '/offer-letter', icon: '📜', label: 'Step 5: Official Offer Letter', badge: 'Sign' },
        { path: '/task', icon: '🎯', label: 'Step 6: Recruitment Task', badge: 'Step 6' },
      ]
    },
    {
      title: 'HR & Careers',
      items: [
        { path: '/offer-letter', icon: '📜', label: 'Offer Letter Acceptance', badge: 'Docx' },
        { path: '/hr-interview', icon: '🤝', label: 'HR Interview Scheduling' },
        { path: '/job-roles', icon: '💼', label: 'Job Roles & Streams' },
        { path: '/signature', icon: '✍️', label: 'Digital E-Signature' },
      ]
    },
    {
      title: 'Learning & Orientation',
      items: [
        { path: '/materials', icon: '📚', label: 'Learning Materials' },
        { path: '/training', icon: '🎓', label: 'Training Modules' },
        { path: '/sop', icon: '📑', label: 'Infogenx Recruitment SOP' },
        { path: '/recruitment-process', icon: '📋', label: 'Recruitment Flow Guide' },
      ]
    },
    {
      title: 'Portal & Policies',
      items: [
        { path: '/dashboard', icon: '📊', label: 'Candidate Dashboard' },
        { path: '/onboarding', icon: '🚀', label: 'Onboarding Overview' },
        { path: '/terms', icon: '📑', label: 'Terms & Conditions' },
        { path: '/completion', icon: '🎉', label: 'Completion Certificate' },
      ]
    }
  ]

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer Panel */}
      <aside className={`drawer-panel ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <img src={logo} alt="Infogenx" className="drawer-logo" />
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Profile Card */}
        {user && (
          <div className="drawer-profile">
            <div className="drawer-avatar">{candidateInitial}</div>
            <div className="drawer-profile-info">
              <p className="drawer-profile-name">{candidateName}</p>
              <p className="drawer-profile-role">{candidateRole}</p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="drawer-nav">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="drawer-section">
              <h4 className="drawer-section-title">{section.title}</h4>
              {section.items.map((item, iIdx) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={iIdx}
                    type="button"
                    className={`drawer-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <span className="drawer-item-left">
                      <span className="drawer-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className={`drawer-item-badge ${item.badgeClass || ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="drawer-footer">
          <p className="drawer-support">
            Need help? <strong>HR Director:</strong><br />
            +91 97878 06366 • nithyanand.a@infogenx.com.au
          </p>
          <button type="button" className="drawer-logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default NavigationDrawer
