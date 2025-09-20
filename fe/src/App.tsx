import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import WalletPage from "./pages/WalletPage";
import './App.css';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <StartPage onStart={() => setStarted(true)} />
      ) : (
        <WalletPage />
        
      )}
      
    </>
  );
}

export default App;
