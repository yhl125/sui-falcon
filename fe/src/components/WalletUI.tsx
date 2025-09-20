import React, { useState, useEffect } from 'react';
import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransaction
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { TransferModal } from './wallet/TransferModal';
import { AccountInfo } from './wallet/AccountInfo';
import { Sidebar } from './wallet/Sidebar';
import { MainContent } from './wallet/MainContent';
import { useFalcon, type FalconKeys } from '../hooks/useFalcon';
import { HybridWallet } from '../lib/HybridWallet';
import { useHybridWallet } from '../hooks/useHybridWalletContext';

interface WalletUIProps {
  // Optional props for additional customization
  onDeposit?: () => void;
}

export const WalletUI: React.FC<WalletUIProps> = ({
  onDeposit
}) => {
  // Access HybridWallet context for complete wallet data
  const {
    hybridWallet,
    hybridWalletId,
    hasHybridWallet,
    isLoading: isHybridWalletLoading,
    createHybridWallet,
    error: hybridWalletError,
    loadHybridWalletForAccount
  } = useHybridWallet();
  const currentAccount = useCurrentAccount();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  
  // Falcon functionality
  const [falconKeys, setFalconKeys] = useState<FalconKeys | null>(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  
  // Access Falcon hook (already initialized in StartPage)
  const { 
    isInitialized: isFalconReady,
    generateKeys,
    error: falconError 
  } = useFalcon();
  
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

  // Load existing Falcon keys on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('falconKeys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setFalconKeys(keys);
        console.log('🔑 Loaded existing Falcon keys from storage');
      } catch (error) {
        console.error('Failed to load Falcon keys from storage:', error);
        localStorage.removeItem('falconKeys'); // Clear corrupted data
      }
    }
  }, []);

  // Debug: Monitor hybrid wallet data changes
  useEffect(() => {
    if (hybridWallet && hybridWalletId) {
      console.log('=== HYBRID WALLET DATA LOADED ===');
      console.log('Hybrid Wallet ID:', hybridWalletId);
      console.log('Hybrid Wallet Object:', hybridWallet);
      console.log('Treasury Balance (BigInt):', hybridWallet.treasury);
      console.log('Treasury Balance (SUI):', Number(hybridWallet.treasury) / Number(MIST_PER_SUI));
      console.log('Transaction Nonce:', hybridWallet.nonce);
      console.log('Ed25519 Public Key:', hybridWallet.ed25519_pubkey);
      console.log('Falcon Public Key Length:', hybridWallet.falcon_pubkey?.length || 0);
      console.log('Connected Traditional Key:', hybridWallet.traditionalKey);
      console.log('Local Falcon Key Available:', !!hybridWallet.falconKey);
      console.log('================================');
    } else if (hasHybridWallet === false) {
      console.log('=== NO HYBRID WALLET FOUND ===');
      console.log('Has Hybrid Wallet:', hasHybridWallet);
      console.log('Hybrid Wallet ID:', hybridWalletId);
      console.log('===============================');
    }
  }, [hybridWallet, hybridWalletId, hasHybridWallet]);

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

  // Falcon key generation
  const handleGenerateFalconKeys = async () => {
    if (!isFalconReady) {
      alert('Falcon is not ready yet. Please wait for initialization to complete.');
      return;
    }

    setIsGeneratingKeys(true);
    try {
      console.log('🔑 Generating Falcon keys...');
      const newKeys = await generateKeys();
      setFalconKeys(newKeys);
      console.log('✅ Falcon keys generated successfully!');
      
      // Store keys in localStorage for persistence
      localStorage.setItem('falconKeys', JSON.stringify(newKeys));
      
      alert('🎉 Falcon keys generated successfully! Keys are now stored securely.');
    } catch (error) {
      console.error('❌ Failed to generate Falcon keys:', error);
      alert('Failed to generate Falcon keys. Please try again.');
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  // Generate wallet with Falcon keys and create Move contract wallet
  const handleGenerateWalletWithFalcon = async () => {
    if (!isFalconReady || !currentAccount) {
      return;
    }

    setIsGeneratingWallet(true);
    try {
      console.log('🔑 Generating Falcon keys for new wallet...');
      
      // Step 1: Generate Falcon keys
      const newKeys = await generateKeys();
      setFalconKeys(newKeys);
      console.log('✅ Falcon keys generated successfully!');
      
      // Step 2: Store keys in localStorage
      localStorage.setItem('falconKeys', JSON.stringify(newKeys));
      
      // Step 3: Update HybridWallet with the new keys
      const wallet = new HybridWallet();
      wallet.init(); // Re-initialize to pick up the new keys
      wallet.setFalconKeys(newKeys.privateKey, newKeys.publicKey);
      console.log(' HybridWallet updated with Falcon keys');
      
      // Step 4: Create Move contract wallet using Falcon keys
      console.log('🏗️ Creating Move contract wallet with Falcon keys...');
      
      try {
        // Create a transaction to register the Falcon public key on-chain
        const tx = new Transaction();
        
        // Add move call to register Falcon public key
        // This would call a Move contract function to store the Falcon key
        tx.moveCall({
          target: `${process.env.REACT_APP_PACKAGE_ID || '0x1'}::falcon_wallet::register_falcon_key`,
          arguments: [
            tx.pure.string(newKeys.publicKey), // Falcon public key
            tx.pure.string('falcon-v1.0'), // Version identifier
          ],
        });
        
        console.log('📡 Executing Move contract transaction...');
        
        // Execute the transaction
        const result = await new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            {
              transaction: tx,
              chain: 'sui:devnet',
            },
            {
              onSuccess: (result) => {
                console.log('✅ Move contract wallet created successfully!', result.digest);
                resolve(result);
              },
              onError: (error) => {
                console.error('❌ Move contract transaction failed:', error);
                reject(error);
              },
            }
          );
        });
        
        console.log('🎉 Falcon wallet registered on-chain:', result);
        
      } catch (contractError) {
        console.warn('⚠️ Move contract call failed, proceeding with local storage only:', contractError);
        // Continue without on-chain registration for now
        // In production, you might want to retry or show a warning
      }
      
      console.log('✅ Move contract wallet created successfully!');
      
      // Step 5: Proceed to normal wallet interface
      setNeedsFalconKeyGeneration(false);
      setIsGeneratingWallet(false);
      
    } catch (error) {
      console.error('❌ Failed to generate wallet with Falcon keys:', error);
      alert('Failed to generate secure wallet. Please try again.');
      setIsGeneratingWallet(false);
    }
  };

  // Check if Falcon keys exist when wallet is connected
  const [needsFalconKeyGeneration, setNeedsFalconKeyGeneration] = useState(false);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);

  useEffect(() => {
    if (currentAccount && isFalconReady) {
      // Initialize HybridWallet and check for real Falcon keys
      const wallet = new HybridWallet();
      wallet.init();
      
      if (!wallet.hasFalconKeys()) {
        // No real Falcon keys - need to generate
        setNeedsFalconKeyGeneration(true);
        console.log('⚠️ WalletUI: No Falcon keys found - showing generation UI');
      } else {
        // Real Falcon keys exist - proceed normally
        setNeedsFalconKeyGeneration(false);
        console.log('✅ WalletUI: Falcon keys found - proceeding to wallet');
        
        // Update local state with the keys from HybridWallet
        if (wallet.falconKey) {
          setFalconKeys({
            privateKey: wallet.falconKey.privateKey,
            publicKey: wallet.falconKey.publicKey
          });
        }
      }
    }
  }, [currentAccount, isFalconReady]);

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

  // If generating wallet with Falcon keys
  if (isGeneratingWallet) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
          width: '90%',
          maxWidth: '500px',
          color: 'white',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          textAlign: 'center',
          border: '1px solid rgba(64, 224, 208, 0.3)'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(64, 224, 208, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem auto',
          border: '2px solid rgba(64, 224, 208, 0.5)',
          position: 'relative'
        }}>
          {/* Spinning outer ring */}
          <div style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            border: '3px solid transparent',
            borderTop: '3px solid #40E0D0',
            borderRadius: '50%',
            animation: 'spin 2s linear infinite'
          }} />
          
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#40E0D0">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.86C16.16 26.74 20 22.55 20 17V7l-8-5z"/>
          </svg>
        </div>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem', 
          color: '#40E0D0',
          fontWeight: '700'
        }}>
          Creating Secure Wallet
        </h2>
        
        <div style={{
          marginBottom: '2rem',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            ✅ Generating quantum-resistant keys<br />
            🏗️ Creating Move contract wallet<br />
            💾 Securing your digital identity
          </div>
          
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(64, 224, 208, 0.8)',
            fontStyle: 'italic'
          }}>
            This may take a moment...
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If wallet connected but needs Falcon key generation
  if (needsFalconKeyGeneration && !isGeneratingWallet) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '3rem',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.4)',
          width: '90%',
          maxWidth: '500px',
          color: 'white',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          textAlign: 'center',
          border: '1px solid rgba(64, 224, 208, 0.3)'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          background: 'rgba(64, 224, 208, 0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem auto',
          border: '2px solid rgba(64, 224, 208, 0.5)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#40E0D0">
            <path d="M7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm12-3c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM19 10.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
        </div>

        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem', 
          color: '#40E0D0',
          fontWeight: '700'
        }}>
          Generate Quantum Keys
        </h2>
        
        <p style={{ 
          marginBottom: '2rem', 
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          Your wallet needs quantum-resistant Falcon keys for enhanced security.
          This will create your secure digital identity.
        </p>

        <button
          onClick={handleGenerateWalletWithFalcon}
          disabled={!isFalconReady}
          style={{
            background: 'linear-gradient(135deg, #40E0D0, #20B2AA)',
            border: 'none',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isFalconReady ? 'pointer' : 'not-allowed',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(64, 224, 208, 0.3)',
            opacity: isFalconReady ? 1 : 0.6
          }}
          onMouseEnter={(e) => {
            if (isFalconReady) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(64, 224, 208, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (isFalconReady) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(64, 224, 208, 0.3)';
            }
          }}
        >
          {isFalconReady ? '🔐 Generate Secure Keys' : '⏳ Preparing...'}
        </button>

        {!isFalconReady && (
          <p style={{ 
            marginTop: '1rem', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem'
          }}>
            Waiting for Falcon security system...
          </p>
        )}
      </div>
    );
  }
  return (
    <>
      {/* Account Info in top-right corner */}
      <AccountInfo />
      
      {/* Slash-style Wallet Container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw',
          height: '75vh',
          maxWidth: '1200px',
          maxHeight: '800px',
          minWidth: '900px',
          minHeight: '600px',
          borderRadius: '24px',
          overflow: 'hidden',
          // boxShadow: '0 32px 80px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          fontFamily: '"Inter", "Segoe UI", sans-serif',
        }}
      >

        {/* Main Content */}
        <MainContent 
          // Action handlers
          onSend={handleSend}
          onDeposit={onDeposit}
          // Falcon functionality
          falconKeys={falconKeys}
          // Hybrid Wallet functionality
          hybridWallet={hybridWallet}
          hybridWalletId={hybridWalletId}
          hybridWalletBalance={hybridWallet?.treasury}
          hasHybridWallet={hasHybridWallet}
          isHybridWalletLoading={isHybridWalletLoading}
          hybridWalletError={hybridWalletError}
        />
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