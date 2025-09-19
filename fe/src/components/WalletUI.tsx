import React, { useState } from 'react';
import { 
  ConnectButton, 
  useCurrentAccount, 
  useSuiClientQuery,
  useSignAndExecuteTransaction 
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';

interface WalletUIProps {
  // Optional props for additional customization
  onDeposit?: () => void;
}

export const WalletUI: React.FC<WalletUIProps> = ({
  onDeposit
}) => {
  const currentAccount = useCurrentAccount();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  // Get balance data using useSuiClientQuery
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address ?? '',
    },
    {
      enabled: !!currentAccount,
    }
  );

  // Hook for executing transactions
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Convert MIST to SUI for display
  const suiBalance = balance ? Number(balance.totalBalance) / Number(MIST_PER_SUI) : 0;

  // Handle transfer transaction
  const handleSend = () => {
    if (!currentAccount) return;
    setIsTransferModalOpen(true);
  };

  const executeTransfer = () => {
    if (!currentAccount || !recipient || !amount) return;

    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [
      tx.pure.u64(Number(amount) * Number(MIST_PER_SUI))
    ]);
    tx.transferObjects([coin], tx.pure.address(recipient));

    signAndExecuteTransaction(
      {
        transaction: tx,
        chain: 'sui:devnet',
      },
      {
        onSuccess: (result) => {
          console.log('Transfer successful:', result.digest);
          setIsTransferModalOpen(false);
          setRecipient('');
          setAmount('');
          alert(`Transfer successful! Transaction: ${result.digest}`);
        },
        onError: (error) => {
          console.error('Transfer failed:', error);
          alert('Transfer failed. Please try again.');
        },
      }
    );
  };

  // If no wallet connected, show connect button
  if (!currentAccount) {
    return (
      <div
        className="wallet-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          width: '90%',
          maxWidth: '600px',
          minWidth: '320px',
          color: '#333',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          textAlign: 'center',
          animation: 'walletFloat 4s ease-in-out infinite'
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', color: '#0099cc' }}>
          Connect Your Wallet
        </h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Connect your Sui wallet to start using the Falcon Wallet
        </p>
        <ConnectButton />
        
        {/* CSS keyframes for floating animation */}
        <style>{`
          @keyframes walletFloat {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-10px);
            }
          }
        `}</style>
      </div>
    );
  }
  return (
    <>
      <div
        className="wallet-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          width: '90%',
          maxWidth: '600px',
          minWidth: '320px',
          color: '#333',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          animation: 'walletFloat 4s ease-in-out infinite'
        }}
      >
        {/* Header Row */}
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
              {`${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`}
            </span>
          </div>
          <div style={{ width: '100px' }}>
            <ConnectButton />
          </div>
        </div>

        {/* Balance Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: '#0099cc',
              lineHeight: '1'
            }}>
              {suiBalance.toFixed(2)}
            </span>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: '500',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              sui
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem'
        }}>
          <button
            onClick={onDeposit}
            style={{
              background: 'transparent',
              color: '#0099cc',
              border: '2px solid #0099cc',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 153, 204, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Deposit
          </button>

          <button
            onClick={handleSend}
            style={{
              background: 'linear-gradient(135deg, #0099cc 0%, #0077aa 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 153, 204, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 153, 204, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 153, 204, 0.3)';
            }}
          >
            Send
          </button>
        </div>

        {/* CSS keyframes for floating animation */}
        <style>{`
          @keyframes walletFloat {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-10px);
            }
          }
        `}</style>
      </div>

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', textAlign: 'center' }}>
              Send SUI
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                Amount (SUI)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.1"
                step="0.1"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                style={{
                  background: 'transparent',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeTransfer}
                disabled={!recipient || !amount}
                style={{
                  background: recipient && amount ? '#0099cc' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  cursor: recipient && amount ? 'pointer' : 'not-allowed'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletUI;