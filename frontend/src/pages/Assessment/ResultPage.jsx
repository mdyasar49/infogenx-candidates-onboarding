import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopHeader from '../../components/TopHeader'
import { useAuth } from '../../hooks/useAuth'
import './ResultPage.css'

function ResultPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [attemptNumber, setAttemptNumber] = useState(1)

  useEffect(() => {
    if (user?.email) {
      const storedResult = sessionStorage.getItem(`infogenx_assessment_result_${user.email}`)
      const storedCount = sessionStorage.getItem(`infogenx_attempt_count_${user.email}`)

      if (storedResult) {
        try {
          const parsed = JSON.parse(storedResult)
          setResult(parsed)
        } catch (e) {
          // ignore
        }
      }

      if (storedCount) {
        setAttemptNumber(parseInt(storedCount, 10))
      }
    }
  }, [user])

  const handleReattempt = () => {
    if (attemptNumber >= 3) return
    const nextAttempt = attemptNumber + 1
    if (user?.email) {
      sessionStorage.setItem(`infogenx_attempt_count_${user.email}`, nextAttempt.toString())
    }
    navigate('/assessment')
  }

  const passed = result ? result.passed : false
  const score = result ? result.score : 0
  const percentage = result ? result.percentage : 0

  return (
    <div className="result-shell" style={{ background: '#FFFFFF', minHeight: '100vh', padding: '24px 20px' }}>
      <main className="result-main" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {user && <TopHeader profile={user} />}

        <div className="result-card" style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 36px',
          border: '1.5px solid transparent',
          backgroundImage: 'linear-gradient(#ffffff, #ffffff), linear-gradient(135deg, #00123C 0%, #E65525 100%)',
          backgroundClip: 'padding-box, border-box',
          backgroundOrigin: 'padding-box, border-box',
          boxShadow: '0 20px 50px rgba(0, 18, 60, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              margin: '0 0 8px',
              background: 'linear-gradient(135deg, #00123C 0%, #E65525 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Assessment Result
            </h1>
            <p style={{ margin: 0, color: '#5C6A86', fontSize: '15px' }}>
              Official evaluation outcome recorded for your profile.
            </p>
          </div>

          {result ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px', alignItems: 'center' }}>
              {/* Outcome Banner */}
              <div style={{
                width: '100%',
                background: passed ? '#F0FDF4' : '#FFF7F5',
                border: passed ? '1px solid #86EFAC' : '1px solid rgba(230, 85, 37, 0.3)',
                borderRadius: '18px',
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  background: passed ? '#22C55E' : '#E65525',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '15px',
                  marginBottom: '14px',
                  letterSpacing: '0.05em'
                }}>
                  {passed ? 'PASS ✓' : 'FAIL ✕'}
                </div>

                <h2 style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: passed ? '#15803D' : '#E65525',
                  margin: '0 0 8px'
                }}>
                  Score: {score} / 50
                </h2>

                <p style={{ fontSize: '18px', fontWeight: '700', color: '#00123C', margin: 0 }}>
                  Percentage: {percentage}%
                </p>
              </div>

              {/* Metrics Grid */}
              <div style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ background: '#FFF8F3', border: '1px solid rgba(0, 18, 60, 0.08)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#5C6A86', fontWeight: '700', textTransform: 'uppercase' }}>Passing Threshold</span>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#00123C', margin: '4px 0 0' }}>80% (40/50)</p>
                </div>

                <div style={{ background: '#FFF8F3', border: '1px solid rgba(0, 18, 60, 0.08)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#5C6A86', fontWeight: '700', textTransform: 'uppercase' }}>Attempt Recorded</span>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#00123C', margin: '4px 0 0' }}>Attempt {attemptNumber} of 3</p>
                </div>

                <div style={{ background: '#FFF8F3', border: '1px solid rgba(0, 18, 60, 0.08)', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#5C6A86', fontWeight: '700', textTransform: 'uppercase' }}>Status</span>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: passed ? '#22C55E' : '#E65525', margin: '4px 0 0' }}>
                    {passed ? 'PASSED' : 'NOT PASSED'}
                  </p>
                </div>
              </div>

              {/* Status Notice & Actions */}
              {passed ? (
                <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ fontSize: '15px', color: '#00123C', margin: 0 }}>
                    Congratulations! You have passed the assessment and unlocked the Recruitment Task.
                  </p>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/offer-letter')}
                      style={{
                        background: 'linear-gradient(90deg, #00123C 0%, #E65525 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px 36px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 10px 24px rgba(230, 85, 37, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>📄</span> Sign & Download Offer Letter
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/task')}
                      style={{
                        background: '#FFFFFF',
                        color: '#00123C',
                        border: '2px solid #00123C',
                        borderRadius: '12px',
                        padding: '16px 36px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      Continue to Task →
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {attemptNumber < 3 ? (
                    <>
                      <p style={{ fontSize: '15px', color: '#00123C', margin: 0 }}>
                        You require 80% (40/50) to pass. You have {3 - attemptNumber} reattempt(s) remaining.
                      </p>
                      <div>
                        <button
                          type="button"
                          onClick={handleReattempt}
                          style={{
                            background: 'linear-gradient(90deg, #00123C 0%, #E65525 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px 48px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 10px 24px rgba(230, 85, 37, 0.2)'
                          }}
                        >
                          Reattempt Assessment ↺
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '12px',
                      padding: '18px',
                      color: '#991B1B',
                      fontSize: '15px',
                      fontWeight: '700'
                    }}>
                      Maximum attempts (3/3) reached. No further attempts available.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#5C6A86', fontSize: '15px', marginBottom: '20px' }}>
                No assessment result recorded yet. Please complete the assessment first.
              </p>
              <button
                type="button"
                onClick={() => navigate('/assessment')}
                style={{
                  background: 'linear-gradient(90deg, #00123C 0%, #E65525 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Go to Assessment →
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default ResultPage
