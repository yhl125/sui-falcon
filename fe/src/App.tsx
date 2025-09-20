// src/App.tsx
import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import WalletPage from "./pages/WalletPage";

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
