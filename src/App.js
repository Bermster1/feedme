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
      console.log('Found invitation token in URL:', inviteParam);
      setInviteToken(inviteParam);
      // Store in sessionStorage so it persists through magic link redirect
      sessionStorage.setItem('pendingInvitation', inviteParam);
      // Clean URL after extracting token
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      // Check if we have a pending invitation from sessionStorage
      const pendingInvite = sessionStorage.getItem('pendingInvitation');
      if (pendingInvite) {
        console.log('Found pending invitation in sessionStorage:', pendingInvite);
        setInviteToken(pendingInvite);
      }
    }
  }, []);

  // Process invitation after user is authenticated (don't wait for families to load)
  useEffect(() => {
    const processInvitation = async () => {
      if (inviteToken && isAuthenticated && !inviteProcessing) {
        try {
          setInviteProcessing(true);
          console.log('Processing invitation token:', inviteToken);
          
          const result = await familyService.joinFamilyWithInvitation(inviteToken);
          if (result.success) {
            console.log('Successfully joined family via invitation');
            // Clear the pending invitation from sessionStorage
            sessionStorage.removeItem('pendingInvitation');
            // Refresh families to show the new family
            if (loadData) {
              await loadData();
            }
            alert('Welcome! You\'ve been added to the family and can now track feedings together.');
          }
        } catch (error) {
          console.error('Error processing invitation:', error);
          alert('Error joining family: ' + error.message);
        } finally {
          setInviteToken(null);
          setInviteProcessing(false);
          // Clean up sessionStorage on any completion (success or error)
          sessionStorage.removeItem('pendingInvitation');
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

  // Show loading while processing invitation (even if not authenticated yet)
  if (inviteProcessing) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <div style={{marginBottom: '1rem'}}>🎉</div>
        <div>Joining your family...</div>
        <div style={{fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem'}}>
          Please wait while we add you to the family
        </div>
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

  if (needsSetup && !inviteToken && !inviteProcessing) {
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
