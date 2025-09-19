import React from 'react';

interface WalletUIProps {
  visible: boolean;
  opacity: number;
}

export const WalletUI: React.FC<WalletUIProps> = ({ visible, opacity }) => {
  if (!visible) return null;

  return (
    <div
      className="wallet-ui"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity,
        transition: 'opacity 0.5s ease',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '16px',
        border: '3px solid #0099cc',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(12px)',
        textAlign: 'center',
        minWidth: '320px',
        maxWidth: '400px',
        color: '#333',
        fontFamily: '"Inter", "Segoe UI", sans-serif'
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          margin: '0 0 0.5rem 0',
          color: '#0099cc',
          fontSize: '1.8rem',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          SuiQ Wallet
        </h2>
        <p style={{
          margin: '0',
          opacity: 0.7,
          fontSize: '0.9rem',
          fontWeight: '400'
        }}>
          Your gateway to the Sui ecosystem
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <button style={{
          background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
        }}>
          Connect Wallet
        </button>

        <button style={{
          background: 'transparent',
          color: '#0099cc',
          border: '2px solid #0099cc',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          Create New Wallet
        </button>
      </div>

      <div style={{
        padding: '1rem',
        background: 'rgba(0, 153, 204, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 153, 204, 0.2)'
      }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          🔒 Secure • 🌊 Sui Network • ⚡ Fast
        </div>
      </div>
    </div>
  );
};

export default WalletUI;