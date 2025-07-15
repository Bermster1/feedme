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
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Check for invitation token in URL on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    if (inviteParam) {
      console.log('Found invitation token in URL:', inviteParam);
      setInviteToken(inviteParam);
      // Try to store in sessionStorage but don't fail if unavailable (incognito mode)
      try {
        sessionStorage.setItem('pendingInvitation', inviteParam);
      } catch (error) {
        console.warn('SessionStorage not available (incognito mode?), keeping token in URL');
      }
      // Keep URL clean but don't remove token yet - we'll do that after processing
    } else {
      // Check if we have a pending invitation from sessionStorage
      try {
        const pendingInvite = sessionStorage.getItem('pendingInvitation');
        if (pendingInvite) {
          console.log('Found pending invitation in sessionStorage:', pendingInvite);
          setInviteToken(pendingInvite);
        }
      } catch (error) {
        console.warn('SessionStorage not available, will rely on URL token');
      }
    }
  }, []);

  // Add loading timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading || familiesLoading) {
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [loading, familiesLoading]);

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
            // Clear the pending invitation from sessionStorage (if available)
            try {
              sessionStorage.removeItem('pendingInvitation');
            } catch (error) {
              console.warn('SessionStorage not available for cleanup');
            }
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
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
          try {
            sessionStorage.removeItem('pendingInvitation');
          } catch (error) {
            console.warn('SessionStorage not available for cleanup');
          }
          // Clean up URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
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
    user: user?.email,
    inviteToken: inviteToken ? 'present' : 'none',
    inviteProcessing,
    loading,
    loadingTimeout
  });

  if (loading || familiesLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1rem',
        color: '#6b7280',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>Loading...</div>
        {loadingTimeout && (
          <div style={{
            marginTop: '1rem',
            color: '#dc2626',
            fontSize: '0.875rem'
          }}>
            <div>Loading is taking longer than expected.</div>
            <div style={{marginTop: '0.5rem'}}>
              This might be due to incognito mode storage restrictions.
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}
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
