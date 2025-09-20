import React from 'react';

interface WalletActionsProps {
  onDeposit?: () => void;
  onSend?: () => void;
}

export const WalletActions: React.FC<WalletActionsProps> = ({
  onDeposit,
  onSend
}) => {
  return (
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
  );
};

export default WalletActions;