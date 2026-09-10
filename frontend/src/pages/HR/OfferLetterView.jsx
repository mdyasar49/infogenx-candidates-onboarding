import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import headerImg from '../../assets/offer/infogenx_header.jpeg'
import directorSigImg from '../../assets/offer/director_signature.jpeg'
import './OfferLetterView.css'

function getFormattedDate(d = new Date()) {
  const day = d.getDate()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const suffix = (day === 1 || day === 21 || day === 31) ? 'st' :
                 (day === 2 || day === 22) ? 'nd' :
                 (day === 3 || day === 23) ? 'rd' : 'th'
  return `${day}${suffix} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

function OfferLetterView() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [signatureMode, setSignatureMode] = useState('draw') // 'draw' | 'upload'
  const [signatureData, setSignatureData] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // { type: 'success' | 'error', message: string }
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasHasContent, setCanvasHasContent] = useState(false)

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const candidateName = user?.name || user?.email?.split('@')[0] || 'Candidate'
  const candidateEmail = user?.email || ''
  const candidateRole = user?.department ? `${user.department} Specialist` : 'Business Development Executive'
  const todayDateStr = getFormattedDate()
  const startDateStr = getFormattedDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const fixedSalary = '₹30,000 per month'

  // Load saved signature from session storage if present
  useEffect(() => {
    if (user?.email) {
      const savedSig = sessionStorage.getItem(`infogenx_offer_sig_${user.email}`)
      if (savedSig) {
        setSignatureData(savedSig)
      }
    }
  }, [user])

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#00123C'
  }, [signatureMode])

  const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pos = getCanvasPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const pos = getCanvasPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setCanvasHasContent(true)
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const clearDrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasHasContent(false)
  }

  const applyDrawnSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !canvasHasContent) return
    const dataUrl = canvas.toDataURL('image/png')
    setSignatureData(dataUrl)
    if (user?.email) {
      sessionStorage.setItem(`infogenx_offer_sig_${user.email}`, dataUrl)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setSignatureData(dataUrl)
      if (user?.email) {
        sessionStorage.setItem(`infogenx_offer_sig_${user.email}`, dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const resetSignature = () => {
    setSignatureData(null)
    setCanvasHasContent(false)
    if (user?.email) {
      sessionStorage.removeItem(`infogenx_offer_sig_${user.email}`)
    }
  }

  // Load html2pdf dynamically
  const loadHtml2Pdf = () => {
    return new Promise((resolve) => {
      if (window.html2pdf) return resolve(window.html2pdf)
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => resolve(window.html2pdf)
      script.onerror = () => resolve(null) // fallback
      document.head.appendChild(script)
    })
  }

  // Print or Download PDF
  const handleDownloadPDF = async () => {
    const docElement = document.getElementById('printable-offer-letter')
    if (!docElement) {
      window.print()
      return
    }

    try {
      const h2p = await loadHtml2Pdf()
      if (h2p) {
        const opt = {
          margin: [8, 8, 8, 8],
          filename: `OfferLetter-${candidateName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        await h2p().set(opt).from(docElement).save()
        return
      }
    } catch (e) {
      console.warn('html2pdf fallback to print:', e)
    }
    window.print()
  }

  // Send Email via Backend
  const handleSendEmail = async () => {
    if (!candidateEmail) {
      alert('Candidate email not found. Please log in again.')
      return
    }

    if (!signatureData) {
      const proceed = window.confirm('You have not added your signature yet. Do you want to sign the letter first?\n\nClick Cancel to sign, or OK to send unsigned.')
      if (!proceed) return
    }

    setSendingEmail(true)
    setEmailStatus(null)

    try {
      let pdfBase64 = null
      const docElement = document.getElementById('printable-offer-letter')

      if (docElement) {
        try {
          const h2p = await loadHtml2Pdf()
          if (h2p) {
            const opt = {
              margin: [8, 8, 8, 8],
              image: { type: 'jpeg', quality: 0.95 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }
            const dataUri = await h2p().set(opt).from(docElement).outputPdf('datauristring')
            if (dataUri && dataUri.includes(',')) {
              pdfBase64 = dataUri.split(',')[1]
            }
          }
        } catch (pdfErr) {
          console.warn('Could not generate client-side PDF string:', pdfErr)
        }
      }

      const defaultApi = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.infogenx.com'
      const apiUrl = import.meta.env.VITE_API_URL || defaultApi

      const res = await fetch(`${apiUrl}/api/offer-letter/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          role: candidateRole,
          salary: fixedSalary,
          startDate: startDateStr,
          signatureDataUrl: signatureData,
          pdfBase64
        })
      })

      const data = await res.json()
      if (data.success) {
        setEmailStatus({
          type: 'success',
          message: `✓ Offer Letter (PDF) successfully sent to ${candidateEmail}! Please check your inbox.`
        })
      } else {
        setEmailStatus({
          type: 'error',
          message: data.message || 'Failed to send offer letter email.'
        })
      }
    } catch (err) {
      setEmailStatus({
        type: 'error',
        message: `Network error: ${err.message}. Please try again.`
      })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="offer-letter-view-container">

      {/* Top Action Bar (hidden during printing) */}
      <div className="offer-actions-bar no-print">
        <div className="offer-actions-left">
          <button type="button" className="btn-secondary" onClick={() => navigate('/result')}>
            ← Back to Results
          </button>
          <button type="button" className="btn-primary" onClick={handleDownloadPDF}>
            🖨️ Download PDF / Print
          </button>
          <button
            type="button"
            className="btn-accent"
            onClick={handleSendEmail}
            disabled={sendingEmail}
          >
            {sendingEmail ? '✉️ Sending...' : '✉️ Send PDF to My Email'}
          </button>
        </div>

        <div className="offer-actions-right">
          <button type="button" className="btn-next-task" onClick={() => navigate('/task')}>
            Proceed to Recruitment Task →
          </button>
        </div>
      </div>

      {/* Email Alert Banner */}
      {emailStatus && (
        <div className={`offer-alert-banner no-print ${emailStatus.type}`}>
          {emailStatus.message}
        </div>
      )}

      {/* E-Signature Control Box (hidden during print) */}
      {!signatureData && (
        <div className="signature-input-box no-print">
          <div className="sig-box-header">
            <h3>✍️ Provide Your Signature to Accept Offer</h3>
            <p>You can either draw your signature below or upload a photo of your signature.</p>
          </div>

          <div className="sig-mode-tabs">
            <button
              type="button"
              className={`sig-tab-btn ${signatureMode === 'draw' ? 'active' : ''}`}
              onClick={() => setSignatureMode('draw')}
            >
              ✏️ Draw Signature
            </button>
            <button
              type="button"
              className={`sig-tab-btn ${signatureMode === 'upload' ? 'active' : ''}`}
              onClick={() => setSignatureMode('upload')}
            >
              📁 Upload Signature Image
            </button>
          </div>

          {signatureMode === 'draw' ? (
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={650}
                height={160}
                className="sig-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <div className="canvas-btn-row">
                <button type="button" className="btn-sm-clear" onClick={clearDrawCanvas}>
                  Clear
                </button>
                <button
                  type="button"
                  className="btn-sm-apply"
                  onClick={applyDrawnSignature}
                  disabled={!canvasHasContent}
                >
                  Apply Signature to Offer Letter ✓
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn-upload-trigger"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Signature Image (PNG, JPG)
              </button>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0' }}>
                Tip: Use a clear photo or scan of your signature on white paper.
              </p>
            </div>
          )}
        </div>
      )}

      {/* The Printable Official Offer Letter Document */}
      <div className="offer-document" id="printable-offer-letter">
        {/* Header Logo Banner */}
        <div className="doc-header">
          <img src={headerImg} alt="Infogenx Private Limited" className="doc-logo" />
        </div>

        <div className="doc-date">Date: {todayDateStr}</div>

        <div className="doc-salutation">Dear {candidateName},</div>

        <p className="doc-p">
          We are pleased to offer you the position of <strong>{candidateRole}</strong> at <strong>Infogenx Private Limited</strong>.
          Based on your background, skills, and assessment performance, we believe you will be a valuable asset to our global business strategy.
        </p>

        <p className="doc-p">
          Your employment will be governed by the following terms and conditions:
        </p>

        <h4 className="doc-h4">1. Remuneration & Compensation</h4>
        <ul className="doc-ul">
          <li><strong>Fixed Monthly Salary:</strong> You will receive a consolidated gross salary of <strong>{fixedSalary}</strong>.</li>
          <li><strong>Performance Incentives:</strong> You are eligible for a Performance-Linked Incentive (PLI) for every project successfully converted or delivered. The incentive is calculated based on project profitability and milestone delivery.</li>
          <li><strong>Payment Schedule:</strong> Salary and earned incentives will be transferred to your designated bank account during the first week of every month, following verification of your monthly deliverables.</li>
        </ul>

        <h4 className="doc-h4">2. Performance Expectations & Targets</h4>
        <ul className="doc-ul">
          <li><strong>Initial Target:</strong> Consistent output and adherence to project deliverables within your first month.</li>
          <li><strong>Contract Continuity:</strong> This offer is performance-linked. Maintaining a consistent pipeline of completed tasks is required to ensure contract continuity.</li>
          <li><strong>Performance Review:</strong> A formal review will be conducted after six months. Upon satisfactory performance and meeting growth KPIs, a potential 10% base salary increase will be considered.</li>
        </ul>

        <h4 className="doc-h4">3. Reporting & Operations</h4>
        <p className="doc-p">
          As part of our data-driven approach, you are required to maintain a daily log of your activities and project statuses in the company’s designated tracking system (Google Sheets / Zoho CRM). This report must be kept up to date to facilitate monthly payouts.
        </p>

        <h4 className="doc-h4">4. Acceptance and Commencement</h4>
        <p className="doc-p">
          Your official start date is scheduled for <strong>{startDateStr}</strong>. To accept this offer, please sign and return this letter.
        </p>

        {/* Authorization & Candidate Acceptance Signatures */}
        <div className="doc-signature-grid">
          {/* Company Authorization */}
          <div className="doc-sig-col">
            <h5 className="doc-sig-h5">Authorization</h5>
            <p className="doc-sig-sub">For Infogenx Private Limited:</p>
            <div className="doc-sig-img-container">
              <img src={directorSigImg} alt="Director Signature" className="doc-director-sig" />
            </div>
            <p className="doc-sig-name"><strong>Nithyanand Arumugham</strong></p>
            <p className="doc-sig-detail">Director</p>
            <p className="doc-sig-detail">Phone: +91 97878 06366</p>
            <p className="doc-sig-detail">Email: nithyanand.a@infogenx.com.au</p>
            <p className="doc-sig-detail">Date: {todayDateStr}</p>
          </div>

          {/* Candidate Acceptance */}
          <div className="doc-sig-col candidate-col">
            <h5 className="doc-sig-h5">Candidate Acceptance</h5>
            <p className="doc-sig-sub">
              I, <strong>{candidateName}</strong>, accept the offer of employment as <strong>{candidateRole}</strong> under the terms and conditions outlined above.
            </p>
            <div className="doc-sig-img-container">
              {signatureData ? (
                <img src={signatureData} alt="Candidate E-Signature" className="doc-candidate-sig" />
              ) : (
                <div className="doc-sig-placeholder">
                  [Draw or upload your signature above]
                </div>
              )}
            </div>
            <p className="doc-sig-name"><strong>{candidateName}</strong></p>
            <p className="doc-sig-detail">Date: {todayDateStr}</p>
            {signatureData && (
              <div className="no-print" style={{ marginTop: '8px' }}>
                <button type="button" className="btn-resign" onClick={resetSignature}>
                  Change / Clear Signature ↺
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Document Footer */}
        <div className="doc-footer">
          Infogenx Private Limited • Official Candidate Onboarding System • https://candidates.infogenx.com
        </div>
      </div>
    </div>
  )
}

export default OfferLetterView
