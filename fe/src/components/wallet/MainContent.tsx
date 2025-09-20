import React from 'react';
import { type FalconKeys } from '../../hooks/useFalcon';

interface MainContentProps {
  balance: number;
  onSend?: () => void;
  onDeposit?: () => void;
  // Falcon functionality
  falconKeys?: FalconKeys | null;
  isFalconReady?: boolean;
  isGeneratingKeys?: boolean;
  onGenerateFalconKeys?: () => void;
  falconError?: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({ 
  balance, 
  onSend, 
  onDeposit,
  // Falcon functionality
  falconKeys,
  isFalconReady,
  isGeneratingKeys,
  onGenerateFalconKeys,
  falconError
}) => {
  const actionButtons = [
    { 
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', 
      label: 'Swap', 
      color: '#6366F1',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    { 
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11l5-5 5 5M12 6v14"/></svg>', 
      label: 'Send', 
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      onClick: onSend 
    },
    { 
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>', 
      label: 'Buy/Sell', 
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    { 
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 13l3 3 7-7m0 5v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h6"/></svg>', 
      label: 'Receive', 
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      onClick: onDeposit 
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 24px 24px 0',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#E0E7FF',
          height: '36px',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            color: '#6366F1',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>
          Deposit on Falcon to win SUI rewards!
        </span>
      </div>

      {/* Balance Section */}
      <div style={{ display: 'flex', gap: '12px', flex: '0 0 auto', height: '120px' }}>
        {/* Main Balance */}
        <div
          style={{
            flex: 2,
            background: 'rgba(51, 65, 85, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: 'white',
              }}
            >
              ${balance.toFixed(2)}
            </h1>
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
          </div>

          {/* Coins Section */}
          <div>
            <h3
              style={{
                fontSize: '14px',
                color: '#94A3B8',
                margin: '0 0 8px 0',
                fontWeight: '500',
              }}
            >
              Coins
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                ${balance.toFixed(2)}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#EF4444',
                  fontWeight: '500',
                }}
              >
                -$3.09
              </div>
            </div>
          </div>
        </div>

        {/* Investments Section */}
        <div
          style={{
            flex: 1,
            background: 'rgba(51, 65, 85, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              color: '#94A3B8',
              margin: '0 0 8px 0',
              fontWeight: '500',
            }}
          >
            Investments
          </h3>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
            }}
          >
            Invest to start earning today
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          flex: '0 0 auto',
          height: '70px',
        }}
      >
        {actionButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            style={{
              background: button.bgColor,
              border: `1px solid ${button.color}20`,
              borderRadius: '10px',
              padding: '12px',
              color: button.color,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              fontSize: '12px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              height: '100%',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = button.color + '20';
              e.currentTarget.style.boxShadow = `0 8px 25px ${button.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = button.bgColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: button.icon }} />
            <span>{button.label}</span>
          </button>
        ))}
      </div>

      {/* Your Coins Section */}
      <div
        style={{
          background: 'rgba(51, 65, 85, 0.6)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            flex: '0 0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              margin: 0,
              color: 'white',
            }}
          >
            Your Coins
          </h2>
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            🔍
          </div>
        </div>

        {/* SUI Token */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            flex: '0 0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                background: '#4F9CF9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              S
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontWeight: '600', fontSize: '16px' }}>Sui</span>
                <span
                  style={{
                    background: '#4F9CF9',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                  }}
                >
                  ✓
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#94A3B8', fontSize: '14px' }}>$3.67</span>
                <span style={{ color: '#EF4444', fontSize: '14px' }}>-4.73%</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
              ${balance.toFixed(2)}
            </div>
            <div style={{ color: '#94A3B8', fontSize: '14px' }}>
              {balance.toFixed(2)} SUI
            </div>
          </div>
        </div>
      </div>

      {/* Falcon Security Section */}
      <div
        style={{
          background: 'rgba(51, 65, 85, 0.6)',
          borderRadius: '12px',
          padding: '16px',
          color: 'white',
          flex: '0 0 auto',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: '700',
              margin: 0,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                color: '#40E0D0',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.86C16.16 26.74 20 22.55 20 17V7l-8-5z"/>
              </svg>
            </div>
            Falcon Security
          </h2>
          
          {/* Falcon Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: isFalconReady ? '#10B981' : '#6B7280',
              fontWeight: '500',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isFalconReady ? '#10B981' : '#6B7280',
              }}
            />
            {isFalconReady ? 'Ready' : 'Initializing...'}
          </div>
        </div>

        {/* Error Display */}
        {falconError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '8px',
            color: '#EF4444',
            fontSize: '12px',
            marginBottom: '12px',
          }}>
            <strong>Error:</strong> {falconError}
          </div>
        )}

        {/* Key Status and Generation */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Key Status */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '4px' }}>
              Quantum-Resistant Keys
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {falconKeys ? (
                <span style={{ color: '#10B981' }}>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }}
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Keys Generated
                </span>
              ) : (
                <span style={{ color: '#6B7280' }}>No Keys</span>
              )}
            </div>
          </div>

          {/* Generate Keys Button */}
          <button
            onClick={onGenerateFalconKeys}
            disabled={!isFalconReady || isGeneratingKeys || !!falconKeys}
            style={{
              background: falconKeys 
                ? 'rgba(16, 185, 129, 0.2)' 
                : (!isFalconReady || isGeneratingKeys) 
                  ? 'rgba(107, 114, 128, 0.5)'
                  : 'rgba(64, 224, 208, 0.2)',
              border: `1px solid ${falconKeys 
                ? '#10B981' 
                : (!isFalconReady || isGeneratingKeys) 
                  ? '#6B7280'
                  : '#40E0D0'}`,
              borderRadius: '8px',
              padding: '10px 16px',
              color: falconKeys 
                ? '#10B981' 
                : (!isFalconReady || isGeneratingKeys) 
                  ? '#6B7280'
                  : '#40E0D0',
              cursor: (!isFalconReady || isGeneratingKeys || !!falconKeys) ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              opacity: (!isFalconReady || isGeneratingKeys || !!falconKeys) ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (isFalconReady && !isGeneratingKeys && !falconKeys) {
                e.currentTarget.style.background = 'rgba(64, 224, 208, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (isFalconReady && !isGeneratingKeys && !falconKeys) {
                e.currentTarget.style.background = 'rgba(64, 224, 208, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isGeneratingKeys ? (
              <>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Generating...
              </>
            ) : falconKeys ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Generated
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm12-3c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM19 10.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                </svg>
                Generate Keys
              </>
            )}
          </button>
        </div>

        {/* Show key info when keys exist */}
        {falconKeys && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6EE7B7',
          }}>
            🔐 Post-quantum cryptographic keys are ready for secure transactions
          </div>
        )}
      </div>

      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MainContent;