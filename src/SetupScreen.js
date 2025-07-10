import React, { useState } from 'react'
import { Baby, Plus } from 'lucide-react'

const SetupScreen = ({ onSetupComplete }) => {
  const [babyName, setBabyName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!babyName.trim() || !birthDate) return

    try {
      setLoading(true)
      await onSetupComplete(babyName.trim(), birthDate)
    } catch (error) {
      console.error('Setup error:', error)
      alert('Error setting up your account. Please try again.')
    } finally {
      setLoading(false)
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
      fontSize: '0.875rem',
      lineHeight: '1.4'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'left'
    },
    label: {
      fontSize: '1rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
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
      marginTop: '0.5rem'
    },
    note: {
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '1rem',
      fontSize: '0.875rem',
      color: '#0c4a6e',
      marginTop: '1rem'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <Baby size={24} />
          </div>
          <h1 style={styles.title}>Welcome to Feed Me!</h1>
        </div>
        
        <p style={styles.subtitle}>
          Let's set up your account by adding your first baby. This will create your family and you can invite your partner later.
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Baby's Name</label>
            <input
              type="text"
              placeholder="Emma"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label style={styles.label}>Birth Date</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              'Setting up...'
            ) : (
              <>
                <Plus size={20} />
                Create My Family
              </>
            )}
          </button>
        </form>
        
        <div style={styles.note}>
          💡 <strong>Tip:</strong> You can add more babies and invite family members (like your partner) from the settings page later.
        </div>
      </div>
    </div>
  )
}

export default SetupScreen