// src/pages/StartPage.tsx
import React from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import { HybridWallet } from '../lib/HybridWallet';


interface StartPageProps {
  onStart: () => void;
}


export const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const handleStart = () => {
    const wallet = new HybridWallet();
    wallet.init(); // 🔥 localStorage에 falcon 키 저장
    console.log("✅ Wallet initialized:", wallet);

    // TODO: 이후 페이지 전환이나 App 상태 업데이트 연결 가능
    onStart(); 
  };

  return (
    <UnderWaterScene>
      {/* Centered Container with Logo, Subtitle, and Button */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2rem'
        }}
      >
        {/* App Logo Text */}
        <div style={{ animation: 'logoShimmer 3s ease-in-out infinite' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              fontFamily: 'Nostalgia, monospace',
              fontWeight: 'bold',
              color: '#E0FFFF',
              textShadow: `
                0 0 10px rgba(224, 255, 255, 0.8),
                0 0 20px rgba(64, 224, 208, 0.6),
                0 0 30px rgba(32, 178, 170, 0.4)
              `,
              margin: 0,
              letterSpacing: '0.1em',
              imageRendering: 'pixelated'
            }}
          >
            SuiQ
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
              fontFamily: 'monospace',
              color: 'rgba(224, 255, 255, 0.8)',
              margin: '0.5rem 0 0 0',
              letterSpacing: '0.05em'
            }}
          >
            Dive into the Sui Ecosystem
          </p>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          style={{
            background: 'rgba(32, 178, 170, 0.7)',
            border: '3px solid #40E0D0',
            color: '#FFFFFF',
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '0px', // Pixel art style
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transition: 'all 0.2s ease',
            boxShadow: `
              0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            imageRendering: 'pixelated',
            animation: 'buttonFloat 3s ease-in-out infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `
              0 6px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `;
            e.currentTarget.style.background = 'rgba(32, 178, 170, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = `
              0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `;
            e.currentTarget.style.background = 'rgba(32, 178, 170, 0.7)';
          }}
        >
          Start
        </button>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes logoShimmer {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(224, 255, 255, 0.8),
              0 0 20px rgba(64, 224, 208, 0.6),
              0 0 30px rgba(32, 178, 170, 0.4);
            transform: translateY(0px);
          }
          50% {
            text-shadow:
              0 0 15px rgba(224, 255, 255, 1),
              0 0 25px rgba(64, 224, 208, 0.8),
              0 0 35px rgba(32, 178, 170, 0.6);
            transform: translateY(-5px);
          }
        }

        @keyframes buttonFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </UnderWaterScene>
  );
};

export default StartPage;
