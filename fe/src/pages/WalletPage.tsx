// src/pages/WalletPage.tsx
import React, { useEffect, useState } from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import WalletUI from '../components/WalletUI';
import { HybridWallet } from '../lib/HybridWallet';
import { useFalcon } from '../hooks/useFalcon';

export const WalletPage: React.FC = () => {
  const { generateKeys } = useFalcon();        // Falcon 키 생성 함수
  const [wallet, setWallet] = useState<HybridWallet | null>(null);

  useEffect(() => {
    const w = new HybridWallet();
    w.init(generateKeys).then(() => {          // 키가 없으면 자동 생성 후 localStorage에 저장됨
      setWallet(w);
    });
  }, [generateKeys]);

  const handleDeposit = () => {
    if (!wallet) {
      alert("Wallet not ready yet!");
      return;
    }
    console.log('Deposit functionality coming soon...');
    alert('Deposit functionality will be implemented in the future.');
  };

  return (
    <UnderWaterScene animationEnabled={true}>
      {/* Wallet이 준비된 뒤에만 UI 렌더링 */}
      {wallet ? (
        <WalletUI onDeposit={handleDeposit} />
      ) : (
        <div style={{ color: "white", textAlign: "center" }}>Loading wallet...</div>
      )}
    </UnderWaterScene>
  );
};

export default WalletPage;
