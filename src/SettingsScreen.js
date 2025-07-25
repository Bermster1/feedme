import React, { useState } from 'react';
import { ChevronRight, X, Users, Baby, Plus } from 'lucide-react';
import { familyService } from './familyService';
import { useFamilies } from './useFamilies';
import { useAuth } from './AuthContext';

const SettingsScreen = ({ onClose }) => {
  console.log('SettingsScreen component loaded!'); // Debug log
  const [currentView, setCurrentView] = useState('main'); // 'main', 'invite', 'family-details'
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const { selectedBaby, activeBabies, families } = useFamilies();
  const { signOut } = useAuth();

  // Generate invitation link and share directly
  const handleGenerateInviteLink = async () => {
    if (!selectedBaby?.family_id) {
      alert('No family selected. Please select a baby first.');
      return;
    }

    try {
      setInviteLoading(true);
      const result = await familyService.generateInvitationLink(selectedBaby.family_id);
      
      if (result.success) {
        // Directly open native share sheet if available
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Join my baby feeding tracker',
              text: 'Join my family on Feed Me to track baby feedings together!',
              url: result.inviteUrl
            });
          } catch (shareError) {
            // User cancelled share or share failed, fallback to clipboard
            if (shareError.name !== 'AbortError') {
              console.warn('Share failed, copying to clipboard:', shareError);
              await navigator.clipboard.writeText(result.inviteUrl);
              alert('Link copied to clipboard!');
            }
          }
        } else {
          // Fallback: copy to clipboard and show alert
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(result.inviteUrl);
              alert('Link copied to clipboard! You can now paste it in any app to share.');
            } else {
              // Final fallback: show the link
              prompt('Copy this invitation link to share:', result.inviteUrl);
            }
          } catch (clipboardError) {
            console.warn('Clipboard copy failed, showing link:', clipboardError);
            prompt('Copy this invitation link to share:', result.inviteUrl);
          }
        }
      } else {
        throw new Error('Failed to generate invitation link');
      }
    } catch (error) {
      console.error('Error generating invitation link:', error);
      alert(`Failed to generate invitation link. Please try again.\n\nError: ${error.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f5f5f7',
      zIndex: 1000,
      overflow: 'auto'
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      color: '#6b7280'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      color: '#6b7280'
    },
    content: {
      paddingBottom: '2rem'
    },
    section: {
      backgroundColor: 'white',
      marginTop: '1rem',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb'
    },
    sectionItem: {
      padding: '1rem',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      backgroundColor: 'white'
    },
    sectionItemLast: {
      borderBottom: 'none'
    },
    itemLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    itemIcon: {
      width: '24px',
      height: '24px',
      color: '#6b7280'
    },
    itemText: {
      fontSize: '1rem',
      color: '#1f2937',
      fontWeight: '400'
    },
    itemSubtext: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    chevron: {
      color: '#d1d5db'
    },
    inviteButton: {
      backgroundColor: '#00704a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    inviteSection: {
      backgroundColor: 'white',
      margin: '1rem',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    inviteTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    inviteSubtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1.5rem',
      lineHeight: '1.5'
    }
  };

  // Main Settings View
  const MainSettingsView = () => (
    <>
      {/* Invite Section - Prominent at top */}
      <div style={styles.inviteSection}>
        <h3 style={styles.inviteTitle}>Invite your partner or caregiver</h3>
        <p style={styles.inviteSubtitle}>
          Share feeding tracking with family members so everyone knows when baby was last fed.
        </p>
        <button
          onClick={handleGenerateInviteLink}
          disabled={inviteLoading}
          style={{
            ...styles.inviteButton,
            opacity: inviteLoading ? 0.6 : 1,
            cursor: inviteLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {inviteLoading ? (
            'Generating...'
          ) : (
            <>
              <Plus size={20} />
              Get my share link
            </>
          )}
        </button>
      </div>

      {/* Settings Options */}
      <div style={styles.section}>
        <div 
          style={styles.sectionItem}
          onClick={() => setCurrentView('family-details')}
        >
          <div style={styles.itemLeft}>
            <Baby style={styles.itemIcon} />
            <div>
              <div style={styles.itemText}>My Family Details</div>
              <div style={styles.itemSubtext}>
                {selectedBaby ? `${selectedBaby.name} and family info` : 'View family information'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} style={styles.chevron} />
        </div>
      </div>

      {/* Account Section */}
      <div style={styles.section}>
        <div style={{...styles.sectionItem, ...styles.sectionItemLast}}>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to sign out?')) {
                await signOut();
                onClose();
              }
            }}
            style={{
              width: '100%',
              padding: '0',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={styles.itemText}>Sign Out</div>
          </button>
        </div>
      </div>
    </>
  );

  // Family Details View
  const FamilyDetailsView = () => (
    <div style={styles.content}>
      {selectedBaby && (
        <div style={styles.section}>
          <div style={{...styles.sectionItem, borderBottom: '1px solid #f3f4f6'}}>
            <div style={styles.itemLeft}>
              <Baby style={styles.itemIcon} />
              <div>
                <div style={styles.itemText}>{selectedBaby.name}</div>
                <div style={styles.itemSubtext}>
                  Born: {new Date(selectedBaby.birth_date).toLocaleDateString()}
                </div>
                <div style={styles.itemSubtext}>
                  Age: {Math.floor((new Date() - new Date(selectedBaby.birth_date)) / (1000 * 60 * 60 * 24 * 7))} weeks old
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Future: Multiple families/babies will show here */}
      {activeBabies.length > 1 && (
        <div style={styles.section}>
          <div style={{padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb'}}>
            <div style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151'}}>
              All Babies ({activeBabies.length})
            </div>
          </div>
          {activeBabies.map((baby, index) => (
            <div 
              key={baby.id} 
              style={{
                ...styles.sectionItem,
                ...(index === activeBabies.length - 1 ? styles.sectionItemLast : {})
              }}
            >
              <div style={styles.itemLeft}>
                <Baby style={styles.itemIcon} />
                <div>
                  <div style={styles.itemText}>{baby.name}</div>
                  <div style={styles.itemSubtext}>
                    {new Date(baby.birth_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {selectedBaby?.id === baby.id && (
                <div style={{
                  backgroundColor: '#00704a',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Current
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        {currentView !== 'main' && (
          <button 
            onClick={() => setCurrentView('main')}
            style={styles.backButton}
          >
            <ChevronRight size={24} style={{transform: 'rotate(180deg)'}} />
          </button>
        )}
        <h1 style={styles.headerTitle}>
          {currentView === 'main' && 'Settings'}
          {currentView === 'family-details' && 'My Family'}
        </h1>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {currentView === 'main' && <MainSettingsView />}
        {currentView === 'family-details' && <FamilyDetailsView />}
      </div>
    </div>
  );
};

export default SettingsScreen;