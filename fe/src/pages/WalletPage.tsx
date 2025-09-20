import React from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import WalletUI from '../components/WalletUI';

export const WalletPage: React.FC = () => {
  const handleDeposit = () => {
    // Future implementation for deposit functionality
    console.log('Deposit functionality coming soon...');
    alert('Deposit functionality will be implemented in the future.');
  };

  return (
    <UnderWaterScene animationEnabled={true}>
      <WalletUI onDeposit={handleDeposit} />
    </UnderWaterScene>
  );
};

export default WalletPage;