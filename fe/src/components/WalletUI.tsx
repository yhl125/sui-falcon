import React, { useState } from 'react';
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransaction
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { WalletHeader, WalletBalance, WalletActions, TransferModal } from './wallet';

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
        <WalletHeader address={currentAccount.address} />
        <WalletBalance balance={suiBalance} />
        <WalletActions onDeposit={onDeposit} onSend={handleSend} />

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

      <TransferModal
        isOpen={isTransferModalOpen}
        recipient={recipient}
        amount={amount}
        onRecipientChange={setRecipient}
        onAmountChange={setAmount}
        onConfirm={executeTransfer}
        onCancel={() => setIsTransferModalOpen(false)}
      />
    </>
  );
};

export default WalletUI;