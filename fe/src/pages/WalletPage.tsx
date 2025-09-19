import React from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import WalletUI from '../components/WalletUI';

interface WalletPageProps {
  // Props for future contract integration
  accountAddress?: string;
  balance?: number;
  onDeposit?: () => void;
  onSend?: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  accountAddress,
  balance,
  onDeposit,
  onSend
}) => {
  return (
    <UnderWaterScene>
      <WalletUI
        accountAddress={accountAddress}
        balance={balance}
        onDeposit={onDeposit}
        onSend={onSend}
      />
    </UnderWaterScene>
  );
};

export default WalletPage;