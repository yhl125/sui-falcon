import { useState } from 'react';
import StartPage from './pages/StartPage';
import WalletPage from './pages/WalletPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'start' | 'wallet'>('start');

  const handleStart = () => {
    setCurrentPage('wallet');
  };

  return (
    <>
      {currentPage === 'start' && <StartPage onStart={handleStart} />}
      {currentPage === 'wallet' && <WalletPage />}
    </>
  );
}

export default App
