import React from 'react';
import { type FalconKeys } from '../../hooks/useFalcon';
import { type HybridWallet } from '../../lib/HybridWallet';

interface MainContentProps {
  // Action handlers
  onSend?: () => void;
  onDeposit?: () => void;
  // Falcon functionality
  falconKeys?: FalconKeys | null;
  // Hybrid Wallet functionality
  hybridWallet?: HybridWallet | null;
  hybridWalletId?: string | null;
  hybridWalletBalance?: bigint;
  hasHybridWallet?: boolean;
  isHybridWalletLoading?: boolean;
  hybridWalletError?: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({
  onSend,
  onDeposit,
  falconKeys,
  hybridWallet,
  hybridWalletId,
  hybridWalletBalance,
  hasHybridWallet,
  isHybridWalletLoading,
  hybridWalletError,
}) => {
  // Import MIST_PER_SUI for conversion
  const MIST_PER_SUI = BigInt(1000000000);
  
  // Helper functions for data formatting
  const formatAddress = (address: string | null) => {
    if (!address) return 'Not Available';
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };
  
  const formatSuiBalance = (balanceBigInt: bigint | undefined) => {
    if (!balanceBigInt) return 0;
    return Number(balanceBigInt) / Number(MIST_PER_SUI);
  };

  // Falcon public key JSON을 0x 형태로 변환
  const formatFalconPublicKey = (falconKeys: FalconKeys | null) => {
    if (!falconKeys) return 'Not Available';
    
    try {
      const keyData = JSON.parse(falconKeys.publicKey);
      if (keyData.pk && Array.isArray(keyData.pk)) {
        // pk 배열을 hex string으로 변환
        const hexValues = keyData.pk.map((num: number) => {
          // 각 숫자를 4바이트 little-endian hex로 변환
          const hex = num.toString(16).padStart(4, '0');
          return hex;
        }).join('');
        return `0x${hexValues}`;
      }
    } catch (error) {
      console.error('Failed to parse Falcon public key:', error);
    }
    return 'Invalid Format';
  };

  // Ed25519 public key를 0x 형태로 변환
  const formatEd25519PublicKey = (ed25519_pubkey: Uint8Array | null) => {
    if (!ed25519_pubkey) return 'Not Available';
    
    const hexString = Array.from(ed25519_pubkey)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    return `0x${hexString}`;
  };
  
  // Process hybrid wallet data
  const hybridSuiBalance = formatSuiBalance(hybridWalletBalance);
  const formattedWalletId = formatAddress(hybridWalletId);
  const formattedFalconPubKey = formatFalconPublicKey(falconKeys);
  const formattedEd25519PubKey = formatEd25519PublicKey(hybridWallet?.ed25519_pubkey || null);
  

  // Debug logging for hybrid wallet data in MainContent
  React.useEffect(() => {
    if (hybridWallet || hasHybridWallet !== undefined) {
      console.log('=== MAINCONTENT HYBRID WALLET DATA ===');
      console.log('Has Hybrid Wallet:', hasHybridWallet);
      console.log('Hybrid Wallet ID:', hybridWalletId);
      console.log('Formatted Wallet ID:', formattedWalletId);
      console.log('Falcon Public Key (0x):', formattedFalconPubKey);
      console.log('Ed25519 Public Key (0x):', formattedEd25519PubKey);
      console.log('Hybrid Wallet Balance (SUI):', hybridSuiBalance);
      console.log('Is Loading:', isHybridWalletLoading);
      console.log('Error:', hybridWalletError);
      console.log('======================================');
    }
  }, [hybridWallet, hybridWalletId, hybridWalletBalance, hasHybridWallet, isHybridWalletLoading, hybridWalletError, formattedFalconPubKey, formattedEd25519PubKey]);

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
        {/* Hybrid Wallet Information Section */}
        {hasHybridWallet && hybridWallet && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '25px',
              padding: '25px',
              background: 'rgba(64, 224, 208, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(64, 224, 208, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#40E0D0',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Hybrid Wallet Information
            </div>
            
            {/* Treasury Balance */}
            <div
              style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: '25px',
              }}
            >
              {hybridSuiBalance.toFixed(3)} SUI
              <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  fontWeight: '400',
                  marginTop: '5px',
                }}
              >
                Treasury Balance
              </div>
            </div>
            
            {/* Essential Information */}
            <div style={{ textAlign: 'left', maxWidth: '100%' }}>
              {/* Wallet Object ID */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#40E0D0',
                    marginBottom: '5px',
                  }}
                >
                  Wallet Object ID:
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(64, 224, 208, 0.3)',
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <span>{hybridWalletId}</span>
                  <button
                    style={{
                      background: '#40E0D0',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '10px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                    onClick={() => navigator.clipboard.writeText(hybridWalletId || '')}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Falcon Public Key */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#40E0D0',
                    marginBottom: '5px',
                  }}
                >
                  Falcon Public Key (0x):
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(64, 224, 208, 0.3)',
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    maxHeight: '60px',
                    overflowY: 'auto',
                  }}
                >
                  <span>{formattedFalconPubKey}</span>
                  <button
                    style={{
                      background: '#40E0D0',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '10px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                    onClick={() => navigator.clipboard.writeText(formattedFalconPubKey)}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Ed25519 Public Key */}
              <div style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#40E0D0',
                    marginBottom: '5px',
                  }}
                >
                  Ed25519 Public Key (0x):
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(64, 224, 208, 0.3)',
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <span>{formattedEd25519PubKey}</span>
                  <button
                    style={{
                      background: '#40E0D0',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '10px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                    onClick={() => navigator.clipboard.writeText(formattedEd25519PubKey)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {hasHybridWallet && hybridWallet && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginBottom: '30px',
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
                background: 'linear-gradient(135deg, #40E0D0, #20B2AA)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(64, 224, 208, 0.3)',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(64, 224, 208, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(64, 224, 208, 0.3)';
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
                background: 'linear-gradient(135deg, #4a9eff, #6ab7ff)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(74, 158, 255, 0.3)',
                minWidth: '120px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(74, 158, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(74, 158, 255, 0.3)';
              }}
            >
              Deposit
            </button>
          </div>
        )}
        
        {/* Loading State for Hybrid Wallet */}
        {isHybridWalletLoading && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '25px',
              padding: '20px',
              background: 'rgba(64, 224, 208, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(64, 224, 208, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: '#40E0D0',
                marginBottom: '10px',
              }}
            >
              Loading Hybrid Wallet...
            </div>
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(64, 224, 208, 0.3)',
                borderTop: '2px solid #40E0D0',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        )}
        
        {/* Error State for Hybrid Wallet */}
        {hybridWalletError && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '25px',
              padding: '15px',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              fontSize: '13px',
            }}
          >
            Hybrid Wallet Error: {hybridWalletError}
          </div>
        )}
        
        {/* No Hybrid Wallet State */}
        {hasHybridWallet === false && !isHybridWalletLoading && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '25px',
              padding: '15px',
              background: 'rgba(156, 163, 175, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(156, 163, 175, 0.2)',
              color: '#6B7280',
              fontSize: '13px',
            }}
          >
            No Hybrid Wallet Found
          </div>
        )}

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

        @keyframes spin {
          0% { 
            transform: rotate(0deg); 
          }
          100% { 
            transform: rotate(360deg); 
          }
        }
      `}</style>
    </div>
  );
};
