import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ROLE_OFFER_CONFIGS, detectRoleKey } from '../../data/roleOfferConfigs'
import headerImg from '../../assets/offer/infogenx_header.jpeg'
import directorSigImg from '../../assets/offer/director_signature.jpeg'
import './AdminOfferReviewPage.css'

function AdminOfferReviewPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Candidate and offer details
  const [candidateData, setCandidateData] = useState(null)
  const [allRequests, setAllRequests] = useState([])

  // Form states
  const [selectedRoleKey, setSelectedRoleKey] = useState('bde')
  const [department, setDepartment] = useState('')
  const [salary, setSalary] = useState('₹30,000 per month')
  const [startDate, setStartDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const defaultApi = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.infogenx.com'
  const apiUrl = import.meta.env.VITE_API_URL || defaultApi

  // Fetch offer details by token or fetch all requests
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        if (token) {
          const res = await fetch(`${apiUrl}/api/offer-letter/review/${token}`)
          const data = await res.json()
          if (data.success && data.offer) {
            setCandidateData(data.offer)
            const roleKey = detectRoleKey(data.offer.role || data.offer.department)
            setSelectedRoleKey(roleKey)
            const roleCfg = ROLE_OFFER_CONFIGS[roleKey] || ROLE_OFFER_CONFIGS['bde']
            setDepartment(data.offer.department || roleCfg.department)
            setSalary(data.offer.salary || roleCfg.defaultSalary)
            setStartDate(data.offer.startDate || '')
            setAdminNotes(data.offer.adminNotes || '')
          } else {
            setError(data.message || 'Unable to retrieve candidate offer details.')
          }
        } else {
          // No token provided - load all candidate requests for admin overview
          const res = await fetch(`${apiUrl}/api/offer-letter/all-requests`)
          const data = await res.json()
          if (data.success) {
            setAllRequests(data.requests || [])
          }
        }
      } catch (err) {
        setError(`Failed to connect to backend: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, apiUrl])

  // Handle Role Track Dropdown change
  const handleRoleChange = (e) => {
    const newKey = e.target.value
    setSelectedRoleKey(newKey)
    const cfg = ROLE_OFFER_CONFIGS[newKey]
    if (cfg) {
      setDepartment(cfg.department)
      setSalary(cfg.defaultSalary)
    }
  }

  // Handle Admin Approval Submission
  const handleApprove = async () => {
    if (!candidateData && !token) return

    setApproving(true)
    setError(null)
    setSuccessMessage(null)

    const activeRoleConfig = ROLE_OFFER_CONFIGS[selectedRoleKey] || ROLE_OFFER_CONFIGS['bde']

    try {
      const res = await fetch(`${apiUrl}/api/offer-letter/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || candidateData.token,
          candidateEmail: candidateData?.candidateEmail,
          role: activeRoleConfig.title,
          department,
          salary,
          startDate,
          adminNotes,
          openingStatement: activeRoleConfig.openingStatement,
          incentiveDescription: activeRoleConfig.incentiveDescription,
          targets: activeRoleConfig.targets,
          reportingTools: activeRoleConfig.reportingTools
        })
      })

      const data = await res.json()
      if (data.success) {
        setSuccessMessage(`✓ Offer Letter successfully approved! Official email with offer document has been dispatched to ${candidateData.candidateEmail}.`)
        setCandidateData((prev) => ({
          ...prev,
          status: 'APPROVED',
          role: activeRoleConfig.title,
          department,
          salary
        }))
      } else {
        setError(data.message || 'Failed to approve offer letter.')
      }
    } catch (err) {
      setError(`Network error: ${err.message}`)
    } finally {
      setApproving(false)
    }
  }

  const activeRoleConfig = ROLE_OFFER_CONFIGS[selectedRoleKey] || ROLE_OFFER_CONFIGS['bde']

  return (
    <div className="admin-review-shell">
      <div className="admin-review-container">

        {/* Header Bar */}
        <header className="admin-review-header">
          <div className="admin-header-title">
            <h1>Infogenx HR Management Portal</h1>
            <p>Candidate Evaluation & Official Offer Letter Release Console</p>
          </div>
          <div className="admin-badge">
            🛡️ Admin Authorization Mode
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '12px' }}>
            <p style={{ fontSize: '16px', color: '#00123C', fontWeight: '600' }}>Loading Offer Request Data...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', fontWeight: '600' }}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '18px 24px', borderRadius: '10px', marginBottom: '24px', fontWeight: '700', fontSize: '15px' }}>
            {successMessage}
          </div>
        )}

        {/* Token Mode: Review Specific Candidate */}
        {!loading && candidateData && (
          <>
            {/* Candidate Summary Card */}
            <div className="candidate-summary-card">
              <div className="cand-info-group">
                <div className="cand-avatar">
                  {candidateData.candidateName?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="cand-text">
                  <h3>{candidateData.candidateName}</h3>
                  <p>{candidateData.candidateEmail}</p>
                </div>
              </div>

              <div className="cand-meta-badges">
                <span className="badge-score">
                  🎯 Assessment: {candidateData.score || 'Passed'}
                </span>
                <span className={`badge-status ${candidateData.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                  {candidateData.status === 'APPROVED' ? '✓ APPROVED' : '⏳ PENDING HR APPROVAL'}
                </span>
              </div>
            </div>

            {/* Approval & Customization Form */}
            <div className="approval-form-card">
              <h3 className="form-section-title">
                📝 Configure Offer Terms & Compensation Package
              </h3>

              <div className="form-grid-2col">
                {/* Role Selector */}
                <div className="admin-field-group">
                  <label htmlFor="admin-role-select">Designated Job Role Track</label>
                  <select
                    id="admin-role-select"
                    className="admin-field-select"
                    value={selectedRoleKey}
                    onChange={handleRoleChange}
                    disabled={candidateData.status === 'APPROVED'}
                  >
                    {Object.values(ROLE_OFFER_CONFIGS).map((cfg) => (
                      <option key={cfg.id} value={cfg.id}>
                        {cfg.title} — ({cfg.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="admin-field-group">
                  <label htmlFor="admin-dept-input">Assigned Department</label>
                  <input
                    id="admin-dept-input"
                    type="text"
                    className="admin-field-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={candidateData.status === 'APPROVED'}
                  />
                </div>
              </div>

              <div className="form-grid-2col">
                {/* Monthly Salary */}
                <div className="admin-field-group">
                  <label htmlFor="admin-salary-input">Gross Monthly Remuneration</label>
                  <input
                    id="admin-salary-input"
                    type="text"
                    className="admin-field-input"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. ₹35,000 per month"
                    disabled={candidateData.status === 'APPROVED'}
                  />
                </div>

                {/* Scheduled Start Date */}
                <div className="admin-field-group">
                  <label htmlFor="admin-startdate-input">Scheduled Joining / Start Date</label>
                  <input
                    id="admin-startdate-input"
                    type="text"
                    className="admin-field-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="e.g. 17th September 2026"
                    disabled={candidateData.status === 'APPROVED'}
                  />
                </div>
              </div>

              {/* Admin Remarks */}
              <div className="admin-field-group" style={{ marginTop: '10px' }}>
                <label htmlFor="admin-notes-input">Internal Remarks / Management Notes (Optional)</label>
                <textarea
                  id="admin-notes-input"
                  className="admin-field-textarea"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved with pre-negotiated cloud cert allowance. Candidate showed exceptional problem solving in sprint module."
                  disabled={candidateData.status === 'APPROVED'}
                />
              </div>

              {/* Action Buttons */}
              <div className="admin-action-bar">
                <button
                  type="button"
                  className="btn-admin-approve"
                  onClick={handleApprove}
                  disabled={approving || candidateData.status === 'APPROVED'}
                >
                  {approving ? '⏳ Approving & Dispatching...' : candidateData.status === 'APPROVED' ? '✓ Offer Already Approved' : '✓ Approve & Issue Offer Letter to Student'}
                </button>
              </div>
            </div>

            {/* Live Document Preview */}
            <div style={{ background: '#ffffff', borderRadius: '14px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 18px rgba(0, 18, 60, 0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, color: '#00123C', fontSize: '16px', fontWeight: '700' }}>
                  📄 Live Offer Document Preview
                </h4>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  This is the exact document the student will see and receive.
                </span>
              </div>

              <div style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fafafa' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img src={headerImg} alt="Infogenx" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <p><strong>Position:</strong> {activeRoleConfig.title} ({department})</p>
                <p><strong>Candidate:</strong> {candidateData.candidateName} &lt;{candidateData.candidateEmail}&gt;</p>
                <p><strong>Compensation:</strong> {salary}</p>
                <p><strong>Performance Incentive:</strong> {activeRoleConfig.incentiveDescription}</p>
                <p><strong>Reporting System:</strong> {activeRoleConfig.reportingTools}</p>
              </div>
            </div>
          </>
        )}

        {/* Overview Mode: Table of All Requests (When no specific token is provided) */}
        {!loading && !candidateData && (
          <div className="admin-table-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#00123C' }}>
              📋 Candidate Offer Letter Queue
            </h3>
            {allRequests.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>
                No candidate offer requests found in database.
              </p>
            ) : (
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Assigned Role</th>
                    <th>Salary</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.map((req) => (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td><strong>{req.candidate_name}</strong></td>
                      <td>{req.candidate_email}</td>
                      <td>{req.assessment_score}</td>
                      <td>{req.role}</td>
                      <td>{req.salary}</td>
                      <td>
                        <span className={`badge-status ${req.status === 'APPROVED' ? 'approved' : 'pending'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-review-action"
                          onClick={() => navigate(`/admin/offer-review?token=${req.token}`)}
                        >
                          Review &amp; Edit →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminOfferReviewPage
