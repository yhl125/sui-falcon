import React from 'react';
import { type FalconKeys } from '../../hooks/useFalcon';

interface MainContentProps {
  balance: number;
  onSend?: () => void;
  onDeposit?: () => void;
  // Falcon functionality
  falconKeys?: FalconKeys | null;
  isFalconReady?: boolean;
  falconError?: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({
  balance,
  onSend,
  onDeposit,
  falconKeys,
  isFalconReady,
  falconError,
}) => {
  const walletAddress = '0xa249e...18ce'; // 실제 지갑 주소로 변경 필요

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 🔆 White glow behind the card */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520, // 카드보다 살짝 크게
          height: 300,
          pointerEvents: 'none',
          zIndex: 0,
          // 중앙이 가장 밝고 바깥이 사라지는 흰색 오라
          background:
            'radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0.45) 50%, transparent 70%)',
          filter: 'blur(28px)', // 퍼짐 정도 (키워드!)
          opacity: 0.8, // 전체 강도
        }}
      />

      {/* 🧊 The card (now actually white, not just transparent) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          width: 460,
          minHeight: 220,
          padding: 32,
          borderRadius: 16,
          // 진짜 흰색에 가까운 반투명 (투명도 너무 낮으면 “투명해 보이기만” 함)
          background: 'rgba(255,255,255,0.88)',
          // 글래스 느낌을 조금만 (옵션)
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          // 살짝의 그림자(글로우와 겹쳐 깊이감)
          boxShadow: '0 10px 35px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.7)',
          color: '#1F2937',
        }}
      >
        {/* Balance Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: '700',
              marginBottom: '12px',
            }}
          >
            ${balance.toFixed(3)}
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#8b92a0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            {walletAddress}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#8b92a0',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              📋
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <button
            onClick={onSend}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '24px',
              border: 'none',
              background: '#2d2e3a',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3d3e4a';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2d2e3a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Send
          </button>
          <button
            onClick={onDeposit}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '24px',
              border: 'none',
              background: '#2d2e3a',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3d3e4a';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2d2e3a';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Deposit
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '30px',
            borderBottom: '1px solid #2d2e3a',
            marginBottom: '30px',
            paddingBottom: '10px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              cursor: 'pointer',
              paddingBottom: '10px',
              borderBottom: '2px solid #4a9eff',
            }}
          >
            Tokens
          </div>
        </div>

        {/* Token List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* SUI Token */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 0',
              borderBottom: '1px solid #2d2e3a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4a9eff, #6ab7ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                💧
              </div>
              <div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  SUI
                  <span
                    style={{
                      background: '#4a9eff',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </span>
                </div>
                <div style={{ color: '#8b92a0', fontSize: '14px' }}>
                  {`${balance.toFixed(3)} SUI`}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>
                ${balance.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
