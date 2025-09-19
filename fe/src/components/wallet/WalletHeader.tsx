import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

export const WalletHeader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem', // 텍스트와 버튼 사이 간격
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <span
        style={{
          fontSize: '0.9rem',
          color: '#666',
          fontWeight: '500',
        }}
      >
        Connected Account : 
      </span>

      <ConnectButton />
    </div>
  );
};

export default WalletHeader;
