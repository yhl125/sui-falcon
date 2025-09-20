import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export const AccountInfo: React.FC = () => {
  const currentAccount = useCurrentAccount();

  // 지갑이 연결되지 않았으면 아무것도 렌더링하지 않음
  if (!currentAccount) {
    return null;
  }

  // 지갑 주소를 축약해서 표시 (앞 6자리 + ... + 뒤 4자리)
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 8px 20px rgba(0, 153, 204, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
        e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 153, 204, 0.18), 0 4px 12px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 153, 204, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
      title={currentAccount.address} // 호버 시 전체 주소 표시
    >
      <div
        style={{
          fontSize: '13px',
          color: 'rgba(0, 0, 0, 0.75)',
          fontWeight: '600',
          letterSpacing: '0.3px',
          fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
        }}
      >
        {formatAddress(currentAccount.address)}
      </div>
    </div>
  );
};

export default AccountInfo;