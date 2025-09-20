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
   // 실제 지갑 주소로 변경 필요

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 🌟 Outer glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 550, // 살짝 줄임
          height: 340,
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(closest-side, 
              rgba(64, 224, 208, 0.7), 
              rgba(32, 178, 170, 0.5) 40%, 
              rgba(20, 184, 166, 0.3) 60%, 
              rgba(16, 185, 129, 0.2) 80%, 
              transparent 95%
            )
          `,
          filter: 'blur(35px)',
          opacity: 0.9,
          animation: 'staticGlow 3s ease-in-out infinite',
        }}
      />
      
      {/* 🌟 Middle glow layer */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 300,
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(closest-side, 
              rgba(224, 255, 255, 0.6), 
              rgba(64, 224, 208, 0.4) 50%, 
              rgba(32, 178, 170, 0.3) 70%, 
              transparent 85%
            )
          `,
          filter: 'blur(20px)',
          opacity: 0.8,
          animation: 'staticGlow 3s ease-in-out infinite 0.3s',
        }}
      />
      
      {/* 🌟 Inner bright core */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 470,
          height: 270,
          pointerEvents: 'none',
          zIndex: 0,
          background: `
            radial-gradient(closest-side, 
              rgba(255, 255, 255, 0.5), 
              rgba(224, 255, 255, 0.3) 30%, 
              rgba(64, 224, 208, 0.2) 60%, 
              transparent 80%
            )
          `,
          filter: 'blur(10px)',
          opacity: 0.7,
          animation: 'staticGlow 3s ease-in-out infinite 0.6s',
        }}
      />

      {/* 🧊 The card with intense shimmer effect */}
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
          // 더 밝은 글래스 모피즘 배경
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          // 강렬한 빛나는 테두리와 그림자
          boxShadow: `
            0 0 25px rgba(64, 224, 208, 0.6),
            0 0 50px rgba(32, 178, 170, 0.4),
            0 0 75px rgba(20, 184, 166, 0.3),
            0 15px 45px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 0 20px rgba(224, 255, 255, 0.3)
          `,
          border: '2px solid rgba(64, 224, 208, 0.7)',
          color: '#1F2937',
          animation: 'cardStaticGlow 4s ease-in-out infinite', // 움직임 없는 글로우만
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
              color: '#2d2e3a',
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

      {/* CSS Animations */}
      <style>{`
        @keyframes staticGlow {
          0%, 100% {
            opacity: 0.7;
            filter: blur(35px);
          }
          50% {
            opacity: 1;
            filter: blur(30px);
          }
        }

        @keyframes cardStaticGlow {
          0%, 100% {
            box-shadow: 
              0 0 25px rgba(64, 224, 208, 0.6),
              0 0 50px rgba(32, 178, 170, 0.4),
              0 0 75px rgba(20, 184, 166, 0.3),
              0 15px 45px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.9),
              inset 0 0 20px rgba(224, 255, 255, 0.3);
            border: 2px solid rgba(64, 224, 208, 0.7);
          }
          50% {
            box-shadow: 
              0 0 35px rgba(64, 224, 208, 0.8),
              0 0 70px rgba(32, 178, 170, 0.6),
              0 0 105px rgba(20, 184, 166, 0.4),
              0 15px 45px rgba(0, 0, 0, 0.1),
              inset 0 2px 0 rgba(255, 255, 255, 0.95),
              inset 0 0 30px rgba(224, 255, 255, 0.5);
            border: 2px solid rgba(64, 224, 208, 0.9);
          }
        }
      `}</style>
    </div>
  );
};
