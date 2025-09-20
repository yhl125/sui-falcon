import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import WalletPage from "./pages/WalletPage";
import { FalconDemo } from "./components/FalconDemo";

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
