import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

interface WalletHeaderProps {
  address?: string;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ address }) => {
  return (
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
          Connected Account
        </span>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '1rem',
          color: '#333'
        }}>
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
        </span>
      </div>
      <div style={{ width: '100px' }}>
        <ConnectButton />
      </div>
    </div>
  );
};

export default WalletHeader;