import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './LoginScreen';
import SetupScreen from './SetupScreen';
import FeedMeApp from './FeedMeApp';
import { useFamilies } from './useFamilies';
import { authService } from './authService';
import { familyService } from './familyService';
import './App.css';

const AppContent = () => {
  const { user, loading, signInWithMagicLink, recoverAccount, isAuthenticated } = useAuth();
  const { needsSetup, createFirstFamilyAndBaby, loading: familiesLoading, error: familiesError, selectedBaby, families, babies, loadData } = useFamilies();
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteProcessing, setInviteProcessing] = useState(false);

  // Check for invitation token in URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
      setInviteToken(inviteParam);
      // Clean URL after extracting token
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Process invitation after user is authenticated
  useEffect(() => {
    const processInvitation = async () => {
      if (inviteToken && isAuthenticated && !inviteProcessing) {
        try {
          setInviteProcessing(true);
          console.log('Processing invitation token:', inviteToken);
          
          const result = await familyService.joinFamilyWithInvitation(inviteToken);
          if (result.success) {
            console.log('Successfully joined family via invitation');
            alert('Welcome! You\'ve been added to the family and can now track feedings together.');
            // Refresh families to show the new family
            if (loadData) {
              await loadData();
            }
          }
        } catch (error) {
          console.error('Error processing invitation:', error);
          alert('Error joining family: ' + error.message);
        } finally {
          setInviteToken(null);
          setInviteProcessing(false);
        }
      }
    };

    processInvitation();
  }, [inviteToken, isAuthenticated, inviteProcessing, loadData]);

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
        inviteToken={inviteToken}
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
