import React, { useState } from 'react'
import { Mail, ArrowRight, Baby, HelpCircle } from 'lucide-react'

const LoginScreen = ({ onSignIn, onRecover, inviteToken }) => {
  // Check for pending invitation in sessionStorage as well
  const pendingInvite = inviteToken || (typeof window !== 'undefined' && sessionStorage.getItem('pendingInvitation'));
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [babyName, setBabyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [recoveryEmails, setRecoveryEmails] = useState([])
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setLoading(true)
      await onSignIn(email.trim(), pendingInvite)
      setMagicLinkSent(true)
    } catch (error) {
      console.error('Login error:', error)
      alert('Error sending magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecovery = async (e) => {
    e.preventDefault()
    if (!babyName.trim() || !birthDate) return

    try {
      setRecoveryLoading(true)
      const emails = await onRecover(babyName.trim(), birthDate)
      setRecoveryEmails(emails)
    } catch (error) {
      console.error('Recovery error:', error)
      alert('No account found with that baby information.')
    } finally {
      setRecoveryLoading(false)
    }
  }

  const styles = {
    container: {
      maxWidth: '28rem',
      margin: '0 auto',
      backgroundColor: '#f7f7f7',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    },
    icon: {
      backgroundColor: '#00704a',
      padding: '0.75rem',
      borderRadius: '50%',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      marginBottom: '2rem',
      fontSize: '0.875rem'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    input: {
      width: '100%',
      padding: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      backgroundColor: '#00704a',
      color: 'white',
      fontWeight: '600',
      padding: '0.875rem',
      borderRadius: '8px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      disabled: { opacity: 0.6, cursor: 'not-allowed' }
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#00704a',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginTop: '1rem'
    },
    successMessage: {
      backgroundColor: '#ecfdf5',
      border: '1px solid #d1fae5',
      borderRadius: '8px',
      padding: '1rem',
      color: '#065f46',
      fontSize: '0.875rem',
      marginTop: '1rem'
    },
    recoveryCard: {
      backgroundColor: '#fef7ff',
      border: '1px solid #e9d5ff',
      borderRadius: '8px',
      padding: '1rem',
      marginTop: '1rem',
      textAlign: 'left'
    },
    emailList: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '1rem',
      marginTop: '1rem'
    }
  }

  if (magicLinkSent) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.icon}>
              <Mail size={24} />
            </div>
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1.5rem',
            lineHeight: '1.4'
          }}>
            A full night's sleep is now a bit closer.
          </h2>
          <div style={{
            fontSize: '1.125rem',
            color: '#4b5563',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            <p style={{margin: '0 0 1rem 0'}}>
              Go check your email.
            </p>
            <p style={{margin: '0 0 1rem 0'}}>
              Tap that link.
            </p>
            <p style={{margin: '0'}}>
              Create your account.
            </p>
          </div>
          <p style={{
            ...styles.subtitle, 
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            We sent a magic link to <strong>{email}</strong>
          </p>
          <button 
            onClick={async () => {
              try {
                setLoading(true);
                await onSignIn(email.trim(), pendingInvite);
                // Keep the confirmation screen showing
              } catch (error) {
                console.error('Resend error:', error);
                alert('Error resending magic link. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: '#007AFF',
              fontWeight: '400',
              border: '1px solid #007AFF',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
              disabled: loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}
            }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Resend link'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <Baby size={24} />
          </div>
          <h1 style={styles.title}>Feed Me</h1>
        </div>
        
        {!showRecovery ? (
          <>
            {pendingInvite ? (
              <div style={{marginBottom: '1.5rem'}}>
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    margin: '0 0 0.5rem 0'
                  }}>
                    🎉 You've been invited to join a family!
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#0369a1',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Sign in or create an account to start tracking feedings together.
                  </p>
                </div>
                <p style={styles.subtitle}>
                  Enter your email to get a magic link
                </p>
              </div>
            ) : (
              <p style={styles.subtitle}>
                Enter your email to get a magic link for instant sign in
              </p>
            )}
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                disabled={loading}
              />
              
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(loading ? styles.button.disabled : {})
                }}
                disabled={loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send Magic Link
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
            
            <button
              onClick={() => setShowRecovery(true)}
              style={styles.linkButton}
            >
              <HelpCircle size={14} style={{verticalAlign: 'middle', marginRight: '4px'}} />
              Forgot your email?
            </button>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>
              Enter your baby's information to find your account
            </p>
            
            <form onSubmit={handleRecovery} style={styles.form}>
              <input
                type="text"
                placeholder="Baby's name"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                style={styles.input}
                required
                disabled={recoveryLoading}
              />
              
              <input
                type="date"
                placeholder="Birth date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={styles.input}
                required
                disabled={recoveryLoading}
              />
              
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(recoveryLoading ? styles.button.disabled : {})
                }}
                disabled={recoveryLoading}
              >
                {recoveryLoading ? 'Searching...' : 'Find My Account'}
              </button>
            </form>
            
            {recoveryEmails.length > 0 && (
              <div style={styles.emailList}>
                <p style={{margin: '0 0 0.5rem 0', fontWeight: '600', color: '#0369a1'}}>
                  Found your account(s):
                </p>
                {recoveryEmails.map((email, index) => (
                  <p key={index} style={{margin: '0.25rem 0', fontFamily: 'monospace'}}>
                    {email}
                  </p>
                ))}
                <p style={{margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#6b7280'}}>
                  Use one of these emails above to sign in.
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                setShowRecovery(false)
                setRecoveryEmails([])
                setBabyName('')
                setBirthDate('')
              }}
              style={styles.linkButton}
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginScreen