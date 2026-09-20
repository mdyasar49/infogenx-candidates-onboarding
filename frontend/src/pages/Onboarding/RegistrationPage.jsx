import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import './RegistrationPage.css'

function RegistrationPage() {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdAffcQaR1oRuv_NwT5D-MrnGbjPq0EE_cka6jAZ5FjEgt0WA/viewform?usp=sharing&ouid=101109227624004877778";

  return (
    <section className="register-shell">
      <div className="register-card">
        <div className="register-brand">
          <img src={logo} alt="Infogenx logo" />
          <span>Candidate Onboarding Portal</span>
        </div>
        <h1>Candidate <span className="heading-accent">Registration</span></h1>
        <p>
          Please complete your application via the official Infogenx Google Form. 
          Upon submission, your account credentials will be automatically generated and sent to your email.
        </p>

        <div className="form-actions" style={{ marginTop: '28px' }}>
          <a 
            href={formUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="primary-button"
            style={{ display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
          >
            Open Candidate Application Form →
          </a>
          <Link to="/login" className="secondary-button" style={{ display: 'inline-block', textAlign: 'center' }}>
            Already registered? Login here
          </Link>
        </div>

        <div className="register-footer" style={{ marginTop: '24px' }}>
          <p>By submitting, your profile will be registered in the Infogenx Recruitment Management System.</p>
        </div>
      </div>
    </section>
  )
}

export default RegistrationPage
