import React from 'react';

interface WalletBalanceProps {
  balance: number;
  currency?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  currency = 'sui'
}) => {
  return (
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
          {balance.toFixed(2)}
        </span>
        <span style={{
          fontSize: '1.2rem',
          fontWeight: '500',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {currency}
        </span>
      </div>
    </div>
  );
};

export default WalletBalance;