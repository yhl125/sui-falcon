import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';

export const AccountInfo: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: '0 12px 32px rgba(0, 153, 204, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: 'auto',
        minWidth: 'auto',
        maxWidth: 'auto',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 153, 204, 0.2), 0 8px 24px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 153, 204, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: 'rgba(0, 0, 0, 0.6)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '1px',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}
      >
        Connected Account
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ConnectButton />
      </div>
      
      {/* Subtle animated background effect */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AccountInfo;