import React from 'react';

interface TransferModalProps {
  isOpen: boolean;
  recipient: string;
  amount: string;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  recipient,
  amount,
  onRecipientChange,
  onAmountChange,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const isValid = recipient && amount;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          marginBottom: '1.5rem',
          color: '#333',
          textAlign: 'center',
          margin: '0 0 1.5rem 0'
        }}>
          Send SUI
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#666',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="0x..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: '#666',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Amount (SUI)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.1"
            step="0.1"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid}
            style={{
              background: isValid ? '#0099cc' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;