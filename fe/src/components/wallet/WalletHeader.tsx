import React from 'react';

export const WalletHeader: React.FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1
        style={{
          fontSize: '2.2rem',
          color: '#0099cc',
          fontWeight: '600',
          margin: '0',
          background: 'linear-gradient(135deg, #0099cc, #00bcd4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.5px',
        }}
      >
        Your Coins
      </h1>
      <p
        style={{
          fontSize: '0.85rem',
          color: '#666',
          margin: '8px 0 0 0',
          fontWeight: '400',
        }}
      >
        Manage your digital assets
      </p>
    </div>
  );
};

export default WalletHeader;
