import React from 'react';

interface WalletUIProps {
  // Props for future contract integration
  accountAddress?: string;
  balance?: number;
  onDeposit?: () => void;
  onSend?: () => void;
}

export const WalletUI: React.FC<WalletUIProps> = ({
  accountAddress = "0x1234...abcd",
  balance = 27.2,
  onDeposit,
  onSend
}) => {
  return (
    <div
      className="wallet-container"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(20px)',
        width: '90%',
        maxWidth: '600px',
        minWidth: '320px',
        color: '#333',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        // Floating animation
        animation: 'walletFloat 4s ease-in-out infinite'
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: '500'
        }}>
          <span style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.25rem',
            display: 'block'
          }}>
            Logged-in Account
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '1rem',
            color: '#333'
          }}>
            {accountAddress}
          </span>
        </div>
        <div style={{ width: '100px' }}>
          {/* Reserved space for future info */}
        </div>
      </div>

      {/* Balance Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <span style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#0099cc',
            lineHeight: '1'
          }}>
            {balance}
          </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '500',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            sui
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <button
          onClick={onDeposit}
          style={{
            background: 'transparent',
            color: '#0099cc',
            border: '2px solid #0099cc',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Deposit
        </button>

        <button
          onClick={onSend}
          style={{
            background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 153, 204, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 153, 204, 0.3)';
          }}
        >
          Send
        </button>
      </div>

      {/* CSS keyframes for floating animation */}
      <style>{`
        @keyframes walletFloat {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default WalletUI;