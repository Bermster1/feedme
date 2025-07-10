import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import SetupScreen from './SetupScreen';
import FeedMeApp from './FeedMeApp';
import { useFamilies } from './useFamilies';
import { authService } from './authService';
import './App.css';

const AppContent = () => {
  const { user, loading, signInWithMagicLink, recoverAccount, isAuthenticated } = useAuth();
  const { needsSetup, createFirstFamilyAndBaby, loading: familiesLoading, error: familiesError, selectedBaby, families, babies } = useFamilies();

  // Production version with authentication
  console.log('Feed Me App - Authentication System Active');
  
  // Debug logging
  console.log('App state:', { 
    isAuthenticated, 
    needsSetup, 
    familiesLoading, 
    familiesError, 
    selectedBaby,
    families: families?.length,
    babies: babies?.length,
    user: user?.email 
  });

  if (loading || familiesLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  // Show error if Supabase is not configured
  if (familiesError && familiesError.message && familiesError.message.includes('fetch')) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontSize: '1rem',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <h2 style={{marginBottom: '1rem'}}>Configuration Error</h2>
        <p style={{marginBottom: '1rem'}}>
          Supabase is not configured. Please check the console for details.
        </p>
        <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem'}}>
          You need to set up your Supabase environment variables.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onSignIn={signInWithMagicLink}
        onRecover={recoverAccount}
      />
    );
  }

  if (needsSetup) {
    return (
      <SetupScreen 
        onSetupComplete={createFirstFamilyAndBaby}
      />
    );
  }

  return <FeedMeApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
