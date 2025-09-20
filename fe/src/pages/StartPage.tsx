// src/pages/StartPage.tsx
import React, { useState, useEffect } from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import { HybridWallet } from '../lib/HybridWallet';
import { useFalcon } from '../hooks/useFalcon';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';


interface StartPageProps {
  onStart: () => void;
}


export const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [showConnectButton, setShowConnectButton] = useState(false);
  
  // Check wallet connection status
  const currentAccount = useCurrentAccount();

  // Initialize Falcon automatically when component mounts
  const { 
    isLoading, 
    isInitialized, 
    error, 
    currentStep 
  } = useFalcon({
    autoInitialize: true,
    onProgress: (step, progress) => {
      // Reduced logging to major steps only to prevent console spam
      if (progress === 0 || progress === 25 || progress === 50 || progress === 75 || progress === 100) {
        console.log(`Falcon Init: ${step}`);
      }
    },
    onComplete: () => {
      console.log('✅ Falcon initialization completed!');
      setIsWalletReady(true);
      // Show connect wallet button after a brief delay
      setTimeout(() => setShowConnectButton(true), 500);
    },
    onError: (error) => {
      console.error('❌ Falcon initialization failed:', error);
      // Still show connect button to allow manual proceed (fallback)
      setTimeout(() => setShowConnectButton(true), 1000);
    }
  });

  // Automatically proceed to wallet page when wallet is connected
  useEffect(() => {
    if (currentAccount && isInitialized) {
      // Initialize HybridWallet and check for Falcon keys
      const wallet = new HybridWallet();
      wallet.init();
      
      if (wallet.hasFalconKeys()) {
        // Falcon 키가 있으면 바로 지갑 페이지로 이동
        console.log("✅ Wallet initialized with Falcon keys:", wallet);
        setTimeout(() => onStart(), 1000); // Small delay for smooth transition
      } else {
        // Falcon 키가 없으면 여기서는 아무것도 하지 않음 (WalletUI에서 처리)
        console.log("⚠️ Wallet connected but no Falcon keys - will need to generate");
        setTimeout(() => onStart(), 1000); // 여전히 지갑 페이지로 이동 (WalletUI에서 키 생성 처리)
      }
    }
  }, [currentAccount, isInitialized, onStart]);


  return (
    <UnderWaterScene animationEnabled={!isLoading}>
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
              fontFamily: 'monospace',
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

        {/* Loading Spinner or Start Button */}
        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            minWidth: '300px'
          }}>
            {/* Loading Spinner */}
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
            }}>
              {/* Outer Ring */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                border: '3px solid rgba(64, 224, 208, 0.1)',
                borderRadius: '50%',
              }} />
              
              {/* Spinning Ring */}
              <div style={{
                position: 'absolute',
                width: '80px',
                height: '80px',
                border: '3px solid transparent',
                borderTop: '3px solid #40E0D0',
                borderRight: '3px solid #40E0D0',
                borderRadius: '50%',
                animation: 'falconSpin 2s linear infinite',
              }} />
              
              {/* Inner Pulsing Circle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '40px',
                height: '40px',
                background: 'radial-gradient(circle, rgba(64, 224, 208, 0.3), transparent)',
                borderRadius: '50%',
                animation: 'falconPulse 1.5s ease-in-out infinite',
              }} />
              
              {/* Center Icon */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#40E0D0',
                textShadow: '0 0 10px rgba(64, 224, 208, 0.8)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.86C16.16 26.74 20 22.55 20 17V7l-8-5z"/>
                </svg>
              </div>
            </div>
            
            {/* Status Text */}
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1rem',
              color: 'rgba(224, 255, 255, 0.9)',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(64, 224, 208, 0.6)',
              minHeight: '1.5rem',
              fontWeight: '500',
            }}>
              Initializing Falcon Security...
            </div>
            
            {/* Simplified Animated Dots */}
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#40E0D0',
                    animation: `dotPulse 1.5s ease-in-out infinite`,
                    animationDelay: `${index * 0.15}s`,
                    boxShadow: '0 0 8px rgba(64, 224, 208, 0.6)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div style={{
            background: 'rgba(255, 69, 0, 0.1)',
            border: '2px solid rgba(255, 69, 0, 0.5)',
            borderRadius: '8px',
            padding: '1rem',
            color: '#FF6347',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ⚠️ Falcon Initialization Failed
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              You can still proceed, but some advanced features may be limited.
            </div>
          </div>
        )}

        {/* Connect Wallet Button - appears when Falcon is ready */}
        {showConnectButton && !currentAccount && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem'
          }}>
            <div style={{
              color: 'rgba(224, 255, 255, 0.8)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              textAlign: 'center',
              textShadow: '0 0 8px rgba(64, 224, 208, 0.4)',
              marginBottom: '0.2rem',
              opacity: 0.9
            }}>
              {isWalletReady ? '' : '⚠️ Standard Mode'}
            </div>
            
            <div style={{
              position: 'relative',
              animation: 'subtleFloat 4s ease-in-out infinite'
            }}>
              {/* Glass morphism background for button */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg, 
                  ${isWalletReady 
                    ? 'rgba(64, 224, 208, 0.15)' 
                    : 'rgba(255, 165, 0, 0.15)'}, 
                  ${isWalletReady 
                    ? 'rgba(32, 178, 170, 0.25)' 
                    : 'rgba(255, 140, 0, 0.25)'})`,
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${isWalletReady 
                  ? 'rgba(64, 224, 208, 0.3)' 
                  : 'rgba(255, 165, 0, 0.3)'}`,
                boxShadow: `
                  0 8px 32px ${isWalletReady 
                    ? 'rgba(64, 224, 208, 0.2)' 
                    : 'rgba(255, 165, 0, 0.2)'},
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }} />
              
              <ConnectButton style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                color: '#E0FFFF',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '12px',
                letterSpacing: '0.05em',
                transition: 'all 0.3s ease',
                textShadow: `0 0 10px ${isWalletReady 
                  ? 'rgba(64, 224, 208, 0.8)' 
                  : 'rgba(255, 165, 0, 0.8)'}`,
                zIndex: 1
              }} />
            </div>
          </div>
        )}

        {/* Show connecting status when wallet is being connected */}
        {currentAccount && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.8rem',
            background: 'rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '2px solid transparent',
              borderTop: '2px solid #10B981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              color: '#6EE7B7',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              textAlign: 'center',
              textShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              fontWeight: '500'
            }}>
              🎉 Connected<br />
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Launching SuiQ...
              </span>
            </div>
          </div>
        )}
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

        @keyframes falconSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes falconPulse {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes dotPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes subtleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
      `}</style>
    </UnderWaterScene>
  );
};

export default StartPage;
